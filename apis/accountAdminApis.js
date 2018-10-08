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
const { sendVerificationEmail } = require("./userApis.js");

const adminApis = {
    POST_sendVerificationEmail
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
    // // set expiration date for verification token
    // const oneHour = 1000 * 60 * 60; // millis * seconds * minutes
    // const expirationDate = new Date((new Date).getTime() + oneHour);
    // user.emailVerificationTokenExpires = expirationDate;

    // save the user
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving account admin user while sending verification email: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    try { await sendVerificationEmail(user); }
    catch (sendEmailError) {
        console.log("Error sending email to account admin trying to verify account: ", sendEmailError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    //
    // // send email with that info to the user
    // let recipients = [ user.email ];
    // let subject = 'Verify email';
    // let content = (`
    //     <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">
    //         <div style="font-size:28px;color:#0c0c0c;">Verify Your Moonshot Account</div>
    //         <p style="width:95%; display:inline-block; text-align:left;">You&#39;re almost there! The last step is to click the button below to verify your account.</p><br/>
    //         <p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights!</p><br/>
    //         <a style="display:inline-block;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:6px 30px;text-decoration:none;margin:20px;background:#494b4d;" href="${moonshotUrl}verifyEmail?token=${user.emailVerificationToken}">Verify Account</a>
    //         <p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>
    //         ${emailFooter(user.email)}
    //     </div>
    // `);
    //
    // try { await sendEmail({ recipients, subject, content }); }
    // catch (sendEmailError) {
    //     console.log("Error sending email to account admin trying to verify account: ", sendEmailError);
    //     return res.status(500).send(errors.SERVER_ERROR);
    // }

    res.status(200).send({success: true});
}


// <<----------------------------------------------------------------------->> //


module.exports = adminApis;
