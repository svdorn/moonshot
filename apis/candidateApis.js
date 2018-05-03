var Users = require('../models/users.js');
var Referrals = require('../models/referrals.js');

var bcrypt = require('bcryptjs');
const crypto = require('crypto');


// get helper functions
const helperFunctions = require('./helperFunctions.js');
const sanitize = helperFunctions.sanitize;
const removeEmptyFields = helperFunctions.removeEmptyFields;
const verifyUser = helperFunctions.verifyUser;
const removePassword = helperFunctions.removePassword;
const getUserByQuery = helperFunctions.getUserByQuery;
const sendEmail = helperFunctions.sendEmail;
const safeUser = helperFunctions.safeUser;
const userForAdmin = helperFunctions.userForAdmin;
const getFirstName = helperFunctions.getFirstName;


const candidateApis = {
    POST_updateAllOnboarding,
    POST_candidate
}


function POST_candidate(req, res) {
    var user = sanitize(req.body);

    // hash the user's password
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            // change the stored password to be the hash
            user.password = hash;
            user.verified = false;
            user.hasFinishedOnboarding = false;

            // create user's verification strings
            user.emailVerificationToken = crypto.randomBytes(64).toString('hex');
            user.verificationToken = crypto.randomBytes(64).toString('hex');
            const query = {email: user.email};

            getUserByQuery(query, function(err, foundUser) {
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error creating account, try with a different email or try again later.");
                }
                if (foundUser == null || foundUser == undefined) {
                    // get count of users with that name to get the profile url
                    Users.count({name: user.name}, function (err, count) {
                        const randomNumber = crypto.randomBytes(8).toString('hex');
                        user.profileUrl = user.name.split(' ').join('-') + "-" + (count + 1) + "-" + randomNumber;
                        user.admin = false;
                        user.agreedToTerms = true;
                        let addedPathway = false;

                        // add pathway to user's My Pathways if they went from
                        // a landing page.
                        // TODO: CHANGE THIS. RIGHT NOW THIS WILL ONLY WORK FOR THE NWM PATHWAY OR SINGLEWIRE PATHWAY
                        if (user.pathwayId === "5a80b3cf734d1d0d42e9fcad" || user.pathwayId === "5a88b4b8734d1d041bb6b386" || user.pathwayId === "5abc12cff36d2805e28d27f3" || user.pathwayId === "5ac3bc92734d1d4f8afa8ac4") {
                            user.pathways = [{
                                pathwayId: user.pathwayId,
                                currentStep: {
                                    subStep: 1,
                                    step: 1
                                }
                            }];
                            addedPathway = true;
                        }
                        else {
                            user.pathwayId = undefined;
                        }

                        user.dateSignedUp = new Date();
                        // make sure referral code is a string, if not set it
                        // to undefined (will happen if there is no referral code as well)
                        if (typeof user.signUpReferralCode !== "string") {
                            user.signUpReferralCode = undefined;
                        }

                        // store the user in the db
                        Users.create(user, function (err, newUser) {
                            if (err) {
                                console.log(err);
                            }

                            req.session.unverifiedUserId = newUser._id;
                            req.session.save(function (err) {
                                if (err) {
                                    console.log("error saving unverifiedUserId to session: ", err);
                                }
                            })

                            if (user.signUpReferralCode) {
                                Referrals.findOne({referralCode: user.signUpReferralCode}, function(referralErr, referrer) {
                                    if (referralErr) {
                                        console.log("Error finding referrer for new sign up: ", referralErr);
                                    } else if (!referrer) {
                                        console.log("Invalid referral code used: ", user.signUpReferralCode);
                                    } else {
                                        referrer.referredUsers.push({
                                            name: newUser.name,
                                            email: newUser.email,
                                            _id: newUser._id
                                        });
                                        referrer.save(function(referrerSaveErr, newReferrer) {
                                            if (referrerSaveErr) {
                                                console.log("Error saving referrer: ", referrerSaveErr);
                                            }
                                        });
                                    }
                                });
                            }

                            try {
                                // send email to everyone if there's a new sign up (if in production mode)
                                if (process.env.NODE_ENV) {
                                    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com", "ameyer24@wisc.edu"];

                                    let subject = 'New Sign Up';
                                    let additionalText = '';
                                    if (addedPathway) {
                                        let pathName = "Singlewire QA";
                                        if (user.pathwayId === "5a80b3cf734d1d0d42e9fcad") {
                                            pathName = "Northwestern Mutual";
                                        }
                                        else if (user.pathwayId === "5abc12cff36d2805e28d27f3") {
                                            pathName = "Curate Full-Stack";
                                        }
                                        else if (user.pathwayId === "5ac3bc92734d1d4f8afa8ac4") {
                                            pathName = "Dream Home CEO";
                                        }
                                        additionalText = '<p>Also added pathway: ' +  pathName + '</p>';
                                    }
                                    let content =
                                        '<div>'
                                        +   '<p>New user signed up.</p>'
                                        +   '<p>Name: ' + newUser.name + '</p>'
                                        +   '<p>email: ' + newUser.email + '</p>'
                                        +   additionalText
                                        + '</div>';

                                    const sendFrom = "Moonshot";
                                    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
                                        if (!success) {
                                            console.log("Error sending sign up alert email");
                                        }
                                    })
                                }
                            } catch (e) {
                                console.log("ERROR SENDING EMAIL ALERTING US THAT A NEW USER SIGNED UP: ", e);
                            }

                            // no reason to return the user with tokens because
                            // they will have to verify themselves before they
                            // can do anything anyway
                            res.json(safeUser(newUser));

                            // send an email to the user one day after signup
                            try {
                                const ONE_DAY = 1000 * 60 * 60 * 24;

                                let moonshotUrl = 'https://www.moonshotlearning.org/';
                                // if we are in development, links are to localhost
                                if (!process.env.NODE_ENV) {
                                    moonshotUrl = 'http://localhost:8081/';
                                }

                                let firstName = getFirstName(newUser.name);
                                // add in a space before the name, if the user has a name
                                if (firstName != "") {
                                    firstName = " " + firstName;
                                }

                                setTimeout(function() {
                                    let dayAfterRecipient = [newUser.email];
                                    let dayAfterSubject = 'Moonshot Fights For You';
                                    let dayAfterContent =
                                        "<div style='font-size:15px;text-align:left;font-family: Arial, sans-serif;color:#000000'>"
                                            + "<p>Hi" + firstName + ",</p>"
                                            + "<p>My name is Kyle. I'm the co-founder and CEO at Moonshot. I'm honored that you trusted us in your career journey. If you need anything at all, please let me know.</p>"
                                            + "<p>I individually fight for every Moonshot candidate — Mock interviews, inside tips that our employers are looking for, anything to help you start the career of your dreams.</p>"
                                            + "<p>Shoot me a message. I'm all ears.</p>"
                                            + "<p>Yours truly,<br/>Kyle</p>"
                                            + "<div style='font-size:10px; text-align:left; color:#000000; margin-bottom:50px;'>"
                                                + "----------------------------------<br/>"
                                                + "Kyle Treige, Co-Founder & CEO<br/>"
                                                + "<a href='https://moonshotlearning.org/'>Moonshot</a><br/>"
                                                + "608-438-4478<br/>"
                                            + "</div>"
                                            + "<div style='font-size:10px; text-align:left; color:#C8C8C8; margin-bottom:30px;'>"
                                                + "<i>Moonshot Learning, Inc.<br/><a href='' style='text-decoration:none;color:#D8D8D8;cursor:default'>1261 Meadow Sweet Dr, Madison, WI 53719</a>.<br/>"
                                                + '<a style="color:#C8C8C8;" href="' + moonshotUrl + 'unsubscribe?email=' + newUser.email + '">Opt-out of future messages.</a></i>'
                                            + "</div>"
                                        + "</div>";

                                    const dayAfterSendFrom = "Kyle Treige";
                                    sendEmail(dayAfterRecipient, dayAfterSubject, dayAfterContent, dayAfterSendFrom, undefined, function (success, msg) {
                                        if (success) {
                                            console.log("sent day-after email");
                                        } else {
                                            console.log("error sending day-after email");
                                        }
                                    })
                                }, ONE_DAY);
                            } catch (e) {
                                console.log("Not able to send day-after email to ", newUser.name, "with id: ", newUser._id);
                                console.log("Error: ", e);
                            }
                        })
                    })
                } else {
                    res.status(401).send("An account with that email address already exists.");
                }
            });
        });
    });
}


// saves all three onboarding steps
function POST_updateAllOnboarding(req, res) {
    const info = sanitize(req.body.params.info);
    const goals = sanitize(req.body.params.goals);
    const interests = sanitize(req.body.params.interests);
    const userId = sanitize(req.body.params.userId);
    const verificationToken = sanitize(req.body.params.verificationToken);

    if (userId && verificationToken) {
        // When true returns the updated document
        Users.findById(userId, function (findErr, user) {
            if (findErr) {
                console.log("Error finding user when updating info during onboarding: ", findErr);
                res.status(500).send("Server error");
                return;
            }

            if (!verifyUser(user, verificationToken)) {
                console.log("Couldn't verify user when trying to update onboarding info.");
                res.status(401).send("User does not have valid credentials to update info.");
                return;
            }

            if (info) {
                // if info exists, try to save it
                const fullInfo = removeEmptyFields(info);

                for (const prop in fullInfo) {
                    // only use properties that are not inherent to all objects
                    if (info.hasOwnProperty(prop)) {
                        console.log("updating " + prop + " to ", fullInfo[prop]);
                        user.info[prop] = fullInfo[prop];
                    }
                }
            }

            // if goals exist, save them
            if (goals) {
                user.info.goals = goals
            }

            // if interests exist, save them
            if (interests) {
                user.info.interests = interests;
            }

            user.save(function (saveErr, updatedUser) {
                if (saveErr) {
                    console.log("Error saving user information when updating info from onboarding: ", saveErr);
                    res.status(500).send("Server error, couldn't save information.");
                    return;
                }
                res.send(removePassword(updatedUser));
            });
        })
    } else {
        console.log("Didn't have info or a user id or both.")
        res.status(403).send("Bad request.");
    }
}


module.exports = candidateApis;
