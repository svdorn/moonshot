const Users = require('../models/users.js');
const Businesses = require('../models/businesses.js');
const credentials = require('../credentials');

const mongoose = require("mongoose");
let stripe_sk = credentials.stripeTestSk;
if (process.env.NODE_ENV === "production") {
    stripe_sk = credentials.stripeSk;
}
const stripe = require("stripe")(stripe_sk);

// get helper functions
const { sanitize,
        getAndVerifyUser,
        frontEndUser
} = require('./helperFunctions');

const errors = require('./errors.js');

const billingApis = {
    POST_customer
}

async function POST_customer(req, res) {
    return new Promise(async function(resolve, reject) {
        const { email, source, userId, verificationToken } = sanitize(req.body);

        // if one of the arguments doesn't exist, return with error code
        if (!email || !source || !userId || !verificationToken) {
            return res.status(400).send("Bad request.");
        }

        // send source to Stripe to create person
        let customer;
        try {
            customer = await stripe.customers.create({
                email,
                source
            });
        } catch (createCustomerError) {
            console.log("Error creting a customer: ", createCustomerError);
            return res.status(403).send("Customer creation failed.");
        }
        // give business object the Stripe customer
        let user;
        let business;
        try {
            user = await getAndVerifyUser(userId, verificationToken);
            business = await Businesses.findById(user.businessInfo.businessId);
            if (!business) {
                console.log("No business found with id: ", user.businessInfo.businessId);
                throw "No business.";
            }
        } catch (getUserError) {
            console.log("Error getting user or business from user: ", getUserError);
            return res.status(403).send("You do not have permission to do add credit card.");
        }

        business.billingCustomerId = customer.id;

        // save the business
        try { await business.save(); }
        catch (bizSaveError) {
            console.log("Error saving business when adding credit card: ", bizSaveError);
            return res.status(500).send("Server error, try again later.");
        }

        return res.json("Success");
    });
}

// TODO: METHOD DESCRIPTOR
async function POST_customer(req, res) {
    return new Promise(function(resolve, reject) {
    })
}

module.exports = billingApis;
