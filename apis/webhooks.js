const Businesses = require('../models/businesses.js');
const Users = require('../models/users.js');

const mongoose = require('mongoose');
const errors = require('./errors');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        sendEmail,
        getFirstName,
        frontEndUser,
        getAndVerifyUser,
        findNestedValue,
        isValidEmail
} = require('./helperFunctions');

const {
    createEmailInfo,
    sendEmailInvite
} = require("./businessApis");


const webhooks = {
    POST_addCandidate
}


async function POST_addCandidate(req, res) {
    // all arguments recieved
    const body = sanitize(req.body);
    // maximum number of levels deep the search will go
    const nestedLevels = 3;
    // we want to go through arrays just in case the data is hidden in one
    const traverseArrays = true;
    // the unique business identifier
    const API_Key = findNestedValue(body, "API_Key", nestedLevels, traverseArrays);
    // identifier for position is just the position id
    const positionId = findNestedValue(body, "Position_Key", nestedLevels, traverseArrays);
    // the email address of the candidate that should be invited
    const email = findNestedValue(body, "Email", nestedLevels, traverseArrays);
    // error to send if either/both API_Key and Position_Key are bad
    const BAD_KEYS = {error: "Invalid API_Key and/or Position_Key."};

    // test that all necessary values exist
    if (!API_Key) { return noInput("API_Key"); }
    if (!positionId) { return noInput("Position_Key"); }
    if (!email) { return noInput("Email"); }

    // test that the api and position keys are valid
    if (typeof API_Key !== "string") { return badInput("API_Key", API_Key) }
    if (typeof positionId !== "string") { return badInput("Position_Key", positionId)}
    // test that the email is in the correct form (is a valid email)
    if (!isValidEmail(email)) {
        return res.status(400).send({
            error: "Invalid email format. Needs to be _____@_____.___ but got "
                    + email + " - also make sure the field is called Email."
        });
    }

    // create the actual mongo id from the given position key
    try { var positionMongooseId = mongoose.Types.ObjectId(positionId); }
    catch (makeIdError) {
        console.log("Position_Key not valid: ", makeIdError);
        return res.status(200).send(BAD_KEYS);
    }

    // query to find the business and position from the keys
    const query = {
        "API_Key": API_Key,
        "positions": {
            // will only get the wanted position
            "$elemMatch": {
                "_id": positionMongooseId
            }
        }
    }

    // find the business from the webhook parameters
    try { var business = await Businesses.findOne(query); }
    catch (getBizError) {
        console.log("Error getting business when adding candidate via webhook: ", getBizError);
        return res.status(500).send({error: "Server error. This is probably Moonshot's fault. Contact us at support@moonshotinsights.io and we'l get it sorted out."});
    }

    // make sure a legit business is found from the webhook info
    if (!business || !Array.isArray(business.positions) || business.positions.length < 1) {
        console.log("business: ", business);
        return res.status(401).send(BAD_KEYS);
    }

    // the position the candidate is applying for
    const position = business.positions[0];

    // create a unique code for the candidate
    try { var emailInfo = await createEmailInfo(business._id, position._id, "candidate", email); }
    catch (codeCreationError) {
        console.log("Error creating a code for candidate signing up via webhook: ", codeCreationError);
        return res.status(500).send({error: "Error sending invite to candidate."});
    }

    // send invite email to candidate
    try { await sendEmailInvite(emailInfo, position.name, business.name); }
    catch (sendEmailError) {
        console.log("Error sending email to candidate signing up via webhook: ", sendEmailError);
        return res.status(500).send({error: "Error sending email invite to candidate."});
    }

    // return successfully
    return res.status(200).send({success: true});

    // creates error to send for no input
    function noInput(arg) {
        return res.status(400).send({
            error: `Must include ${arg}. Make sure capitalization is correct (${arg} not ${arg.toLowerCase()}).`
        })
    }

    // creates error to send for invalid input
    function badInput(arg, value) {
        return res.status(400).send({
            error: `Invalid ${arg}. Should be a string, but got a ${typeof value}`
        });
    }
}

module.exports = webhooks;
