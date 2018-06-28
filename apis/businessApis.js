const Businesses = require("../models/businesses.js");
const Users = require("../models/users.js");
const Psychtests = require("../models/psychtests.js");
const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        getUserByQuery,
        sendEmail,
        getFirstName,
        getAndVerifyUser,
        frontEndUser,
        speedTest,
} = require('./helperFunctions.js');
// get error strings that can be sent back to the user
const errors = require('./errors.js');


const businessApis = {
    POST_forBusinessEmail,
    POST_demoEmail,
    POST_dialogEmail,
    POST_dialogEmailScreen2,
    POST_dialogEmailScreen3,
    POST_dialogEmailScreen4,
    POST_contactUsEmail,
    POST_updateHiringStage,
    POST_answerQuestion,
    POST_emailInvites,
    GET_candidateSearch,
    GET_employeeSearch,
    GET_employeeQuestions,
    GET_positions,
    GET_evaluationResults
}


// ----->> START APIS <<----- //

function POST_emailInvites(req, res) {
    const body = req.body;
    const candidateEmails = sanitize(body.candidateEmails);
    const employeeEmails = sanitize(body.employeeEmails);
    const adminEmails = sanitize(body.adminEmails);
    const userId = sanitize(body.currentUserInfo.userId);
    const userName = sanitize(body.currentUserInfo.userName);
    const verificationToken = sanitize(body.currentUserInfo.verificationToken);
    const companyId = sanitize(body.currentUserInfo.companyId);
    const positionId = sanitize(body.currentUserInfo.positionId);
    const positionName = sanitize(body.currentUserInfo.positionName);

    // if one of the arguments doesn't exist, return with error code
    if (!candidateEmails || !employeeEmails || !adminEmails || !userId || !userName || !companyId || !verificationToken || !positionId || !positionName) {
        return res.status(400).send("Bad request.");
    }

    let moonshotUrl = 'https://www.moonshotinsights.io/';
    // if we are in development, links are to localhost
    if (process.env.NODE_ENV === "development") {
        moonshotUrl = 'http://localhost:8081/';
    }

    // verify the employer is actually a part of this organization
    verifyEmployerAndReturnBusiness(userId, verificationToken, companyId)
    .then(business => {
        // if employer does not have valid credentials
        if (!business) {
            console.log("Employer tried to send verification links");
            return res.status(403).send("You do not have permission to send verification links.");
        }

        let code = business.code;

        const positionIndex = business.positions.findIndex(currPosition => {
            return currPosition._id.toString() === positionId.toString();
        });



        let position = business.positions[positionIndex];

        if (!position) {
            return res.status(403).send("Not a valid position.");
        }

        const businessName = business.name;

        // Add the position code onto the end of the code
        code = code.toString().concat(position.code);

        // get current date - used for candidate code start dates
        const now = new Date();

        // Send candidate emails
        for (let i = 0; i < candidateEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            const codeObj = { code: userCode, startDate: now };
            if (position.candidateCodes) {
                position.candidateCodes.push(codeObj);
            } else {
                position.candidateCodes = [];
                position.candidateCodes.push(codeObj);
            }
            // send email
            let recipient = [candidateEmails[i]];
            let subject = businessName + " invited you to the next round";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:95%; display:inline-block; text-align:left;">&#09;Congratulations, ' + businessName
                    + ' advanced you to the next step for the ' + positionName + ' position. The next step is completing ' + businessName + '&#39;s evaluation on Moonshot.'
                    + ' Please click the button below to create your account. Once you&#39;ve created your account, you can begin your evaluation.'
                    + '</p>'
                    + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot and congrats on advancing to the next step for the ' + positionName + ' position!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:95%;display:inline-block;">'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + candidateEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Send employee emails
        for (let i = 0; i < employeeEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            const codeObj = { code: userCode, startDate: now };
            if (position.employeeCodes) {
                position.employeeCodes.push(codeObj);
            } else {
                position.employeeCodes = [];
                position.employeeCodes.push(codeObj);
            }
            // send email
            let recipient = [employeeEmails[i]];
            let subject = businessName + " invited you to take the " + positionName + " evaluation";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:95%; display:inline-block; text-align:left;">' + userName + ' invited you to complete an evaluation for ' + businessName + '&#39;s ' + positionName + ' position.'
                    + ' Your participation will help create a baseline for ' + businessName + '&#39;s predictive candidate evaluations for incoming applicants.'
                    + ' Please click the button below to create an account. Once you&#39;ve created your account you can begin your evaluation.</p>'
                    + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:95%;display:inline-block;">'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + candidateEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Send manager emails
        // for (let i = 0; i < managerEmails.length; i++) {
        //     // add code to the position
        //     const userCode = crypto.randomBytes(64).toString('hex');
        //     if (position.managerCodes) {
        //         position.managerCodes.push(userCode);
        //     } else {
        //         position.managerCodes = [];
        //         position.managerCodes.push(userCode);
        //     }
        //     // send email
        //     let recipient = [managerEmails[i]];
        //     let subject = "You've Been Invited!";
        //     let content =
        //         '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
        //             + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
        //             + '<p style="width:60%; display:inline-block; text-align:left;">&#09;You&#39;ve been invited by ' + userName + ' from ' + businessName + ' as a manager!'
        //             + ' Please click the button below to create your account.'
        //             + ' Once you&#39;ve created your account you can begin grading your employees, tracking candidates, and reviewing evaluation results!</p>'
        //             + '<br/><p style="width:60%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
        //             + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
        //             + code + "&userCode=" + userCode
        //             + '">Create Account</a>'
        //             + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
        //             + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
        //             + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
        //             + '<div style="text-align:left;width:60%;display:inline-block;">'
        //                 + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
        //                 + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
        //                 + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
        //                 + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + candidateEmails[i] + '">Opt-out of future messages.</a></i>'
        //                 + '</div>'
        //             + '</div>'
        //         + '</div>';
        //
        //     const sendFrom = "Moonshot";
        //     sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
        //         if (!success) {
        //             res.status(500).send(msg);
        //         }
        //     })
        // }
        // Send admin emails
        for (let i = 0; i < adminEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            const codeObj = { code: userCode, startDate: now };
            if (position.adminCodes) {
                position.adminCodes.push(codeObj);
            } else {
                position.adminCodes = [];
                position.adminCodes.push(codeObj);
            }
            // send email
            let recipient = [adminEmails[i]];
            let subject = businessName + " invited you to be an admin on Moonshot";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:95%; display:inline-block; text-align:left;">' + userName + ' invited you to be an admin for ' + businessName + '&#39;s predictive candidate evaluations.'
                    + ' Please click the button below to create your account.'
                    + ' Once you&#39;ve created your account you can begin adding other admins, employees, and candidates, as well as grade employees and review evaluation results.</p>'
                    + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights and candidate predictions!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:95%;display:inline-block;">'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + candidateEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Save the new business object with updated positions array
        // update the employee in the business object
        business.positions[positionIndex] = position;

        // save the business
        business.save()
        .then(updatedBusiness => {
            return res.json(position);
        })
        .catch(updateBusinessErr => {
            return res.status(500).send("failure!");
        });




    })
    .catch(verifyEmployerErr => {
        console.log("Error when trying to verify employer when they were trying to send verification links: ", verifyEmployerErr);
        return res.status(500).send("Server error, try again later.");
    })


}

function POST_forBusinessEmail(req, res) {
    let phone = "None given";
    if (req.body.phone) {
        phone = sanitize(req.body.phone);
    }
    let company = "None given";
    if (req.body.company) {
        company = sanitize(req.body.company);
    }
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    let subject = 'Moonshot Sales Lead - From Home Page';

    let content = "<div>"
        + "<h3>Sales Lead from Home Page:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "</p>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Company: "
        + company
        + "</p>"
        + "<p>Phone Number: "
        + phone
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Thank you for contacting us, our team will get back to you shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
}

function POST_demoEmail(req, res) {
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    let subject = 'Moonshot - Somebody watched the Demo';

    let content = "<div>"
        + "<h3>Email of someone who watched demo: </h3>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Thank you for contacting us, our team will get back to you shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
}

function POST_dialogEmail(req, res) {
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    let subject = 'ACTION REQUIRED - Somebody filled out form on homepage';

    let content = "<div>"
        + "<h2>Lead from Moonshot Insights homepage</h2>"
        + "<h3>Name</h3>"
        + "<p>"
        + sanitize(req.body.name)
        + "</p>"
        + "<h3>Email</h3>"
        + "<p>"
        + sanitize(req.body.email)
        + "</p>"
        + "<h3>Company</h3>"
        + "<p>"
        + sanitize(req.body.company)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Thank you for contacting us, our team will get back to you shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
}

function POST_dialogEmailScreen2(req, res) {
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    let subject = 'Moonshot - Somebody filled out second pg on Homepage';
    const name = sanitize(req.body.name);
    const company = sanitize(req.body.company);
    const password = sanitize(req.body.password);
    const email = sanitize(req.body.email);

    let user = {
        name: name,
        email: email
    };
    let business = {
        name: company
    };

    // hash the user's password
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            // change the stored password to be the hash
            user.password = hash;
            user.verified = true;
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
                        const NOW = new Date();
                        user.termsAndConditions = [
                            {
                                name: "Privacy Policy",
                                date: NOW,
                                agreed: true
                            },
                            {
                                name: "Terms of Use",
                                date: NOW,
                                agreed: true
                            },
                            {
                                name: "Service Level Agreement",
                                date: NOW,
                                agreed: true
                            }
                        ];
                        user.dateSignedUp = new Date();

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

                            business.employerIds = [];
                            business.employerIds.push(newUser._id);

                            // Create business
                            Businesses.create(business, function(err, newBusiness) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // Send email with info to us
                                    let content = "<div>"
                                        + "<h3>Info of someone who filled out second page on homepage: </h3>"
                                        + "<p>Name: "
                                        + sanitize(req.body.name)
                                        + "</p>"
                                        + "<p>Company: "
                                        + sanitize(req.body.company)
                                        + "</p>"
                                        + "</div>";

                                    const sendFrom = "Moonshot";
                                    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
                                        if (success) {
                                            res.json("Thank you for contacting us, our team will get back to you shortly.");
                                        } else {
                                            res.status(500).send(msg);
                                        }
                                    })
                                }
                            });
                        });
                    })
                } else {
                    res.status(401).send("An account with that email address already exists.");
                }

            });
        });
    });
}

function POST_dialogEmailScreen3(req, res) {
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    let subject = 'Moonshot - Somebody filled out third pg on Homepage';

    let content = "<div>"
        + "<h3>Info of someone who filled out third page on homepage: </h3>"
        + "<p>Positions: "
        + sanitize(req.body.positions)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Thank you for contacting us, our team will get back to you shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
}

function POST_dialogEmailScreen4(req, res) {
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    let subject = 'Moonshot - Somebody filled out fourth pg on Homepage';

    let content = "<div>"
        + "<h3>Info of someone who filled out fourth page on homepage: </h3>"
        + "<p>Skill 1: "
        + sanitize(req.body.skill1)
        + "</p>"
        + "<p>Skill 2: "
        + sanitize(req.body.skill2)
        + "</p>"
        + "<p>Skill 3: "
        + sanitize(req.body.skill3)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Thank you for contacting us, our team will get back to you shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
}

function POST_contactUsEmail(req, res) {
    let message = "None";
    if (req.body.message) {
        message = sanitize(req.body.message);
    }
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io"];
    let subject = 'Moonshot Question -- Contact Us Form';
    let content = "<div>"
        + "<h3>Questions:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "</p>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Message: "
        + message
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Email sent successfully, our team will be in contact with you shortly!");
        } else {
            res.status(500).send(msg);
        }
    })
}


// updates a candidate for a business as Contacted, Interviewing, Dismissed, etc
// TODO: this whole thing could probably be done with one query
async function POST_updateHiringStage(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const candidateId = sanitize(body.candidateId);
    const hiringStage = sanitize(body.hiringStage);
    const isDismissed = sanitize(body.isDismissed);
    const positionId = sanitize(body.positionId);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !verificationToken || !candidateId || !hiringStage || typeof isDismissed !== "boolean" || !positionId) {
        return res.status(400).send("Bad request.");
    }

    // ensure the hiring stage provided is valid
    const validHiringStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
    if (!validHiringStages.includes(hiringStage)) {
        console.log("Invalid hiring stage provided.");
        return res.status(400).send("Invalid hiring stage provided.");
    }

    // get the user and the business
    let user;
    let business;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
        business = await Businesses.findById(user.businessInfo.company.companyId);
        if (!business) {
            console.log("No business found with id: ", user.businessInfo.company.companyId);
            throw "No business.";
        }
    } catch (getUserError) {
        console.log("Error getting user or business from user: ", getUserError);
        return res.status(403).send("You do not have permission to do that.");
    }

    // get the position index and position
    const positionIndex = business.positions.findIndex(pos => {
        return pos._id.toString() === positionId.toString();
    });
    if (typeof positionIndex !== "number" || positionIndex < 0) {
        return res.status(400).send("Invalid position.");
    }
    let position = business.positions[positionIndex];

    // get the candidate index and candidate
    const candidateIdString = candidateId.toString();
    const candidateIndex = position.candidates.findIndex(cand => {
        return cand.candidateId.toString() === candidateIdString;
    });
    if (typeof candidateIndex !== "number" || candidateIndex < 0) {
        return res.status(400).send("Candidate has not applied for that position.");
    }

    // update the candidate info
    position.candidates[candidateIndex].hiringStage = hiringStage;
    position.candidates[candidateIndex].isDismissed = isDismissed;
    position.candidates[candidateIndex].hiringStageChanges.push({
        hiringStage,
        dateChanged: new Date()
    })
    business.positions[positionIndex] = position;

    // save the business
    try { await business.save(); }
    catch (bizSaveError) {
        console.log("Error saving business with candidate with updated hiring stage: ", bizSaveError);
        return res.status(500).send("Server error, try again later.");
    }

    return res.json("success");
}

async function POST_answerQuestion(req, res) {
    const body = req.body;
    const userId = sanitize(body.user.userId);
    const employeeId = sanitize(body.user.employeeId);
    const verificationToken = sanitize(body.user.verificationToken);
    const questionIndex = sanitize(body.user.questionIndex);
    const score = sanitize(body.user.score);
    const gradingComplete = sanitize(body.user.gradingComplete);
    const positionName = sanitize(body.user.positionName);

    if (!userId || !verificationToken || !(typeof questionIndex === 'number') || !(typeof score === 'number') || !employeeId || !positionName) {
        return res.status(400).send("Bad request.");
    }

    // verify the employer is actually a part of this organization
    // get the user who is trying to search for candidates
    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user is not an admin or manager, they can't search for candidates
    if (!["accountAdmin", "manager"].includes(user.userType)) {
        console.log("User is type: ", user.userType);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user doesn't have
    if (!user.businessInfo || !user.businessInfo.company || !user.businessInfo.company.companyId) {
        console.log("User doesn't have associated business.");
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    const companyId = user.businessInfo.company.companyId;

    const businessQuery = {
        "_id": mongoose.Types.ObjectId(companyId)
    }

    // get the business the user works for
    let business;
    try {
        business = await Businesses
            .find(businessQuery)
        // see if there are none found
        if (!business || business.length === 0 ) { throw "No business found - userId: ", user._id; }
        // if any are found, only one is found, as we searched by id
        business = business[0];
    } catch (findBizError) {
        console.log("error finding business for user trying to search for candidates: ", findBizError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // make sure the user gave a valid position
    if (!business.positions || business.positions.length === 0) {
        return res.status(400).send("Invalid position.");
    }

    const positionIndex = business.positions.findIndex(position => {
        return position.name.toString() === positionName.toString();
    })

    if (positionIndex <= -1) {
        return res.status(400).send("Invalid position.");
    }

    // should only be one position in the array since names should be unique
    const position = business.positions[positionIndex];

    // get the employees from that position
    let employees = position.employees;

    // the index of the employee in the employee array
    const employeeIndex = employees.findIndex(currEmployee => {
        return currEmployee.employeeId.toString() === employeeId.toString();
    });

    let employee = employees[employeeIndex];


    // get the index of the answer in the user's answers array
    const answerIndex = employee.answers.findIndex(answer => {
        return answer.questionIndex === questionIndex;
    });

    if (answerIndex === -1) {
        const newAnswer = {
            complete: true,
            score: score,
            questionIndex: questionIndex
        };
        employee.answers.push(newAnswer);
    } else {
        employee.answers[answerIndex].score = score;
    }

    employee.gradingComplete = gradingComplete;

    // update the employee in the business object
    business.positions[positionIndex].employees[employeeIndex] = employee;

    // save the business
    business.save()
    .then(updatedBusiness => {
        return res.json(employee.answers);
    })
    .catch(updateBusinessErr => {
        console.log("error: ", updateBusinessErr);
        return res.status(500).send("failure!");
    });
}


// VERIFY THAT THE GIVEN USER IS LEGIT AND PART OF THE GIVEN BUSINESS
// RETURNS THE BUSINESS THAT THE EMPLOYER WORKS FOR ON SUCCESS, UNDEFINED ON FAIL
async function verifyEmployerAndReturnBusiness(userId, verificationToken, businessId) {
    return new Promise(async (resolve, reject) => {
        try {
            // find the user and business
            let [user, business] = await Promise.all([
                Users.findById(userId),
                Businesses.findById(businessId)
            ]);

            // check that user and business were found
            if (!user || !business) { throw "User or business not found."; }

            // check if the user has the right verification token
            if (user.verificationToken !== verificationToken) {
                throw "Wrong verification token."
            }

            // check that the user is part of the business
            if (user.businessInfo.company.companyId.toString() !== businessId.toString()) {
                throw "User not part of that company.";
            }

            // successful verification
            resolve(business);
        }

        catch (error) {
            reject(error);
        }
    })
}

function GET_employeeQuestions(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    Users.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their employees: ", findBUserErr);
            return res.status(500).send("Server error, try again later.");
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            return res.status(403).send("You do not have permission to access employee info.");
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            return res.status(403).send("You do not have permission to access employee info.");
        }

        const companyId = user.businessInfo.company.companyId;
        let businessQuery = { '_id': companyId }

        Businesses.find(businessQuery)
        .select("employeeQuestions")
        .exec(function(findEmployeesErr, employees)
        {
            if (findEmployeesErr) {
                return res.status(500).send("Server error, couldn't get employees.");
            } else {
                return res.json(employees[0]);
            }
        });
    })
}

async function GET_positions(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    // get the user
    let user;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (findUserError) {
        console.log("Error finding business user who was trying to see thier positions: ", findUserError);
        return res.status(500).send("Server error, try again later.");
    }

    // get the business the user works for
    const companyId = user.businessInfo.company.companyId;
    let business;
    try {
        business = await Businesses
            .findById(companyId)
            .select("logo name positions._id positions.name positions.completions positions.usersInProgress positions.skillNames positions.timeAllotted positions.length");
    } catch (findBizError) {
        console.log("Error finding business when getting positions: ", findBizError);
        return res.status(500).send("Server error, couldn't get positions.");
    }

    return res.json({logo: business.logo, businessName: business.name, positions: business.positions});
}


async function GET_evaluationResults(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const profileUrl = sanitize(req.query.profileUrl);
    const businessId = sanitize(req.query.businessId);
    const positionId = sanitize(req.query.positionId);
    const positionIdString = positionId.toString();

    //console.log("userId: ", userId, "profileUrl: ", profileUrl, "businessId: ", businessId, "positionId: ", positionId);

    // --->>      GET USER, BUSINESS, AND CANDIDATE FROM DATABASE       <<--- //
    let user, business, candidate, psychTest;
    try {
        // get the business user, candidate, and business
        let [foundUser, foundCandidate, foundBusiness, foundPsychTest] = await Promise.all([
            getAndVerifyUser(userId, verificationToken),
            Users.findOne({profileUrl}).select("_id name userType title email emailToContact psychometricTest.factors.name psychometricTest.factors.score psychometricTest.factors.factorId positions.positionId positions.freeResponseQuestions skillTests.skillId skillTests.name skillTests.mostRecentScore"),
            Businesses.findById(businessId).select("_id positions._id positions.employees.employeeId positions.employees.scores positions.candidates.candidateId positions.candidates.scores positions.skills"),
            Psychtests.findOne({}).select("factors._id factors.stats")
        ]);

        // make sure a user, candidate, business, and psych test were found
        if (!foundUser || !foundCandidate || !foundBusiness || !foundPsychTest) {
            throw "User or candidate or business not found.";
        }

        // get the three found objects outside of the try/catch
        user = foundUser; candidate = foundCandidate; business = foundBusiness; psychTest = foundPsychTest;
    } catch (dbError) {
        console.log("Error getting user or candidate or business: ", dbError);
        res.status(500).send("Invalid operation.");
    }
    // <<------------------------------------------------------------------>> //

    // --->>           VERIFY LEGITIMACY AND GET NEEDED DATA            <<--- //
    // set variables that depend on user type
    let userArray;
    // if the user is a candidate
    if (candidate.userType === "candidate") {
        userArray = "candidates";
        idType = "candidateId";
    }
    // if the user is an employee
    else {
        userArray = "employees";
        idType = "employeeId";
    }

    // verify that the business user has the right permissions
    try {
        if (businessId.toString() !== user.businessInfo.company.companyId.toString()) {
            throw "Doesn't have right business id.";
        }
    } catch (permissionsError) {
        console.log("Business user did not have the right business id: ", permissionsError);
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    // verify that the position exists within the business ...
    const bizPositionIndex = business.positions.findIndex(pos => {
        return pos._id.toString() === positionIdString;
    })
    if (typeof bizPositionIndex !== "number" || bizPositionIndex < 0) {
        console.log(`Position not found within business while trying to get results. userId: ${userId}, candidateId: ${candidate._id}, positionId: ${positionId}`);
        return res.status(400).send("Candidate has not applied for that position.");
    }
    // ... and then get it
    const bizPosition = business.positions[bizPositionIndex];

    // verify that the user applied for this position ...
    const candidatePositionIndex = candidate.positions.findIndex(pos => {
        return pos.positionId.toString() === positionIdString;
    })
    if (typeof candidatePositionIndex !== "number" || candidatePositionIndex < 0) {
        console.log(`Position not found within candidate while trying to get results. userId: ${userId}, candidateId: ${candidate._id}, positionId: ${positionId}`);
        return res.status(400).send("Canidate has not applied for that position.");
    }
    // ... and then get the position object within the candidate
    const candidatePosition = candidate.positions[candidatePositionIndex];

    // get the candidate object within the position within the business ...
    const candidateIdString = candidate._id.toString();
    const bizCandidateIndex = bizPosition[userArray].findIndex(cand => {
        return cand[idType].toString() === candidateIdString;
    });
    if (typeof bizCandidateIndex !== "number" || bizCandidateIndex < 0) {
        console.log(`Candidate not found within business while trying to get results. userId: ${userId}, candidateId: ${candidate._id}, positionId: ${positionId}`);
        return res.status(400).send("Canidate has not applied for that position.");
    }
    // ... and then get the candidate from there
    const bizCandidate = bizPosition[userArray][bizCandidateIndex];
    // <<------------------------------------------------------------------>> //

    // --->>              FORMAT THE DATA FOR THE FRONT END             <<--- //
    // get position-specific free response questions
    const frqs = candidatePosition.freeResponseQuestions.map(frq => {
        return {
            question: frq.body,
            answer: frq.response
        }
    })
    // get skill test scores for relevant skills
    const skillScores = candidate.skillTests ? candidate.skillTests.filter(skill => {
        return bizPosition.skills.some(posSkill => {
            return posSkill.toString() === skill.skillId.toString();
        });
    }) : [];
    // have to convert the factor names to what they will be displayed as
    const psychNameConversions = {
        "Extraversion": "Dimension",
        "Emotionality": "Temperament",
        "Honesty-Humility": "Viewpoint",
        "Conscientiousness": "Methodology",
        "Openness to Experience": "Perception",
        "Agreeableness": "Ethos",
        "Altruism": "Belief"
    };
    const psychScores = candidate.psychometricTest.factors.map(area => {
        // find the factor within the psych test so we can get the middle 80 scores
        const factorIndex = psychTest.factors.findIndex(fac => {
            return fac._id.toString() === area.factorId.toString();
        });
        const foundFactor = typeof factorIndex === "number" && factorIndex >= 0;
        stats = foundFactor ? psychTest.factors[factorIndex].stats : undefined;

        return {
            name: psychNameConversions[area.name],
            score: area.score,
            stats
        }
    });
    const results = {
        title: candidate.title,
        name: candidate.name,
        email: candidate.emailToContact ? candidate.emailToContact : candidate.email,
        performanceScores: bizCandidate.scores,
        frqs, skillScores, psychScores
    };
    // <<------------------------------------------------------------------>> //

    // return the information to the front end
    res.json(results);
}


async function GET_candidateSearch(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user who is trying to search for candidates
    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user is not an admin or manager, they can't search for candidates
    if (!["accountAdmin", "manager"].includes(user.userType)) {
        console.log("User is type: ", user.userType);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user doesn't have
    if (!user.businessInfo || !user.businessInfo.company || !user.businessInfo.company.companyId) {
        console.log("User doesn't have associated business.");
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    const companyId = user.businessInfo.company.companyId;

    // the restrictions on the search
    const searchTerm = sanitize(req.query.searchTerm);
    const hiringStage = sanitize(req.query.hiringStage);
    // position name is the only required input to the search
    const positionName = sanitize(req.query.positionName);
    // the thing we should sort by - default is alphabetical
    const sortBy = sanitize(req.query.sortBy);

    const businessQuery = {
        "_id": mongoose.Types.ObjectId(companyId)
    }

    // get only the position the user is asking for in the positions array
    const positionQuery = {
        "positions": {
            "$elemMatch": {
                "name": positionName
            }
        }
    }

    // get the business the user works for
    let business;
    try {
        business = await Businesses
            .find(businessQuery, positionQuery)
            .select("positions.name positions.candidates.scores positions.candidates.candidateId positions.candidates.hiringStage positions.candidates.isDismissed positions.candidates.name positions.candidates.hiringStageChanges.dateChanged positions.candidates.location positions.candidates.profileUrl");
        // see if there are none found
        if (!business || business.length === 0 ) { throw "No business found - userId: ", user._id; }
        // if any are found, only one is found, as we searched by id
        business = business[0];
    } catch (findBizError) {
        console.log("error finding business for user trying to search for candidates: ", findBizError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // make sure the user gave a valid position
    if (!business.positions || business.positions.length === 0) {
        return res.status(400).send("Invalid position.");
    }

    // should only be one position in the array since names should be unique
    const position = business.positions[0];

    // get the list of candidates and sort and filter them by the given parameters
    // TODO: this could be done with a more complicated query instead, consider
    // doing that
    let candidates = position.candidates;

    // filter by name if search term given
    if (searchTerm && searchTerm !== "" && candidates) {
        const nameRegex = new RegExp(searchTerm, "i");
        candidates = candidates.filter(candidate => {
            return nameRegex.test(candidate.name);
        });
    }

    // filter by hiring stage if hiring stage given
    if (hiringStage && hiringStage !== "" && candidates) {
        candidates = candidates.filter(candidate => {
            return candidate.hiringStage === hiringStage;
        });
    }

    // default sort property is alphabetical, sort by score if that's the given sort by property
    let sortProperty = "name";
    if (typeof sortBy === "string" && sortBy.toLowerCase() === "score" && candidates) { sortProperty = "scores.overall"; }

    // sort the candidates
    if (candidates) {
        candidates.sort((candA, candB) => {
            if (candA[sortProperty] < candB[sortProperty]) { return -1; }
            if (candA[sortProperty] > candB[sortProperty]) { return 1; }
            return 0;
        });
    }

    res.json(candidates);
}

async function GET_employeeSearch(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user who is trying to search for candidates
    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user is not an admin or manager, they can't search for candidates
    if (!["accountAdmin", "manager"].includes(user.userType)) {
        console.log("User is type: ", user.userType);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user doesn't have
    if (!user.businessInfo || !user.businessInfo.company || !user.businessInfo.company.companyId) {
        console.log("User doesn't have associated business.");
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    const companyId = user.businessInfo.company.companyId;

    // the restrictions on the search
    const searchTerm = sanitize(req.query.searchTerm);
    const status = sanitize(req.query.status);
    // position name is the only required input to the search
    const positionName = sanitize(req.query.positionName);

    const businessQuery = {
        "_id": mongoose.Types.ObjectId(companyId)
    }

    // get only the position the user is asking for in the positions array
    const positionQuery = {
        "positions": {
            "$elemMatch": {
                "name": positionName
            }
        }
    }

    // get the business the user works for
    let business;
    try {
        business = await Businesses
            .find(businessQuery, positionQuery)
            .select("positions.name positions.employees.answers positions.employees.employeeId positions.employees.managerId positions.employees.scores.overall positions.employees.gradingComplete positions.employees.name positions.employees.profileUrl positions.employees.score");
        // see if there are none found
        if (!business || business.length === 0 ) { throw "No business found - userId: ", user._id; }
        // if any are found, only one is found, as we searched by id
        business = business[0];
    } catch (findBizError) {
        console.log("error finding business for user trying to search for candidates: ", findBizError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // make sure the user gave a valid position
    if (!business.positions || business.positions.length === 0) {
        return res.status(400).send("Invalid position.");
    }

    // should only be one position in the array since names should be unique
    const position = business.positions[0];

    // get the employees from that position
    let employees = position.employees;

    // filter by name if search term given
    if (searchTerm && searchTerm !== "" && employees) {
        const nameRegex = new RegExp(searchTerm, "i");
        employees = employees.filter(employee => {
            return nameRegex.test(employee.name);
        });
    }

    // filter by status if status given
    let gradingComplete = false;
    if (status && status !== "" && employees) {
        if (status.toString() === "Complete") {
            gradingComplete = true;
        }
        employees = employees.filter(employee => {
            return employee.gradingComplete === gradingComplete;
        });
    }

    console.log("employees: ", employees);

    res.json(employees);
}



module.exports = businessApis;
