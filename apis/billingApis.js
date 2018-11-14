const Users = require('../models/users.js');
const Businesses = require('../models/businesses.js');
const credentials = require('../credentials');

const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.NODE_ENV === "production" ? credentials.stripeSk : credentials.stripeTestSk);

// get helper functions
const { sanitize,
        getAndVerifyUser,
        frontEndUser,
        sendEmail,
        emailFooter
} = require('./helperFunctions');

const errors = require('./errors.js');

const billingApis = {
    POST_customer,
    POST_updateSource,
    POST_cancelPlan,
    POST_pausePlan
}

// post a new customer with their credit card info and subscription selection
async function POST_customer(req, res) {
    return new Promise(async function(resolve, reject) {
        const { email, source, userId, verificationToken, subscriptionTerm } = sanitize(req.body);

        // if one of the arguments doesn't exist, return with error code
        if (!email || !source || !userId || !verificationToken || !subscriptionTerm) {
            return res.status(400).send("Bad request.");
        }

        // send source to Stripe to create person
        try {
            var customer = await stripe.customers.create({
                email,
                source
            });
        } catch (createCustomerError) {
            console.log("Error creting a customer: ", createCustomerError);
            return res.status(403).send("Customer creation failed.");
        }
        // give business object the Stripe customer
        try {
            var user = await getAndVerifyUser(userId, verificationToken);
            var business = await Businesses.findById(user.businessInfo.businessId);
            if (!business) {
                console.log("No business found with id: ", user.businessInfo.businessId);
                throw "No business.";
            }
        } catch (getUserError) {
            console.log("Error getting user or business from user: ", getUserError);
            return res.status(403).send("You do not have permission to do add credit card.");
        }

        // add billing info to the business
        business.billing = {};
        business.billing.customerId = customer.id;
        business.billing.cardOnFile = true;

        try {
            var subscription = await addSubscription(business.billing.customerId, subscriptionTerm);
        } catch(error) {
            console.log("Error adding subscription.");
            return reject("Error adding subscription.");
        }

        // add subscription info to the user
        business.billing.subscription = {};
        business.billing.subscription.name = subscriptionTerm;
        const dateCreated = new Date(subscription.billing_cycle_anchor * 1000);
        const dateEnding = getEndDate(dateCreated, subscriptionTerm);
        business.billing.subscription.dateCreated = dateCreated;
        business.billing.subscription.dateEnding = dateEnding;

        // save the business
        try { await business.save(); }
        catch (bizSaveError) {
            console.log("Error saving business when adding credit card: ", bizSaveError);
            return res.status(500).send("Server error, try again later.");
        }

        return res.json(business.billing);
    });
}

// post a new customer with their credit card info and subscription selection
async function POST_updateSource(req, res) {
    return new Promise(async function(resolve, reject) {
        const { source, userId, verificationToken } = sanitize(req.body);

        // if one of the arguments doesn't exist, return with error code
        if (!source || !userId || !verificationToken) {
            return res.status(400).send("Bad request.");
        }

        // give business object the Stripe customer
        try {
            var user = await getAndVerifyUser(userId, verificationToken);
            var business = await Businesses.findById(user.businessInfo.businessId);
            if (!business) {
                console.log("No business found with id: ", user.businessInfo.businessId);
                throw "No business.";
            }
        } catch (getUserError) {
            console.log("Error getting user or business from user: ", getUserError);
            return res.status(403).send("You do not have permission to do add credit card.");
        }

        // update source in stripe
        try {
            var customer = await stripe.customers.update(business.billing.customerId, {
                source
            });
        } catch (createCustomerError) {
            console.log("Error creting a customer: ", createCustomerError);
            return res.status(403).send("Customer creation failed.");
        }

        business.billing.cardOnFile = true;

        // save the business
        try { await business.save(); }
        catch (bizSaveError) {
            console.log("Error saving business when adding credit card: ", bizSaveError);
            return res.status(500).send("Server error, try again later.");
        }

        return res.json(business.billing);
    })
}

async function POST_cancelPlan(req, res) {
    return new Promise(async function(resolve, reject) {
        const { userId, verificationToken, message } = sanitize(req.body);

        // if one of the arguments doesn't exist, return with error code
        if (!userId || !verificationToken) {
            return res.status(400).send("Bad request.");
        }

        // give business object the Stripe customer
        try {
            var user = await getAndVerifyUser(userId, verificationToken);
            var business = await Businesses.findById(user.businessInfo.businessId);
            if (!business) {
                console.log("No business found with id: ", user.businessInfo.businessId);
                throw "No business.";
            }
        } catch (getUserError) {
            console.log("Error getting user or business from user: ", getUserError);
            return res.status(403).send("You do not have permission to do add credit card.");
        }

        if (business.billing && business.billing.subscription) {
            business.billing.subscription.cancelled = true;
            sendCancelEmail("cancel", business.name, message, business.billing)
        } else {
            return res.status(400).send("Business does not have any billing info.");
        }

        // save the business
        try { await business.save(); }
        catch (bizSaveError) {
            console.log("Error saving business when adding credit card: ", bizSaveError);
            return res.status(500).send("Server error, try again later.");
        }

        return res.json(business.billing);
    });
}

async function POST_pausePlan(req, res) {
    return new Promise(async function(resolve, reject) {
        const { userId, verificationToken, message } = sanitize(req.body);

        // if one of the arguments doesn't exist, return with error code
        if (!userId || !verificationToken) {
            return res.status(400).send("Bad request.");
        }

        // give business object the Stripe customer
        try {
            var user = await getAndVerifyUser(userId, verificationToken);
            var business = await Businesses.findById(user.businessInfo.businessId);
            if (!business) {
                console.log("No business found with id: ", user.businessInfo.businessId);
                throw "No business.";
            }
        } catch (getUserError) {
            console.log("Error getting user or business from user: ", getUserError);
            return res.status(403).send("You do not have permission to do add credit card.");
        }

        if (business.billing) {
            sendCancelEmail("pause", business.name, message, business.billing)
        } else {
            return res.status(400).send("Business does not have any billing info.");
        }

        return res.json(business.billing);
    });
}

// add a subscription to a new customer
async function addSubscription(customerId, subscriptionTerm) {
    return new Promise(async function(resolve, reject) {
        const index = credentials.plans.findIndex(plan => {
            return plan.period.toString() === subscriptionTerm.toString();
        });


        try {
            var subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{plan: process.env.NODE_ENV === "production" ? credentials.plans[index].id : credentials.plans[index].test_id}]
            });
        } catch(error) {
            console.log("Error adding subscription: ", error);
            return reject("Error adding subscription.");
        }

        return resolve(subscription);
    })
}

// send email to verify user account
async function sendCancelEmail(type, business, message, billing) {
    return new Promise(async function(resolve, reject) {
        let recipients = ["kyle@moonshotinsights.io", "stevedorn9@gmail.com"];
        let subject = "Cancel/Pausing of Plan";
        const content = `<div>
                <h2>Cancel/Pausing of a Plan</h2>
                <h3>Type</h3>
                <p>${type}</p>
                <h3>Business Name</h3>
                <p>${business}</p>
                <h3>Message</h3>
                <p>${message}</p>
                <h3>Billing Info</h3>
                <p>${billing}</p>
            </div>`;

        try {
            await sendEmail({ recipients, subject, content });
            return resolve();
        } catch (sendEmailError) {
            // send email error
            return reject(sendEmailError);
        }
    });
}

// get the end date of a subscription and return it
function getEndDate(startDate, subscriptionTerm) {
    // number of months the subscription lasts
    let subscriptionLength = 0;

    switch(subscriptionTerm) {
        case "1 year":
            subscriptionLength = 12;
            break;
        case "6 months":
            subscriptionLength = 6;
            break;
        case "3 months":
            subscriptionLength = 3;
            break;
        case "1 month":
            subscriptionLength = 1;
            break;
        default:
            subscriptionLength = 0;
            break;
    }
    // get the end date
    let endDate = new Date(startDate);
    endDate = endDate.setMonth(endDate.getMonth() + subscriptionLength);

    return endDate;
}

module.exports = billingApis;
