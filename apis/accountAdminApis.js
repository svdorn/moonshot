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
        sendEmailPromise,
        frontEndUser,
        getAndVerifyUser,
        validArgs
} = require('./helperFunctions.js');

// import random functions from other apis


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

    let moonshotUrl = 'https://moonshotinsights.io/';
    // if we are in development, links are to localhost
    if (process.env.NODE_ENV === "development") {
        moonshotUrl = 'http://localhost:8081/';
    }

    // send email with that info to the user
    let recipients = [ user.email ];
    let subject = 'Verify email';
    let content =
        '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
            + '<div style="font-size:28px;color:#0c0c0c;">Verify Your Moonshot Account</div>'
            + '<p style="width:95%; display:inline-block; text-align:left;">You&#39;re almost there! The last step is to click the button below to verify your account.'
            + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights!</p><br/>'
            + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'verifyEmail?token='
            + user.emailVerificationToken
            + '">Verify Account</a>'
            + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
            + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
            + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
            + '<div style="text-align:left;width:95%;display:inline-block;">'
                + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + user.email + '">Opt-out of future messages.</a></i>'
                + '</div>'
            + '</div>'
        + '</div>';

    const sendFrom = "Moonshot";

    try { await sendEmailPromise({ recipients, subject, content, sendFrom }); }
    catch (sendEmailError) {
        console.log("Error sending email to account admin trying to verify account: ", sendEmailError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    res.status(200).send({success: true});
}


// <<----------------------------------------------------------------------->> //


module.exports = adminApis;
