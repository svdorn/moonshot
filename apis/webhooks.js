const Businesses = require('../models/businesses.js');
const Users = require('../models/users.js');
const credentials = require('../credentials');

const mongoose = require('mongoose');
const stripe = require("stripe")(process.env.NODE_ENV === "production" ? credentials.stripeSk : credentials.stripeTestSk);
const errors = require('./errors');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        getFirstName,
        frontEndUser,
        getAndVerifyUser,
        findNestedValue,
        isValidEmail,
        addSubscription,
        getBillingEndDate
} = require('./helperFunctions');

const {
    createEmailInfo,
    sendEmailInvite
} = require("./businessApis");


const webhooks = {
    POST_addCandidate,
    POST_cancelBillingSubscription
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
    const Position_Key = findNestedValue(body, "Position_Key", nestedLevels, traverseArrays);
    // the email address of the candidate that should be invited
    const email = findNestedValue(body, "Email", nestedLevels, traverseArrays);
    // error to send if either/both API_Key and Position_Key are bad
    const BAD_KEYS = {error: "Invalid API_Key and/or Position_Key."};

    // test that all necessary values exist
    if (!API_Key) { return noInput("API_Key"); }
    if (!Position_Key) { return noInput("Position_Key"); }
    if (!email) { return noInput("Email"); }

    // test that the api and position keys are valid
    if (typeof API_Key !== "string") { return badInput("API_Key", API_Key) }
    if (typeof Position_Key !== "string") { return badInput("Position_Key", Position_Key)}
    // test that the email is in the correct form (is a valid email)
    if (!isValidEmail(email)) {
        return res.status(400).send({
            error: "Invalid email format. Needs to be _____@_____.___ but got "
                    + email + " - also make sure the field is called Email."
        });
    }

    // the different things that could be used to identify the position
    let positionOptions = [
        { "name": Position_Key }
    ];

    // try using the key as an id
    try {
        // make the position key into a mongoose id
        const positionMongooseId = mongoose.Types.ObjectId(Position_Key);
        // add the _id option to the query
        positionOptions.push({ "_id": positionMongooseId });
    }
    catch (makeIdError) { /* not searching by _id */ }

    // query to find the business and position from the keys
    const query = {
        "API_Key": API_Key,
        "positions": {
            // will only get the wanted position, and will only get the business
            // that has this position
            "$elemMatch": {
                "$or": positionOptions
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

async function POST_cancelBillingSubscription(req, res) {
    // all arguments recieved
    const body = sanitize(req.body);
    console.log("body: ", body);
    console.log("body data?: ", body.data)
    if (!body.data) {
        return res.status(500).send("Incorrect data supplied");
    }
    // the id of the subscription that was cancelled
    const subscriptionId = body.data.id;
    // customerId of stripe customer
    const customerId = body.data.customer;

    // query the db the business with this stripe customerId
    const query = {
        billing: { customerId }
    };
    try {
        var business = await Businesses
            .findOne(query)
            .select("_id billing");
    }
    catch (getBusinessesError) {
        console.log("Error getting business from customer id in cancel stripe webhook: ", getBusinessesError);
        return res.status(500).send("Error getting business from customerId");
    }

    if (!business || !business.billing) {
        console.log("No business or billing info for business in cancel stripe webhook.");
        return res.status(500).send("No business or billing info for business.");
    }

    if (business.billing.subscription && business.billing.subscription.id) {
        if (business.billing.subscription.id.toString() === subscriptionId.toString()) {
            // we have the right subscription, push it onto oldSubscriptions, and delete it from our database
            if (!business.billing.oldSubscriptions) {
                business.billing.oldSubscriptions = [];
            }
            business.billing.oldSubscriptions.push(business.billing.subscription);
            business.billing.subscription = { };
        }
    }

    // if the subscription was deleted
    if (business.billing.subscription === { }) {
        // check for newSubscriptions, start that on stripe and make it subscription in our db
        if (business.billing.newSubscription && business.billing.newSubscription.name) {
            const subscriptionTerm = business.billing.newSubscription.name;
            try {
                var subscription = await addSubscription(customerId, subscriptionTerm);
            } catch(error) {
                console.log("Error adding subscription.");
                return res.status(500).send("Error adding subscription inside cancel subscription webhook");
            }
            // set the newSubscription to undefined
            business.billing.newSubscription = undefined;
            // give the subscription the right info returned from the addSubscription method
            business.billing.subscription.id = subscription.id;
            business.billing.name = subscriptionTerm;
            const dateCreated = new Date(subscription.billing_cycle_anchor * 1000);
            const dateEnding = getBillingEndDate(dateCreated, subscriptionTerm);
            business.billing.subscription.dateCreated = dateCreated;
            business.billing.subscription.dateEnding = dateEnding;
        }
    } else {
        return res.status(500).send("Error deleting the right subscription from our database");
    }

    // save the business
    try { await business.save(); }
    catch (bizSaveError) {
        console.log("Error saving business in cancel subscription webhook: ", bizSaveError);
        return res.status(500).send("Server error saving the business after updating subscription from webhook.");
    }

    res.status(200).send({});
}

module.exports = webhooks;
