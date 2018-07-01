const Businesses = require("../models/businesses.js");
const Users = require("../models/users.js");
const Psychtests = require("../models/psychtests.js");
const Signupcodes = require("../models/signupcodes.js");
const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// get helper functions
const { sanitize,
        sendEmail,
        getAndVerifyUser,
        frontEndUser,
        speedTest,
        lastPossibleSecond
} = require('./helperFunctions.js');
// get error strings that can be sent back to the user
const errors = require('./errors.js');


const businessApis = {
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

// create a signup code for a user
function createCode(businessId, positionId, userType) {
    return new Promise(async function(resolve, reject) {
        // initialize random characters string
        let randomChars;
        // see if this code already exists
        try {
            // will contain any code that has the same random characters
            let foundCode;
            // if this gets up to 8 something is super weird
            let counter = 0;
            do {
                if (counter >= 8) { throw "Too many codes found that had already been used." }
                counter++;
                // assign randomChars 10 random hex characters
                randomChars = crypto.randomBytes(5).toString('hex');
                // try to find another code with the same random characters
                const foundCode = Signupcodes.findOne({ code: randomChars });
            } while (foundCode);
        } catch (findCodeError) {
            console.log("Error looking for code with same characters.");
            return reject(findCodeError);
        }
        // we are now guaranteed to have a unique code
        const NOW = new Date();
        const TWO_WEEKS = 14;
        // create the code
        let code = {
            code: randomChars,
            created: NOW,
            expirationDate: lastPossibleSecond(NOW, TWO_WEEKS),
            businessId, positionId, userType
        }
        console.log("code: ", code);
        // make the code in the db
        try { code = await Signupcodes.create(code) }
        catch (createCodeError) {
            console.log("here");
            return reject(createCodeError);
        }
        // return the code
        return resolve(code);
    });
}


// returns an object with the email, userType, and new code for a user
function createEmailInfo(businessId, positionId, userType, email) {
    return new Promise(async function(resolve, reject) {
        try {
            const codeObj = await createCode(businessId, positionId, userType);
            resolve({
                code: codeObj.code,
                email, userType
            });
        }
        // catch whatever random error comes up
        catch (error) {
            reject(error);
        }
    });
}


// sends email to the user with email info provided
async function sendEmailInvite(emailInfo, positionName, businessName, moonshotUrl) {
    return new Promise(async function(resolve, reject) {
        const code = emailInfo.code;
        const email = emailInfo.email;
        const userType = emailInfo.userType;

        // recipient of the email
        const recipient = [ email ];
        // sender of the email
        const sendFrom = "Moonshot";
        // the content of the email
        let content = "";
        // subject of the email
        let subject = "";

        // the button linking to the signup page with the signup code in the url
        const createAccountButton =
              '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="'
            + moonshotUrl + 'signup?code=' + code
            + '">Create Account</a>';

        // at the end of every user's email
        const emailFooter =
              '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
            + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
            + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
            + '<div style="text-align:left;width:95%;display:inline-block;">'
                + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + email + '">Opt-out of future messages.</a></i>'
                + '</div>'
            + '</div>';

        switch (userType) {
            case "candidate":
                subject = businessName + " invited you to the next round";
                content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                        + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                        + '<p style="width:95%; display:inline-block; text-align:left;">&#09;Congratulations, ' + businessName
                        + ' advanced you to the next step for the ' + positionName + ' position. The next step is completing ' + businessName + '&#39;s evaluation on Moonshot.'
                        + ' Please click the button below to create your account. Once you&#39;ve created your account, you can begin your evaluation.'
                        + '</p>'
                        + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot and congrats on advancing to the next step for the ' + positionName + ' position!</p><br/>'
                        + createAccountButton
                        + emailFooter
                    + '</div>';
                break;
            case "employee":
                subject = businessName + " invited you to take the " + positionName + " evaluation";
                content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                        + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                        + '<p style="width:95%; display:inline-block; text-align:left;">' + userName + ' invited you to complete an evaluation for ' + businessName + '&#39;s ' + positionName + ' position.'
                        + ' Your participation will help create a baseline for ' + businessName + '&#39;s predictive candidate evaluations for incoming applicants.'
                        + ' Please click the button below to create an account. Once you&#39;ve created your account you can begin your evaluation.</p>'
                        + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                        + createAccountButton
                        + emailFooter
                    + '</div>';
                break;
            case "accountAdmin":
                subject = businessName + " invited you to be an admin on Moonshot";
                content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                        + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                        + '<p style="width:95%; display:inline-block; text-align:left;">' + userName + ' invited you to be an admin for ' + businessName + '&#39;s predictive candidate evaluations.'
                        + ' Please click the button below to create your account.'
                        + ' Once you&#39;ve created your account you can begin adding other admins, employees, and candidates, as well as grade employees and review evaluation results.</p>'
                        + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights and candidate predictions!</p><br/>'
                        + createAccountButton
                        + emailFooter
                    + '</div>';
                break;
            default:
                return reject("Invalid user type");
        }

        // send the email
        sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
            if (!success) { reject(msg); }
            else { resolve(); }
        })
    });
}


// send email invites to multiple email addresses with varying user types
async function POST_emailInvites(req, res) {
    const body = req.body;
    const candidateEmails = sanitize(body.candidateEmails);
    const employeeEmails = sanitize(body.employeeEmails);
    const adminEmails = sanitize(body.adminEmails);
    const userId = sanitize(body.currentUserInfo.userId);
    const userName = sanitize(body.currentUserInfo.userName);
    const verificationToken = sanitize(body.currentUserInfo.verificationToken);
    const businessId = sanitize(body.currentUserInfo.businessId);
    const positionId = sanitize(body.currentUserInfo.positionId);
    const positionName = sanitize(body.currentUserInfo.positionName);

    // if one of the arguments doesn't exist, return with error code
    if (!candidateEmails || !employeeEmails || !adminEmails || !userId || !userName || !businessId || !verificationToken || !positionId || !positionName) {
        return res.status(400).send("Bad request.");
    }

    // where links in the email will go
    let moonshotUrl = 'https://www.moonshotinsights.io/';
    // if we are in development, links are to localhost
    if (process.env.NODE_ENV === "development") {
        moonshotUrl = 'http://localhost:8081/';
    }

    // get the business and ensure the user has access to send invite emails
    let business;
    try { business = await verifyAccountAdminAndReturnBusiness(userId, verificationToken, businessId); }
    catch (verifyUserError) {
        console.log("error verifying user or getting business when sending invite emails: ", verifyUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // find the position within the business
    const positionIndex = business.positions.findIndex(currPosition => {
        return currPosition._id.toString() === positionId.toString();
    });
    if (typeof positionIndex !== "number" || positionIndex < 0) {
        return res.status(403).send("Not a valid position.");
    }
    const position = business.positions[positionIndex];
    if (!position) { return res.status(403).send("Not a valid position."); }
    const businessName = business.name;

    // a list of promises that will resolve to objects containing new codes
    // as well as all user-specific info needed to send the invite email
    let emailPromises = [];
    candidateEmails.forEach(email => {
        emailPromises.push(createEmailInfo(businessId, positionId, "candidate", email));
    });
    employeeEmails.forEach(email => {
        emailPromises.push(createEmailInfo(businessId, positionId, "employee", email));
    });
    adminEmails.forEach(email => {
        emailPromises.push(createEmailInfo(businessId, positionId, "accountAdmin", email));
    });

    // wait for all the email object promises to resolve
    let emailInfoObjects;
    try { emailInfoObjects = await Promise.all(emailPromises); }
    catch (emailInfoObjectsError) {
        console.log("error creating email info objects: ", emailInfoObjectsError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // send all the emails
    let sendEmailPromises = [];
    emailInfoObjects.forEach(emailInfoObject => {
        sendEmailPromises.push(sendEmailInvite(emailInfoObject, positionName, businessName, moonshotUrl));
    })

    // wait for all the emails to be sent
    try { await Promise.all(sendEmailPromises); }
    catch (sendEmailsError) {
        console.log("error sending invite emails: ", sendEmailsError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // successfully sent all the emails
    return res.json(true);
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

async function POST_dialogEmailScreen2(req, res) {
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
        bcrypt.hash(password, salt, async function (err, hash) {
            // change the stored password to be the hash
            user.password = hash;
            user.verified = true;
            const query = {email: user.email};

            // see if there are any users who already have that email address
            try {
                const foundUser = await Users.findOne(query);
                if (foundUser) {
                    return res.status(401).send("An account with that email address already exists.");
                }
            } catch (findUserError) {
                console.log("error finding user with same email: ", findUserError);
                return res.status(500).send("Error creating account, try with a different email or try again later.");
            }

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
                user.dateSignedUp = NOW;

                // store the user in the db
                Users.create(user, function (err, newUser) {
                    if (err) {
                        console.log(err);
                    }

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
async function POST_updateHiringStage(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const candidateId = sanitize(body.candidateId);
    const hiringStage = sanitize(body.hiringStage);
    const isDismissed = sanitize(body.isDismissed);
    const positionId = sanitize(body.positionId);

    // verify biz user, get candidate, find and verify candidate's position
    let user, candidate, candidatePositionIndex;
    try {
        let {
            foundUser,
            foundCandidate,
            foundPositionIndex
        } = await verifyBizUserAndFindCandidatePosition(userId, verificationToken, candidateId, positionId);
        user = foundUser; candidate = foundCandidate; candidatePositionIndex = foundPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    let candidatePosition = candidate.positions[candidatePositionIndex];

    // update all new hiring stage info
    candidatePosition.hiringStage = hiringStage;
    candidatePosition.isDismissed = isDismissed;
    // make sure hiring stage changes array exists
    if (!Array.isArray(candidatePosition.hiringStageChanges)) {
        candidatePosition.hiringStageChanges = [];
    }
    candidatePosition.hiringStageChanges.push({
        hiringStage, isDismissed,
        dateChanged: new Date()
    });

    // save the new info into the candidate object
    candidate.positions[candidatePositionIndex] = candidatePosition;

    // save the candidate
    try { candidate = await candidate.save(); }
    catch (saveCandidateError) {
        console.log("Error saving candidate while trying to update hiring stage: ", saveCandidateError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    res.json(true);
}


// returns the business user object, the candidate/employee, and the index of
// the position within the positions array of the candidate/employee
async function verifyBizUserAndFindCandidatePosition(userId, verificationToken, candidateId, positionId) {
    return new Promise(async function(resolve, reject) {
        // find the user and the candidate
        let user, candidate;
        try {
            const [foundUser, foundCandidate] = await Promise.all([
                getAndVerifyUser(userId, verificationToken),
                Users.findById(candidateId)
            ])
            user = foundUser;
            candidate = foundCandidate;
            if (!candidate) { return reject("Invalid candidate id."); }
        }
        catch (findUserError) { return reject(findUserError); }

        // make sure the user has an associated business
        if (!user.businessInfo || !user.businessInfo.businessId) {
            return reject("User does not have associated business.");
        }

        // if the user is not an admin or manager, they can't edit other users' info
        if (!["accountAdmin", "manager"].includes(user.userType)) {
            reject("User does not have permission. User is type: ", user.userType);
        }

        if (!Array.isArray(candidate.positions)) {
            return reject("That candidate did not apply for this position.");
        }

        // get the candidate's position with this position id
        const candidatePositionIndex = candidate.positions.findIndex(position => {
            // index is correct if it has the right position id and the business id
            // for the business that the user works for
            return position.positionId.toString() === positionId.toString() && user.businessInfo.businessId.toString() === position.businessId.toString();
        });
        if (typeof candidatePositionIndex !== "number" || candidatePositionIndex < 0) {
            return reject("Candidate did not apply for this position.");
        }

        resolve({ user, candidate, candidatePositionIndex })
    });
}


// have a manager or account admin answer a question about an employee
async function POST_answerQuestion(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const employeeId = sanitize(body.employeeId);
    const positionId = sanitize(body.positionId);
    const questionIndex = sanitize(body.questionIndex);
    const score = sanitize(body.score);
    const gradingComplete = sanitize(body.gradingComplete);

    // make sure all necessary params are here
    if (!userId || !verificationToken || !(typeof questionIndex === 'number') || !(typeof score === 'number') || !employeeId || !positionId) {
        return res.status(400).send("Bad request.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let user, employee, employeePositionIndex;
    try {
        let {
            foundUser,
            foundEmployee,
            foundPositionIndex
        } = await verifyBizUserAndFindCandidatePosition(userId, verificationToken, employeeId, positionId);
        user = foundUser; employee = foundEmployee; candidatePositionIndex = foundPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting employee position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if the answers array doesn't exist, make it
    if (!Array.isArray(employee.positions[employeePositionIndex].answers)) {
        employee.positions[employeePositionIndex].answers = [];
    }

    // get the index of the answer in the user's answers array
    const answerIndex = employee.positions[employeePositionIndex].answers.findIndex(answer => {
        return answer.questionIndex === questionIndex;
    });

    if (answerIndex === -1) {
        const newAnswer = {
            complete: true,
            score: score,
            questionIndex: questionIndex
        };
        employee.positions[employeePositionIndex].answers.push(newAnswer);
    } else {
        employee.positions[employeePositionIndex].answers[answerIndex].score = score;
    }

    // mark whether the manager is finished grading the employee
    employee.positions[employeePositionIndex].gradingComplete = gradingComplete;

    // if no manager is marked as being the grader, add the current user
    if (!employee.positions[employeePositionIndex].managerId) {
        employee.positions[employeePositionIndex].managerId = user._id;
    }

    // save the employee
    try { employee = employee.save(); }
    catch (updateEmployeeError) {
        console.log("Error saving employee during grading: ", updateEmployeeError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // return successfully
    res.json(employee.positions[employeePositionIndex].answers);
}


// VERIFY THAT THE GIVEN USER IS LEGIT AND PART OF THE GIVEN BUSINESS
// RETURNS THE BUSINESS THAT THE EMPLOYER WORKS FOR ON SUCCESS, UNDEFINED ON FAIL
async function verifyAccountAdminAndReturnBusiness(userId, verificationToken, businessId) {
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

            if (user.userType !== "accountAdmin") {
                throw `User was supposed to be an account admin, but was: ${user.userType}`;
            }

            // check that the user is part of the business
            if (user.businessInfo.businessId.toString() !== businessId.toString()) {
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

        const businessId = user.businessInfo.businessId;
        let businessQuery = { '_id': businessId }

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


// get all positions for a business
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
        console.log("Error finding business user who was trying to see their positions: ", findUserError);
        return res.status(500).send("Server error, try again later.");
    }

    // get the business the user works for
    const businessId = user.businessInfo.businessId;
    let business;
    try {
        business = await Businesses
            .findById(businessId)
            .select("logo name positions._id positions.name positions.skillNames positions.timeAllotted positions.length");
    } catch (findBizError) {
        console.log("Error finding business when getting positions: ", findBizError);
        return res.status(500).send("Server error, couldn't get positions.");
    }

    let positionPromises = business.positions.map(position => {
        return addCompletionsAndInProgress(position);
    });

    let positions;
    try { positions = await Promise.all(positionPromises); }
    catch (awaitPositionError) {
        console.log("Error getting completions and inProgress: ", awaitPositionError);
        res.status(500).send(errors.SERVER_ERROR);
    }

    return res.json({ logo: business.logo, businessName: business.name, positions });
}


// get the number of users who have completed and are in progress for a certain position
// return the position object but with two additional properties - completions and usersInProgress
async function addCompletionsAndInProgress(position) {
    return new Promise(async function(resolve, reject) {
        try {
            const positionId = position._id;
            // all users with this position id in their positions array who have an end date
            completionsQuery = {
                "positions": {
                    "$elemMatch": {
                        "$and": [
                            { "positionId": mongoose.Types.ObjectId(positionId) },
                            { "appliedEndDate": { "$exists": true } }
                        ]
                    }
                }
            }
            // all users with this position id in their positions array who have a start
            // date but NOT an end date
            inProgressQuery = {
                "positions": {
                    "$elemMatch": {
                        "$and": [
                            { "positionId": mongoose.Types.ObjectId(positionId) },
                            { "appliedStartDate": { "$exists": true } },
                            { "appliedEndDate": { "$exists": false } }
                        ]
                    }
                }
            }

            const [ completions, usersInProgress ] = await Promise.all([
                Users.count(completionsQuery),
                Users.count(inProgressQuery)
            ]);

            if (typeof position.toObject === "function") {
                position = position.toObject();
            }

            resolve ({ ...position, completions, usersInProgress });
        }

        catch (error) { reject(error); }
    });
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
        if (businessId.toString() !== user.businessInfo.businessId.toString()) {
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
    console.log("searching for candidates");

    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user who is trying to search for candidates
    let user;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user is not an admin or manager, they can't search for candidates
    if (!["accountAdmin", "manager"].includes(user.userType)) {
        console.log("User is type: ", user.userType);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the user doesn't have an associated business, error
    if (!user.businessInfo || !user.businessInfo.businessId) {
        console.log("User doesn't have associated business.");
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // the id of the business that the user works for
    const businessId = user.businessInfo.businessId;
    // the restrictions on the search
    const searchTerm = sanitize(req.query.searchTerm);
    // if a specific hiring stage is wanted
    const hiringStage = sanitize(req.query.hiringStage);
    // position name is the only required input to the search
    const positionName = sanitize(req.query.positionName);
    // the thing we should sort by - default is alphabetical
    const sortBy = sanitize(req.query.sortBy);


    // sort by overall score by default
    // let sort = { }
    // if (sortBy) {
    //
    // }

    let positionRequirements = [
        { "businessId": mongoose.Types.ObjectId(businessId) },
        { "name": positionName }
    ];
    // filter by hiring stage if requested
    if (hiringStage) {
        positionRequirements.push({ "hiringStage": hiringStage });
    }

    // only get the position that was asked for
    let query = {
        "positions": {
            "$elemMatch": {
                "$and": positionRequirements
            }
        }
    }

    // search by name too if search term exists
    if (searchTerm) {
        const nameRegex = new RegExp(searchTerm, "i");
        query["name"] = nameRegex;
    }

    const attributes = "_id name profileUrl positions.isDismissed positions.hiringStage positions.isDismissed positions.hiringStageChanges positions.scores";

    // perform the search
    let candidates = [];
    try { candidates = await Users.find(query).select(attributes); }
    catch (candidateSearchError) {
        console.log("Error searching for candidates: ", candidateSearchError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    console.log("candidates before alteration: ", candidates);

    // format the candidates for the front end
    const formattedCandidates = candidates.map(candidate => {
        const candidateObj = candidate.toObject();
        console.log("candidateObj: ", candidateObj);
        return {
            name: candidateObj.name,
            profileUrl: candidateObj.profileUrl,
            _id: candidateObj._id,
            ...(candidateObj.positions[0])
        }
    })

    console.log("candidates after alteration: ", formattedCandidates);

    return res.json(formattedCandidates);
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
    if (!user.businessInfo || !user.businessInfo.businessId) {
        console.log("User doesn't have associated business.");
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    const businessId = user.businessInfo.businessId;

    // the restrictions on the search
    const searchTerm = sanitize(req.query.searchTerm);
    const status = sanitize(req.query.status);
    // position name is the only required input to the search
    const positionName = sanitize(req.query.positionName);

    const businessQuery = {
        "_id": mongoose.Types.ObjectId(businessId)
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
