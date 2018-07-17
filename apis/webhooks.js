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
        findNestedValue
} = require('./helperFunctions');

const {
    createEmailInfo,
    sendEmailInvite
} = require("./businessApis");


const webhooks = {
    POST_addCandidate
}


async function POST_addCandidate(req, res) {
    console.log("req.body: ", req.body);
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
    const email = findNestedValue(body, "email", nestedLevels, traverseArrays);

    console.log("email: ", email);

    return res.status(200).send("success");

    // TODO: test that the email is in the correct form (is a valid email)

    // query to find the business and position from the keys
    try {
        var query = {
            "apiKey": API_Key,
            "positions": {
                // will only get the wanted position
                "$elemMatch": {
                    "_id": mongoose.types.ObjectId(positionId)
                }
            }
        }
    } catch(typeError) {
        console.log("Error creating query to find business when adding candidate via webhook: ", typeError);
        return res.status(400).send("Bad request. Make sure to include API_Key, Position_Key, and Email fields. Capitalization matters.");
    }

    // find the business from the webhook parameters
    try { var business = await Businesses.findOne(query); }
    catch (getBizError) {
        console.log("Error getting business when adding candidate via webhook: ", getBizError);
        return res.status(500).send("Server error.");
    }

    // make sure a legit business is found from the webhook info
    if (!business || !Array.isArray(business.positions) || business.positions.length < 1) {
        return res.status(401).send("Invalid API_Key and/or Position_Key.");
    }

    // the position the candidate is applying for
    const position = business.positions[0];

    // create a unique code for the candidate
    try { var emailInfo = createEmailInfo(business._id, position._id, "candidate", email); }
    catch (codeCreationError) {
        console.log("Error creating a code for candidate signing up via webhook: ", codeCreationError);
        return res.status(500).send("Error sending invite to candidate.");
    }

    // send invite email to candidate
    try { await sendEmailInvite(emailInfo, position.name, business.name); }
    catch (sendEmailError) {
        console.log("Error sending email to candidate signing up via webhook: ", sendEmailError);
        res.status(500).send("Error sending email invite to candidate");
    }

    return res.status(200).send();
}

module.exports = webhooks;
