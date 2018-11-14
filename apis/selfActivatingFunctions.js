const Users = require('../models/users.js');
const Businesses = require('../models/businesses.js');
const credentials = require('../credentials');

const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.NODE_ENV === "production" ? credentials.stripeSk : credentials.stripeTestSk);
var CronJob = require("cron").CronJob;

// get helper functions
const { sendEmail,
        emailFooter,
        getFirstName,
        devEmail,
        devMode,
        moonshotUrl,
        liveSite,
        isValidEmail
} = require('./helperFunctions');

// run the function to send email updates once a day at 8am LA time
// only do this if in production and on the real site (not the testing site)
if (liveSite) {
    const onComplete = null;
    const onStart = true;
    const timezone = "America/Los_Angeles";
    new CronJob("0 0 8 * * *", safeSendUpdateEmails, onComplete, onStart, timezone);
}

async function safeSendUpdateEmails() {
    try { await sendUpdateEmails(); }
    catch (sendEmailsError) { console.log("Error sending emails: ", sendEmailsError); }
    console.log("Email updates sent!");
}

async function safeStripeUpdates() {
    try { await stripeUpdates(); }
    catch (stripeUpdatesError) { console.log("Error sending emails: ", stripeUpdatesError); }
    console.log("Stripe updates completed!");
}

// global time constants
const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;
const minimumTimes = {
    "Weekly": ONE_DAY * 7,
    "Every 5 Days": ONE_DAY * 5,
    "Every 2 Days": ONE_DAY * 2,
    "Daily": ONE_DAY,
    "never": 0
};
const timeIntervals = {
    "Weekly": "week",
    "Every 5 Days": "five days",
    "Every 2 Days": "two days",
    "Daily": "day"
}

// function that runs once a day and updates every account admin with the number
// of users that have gone through their evaluations
async function sendUpdateEmails() {
    return new Promise(async function(resolve, reject) {
        // go through every business and find out how many new candidates have
        // completed their evaluations in
        try {
            var businesses = await Businesses
                .find({})
                .select("_id positions._id positions.name");
        }
        catch (getBusinessesError) {
            handleError(getBusinessesError);
            return reject(getBusinessesError);
        }

        // create hash table for businesses/positions
        // positions can be accessed via positions[businessId]
        let positions = {};
        businesses.forEach(business => {
            const businessIdString = business._id.toString();
            // hash table for the positions
            positions[businessIdString] = business.positions;
        })

        // get every account admin
        try { var admins = await Users.find({ "userType": "accountAdmin" }); }
        catch(getUsersError) {
            handleError(getUsersError)
            return reject(getUsersError);
        }

        // millis for current time
        const now = (new Date()).getTime();

        // contains one promise for every email being sent
        let emailPromises = [];

        // go through every account admin and find out how many candidates completed
        // evaluations for their company in the timeframe they want notifications about
        for (let adminIdx = 0; adminIdx < admins.length; adminIdx++) {
            emailPromises.push(emailIfEnoughTimeElapsed(admins[adminIdx]));
        }

        // wait for all the emails to finish sending
        try { await Promise.all(emailPromises); }
        catch (emailPromisesError) { return handleError(emailPromisesError); }

        // end the function
        return resolve();


        /* INTERNAL FUNCTIONS */

        // figure out if an email should be sent, and if so, do it
        async function emailIfEnoughTimeElapsed(admin) {
            return new Promise(async function(resolve, reject) {
                if (!isValidEmail(admin.email)) {
                    console.log(`User with id: ${admin._id} had invalid email: ${admin.email}`);
                    return resolve();
                }

                // if the admin does not have notification preferences, create the preferences object
                if (!admin.notifications) { admin.notifications = {}; }
                // if the admin has not marked their preference on time delays between
                // email updates, assume the delay should be 1 day
                if (!admin.notifications.time) { admin.notifications.time = "1 Day"; }
                // if it is unknown if the admin has been sent an update email in the
                // past, assume they haven't been
                if (typeof admin.notifications.firstTime !== "boolean") { admin.notifications.firstTime = true; }

                // IF THIS ADMIN RECEIVED AN EMAIL UPDATE WITHIN THEIR TIMEFRAME FOR
                // SENDING NEW UPDATES, DON'T SEND AN UPDATE
                let notificationInfo = admin.notifications;
                // if user never wants notifications, skip them
                if (notificationInfo.time === "never") {
                    console.log(admin.email, " never wants email updates.");
                    return resolve();
                }
                // millis for approximate time last date email was sent;
                // if an email has never been sent, say one was sent in 1970
                const lastSent = new Date(notificationInfo.lastSent ? notificationInfo.lastSent : 0);
                const lastSentMillis = lastSent.getTime();
                // millis since last email was sent
                const timeSinceLastSent = now - lastSentMillis;
                // minimum time wanted between emails
                let minimumTime = minimumTimes[notificationInfo.time];
                // if invalid setting for sending emails, assume should send them daily
                if (!minimumTime) { minimumTime = ONE_DAY; }
                // check for minimum time minus an hour to account for email send delays
                if (timeSinceLastSent < minimumTime - ONE_HOUR) {
                    console.log("Not enough time elapsed for: ", admin.email);
                    return resolve();
                }

                // id of the business the user works for
                if (!admin.businessInfo || !admin.businessInfo.businessId) {
                    console.log(`Admin with id ${admin._id} id not have business id.`);
                    return resolve();
                }
                const businessId = admin.businessInfo.businessId.toString();
                const businessMongoId = mongoose.Types.ObjectId(businessId);
                // list of all the positions the business offers
                const allPositions = positions[businessId.toString()];
                if (!allPositions) {
                    console.log("No positions for business id: ", businessId.toString());
                    return resolve();
                }

                // contains all the promises that are counting numbers of users
                let countUserPromises = [];

                // find how many users completed each position since the last email was sent
                for (let positionIdx = 0; positionIdx < allPositions.length; positionIdx++) {
                    const completionsQuery = {
                       "userType": "candidate",
                       "positions": {
                           "$elemMatch": {
                               "businessId": businessMongoId,
                               "positionId": mongoose.Types.ObjectId(allPositions[positionIdx]._id),
                               "appliedEndDate": { "$gte" : lastSent }
                           }
                       }
                    }
                    countUserPromises.push(Users.countDocuments(completionsQuery));
                }

                // wait for all the counts to complete
                try { var userCounts = await Promise.all(countUserPromises); }
                catch (countUsersError) {
                    console.log("Error counting users for email update for :", admin.email, countUsersError);
                    return resolve();
                }

                // send email to the user with the counts
                try { await sendUpdateEmail(admin.email, admin.name, allPositions.map(p => p.name), userCounts, timeIntervals[notificationInfo.time], admin.notifications.firstTime); }
                catch (sendEmailError) {
                    console.log("Error sending update email to ", admin.email, sendEmailError);
                    return resolve();
                }

                // update user to contain info about when this email was sent
                admin.notifications.lastSent = now;
                admin.notifications.firstTime = false;
                try { await admin.save(); }
                catch (saveUserError) { console.log("Error saving user with email: ", admin.email, " after sending update email: ", saveUserError); }

                return resolve();
            });
        }

        // creates content then sends the update email
        async function sendUpdateEmail(recipient, recipientName, positionNames, counts, timeInterval, firstTime) {
            return new Promise(async function(resolve, reject) {
                try {
                    let totalCompletions = 0;
                    const countsSection = (`
                        <div style="margin-top: 20px">
                            ${positionNames.map((positionName, positionIdx) => {
                                // number of users who completed this position
                                const count = counts[positionIdx];
                                // add the number of completions for this position to the total
                                totalCompletions += count;
                                return (`
                                    <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d; width:95%; display:inline-block; text-align:left;">
                                        <b style="color:#0c0c0c; display:inline-block">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${positionName}:&nbsp;</b>
                                        <div style="display:inline-block">${count} candidate completion${count === 1 ? "" : "s"} in the past ${timeInterval}</div>
                                    </div>
                                `);
                            })}
                        </div>
                    `);

                    // if there are no completions, don't send the email
                    if (totalCompletions === 0) {
                        console.log("No candidates for: ", recipient);
                        return resolve();
                    }

                    // Section that introduces purpose of email, is different if it is first time sending notification email
                    const introSection = (`
                        <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">
                            ${firstTime ?
                                "My name is Justin and I'm the Chief Product Officer at Moonshot Insights. I'll be sending you emails updating you when candidates complete your evaluations so that you can view their results and move the hiring process along quickly. Here's your first update:"
                                :
                                "It's Justin again with a quick update on your evaluations:"
                            }
                        </div>
                    `);

                    const changeFrequencyNote = `<a style="color:#C8C8C8; margin-top:20px;" href="${moonshotUrl}settings">Change the frequency of your notifications.</a></i><br/>`;

                    const firstName = getFirstName(recipientName);
                    const content = (`
                        <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">
                            <div style="width:95%; display:inline-block; text-align:left;">Hi${firstName ? ` ${firstName},` : ","}</div>
                            ${introSection}
                            ${countsSection}<br/>
                            <a style="display:inline-block;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:6px 30px;text-decoration:none;margin:20px;background:#494b4d;" href="${moonshotUrl}myCandidates">See Results</a>
                            <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">If you have any questions, please feel free to shoot me a message at <b style="color:#0c0c0c">Justin@MoonshotInsights.io</b>. To add your next evaluation, you can go <b style="color:#C8C8C8;" ><a href="${moonshotUrl}myEvaluations?open=true">here</a></b>.</div>
                            <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">Sincerely,<br/><br/>Justin Ye<br/><i>Chief Product Officer</i><br/><b style="color:#0c0c0c">Justin@MoonshotInsights.io</b></div>
                            ${emailFooter(recipient, changeFrequencyNote)}
                        </div>
                    `);

                    const subject = `${totalCompletions} Candidate${totalCompletions === 1 ? "" : "s"} Completed Your Evaluation`;

                    // send the email and then return successfully
                    await sendEmail({
                        recipient, subject, content,
                        senderName: "Justin Ye",
                        senderAddress: "justin"
                    });

                    console.log("email sent to ", recipient);
                    return resolve();
                }
                // simply reject any error that comes up
                catch (emailError) { return reject(emailError); }
            });
        }

        // handles generic errors
        async function handleError(error) {
            console.log("Error sending update emails: ", error);
            const failSubject = "MOONSHOT - IMPORTANT - Error sending email updates to Account Admins";
            const failContent = "Check logs for specific error.";
            const failRecipients = devMode ? devEmail :["ameyer24@wisc.edu", "stevedorn9@gmail.com"];
            try { await sendEmail({ subject: failSubject, recipients: failRecipients, content: failContent}) }
            catch (sendFailEmailFail) { console.log("Also failed sending the email telling us the email failed :("); }
        }
    });
}

// function that runs once a day and updates stripe with cancellations and new subscriptions
async function stripeUpdates() {
    return new Promise(async function(resolve, reject) {
        // go through every business and find out how many new candidates have
        // completed their evaluations in
        try {
            var businesses = await Businesses
                .find({})
                .select("_id billing");
        }
        catch (getBusinessesError) {
            handleError(getBusinessesError);
            return reject(getBusinessesError);
        }

        // millis for current time
        const now = (new Date()).getTime();

        // contains one promise for stripe update
        let stripePromises = [];

        // go through every business and see if their subscriptions on stripe need to be updated
        for (let bizIdx = 0; bizIdx < businesses.length; bizIdx++) {
            let biz = businesses[bizIdx];
            if (biz && biz.billing) {
                stripePromises.push(stripeUpdateBusiness(biz));
            }
        }

        // wait for all the stripe updates to finish
        try { await Promise.all(stripePromises); }
        catch (stripePromisesError) { return handleError(stripePromisesError); }

        // end the function
        return resolve();


        /* INTERNAL FUNCTIONS */

        // update stripe with new subscription info, changes in subscriptions,
        // and cancellations of subscriptions
        async function stripeUpdateBusiness(business) {
            return new Promise(async function(resolve, reject) {
                // billing info variable
                const billing = business.billing;
                // if the business doesn't have a subscription, can't change anything
                if (!billing.subscription || !billing.subscription.id) {
                    return resolve();
                }

                // see when the current subscription ends
                const end = billing.subscription.dateEnding;
                // compare the end date to the date today
                const timeLeft = end - now;

                // if there is less than a week left on the plan
                if (timeLeft < ONE_WEEK) {
                    // if the plan is going to be cancelled, cancel it
                    if (billing.subscription.cancelled) {
                        try {
                            var subscriptions = await stripe.subscriptions.list({ customer: billing.customerId, limit: 3 });
                        } catch (getSubscriptionListError) {
                            console.log("Error getting subscription lists from stripe for business with id: ", business._id, " with error: ", getSubscriptionListError);
                            return resolve();
                        }

                        subIdx = subscriptions.findIndex(sub => { return sub.id === billing.subscription.id})

                        if (subIdx !== -1) {
                            const subscription = subscriptions[subIdx];
                            // the plan is still active and is the correct plan and needs to be cancelled
                            try {
                                var updatedSubscription = await stripe.subscriptions.update(subscription.id, {cancel_at_period_end: true});
                            } catch (deleteSubscriptionError) {
                                console.log("Error deleting subscription from stripe for business with id: ", business._id, " with error: ", deleteSubscriptionError);
                                return resolve();
                            }
                        }
                    }
                    // send an email telling them they have to cancel it manually
                }

                return resolve();
            })
        }

        // handles generic errors
        async function handleError(error) {
            console.log("Error updating stripe: ", error);
            const failSubject = "MOONSHOT - IMPORTANT - Error sending stripe updates";
            const failContent = "Check logs for specific error.";
            const failRecipients = devMode ? devEmail :["ameyer24@wisc.edu", "stevedorn9@gmail.com"];
            try { await sendEmail({ subject: failSubject, recipients: failRecipients, content: failContent}) }
            catch (sendFailEmailFail) { console.log("Also failed sending the email telling us the stripe update failed :("); }
        }
    });
}
