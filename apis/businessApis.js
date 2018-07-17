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
    POST_addEvaluationEmail,
    POST_dialogEmail,
    POST_dialogEmailScreen2,
    POST_dialogEmailScreen3,
    POST_dialogEmailScreen4,
    POST_contactUsEmail,
    POST_updateHiringStage,
    POST_answerQuestion,
    POST_emailInvites,
    POST_createLink,
    POST_rateInterest,
    POST_changeHiringStage,
    POST_moveCandidates,
    POST_sawMyCandidatesInfoBox,
    GET_candidateSearch,
    GET_business,
    GET_employeeSearch,
    GET_employeeQuestions,
    GET_positions,
    GET_evaluationResults
}


// ----->> START APIS <<----- //

// create a signup code for a user
function createCode(businessId, positionId, userType, open) {
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
            businessId, positionId, userType, open
        }
        console.log("code: ", code);
        // make the code in the db
        try { code = await Signupcodes.create(code) }
        catch (createCodeError) {
            return reject(createCodeError);
        }
        // return the code
        return resolve(code);
    });
}

function createLink(businessId, positionId, userType) {
    return new Promise(async function(resolve, reject) {
        try {
            const codeObj = await createCode(businessId, positionId, userType, true);
            resolve({
                code: codeObj.code, userType
            });
        }
        // catch whatever random error comes up
        catch (error) {
            reject(error);
        }
    })
}

// returns an object with the email, userType, and new code for a user
function createEmailInfo(businessId, positionId, userType, email) {
    return new Promise(async function(resolve, reject) {
        try {
            const codeObj = await createCode(businessId, positionId, userType, false);
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
async function sendEmailInvite(emailInfo, positionName, businessName, moonshotUrl, userName) {
    return new Promise(async function(resolve, reject) {
        const code = emailInfo.code;
        const email = emailInfo.email;
        const userType = emailInfo.userType;

        console.log("userName: ", userName);

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
        sendEmailPromises.push(sendEmailInvite(emailInfoObject, positionName, businessName, moonshotUrl, userName));
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

// create link that people can sign up as
async function POST_createLink(req, res) {
    console.log("start");
    const body = req.body;
    const userId = sanitize(body.currentUserInfo.userId);
    const userName = sanitize(body.currentUserInfo.userName);
    const verificationToken = sanitize(body.currentUserInfo.verificationToken);
    const businessId = sanitize(body.currentUserInfo.businessId);
    const positionId = sanitize(body.currentUserInfo.positionId);
    const positionName = sanitize(body.currentUserInfo.positionName);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !userName || !businessId || !verificationToken || !positionId || !positionName) {
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
    let promise = [];
    promise.push(createLink(businessId, positionId, "candidate"));

    // wait for all the email object promises to resolve
    let obj;
    try { obj = await Promise.all(promise); }
    catch (error) {
        console.log("error creating links: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    console.log("return: ", obj);
    // successfully created the link
    return res.json(obj);
}


// rates how interested the business is in the candidate (number of stars 1-5)
async function POST_rateInterest(req, res) {
    const bizUserId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateId = sanitize(req.body.candidateId);
    const interest = sanitize(req.body.interest);
    const positionId = sanitize(req.body.positionId);

    // make sure the interest value is valid
    if (typeof interest !== "number" || interest < 1 || interest > 5) {
        return res.status(400).send("Invalid interest level.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, candidate, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, candidateId);
        bizUser = results.bizUser; candidate = results.user; candidatePositionIndex = results.userPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // update the business' interest in the candidate, making sure it is an integer
    candidate.positions[candidatePositionIndex].interest = Math.round(interest);
    // mark the candidate as reviewed, in case they weren't already
    candidate.positions[candidatePositionIndex].reviewed = true;

    // save the user with the new info
    try { await candidate.save() }
    catch (saveCandidateError) {
        console.log("Error saving candidate with new interest level: ", saveCandidateError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // return successfully
    return res.json(true);
}


// changes hiring stage of a candidate
async function POST_changeHiringStage(req, res) {
    const bizUserId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateId = sanitize(req.body.candidateId);
    const hiringStage = sanitize(req.body.hiringStage);
    const positionId = sanitize(req.body.positionId);

    // make sure the interest value is valid
    if (!["Dismissed", "Not Contacted", "Contacted", "Interviewing", "Offered", "Hired"].includes(hiringStage)) {
        return res.status(400).send("Invalid hiring stage.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, candidate, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, candidateId);
        bizUser = results.bizUser; candidate = results.user; candidatePositionIndex = results.userPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if dismissing a candidate
    let hiringStageChanges = candidate.positions[candidatePositionIndex].hiringStageChanges;
    // the hiring stage before it was changed
    let mostRecentHiringStage;
    // if there isn't a history of hiring stage changes, make one
    if (!Array.isArray(hiringStageChanges) || hiringStageChanges.length === 0) {
        hiringStageChanges = [];
        mostRecentHiringStage = "Not Contacted";
    }
    // otherwise we can know what the most recent stage was
    else { mostRecentHiringStage = hiringStageChanges[hiringStageChanges.length - 1].hiringStage; }
    // process is a bit different for dismissing candidates
    if (hiringStage === "Dismissed") {
        candidate.positions[candidatePositionIndex].isDismissed = true;
        hiringStageChanges.push({
            isDismissed: true,
            hiringStage: hiringStageChanges[hiringStageChanges.length - 1].hiringStage,
            dateChanged: new Date()
        });
    }
    // not dismissing the candidate
    else {
        candidate.positions[candidatePositionIndex].hiringStage = hiringStage;
        candidate.positions[candidatePositionIndex].isDismissed = false;
        hiringStageChanges.push({
            isDismissed: false,
            hiringStage,
            dateChanged: new Date()
        });
    }
    // update the business' interest in the candidate, making sure it is an integer
    candidate.positions[candidatePositionIndex].hiringStageChanges = hiringStageChanges;
    // mark the candidate as reviewed, in case they weren't already
    candidate.positions[candidatePositionIndex].reviewed = true;

    // save the user with the new info
    try { console.log(await candidate.save()); }
    catch (saveCandidateError) {
        console.log("Error saving candidate with new interest level: ", saveCandidateError);
        return res.status(500).send(errors.SERVER_ERROR);
    }


    // return successfully
    return res.json(true);
}


async function POST_moveCandidates(req, res) {
    const bizUserId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateIds = sanitize(req.body.candidateIds);
    const moveTo = sanitize(req.body.moveTo);
    const positionId = sanitize(req.body.positionId);

    // make sure input is valid
    if (!["Reviewed", "Not Reviewed", "Favorites", "Non-Favorites", "Dismissed"].includes(moveTo)) {
        console.log("moveTo invalid, was: ", moveTo);
        return res.status(400).send("Bad request.");
    }

    // verify the business user
    let bizUser;
    try { bizUser = await getAndVerifyUser(bizUserId, verificationToken); }
    catch (getBizUserError) {
        console.log("Error getting/verifying biz user: ", getBizUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // get the business id that the biz user works for
    let businessId;
    try { businessId = bizUser.businessInfo.businessId; }
    catch(noBizIdError) { return res.status(403).send(errors.PERMISSIONS_ERROR); }
    if (!businessId) { return res.status(403).send(errors.PERMISSIONS_ERROR); }

    // find all candidates that should be altered
    const findQuery = {
        "_id" : {
            "$in": candidateIds
        }
    }

    // TODO: SWITCH TO THIS AS SOON AS SANDBOX DB IS SWITCHED TO 3.6 (JULY 20th)
    // // find which property is being modified and what to set it to
    // // default to reviewed = true
    // let property = "positions.$[elem].reviewed";
    // let value = true;
    // if (moveTo === "Not Reviewed") {
    //     value = false;
    // } else if (moveTo === "Favorites") {
    //     property = "positions.$[elem].favorite";
    // }
    //
    // // mark their reviewed or favorited status
    // let updateQuery = {
    //     "$set": {}
    // };
    // updateQuery["$set"][property] = value;
    //
    //
    // // update only the correct position within the user
    // const options = {
    //     // can match multiple candidates
    //     "multi": true,
    //     // business and position id must match
    //     "arrayFilters": [
    //         { "_id": mongoose.Types.ObjectId(positionId) },
    //         { "businessId": mongoose.Types.ObjectId(businessId) }
    //     ],
    //     // do NOT create a new position if no position matches
    //     "upsert": false
    // }
    //
    //
    // try { await Users.update(findQuery, updateQuery, options); }
    // catch (findAndUpdateError) {
    //     console.log("Error finding/updating users with favorite/reviewed status: ", findAndUpdateError);
    //     return res.status(500).send(errors.SERVER_ERROR);
    // }

    let users = [];
    try { users = await Users.find(findQuery) }
    catch (findUsersError) {
        console.log("Error finding matching users when trying to update reviewed/favorited status: ", findUsersError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // find which property is being modified and what to set it to
    // default to reviewed = true
    let property = "reviewed";
    let value = true;
    if (moveTo === "Not Reviewed") {
        value = false;
    } else if (moveTo === "Favorites") {
        property = "favorite";
    } else if (moveTo === "Non-Favorites") {
        property = "favorite";
        value = false;
    }

    // the current date
    const NOW = new Date();

    // a list of promises, when it's done all users have been saved
    let saveUserPromises = [];
    // go through each affected user
    users.forEach(user => {
        // find the index of the position
        const positionIndex = user.positions.findIndex(position => {
            return position.positionId.toString() === positionId.toString() && position.businessId.toString() === businessId.toString();
        });
        // if the position is valid ...
        if (positionIndex >= 0) {
            // ... copy the poisition ...
            let userPosition = user.positions[positionIndex];
            // ... and if dismissing the candidates ...
            if (moveTo === "Dismissed") {
                // ... dismiss the candidate ...
                userPosition.isDismissed = true;
                // ... and add this to the history of changes
                let mostRecentStage = "Not Contacted";
                if (!Array.isArray(userPosition.hiringStageChanges) || userPosition.hiringStageChanges.length === 0) {
                    userPosition.hiringStageChanges = [];
                } else {
                    mostRecentStage = userPosition.hiringStageChanges[userPosition.hiringStageChanges.length - 1].hiringStage;
                }
                user.positions[positionIndex].hiringStageChanges.push({
                    hiringStage: mostRecentStage,
                    isDismissed: true,
                    dateChanged: NOW
                });
            } else {
                // ... or alter the value
                userPosition[property] = value;
            }

            // save the position
            user.positions[positionIndex] = userPosition;
            // save the user
            saveUserPromises.push(user.save());
        }
    });

    // wait for all users to get saved
    await Promise.all(saveUserPromises);

    res.json(true);
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

function POST_addEvaluationEmail(req, res) {
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com"];
    const business = sanitize(req.body.business);
    const position = sanitize(req.body.position);
    let subject = 'ACTION REQUIRED - ' + business + ' requested new position';

    let content = "<div>"
        + "<h2>" + business + " requested new position</h2>"
        + "<h3>Business</h3>"
        + "<p>"
        + business
        + "</p>"
        + "<h3>Position</h3>"
        + "<p>"
        + position
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
    const bizUserId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const userId = sanitize(body.candidateId);
    const hiringStage = sanitize(body.hiringStage);
    const isDismissed = sanitize(body.isDismissed);
    const positionId = sanitize(body.positionId);

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, user, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, userId);
        bizUser = results.bizUser; user = results.user; userPositionIndex = results.userPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting user position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    let userPosition = user.positions[userPositionIndex];

    // update all new hiring stage info
    userPosition.hiringStage = hiringStage;
    userPosition.isDismissed = isDismissed;
    // make sure hiring stage changes array exists
    if (!Array.isArray(userPosition.hiringStageChanges)) {
        userPosition.hiringStageChanges = [];
    }
    userPosition.hiringStageChanges.push({
        hiringStage, isDismissed,
        dateChanged: new Date()
    });

    // save the new info into the candidate object
    user.positions[userPositionIndex] = userPosition;

    // save the user
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user while trying to update hiring stage: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    res.json(true);
}


// returns the business user object, the candidate/employee, and the index of
// the position within the positions array of the candidate/employee
async function verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, userId, profileUrl) {
    return new Promise(async function(resolve, reject) {
        if (!bizUserId) { return reject("No bizUserId."); }
        else if (!verificationToken) { return reject("No business user verificationToken."); }
        else if (!positionId) { return reject("No positionId."); }
        else if (!userId) { return reject("No userId"); }

        // find the user and the candidate
        let bizUser, user;
        // search by id if possible, profile url otherwise
        try {
            const [foundBizUser, foundUser] = await Promise.all([
                getAndVerifyUser(bizUserId, verificationToken),
                Users.findById(userId)
            ])
            bizUser = foundBizUser;
            user = foundUser;
            if (!user) { return reject("Invalid user id."); }
        }
        catch (findUserError) { return reject(findUserError); }

        // make sure the user has an associated business
        if (!bizUser.businessInfo || !bizUser.businessInfo.businessId) {
            return reject("Business user does not have associated business.");
        }

        // if the user is not an admin or manager, they can't edit other users' info
        if (!["accountAdmin", "manager"].includes(bizUser.userType)) {
            reject("User does not have permission. User is type: ", bizUser.userType);
        }

        if (!Array.isArray(user.positions)) {
            return reject("That user did not apply for this position.");
        }

        // get the candidate's position with this position id
        const userPositionIndex = user.positions.findIndex(position => {
            // index is correct if it has the right position id and the business id
            // for the business that the user works for
            return position.positionId.toString() === positionId.toString() && bizUser.businessInfo.businessId.toString() === position.businessId.toString();
        });
        if (typeof userPositionIndex !== "number" || userPositionIndex < 0) {
            return reject("User did not apply for this position.");
        }

        resolve({ bizUser, user, userPositionIndex })
    });
}


// have a manager or account admin answer a question about an employee
async function POST_answerQuestion(req, res) {
    const body = req.body;
    const bizUserId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const userId = sanitize(body.employeeId);
    const positionId = sanitize(body.positionId);
    const questionIndex = sanitize(body.questionIndex);
    const score = sanitize(body.score);
    const gradingComplete = sanitize(body.gradingComplete);

    // make sure all necessary params are here
    if (!bizUserId || !verificationToken || !(typeof questionIndex === 'number') || !(typeof score === 'number') || !userId || !positionId) {
        return res.status(400).send("Bad request.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, user, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, userId);
        bizUser = results.bizUser; user = results.user; userPositionIndex = results.userPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting user position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if the answers array doesn't exist, make it
    if (!Array.isArray(user.positions[userPositionIndex].answers)) {
        user.positions[userPositionIndex].answers = [];
    }

    // get the index of the answer in the user's answers array
    const answerIndex = user.positions[userPositionIndex].answers.findIndex(answer => {
        return answer.questionIndex === questionIndex;
    });

    if (answerIndex === -1) {
        const newAnswer = {
            complete: true,
            score: score,
            questionIndex: questionIndex
        };
        user.positions[userPositionIndex].answers.push(newAnswer);
    } else {
        user.positions[userPositionIndex].answers[answerIndex].score = score;
    }

    // mark whether the manager is finished grading the user
    user.positions[userPositionIndex].gradingComplete = gradingComplete;

    // if no manager is marked as being the grader, add the current user
    if (!user.positions[userPositionIndex].managerId) {
        user.positions[userPositionIndex].managerId = user._id;
    }

    // save the user
    try { user = await user.save(); }
    catch (updateUserError) {
        console.log("Error saving user during grading: ", updateUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // return successfully
    res.json(user.positions[userPositionIndex].answers);
}

async function GET_business(req, res) {
    console.log(req.query);
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const businessId = sanitize(req.query.businessId);

    let business;
    try {
        business = await verifyAccountAdminAndReturnBusiness(userId, verificationToken, businessId);
    } catch(err) {
        console.log("error getting business: ", err);
        return res.status(500).send("Server error.");
    }

    console.log("business, ", business);

    return res.json(business);
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
                "userType": "candidate",
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
                "userType": "candidate",
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
    const bizUserId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const userId = sanitize(req.query.candidateId);
    const positionId = sanitize(req.query.positionId);
    const positionIdString = positionId.toString();

    // verify biz user, get candidate/employee, find and verify candidate's/employee's position
    let bizUser, user, userPositionIndex, psychTest;
    try {
        let [
            results,
            foundPsychTest
        ] = await Promise.all([
            verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, userId),
            Psychtests.findOne({}).select("factors._id factors.stats")
        ]);
        bizUser = results.bizUser; user = results.user; psychTest = foundPsychTest;
        userPositionIndex = results.userPositionIndex;
    } catch(error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    let userPosition = user.positions[userPositionIndex];

    // --->>              FORMAT THE DATA FOR THE FRONT END             <<--- //
    // get position-specific free response questions
    const frqs = userPosition.freeResponseQuestions.map(frq => {
        return {
            question: frq.body,
            answer: frq.response
        }
    })
    // get skill test scores for relevant skills
    const skillScores = Array.isArray(user.skillTests) ? user.skillTests.filter(skill => {
        return userPosition.skillTestIds.some(posSkillId => {
            return posSkillId.toString() === skill.skillId.toString();
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
    const psychScores = user.psychometricTest.factors.map(area => {
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
        title: user.title,
        name: user.name,
        email: user.emailToContact ? user.emailToContact : user.email,
        interest: userPosition.interest,
        hiringStage: userPosition.hiringStage,
        isDismissed: userPosition.isDismissed,
        endDate: userPosition.appliedEndDate,
        performanceScores: userPosition.scores,
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
    // // the restrictions on the search
    // const searchTerm = sanitize(req.query.searchTerm);
    // // if a specific hiring stage is wanted
    // const hiringStage = sanitize(req.query.hiringStage);
    // position name is the only required input to the search
    const positionName = sanitize(req.query.positionName);

    let positionRequirements = [
        { "businessId": mongoose.Types.ObjectId(businessId) },
        { "name": positionName }
    ];
    // // filter by hiring stage if requested
    // if (hiringStage) {
    //     positionRequirements.push({ "hiringStage": hiringStage });
    // }

    // only get the position that was asked for
    let query = {
        "userType": "candidate",
        "positions": {
            "$elemMatch": {
                "$and": positionRequirements
            }
        }
    }

    // // search by name too if search term exists
    // if (searchTerm) {
    //     const nameRegex = new RegExp(searchTerm, "i");
    //     query["name"] = nameRegex;
    // }

    // the user attributes that we want to keep
    const attributes = "_id name profileUrl positions.reviewed positions.favorite positions.interest positions.isDismissed positions.hiringStage positions.isDismissed positions.hiringStageChanges positions.scores";

    // perform the search
    let candidates = [];
    try { candidates = await Users.find(query).select(attributes); }
    catch (candidateSearchError) {
        console.log("Error searching for candidates: ", candidateSearchError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // format the candidates for the front end
    const formattedCandidates = candidates.map(candidate => {
        const candidateObj = candidate.toObject();
        return {
            name: candidateObj.name,
            profileUrl: candidateObj.profileUrl,
            _id: candidateObj._id,
            ...(candidateObj.positions[0])
        }
    })

    // successfully return the candidates
    return res.json(formattedCandidates);
}

async function GET_employeeSearch(req, res) {
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
    const status = sanitize(req.query.status);
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
    if (status) {
        const gradingComplete = status === "Complete";
        positionRequirements.push({ "gradingComplete": gradingComplete });
    }

    // only get the position that was asked for
    let query = {
        "userType": "employee",
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

    // the user attributes that we want to keep
    const attributes = "_id name profileUrl positions.answers positions.gradingComplete positions.scores";

    // perform the search
    let employees = [];
    try { employees = await Users.find(query).select(attributes); }
    catch (employeeSearchError) {
        console.log("Error searching for employees: ", employeeSearchError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // format the employees for the front end
    const formattedEmployees = employees.map(employee => {
        const employeeObj = employee.toObject();
        return {
            name: employeeObj.name,
            _id: employeeObj._id,
            profileUrl: employeeObj.profileUrl,
            ...(employeeObj.positions[0])
        };
    })

    // successfully return the employees
    return res.json(formattedEmployees);
}


// mark that a user has seen the info box shown at the top of my candidates
async function POST_sawMyCandidatesInfoBox(req, res) {
    const find = {
        "_id": sanitize(req.body.userId),
        "verificationToken": sanitize(req.body.verificationToken)
    };
    const update = { "sawMyCandidatesInfoBox": true };
    const options = { "upsert": false, "new": true };

    let user;
    try { user = await Users.findOneAndUpdate(find, update, options) }
    catch (updateError) {
        console.log("Error updating user while trying to see my candidates info box: ", updateError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    console.log("new user: ", user);

    return res.json(frontEndUser(user));
}



module.exports = businessApis;
