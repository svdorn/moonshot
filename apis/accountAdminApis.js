const Businesses = require('../models/businesses.js');
const Users = require('../models/users.js');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const errors = require('./errors');

// get helper functions
const { sanitize,
        verifyUser,
        sendEmail,
        frontEndUser,
        getAndVerifyUser,
        validArgs,
        moonshotUrl,
        emailFooter
} = require('./helperFunctions.js');

// import random functions from other apis


const adminApis = {
    POST_sendVerificationEmail,
    // POST_identifyATS,
    // POST_integrationSuggestion,
    // POST_languagePreference
}


// --------------------------->> API DEFINITIONS <<--------------------------- //


async function POST_sendVerificationEmail(req, res) {
    // get and verify arguments
    const { userId, verificationToken } = sanitize(req.body);
    const stringArgs = [ userId, verificationToken ];
    if (!validArgs({ stringArgs })) { return res.status(400).send(errors.BAD_REQUEST); }

    // get the user who wants to verify their email
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting account admin user who wants to send verification token: ", getUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // see if they have already been verified
    if (user.verified) { return res.status(200).send({alreadyVerified: true}); }

    // create email verification token
    user.emailVerificationToken = crypto.randomBytes(64).toString('hex');
    // set expiration date for verification token
    const oneHour = 1000 * 60 * 60; // millis * seconds * minutes
    const expirationDate = new Date((new Date).getTime() + oneHour);
    user.emailVerificationTokenExpires = expirationDate;

    // save the user
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving account admin user while sending verification email: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // send email with that info to the user
    let recipients = [ user.email ];
    let subject = 'Verify email';
    let content = (`
        <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">
            <div style="font-size:28px;color:#0c0c0c;">Verify Your Moonshot Account</div>
            <p style="width:95%; display:inline-block; text-align:left;">You&#39;re almost there! The last step is to click the button below to verify your account.</p><br/>
            <p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights!</p><br/>
            <a style="display:inline-block;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:6px 30px;text-decoration:none;margin:20px;background:#494b4d;" href="${moonshotUrl}verifyEmail?token=${user.emailVerificationToken}">Verify Account</a>
            <p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>
            ${emailFooter(user.email)}
        </div>
    `);

    try { await sendEmail({ recipients, subject, content }); }
    catch (sendEmailError) {
        console.log("Error sending email to account admin trying to verify account: ", sendEmailError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    res.status(200).send({success: true});
}


// // mark which ats your company uses during onboarding
// async function POST_identifyATS(req, res) {
//     const { userId, verificationToken, ats } = sanitize(req.body);
//     // query to find the user
//     const find = { _id: userId, verificationToken };
//     // query to update the preferred ats of the user
//     const update = { "$set": { "onboarding.ats": ats } }
//     // return the updated user
//     const options = { "new": true };
//     // find and update the user with new ats
//     try { var user = await Users.findOneAndUpdate(find, update, options); }
//     catch (updateError) {
//         console.log("Error updating user's preferred ats: ", updateError);
//         return res.status(500).send(errors.SERVER_ERROR);
//     }
//     // if the user didn't provide the correct user id/verification token combo
//     if (!user) { return res.status(400).send("Invalid user credentials."); }
//     // return the updated user
//     res.status(200).send({ user });
//
//     // SEND AN EMAIL TO US TELLING US WHICH ATS THE BUSINESS USES
//     // get the business the user works for
//     let business;
//     try { business = await Businesses.findById(user.businessInfo.businessId).select("name"); }
//     catch (findBizError) {
//         console.log("Error finding business from user who marked their ats: ", findBizError);
//         // need a business with a name to send the email
//         business = { name: "unknown" };
//     }
//     // set up the email
//     const recipients = process.env.NODE_ENV === "development" ? process.env.DEV_EMAIL : ["kyle@moonshotinsights.io", "ameyer24@wisc.edu", "stevedorn9@gmail.com"];
//     const subject = "Account Admin Marked ATS System They Use";
//     const content = (
//         `<div>
//             <p>User: ${user.name}</p>
//             <p>Email: ${user.email}</p>
//             <p>Business: ${business.name}</p>
//             <p>ATS Used: ${ats}</p>
//         </div>`
//     )
//     // send the email
//     sendEmail({ recipients, subject, content }).then().catch(error => {
//         console.log("Error sending email alerting founders of ats used by customer: ", error);
//     });
// }
//
//
// // mark your suggestion for an integration method
// async function POST_integrationSuggestion(req, res) {
//     const { userId, verificationToken, suggestion } = sanitize(req.body);
//     console.log("userId: ", userId, "verificationToken: ", verificationToken);
//     // query to find the user
//     const find = { _id: userId, verificationToken };
//     // query to update the integration suggestion of the user
//     const update = { "$set": { "onboarding.integrationSuggestion": suggestion } }
//     // return the updated user
//     const options = { "new": true };
//     // find and update the user with new integration suggestion
//     try { var user = await Users.findOneAndUpdate(find, update, options); }
//     catch (updateError) {
//         console.log("Error updating user's integration suggestion: ", updateError);
//         return res.status(500).send(errors.SERVER_ERROR);
//     }
//     // if the user didn't provide the correct user id/verification token combo
//     if (!user) { return res.status(400).send("Invalid user credentials."); }
//     // return the updated user
//     res.status(200).send({ user });
//
//     // SEND AN EMAIL TO US TELLING US WHICH ATS THE BUSINESS USES
//     // get the business the user works for
//     let business;
//     try { business = await Businesses.findById(user.businessInfo.businessId).select("name"); }
//     catch (findBizError) {
//         console.log("Error finding business from user who marked their integration suggestion: ", findBizError);
//         // need a business with a name to send the email
//         business = { name: "unknown" };
//     }
//     // set up the email
//     const recipients = process.env.NODE_ENV === "development" ? process.env.DEV_EMAIL : ["kyle@moonshotinsights.io", "ameyer24@wisc.edu", "stevedorn9@gmail.com"];
//     const subject = "Account Admin Suggested an Integration Method";
//     const content = (
//         `<div>
//             <p>User: ${user.name}</p>
//             <p>Email: ${user.email}</p>
//             <p>Business: ${business.name}</p>
//             <p>Integration suggestion: ${suggestion}</p>
//         </div>`
//     )
//     // send the email
//     sendEmail({ recipients, subject, content }).then().catch(error => {
//         console.log("Error sending email alerting founders of customer integration suggestion: ", error);
//     });
// }
//
//
// // mark what language you want to use to integrate with Moonshot
// async function POST_languagePreference(req, res) {
//     const { userId, verificationToken, languagePreference, customLanguage } = sanitize(req.body);
//     console.log("userId: ", userId, "verificationToken: ", verificationToken);
//     // query to find the user
//     const find = { _id: userId, verificationToken };
//     // query to update the language preference of the user
//     const update = { "$set": {
//         "onboarding.languagePreference": languagePreference,
//         "onboarding.customLanguage": customLanguage
//     } };
//     // return the updated user
//     const options = { "new": true };
//     // find and update the user with new ats
//     try { var user = await Users.findOneAndUpdate(find, update, options); }
//     catch (updateError) {
//         console.log("Error updating user's integration suggestion: ", updateError);
//         return res.status(500).send(errors.SERVER_ERROR);
//     }
//     // if the user didn't provide the correct user id/verification token combo
//     if (!user) { return res.status(400).send("Invalid user credentials."); }
//     // return the updated user
//     res.status(200).send({ user });
//
//     // SEND AN EMAIL TO US TELLING US WHICH ATS THE BUSINESS USES
//     // get the business the user works for
//     let business;
//     try { business = await Businesses.findById(user.businessInfo.businessId).select("name"); }
//     catch (findBizError) {
//         console.log("Error finding business from user who marked their preferred integration language: ", findBizError);
//         // need a business with a name to send the email
//         business = { name: "unknown" };
//     }
//     // set up the email
//     const recipients = process.env.NODE_ENV === "development" ? process.env.DEV_EMAIL : ["kyle@moonshotinsights.io", "ameyer24@wisc.edu", "stevedorn9@gmail.com"];
//     const subject = "Account Admin Marked Preferred Integration Language";
//     const content = (
//         `<div>
//             <p>User: ${user.name}</p>
//             <p>Email: ${user.email}</p>
//             <p>Business: ${business.name}</p>
//             <p>Preferred language: ${languagePreference}</p>
//             ${customLanguage ? `<p>Custom Language: ${customLanguage}` : ""}
//         </div>`
//     )
//     // send the email
//     sendEmail({ recipients, subject, content }).then().catch(error => {
//         console.log("Error sending email alerting founders of customer integration suggestion: ", error);
//     });
// }


// <<----------------------------------------------------------------------->> //


module.exports = adminApis;
