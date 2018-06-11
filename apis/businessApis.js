var Businesses = require("../models/businesses.js");
var Users = require("../models/users.js");
const mongoose = require("mongoose");

const crypto = require('crypto');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser,
        userForAdmin,
        getFirstName,
        getAndVerifyUser,
        frontEndUser,
        FOR_EMPLOYER,
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
    GET_employees,
    GET_positions,
    GET_evaluationResults
}


// ----->> START APIS <<----- //

function POST_emailInvites(req, res) {
    const body = req.body;
    const candidateEmails = sanitize(body.candidateEmails);
    const employeeEmails = sanitize(body.employeeEmails);
    const managerEmails = sanitize(body.managerEmails);
    const adminEmails = sanitize(body.adminEmails);
    const userId = sanitize(body.currentUserInfo.userId);
    const userName = sanitize(body.currentUserInfo.userName);
    const verificationToken = sanitize(body.currentUserInfo.verificationToken);
    const companyId = sanitize(body.currentUserInfo.companyId);
    const positionId = sanitize(body.currentUserInfo.positionId);

    // if one of the arguments doesn't exist, return with error code
    if (!candidateEmails || !employeeEmails || !managerEmails || !adminEmails || !userId || !userName || !companyId || !verificationToken || !positionId) {
        return res.status(400).send("Bad request.");
    }

    let moonshotUrl = 'https://www.moonshotinsights.io/';

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
            let subject = businessName + "Invited you to the Next Round";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:60%; display:inline-block; text-align:left;">&#09;You&#39;ve been invited by ' + userName + ' from ' + businessName + ' as a candidate!'
                    + ' Please click the button below to create your account.'
                    + ' Once you&#39;ve created your account you can begin your evaluation!</p>'
                    + '<br/><p style="width:60%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:60%;display:inline-block;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
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
            if (position.employeeCodes) {
                position.employeeCodes.push(userCode);
            } else {
                position.employeeCodes = [];
                position.employeeCodes.push(userCode);
            }
            // send email
            let recipient = [employeeEmails[i]];
            let subject = businessName + " Invited you as an Employee";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:60%; display:inline-block; text-align:left;">&#09;You&#39;ve been invited by ' + userName + ' from ' + businessName + ' as an employee!'
                    + ' Please click the button below to create your account.'
                    + ' Once you&#39;ve created your account you can begin your evaluation!</p>'
                    + '<br/><p style="width:60%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:60%;display:inline-block;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
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
        for (let i = 0; i < managerEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            if (position.managerCodes) {
                position.managerCodes.push(userCode);
            } else {
                position.managerCodes = [];
                position.managerCodes.push(userCode);
            }
            // send email
            let recipient = [managerEmails[i]];
            let subject = "You've Been Invited!";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:60%; display:inline-block; text-align:left;">&#09;You&#39;ve been invited by ' + userName + ' from ' + businessName + ' as a manager!'
                    + ' Please click the button below to create your account.'
                    + ' Once you&#39;ve created your account you can begin grading your employees, tracking candidates, and reviewing evaluation results!</p>'
                    + '<br/><p style="width:60%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:60%;display:inline-block;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
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
        // Send admin emails
        for (let i = 0; i < adminEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            if (position.adminCodes) {
                position.adminCodes.push(userCode);
            } else {
                position.adminCodes = [];
                position.adminCodes.push(userCode);
            }
            // send email
            let recipient = [adminEmails[i]];
            let subject = "You've Been Invited!";
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:60%; display:inline-block; text-align:left;">&#09;You&#39;ve been invited by ' + userName + ' from ' + businessName + ' to be an account admin!'
                    + ' Please click the button below to create your account.'
                    + ' Once you&#39;ve created your account you can begin adding other admins, managers, employees, and candidates, as well as review the results of your evaluations.</p>'
                    + '<br/><p style="width:60%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:60%;display:inline-block;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
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
    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
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
    //let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
    let recipients = ["stevedorn9@gmail.com"];
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
    //let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
    let recipients = ["stevedorn9@gmail.com"];
    let subject = 'Moonshot - Somebody filled out email on Homepage';

    let content = "<div>"
        + "<h3>Email of someone who filled out first page on homepage: </h3>"
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

function POST_dialogEmailScreen2(req, res) {
    //let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
    let recipients = ["stevedorn9@gmail.com"];
    let subject = 'Moonshot - Somebody filled out second pg on Homepage';

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

function POST_dialogEmailScreen3(req, res) {
    //let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
    let recipients = ["stevedorn9@gmail.com"];
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
    //let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
    let recipients = ["stevedorn9@gmail.com"];
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
    const positionName = sanitize(body.positionName);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !verificationToken || !candidateId || !hiringStage || typeof isDismissed !== "boolean" || !positionName) {
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
        return pos.name === positionName;
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

function POST_answerQuestion(req, res) {
    const body = req.body;
    const userId = sanitize(body.user.userId);
    const employeeId = sanitize(body.user.employeeId);
    const verificationToken = sanitize(body.user.verificationToken);
    const questionIndex = sanitize(body.user.questionIndex);
    const score = sanitize(body.user.score);
    const companyId = sanitize(body.user.companyId);
    const gradingComplete = sanitize(body.user.gradingComplete);

    if (!userId || !verificationToken || !(typeof questionIndex === 'number') || !(typeof score === 'number') || !employeeId || !companyId) {
        return res.status(400).send("Bad request.");
    }

    // verify the employer is actually a part of this organization
    verifyEmployerAndReturnBusiness(userId, verificationToken, companyId)
    .then(business => {
        // if employer does not have valid credentials
        if (!business) {
            console.log("Employer tried to update an answer to a question and didn't have access.");
            return res.status(403).send("You do not have permission to change an employees answers.");
        }

        // the index of the employee in the employee array
        const employeeIndex = business.employees.findIndex(currEmployee => {
            return currEmployee.employeeId.toString() === employeeId.toString();
        });

        let employee = business.employees[employeeIndex];


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
        business.employees[employeeIndex] = employee;

        // save the business
        business.save()
        .then(updatedBusiness => {
            return res.json(employee.answers);
        })
        .catch(updateBusinessErr => {
            return res.status(500).send("failure!");
        });
    })
    .catch(verifyEmployerErr => {
        console.log("Error when trying to verify employer when they were trying to edit an answer for a question: ", verifyEmployerErr);
        return res.status(500).send("Server error, try again later.");
    })
}


// VERIFY THAT THE GIVEN USER IS LEGIT AND PART OF THE GIVEN BUSINESS
// RETURNS THE BUSINESS THAT THE EMPLOYER WORKS FOR ON SUCCESS, UNDEFINED ON FAIL
async function verifyEmployerAndReturnBusiness(userId, verificationToken, businessId) {
    return new Promise(async (resolve, reject) => {
        try {
            // function to print the info that was given; for when errors occur
            const printInfo = () => {
                console.log("Given userId: ", userId);
                console.log("Given verificationToken: ", verificationToken);
                console.log("Given businessId: ", businessId);
            }

            // if the arguments provided are invalid, cannot validate user
            if (typeof userId !== "string" || typeof verificationToken !== "string" || typeof businessId !== "string") {
                console.log("Employer could not be verified.");
                printInfo();
                return resolve(undefined);
            }

            // set to true once we've verified the user is real and has the right
            // verification token
            let verifiedUser = false;
            // set to true once we've verified the user is employed by the
            // business they say they are
            let verifiedPosition = false;
            // the business found in the db, returned on success
            let business = undefined;

            // find the employer by the given id
            Users.findById(userId)
            .then(foundEmployer => {
                // if employer couldn't be found from the given id
                if (!foundEmployer) {
                    console.log("Couldn't find employer in the database when trying to verify them.");
                    printInfo();
                    return resolve(undefined);
                }
                // make sure the employer has the right verification token
                if (foundEmployer.verificationToken !== verificationToken) {
                    console.log("Employer gave wrong verification token when trying to be verified.");
                    printInfo();
                    return resolve(undefined);
                }
                // employer is real, return successfully if position in company verified
                verifiedUser = true;
                if (verifiedPosition) {
                    return resolve(business);
                }
            })
            .catch(findEmployerErr => {
                console.log("Error finding employer in db when trying to verify employer: ", findEmployerErr);
                printInfo();
                return resolve(undefined);
            })


            // make sure the employer is in the business' employer id array
            Businesses.findById(businessId)
            .then(foundBusiness => {
                if (!foundBusiness) {
                    console.log("Did not find business when trying to verify employer.");
                    printInfo();
                    return resolve(undefined);
                }

                // try to find employer in business' employer id array
                const employerWorksForBusiness = foundBusiness.employerIds.some(employerId => {
                    // userId is that of the user we are trying to verify
                    return employerId.toString() === userId;
                });

                // employer did not exist within the business' employers array
                if (!employerWorksForBusiness) {
                    console.log("Employer did not exist within the business' employers array (they don't work for that company).");
                    printInfo();
                    return resolve(undefined);
                }

                // employer does work for this company, return successfully if they are verified
                verifiedPosition = true;
                business = foundBusiness
                if (verifiedUser) {
                    return resolve(business);
                }
            })
            .catch(findBusinessErr => {
                console.log("Error finding business in db when trying to verify employer: ", findBusinessErr);
                printInfo();
                return resolve(undefined);
            });
        }
        // some error, probably in the database, so employer can't be verified
        catch (error) {
            console.log("Error verifying employer: ", error);
            return resolve(undefined);
        }
    });
}

function GET_employees(req, res) {
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
        .select("employees employeeQuestions")
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
        console.log("Error finding businesss user who was trying to see thier positions: ", findUserError);
        return res.status(500).send("Server error, try again later.");
    }

    // get the business the user works for
    const companyId = user.businessInfo.company.companyId;
    let business;
    try {
        business = await Businesses
            .findById(companyId)
            .select("logo name positions._id positions.name positions.completions positions.usersInProgress position.skills positions.timeAllotted");
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
    const positionName = sanitize(req.query.positionName);
    const businessId = sanitize(req.query.businessId);

    let user, business, candidate;
    try {
        // get the business user, candidate, and business
        let [foundUser, foundCandidate, foundBusiness] = Promise.all([
            getAndVerifyUser(userId, verificationToken),
            Users.findOne({profileUrl}),
            Businesses.findById(businessId)
        ]);

        // make sure a user, candidate, and business were found
        if (!foundUser || !foundCandidate || !foundBusiness) {
            throw "User or candidate or business not found.";
        }

        // get the three found objects outside of the try/catch
        user = foundUser; candidate = foundCandidate; business = foundBusiness;
    } catch (dbError) {
        console.log("Error getting user or candidate or business: ", dbError);
        res.status(500).send("Invalid operation.");
    }

    // verify that the business user has the right permissions
    try {
        if (businessId.toString() !== user.businessInfo.company.companyId()) {
            throw "Doesn't have right business id.";
        }
    } catch (permissionError) {
        console.log("Business user did not have the right business id: ", permissionsError);
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    // TODO: verify that the user applied for this position


    // TODO: get the needed information for the front end
    const results = {};

    // return the information to the front end
    res.json(results);
}


async function GET_candidateSearch(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // message displayed on miscellaneous errors
    const SERVER_ERROR = "Server error, try again later.";
    // message displayed when user doesn't have right permissions
    const PERMISSIONS_ERROR = "You don't have permission to do that.";

    // get the user who is trying to search for candidates
    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(PERMISSIONS_ERROR);
    }

    // if the user is not an admin or manager, they can't search for candidates
    if (!["accountAdmin", "manager"].includes(user.userType)) {
        console.log("User is type: ", user.userType);
        return res.status(401).send(PERMISSIONS_ERROR);
    }

    // if the user doesn't have
    if (!user.businessInfo || !user.businessInfo.company || !user.businessInfo.company.companyId) {
        console.log("User doesn't have associated business.");
        return res.status(401).send(PERMISSIONS_ERROR);
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
            .select("positions.name positions.candidates.scores positions.candidates.candidateId positions.candidates.hiringStage positions.candidates.isDismissed positions.candidates.name positions.candidates.archetype positions.candidates.hiringStageChanges.dateChanged positions.candidates.location positions.candidates.profileUrl");
        // see if there are none found
        if (!business || business.length === 0 ) { throw "No business found - userId: ", user._id; }
        // if any are found, only one is found, as we searched by id
        business = business[0];
    } catch (findBizError) {
        console.log("error finding business for user trying to search for candidates: ", findBizError);
        return res.status(500).send(SERVER_ERROR);
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
    if (searchTerm && searchTerm !== "") {
        const nameRegex = new RegExp(searchTerm, "i");
        candidates = candidates.filter(candidate => {
            return nameRegex.test(candidate.name);
        });
    }

    // filter by hiring stage if hiring stage given
    if (hiringStage && hiringStage !== "") {
        candidates = candidates.filter(candidate => {
            return candidate.hiringStage === hiringStage;
        });
    }

    // default sort property is alphabetical, sort by score if that's the given sort by property
    let sortProperty = "name";
    if (typeof sortBy === "string" && sortBy.toLowerCase() === "score") { sortProperty = "scores.overall"; }

    // sort the candidates
    candidates.sort((candA, candB) => {
        if (candA[sortProperty] < candB[sortProperty]) { return -1; }
        if (candA[sortProperty] > candB[sortProperty]) { return 1; }
        return 0;
    });

    res.json(candidates);
}


module.exports = businessApis;
