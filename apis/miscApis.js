var Referrals = require('../models/referrals.js');
var Emailaddresses = require('../models/emailaddresses.js');

const crypto = require('crypto');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        sendEmail,
        getFirstName,
        frontEndUser
} = require('./helperFunctions.js');


const miscApis = {
    POST_createReferralCode,
    POST_unsubscribeEmail
}


function POST_createReferralCode(req, res) {
    const name = sanitize(req.body.name);
    // make it to lower case so that it's case insensitive
    const email = sanitize(req.body.email).toLowerCase();

    let sendReferralEmail = function(theCode) {
        // if we're in development (on localhost) navigate to localhost
        let moonshotUrl = "https://www.moonshotinsights.io/";
        if (process.env.NODE_ENV === "development") {
            moonshotUrl = "http://localhost:8081/";
        }
        const recipient = [email];
        const subject = "Moonshot Referral Code";
        const emailContent =
            "<div style='color:black'>"
            +   "<p>Hello " + name + ",</p>"

            +   "<p>Thank you for signing up as a Moonshot referrer! With us, you can shape the future of the workforce and get paid to do it. Moonshot trains and evaluates college students and recent graduates in skills and positions needed by employers. We do this by creating course pathways that evaluate candidates in positions that our employer partners are hiring for. <a href='https://moonshotinsights.io/'>Check out all of our positions</a>.</p>"

            +   "<p>You will earn $300 for everyone you send our way that gets a job through the Moonshot site.</p>"

            +   "<p>For you to receive credit for a Moonshot user, the user must do one of the following:</p>"
            +   "<p>1. Input your referral code (this is your code: " + theCode + ") at the end of the Pathway when asked how he or she heard about Moonshot.</p>"
            +   "<p>2. Sign up by coming through your unique referrer link: <br/><a href='" + moonshotUrl + "?referralCode=" + theCode + "'>" + moonshotUrl + "?referralCode=" + theCode + "</a></p>"

            +   "<p>A lot of people start by sharing with friends in person and on social media. The people really on their game carry around cards to be ready for any situation. (Let me know if you want card designs to print off.)</p>"

            +   "<p>I'm always excited to strategize tactics and techniques to attract candidates. Shoot me a message if you would like to brainstorm. Remember, all of your outreach must be in accordance with the Moonshot Affiliate Agreement you accepted.</p>"

            +   "<p>Happy referring!</p>"
            +   "<p>Kyle</p>"

            +   "<p>-----------------------------</p>"
            +   "<div style='font-size:12px'>Kyle Treige, Co-Founder & CEO<br/>"
            +   "<a href='" + moonshotUrl + "'>Moonshot<br/>"
            +   "kyle@moonshotinsights.io<br/>"
            +   "608-438-4478</div>"

            +   '<div style="font-size:10px; color:#C8C8C8; margin-top:30px; margin-bottom:30px;">'
            +       '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
            +       '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + email + '">Opt-out of future messages.</a></i>'
            +   '</div>'

            + "</div>";

        // send email to user who asked for a referral code with the info about the code
        const sendFrom = "Kyle Treige";
        sendEmail(recipient, subject, emailContent, sendFrom, undefined, function (success, msg) {
            if (!success) {
                console.log("Email not sent to user about referral code. Message: ", msg);
            }
        })
    }

    const query = {email};

    Referrals.findOne(query, function(err, user) {
        // if there was an error somewhere along the way getting the user
        if (err) {
            return res.status(500).send("Server error, try again later.");
        }
        // if this user has not already asked for a referral code
        else if (user == null) {
            // create the referral code randomly
            const referralCode = crypto.randomBytes(4).toString('hex');
            // the amount we said we'd pay the user for their friend using this code
            const incentive = "$300";
            const userBeingCreated = {name, email, referralCode, incentive}

            // TODO: check if the referral code was already created, make a new
            // one if so

            Referrals.create(userBeingCreated, function(error, newUser) {
                // if there was an error creating the user
                if (error) {
                    return res.status(500).send("Server error, try again later.");
                } else {
                    sendReferralEmail(newUser.referralCode);
                    return res.json(newUser.referralCode);
                }
            });
        }
        // if the user has asked for a referral code in the past
        else {
            // if the user already has a referral code, give them that
            sendReferralEmail(user.referralCode);
            res.json(user.referralCode);
        }
    });
}


function POST_unsubscribeEmail(req, res) {
    let recipient = ["kyle@moonshotinsights.io"];
    let subject = 'URGENT ACTION - User Unsubscribe from Moonshot';
    let content = "<div>"
        + "<h3>This email is Unsubscribing from Moonshot Emails:</h3>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("You have successfully unsubscribed.");
        } else {
            res.status(500).send(msg);
        }
    });

    const optOutError = function(error) {
        console.log("ERROR ADDING EMAIL TO OPT OUT LIST: " + req.body.email);
        console.log("The error was: ", error);
        let recipient = ["ameyer24@wisc.edu"];
        let subject = "MOONSHOT - URGENT ACTION - User was not unsubscribed"
        let content = "<div>"
            + "<h3>This email could not be added to the optOut list:</h3>"
            + "<p>Email: "
            + sanitize(req.body.email)
            + "</p>"
            + "</div>";
        sendEmail(recipient, subject, content, sendFrom, undefined, function(){});
    }

    // add email to list of unsubscribed emails
    Emailaddresses.findOne({name: "optedOut"}, function(err, optedOut) {
        if (err) {
            optOutError(err);
        }
        else {
            optedOut.emails.push(req.body.email);
            optedOut.save(function(err2, newOptedOut) {
                if (err2) {
                    optOutError(err2);
                }
            });
        }
    });
}


module.exports = miscApis;
