const Users = require('../models/users.js');
const Businesses = require('../models/businesses.js');

const mongoose = require("mongoose");

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        userForAdmin,
        getFirstName,
        getAndVerifyUser,
        frontEndUser,
        getSkillNamesByIds,
        NO_TOKENS
} = require('./helperFunctions');

const errors = require('./errors.js');

const billingApis = {
    POST_customer
}

async function POST_customer(req, res) {
    // get info

    const stripe = require("stripe")("sk_test_lJ6Gk1lWmEsMLoLGEKJCYFq8");

    // give business object the Stripe source

    // send source to Stripe to create person

}

module.exports = billingApis;
