const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');
const credentials = require('../credentials');

const Users = require('../models/users.js');
const Emailaddresses = require('../models/emailaddresses.js');
const Businesses = require('../models/businesses.js');
const Skills = require('../models/skills.js');


// strictly sanitize, only allow bold and italics in input
const sanitizeOptions = {
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: []
}


// removes information from a db user object so that it can be passed for that
// same user on the front end
function frontEndUser(dbUser, extraFieldsToRemove) {
    // copy everything into new user object
    let newUser = Object.assign({}, dbUser);

    // doing Object.assign with a document from the db can lead to the new object
    // having a bunch of properties we don't want with the actual object ending
    // up in newObj._doc, so take the ._doc property if it exists and treat it
    // as the actual object
    if (newUser._doc) {
        newUser = newUser._doc;
    }

    // clean the psychometric test
    let cleanPsychTest = undefined;
    const psychTest = newUser.psychometricTest;
    if (psychTest) {
        cleanPsychTest = {};
        if (psychTest.inProgress) {
            cleanPsychTest.inProgress = psychTest.inProgress;
        }
        if (psychTest.startDate) {
            cleanPsychTest.startDate = psychTest.startDate;
        }
        if (psychTest.endDate) {
            cleanPsychTest.endDate = psychTest.endDate;
        }

        if (typeof psychTest.questionsPerFacet === "number" && Array.isArray(psychTest.factors)) {
            // count the number of questions - questions/facet * number of facets
            let numFacets = 0;
            psychTest.factors.forEach(factor => {
                if (factor && typeof factor === "object" && Array.isArray(factor.facets)) {
                    numFacets += factor.facets.length;
                }
            });
            cleanPsychTest.numQuestions = psychTest.questionsPerFacet * numFacets;
        }

        if (typeof psychTest.numQuestionsAnswered === "number") {
            cleanPsychTest.numQuestionsAnswered = psychTest.numQuestionsAnswered;
        }

        const currentQuestion = psychTest.currentQuestion;
        // only applies if the user is currently taking the test
        if (currentQuestion && typeof currentQuestion === "object") {
            cleanPsychTest.currentQuestion = {
                body: currentQuestion.body,
                leftOption: currentQuestion.leftOption,
                rightOption: currentQuestion.rightOption,
                questionId: currentQuestion.questionId
            }

        }
    }

    // if the user is currently applying for a position
    let currentPosition = undefined;
    if (newUser.positionInProgress) {
        // find the index of the position the user is
        const positionInProgressString = newUser.positionInProgress.toString();
        const positionIndex = newUser.positions.findIndex(pos => {
            return pos.positionId.toString() === positionInProgressString;
        });
        position = newUser.positions[positionIndex];

        currentPosition = {
            inProgress: true,
            name: position.name,
            agreedToSkillTestTerms: position.agreedToSkillTestTerms,
            skillTests: position.skillTestIds,
            testIndex: position.testIndex,
            freeResponseQuestions: position.freeResponseQuestions
        }
    }

    // default things to remove
    newUser.password = undefined;
    newUser.emailVerificationToken = undefined;
    newUser.passwordToken = undefined;
    newUser.passwordTokenExpirationTime = undefined;
    newUser.skillTests = undefined;
    newUser.positions = undefined;
    newUser.psychometricTest = cleanPsychTest;
    newUser.currentPosition = currentPosition;

    // if we are given more than the default fields to remove
    if (Array.isArray(extraFieldsToRemove)) {
        // go through each extra field and remove them from the user
        extraFieldsToRemove.forEach(field => {
            // make sure the field is a string so it can be an object property
            if (typeof field === "string") {
                newUser[field] = undefined;
            }
        });
    }

    // return the updated user, ready for front-end use
    return newUser;
}


// some options for front-end user
const COMPLETE_CLEAN = [
    "_id",
    "verificationToken",
    "admin",
    "termsAndConditions",
    "employerCode",
    "hideProfile",
    "referredByCode",
    "verified",
    "redirect",
    "psychometricTest",
    "positions",
    "positionInProgress",
    "currentPosition",
    "emailVerificationToken"
]
// don't want employers to see which other positions user has applied for
const FOR_EMPLOYER = [ "verificationToken", "emailVerificationToken" ];
const NO_TOKENS = [ "verificationToken", "emailVerificationToken" ];


function randomInt(lowBound, highBound) {
    const range = highBound - lowBound;
    return Math.floor(Math.random() * (range + 1)) + lowBound;
}


function getFirstName(name) {
    // split by spaces, get array of non-spaced names, return the first one
    let firstName = "";
    try {
        firstName = name.split(' ')[0];
    } catch (e) {
        firstName = "";
    }
    return firstName;
}


// this user object can now safely be seen by anyone
function safeUser(user) {
    let newUser = Object.assign({}, user);

    // doing Object.assign with a document from the db can lead to the new object
    // having a bunch of properties we don't want with the actual object ending
    // up in newObj._doc, so take the ._doc property if it exists and treat it
    // as the actual object
    if (newUser._doc) {
        newUser = newUser._doc;
    }

    newUser.password = undefined;
    newUser._id = undefined;
    newUser.verificationToken = undefined;
    newUser.emailVerificationToken = undefined;
    newUser.passwordToken = undefined;
    newUser.answers = undefined;

    return newUser;
}

// same as safe user except it has the user's answers to questions
function userForAdmin(user) {
    let newUser = Object.assign({}, user);

    if (newUser._doc) {
        newUser = newUser._doc;
    }

    newUser.password = undefined;
    newUser._id = undefined;
    newUser.verificationToken = undefined;
    newUser.emailVerificationToken = undefined;
    newUser.passwordToken = undefined;

    return newUser;
}


// callback needs to be a function of a success boolean and string to return;
// takes an ARRAY of recipient emails
function sendEmail(recipients, subject, content, sendFrom, attachments, callback) {
    // recipientArray is an array of strings while recipientList is one string with commas
    let recipientArray = [];
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    // if only one recipient was given, in string form, and it is an actual email address
    if (typeof recipients === "string" && emailRegex.test(recipients)) {
        // add it to the recipients list
        recipientArray.push(recipients);
    }
    // if recipients is an array like it's supposed to be
    else if (Array.isArray(recipients)) {
        // set the recipient list to be everyone who was passed in
        recipientArray = recipients;
    }
    // otherwise return unsuccessfully
    else {
        callback(false, "Invalid argument. Recipients should be a list of strings.");
        return;
    }

    if (recipientArray.length === 0) {
        callback(false, "Couldn't send email. No recipient.")
        return;
    }

    // get the list of email addresses that have been opted out
    let recipientList = "";
    Emailaddresses.findOne({name: "optedOut"}, function(err, optedOut) {
        const optedOutStudents = optedOut.emails;
        recipientArray.forEach(recipient => {
            // make sure the email is a legitimate address
            if (emailRegex.test(recipient)) {
                emailOptedOut = optedOutStudents.some(function(optedOutEmail) {
                    return optedOutEmail.toLowerCase() === recipient.toLowerCase();
                });
                // add the email to the list of recipients to email if the recipient
                // has not opted out
                if (!emailOptedOut) {
                    if (recipientList === "") {
                        recipientList = recipient;
                    } else {
                        recipientList = recipientList + ", " + recipient;
                    }
                }
            }
        });

        // don't send an email if it's not going to be sent to anyone
        if (recipientList === "") {
            callback(false, "Couldn't send email. Recipients are on the opt-out list or no valid emails were given.")
            return;
        }

        // the default email account to send emails from
        let from = '"Moonshot" <do-not-reply@moonshotinsights.io>';
        let authUser = credentials.emailUsername;
        let authPass = credentials.emailPassword;
        if (sendFrom) {
            if (sendFrom === "Kyle Treige") {
                from = '"Kyle Treige" <kyle@moonshotinsights.io>';
                authUser = credentials.kyleEmailUsername;
                authPass = credentials.kyleEmailPassword;
            } else {
                from = '"' + sendFrom + '" <do-not-reply@moonshotinsights.io>';
            }
        }

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            // host: 'smtp.ethereal.email',
            // port: 587,
            // secure: false, // true for 465, false for other ports
            // auth: {
            //     user: 'snabxjzqe3nmg2p7@ethereal.email',
            //     pass: '5cbJWjTh7YYmz7e2Ce'
            // }
            service: 'gmail',
            auth: {
                user: authUser,
                pass: authPass
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: from, // sender address
            to: recipientList, // list of receivers
            subject: subject, // Subject line
            html: content // html body
        };

        // attach attachments, if they exist
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                callback(false, "Error sending email to user");
                return;
            }
            callback(true, "Email sent! Check your email.");
            return;
        });
    })
}


// dangerous, returns user with verification token
function getUserByQuery(query, callback) {
    let finishedOneCall = false;

    // if user found in one of the DBs, performs the callback
    // if user not found, check if the other DB is already done
    //     if so, callback with no user, otherwise, wait for the other DB call
    let doCallbackOrWaitForOtherDBCall = function(err, foundUser) {
        // if a user was found, return it
        if (foundUser && foundUser != null) {
            const NO_ERRORS = undefined;
            callback(NO_ERRORS, removePassword(foundUser));
            return;
        }
        // no user found in one of the dbs
        else {
            // if this is the second db we've checked, no user was found in
            // either db, so return undefined and an error if one exists
            if (finishedOneCall) {
                const NO_USER_FOUND = undefined;
                callback(err, NO_USER_FOUND);
            }
            // if this is the first db we've checkd, mark that a db was checked
            else {
                finishedOneCall = true;
            }
        }
    }

    Users.findOne(query, function (err, foundUser) {
        doCallbackOrWaitForOtherDBCall(err, foundUser);
    });
}


// used when passing the user object back to the user, still contains sensitive
// data such as the user id and verification token
function removePassword(user) {
    if (typeof user === "object" && user != null) {
        let newUser = user;
        newUser.password = undefined;
        return newUser;
    } else {
        return undefined;
    }
}


// remove html tags from a variable (any type) to prevent code injection
function sanitize(something) {
    const somethingType = (typeof something);
    switch (somethingType) {
        case "object":
            return sanitizeObject(something);
            break;
        case "boolean":
        case "number":
            return something;
            break;
        case "string":
            return sanitizeHtml(something, sanitizeOptions);
            break;
        case "undefined":
        case "symbol":
        case "function":
        default:
            return undefined;
    }
}


function sanitizeObject(obj) {
    if (!obj) {
        return undefined;
    }

    if (Array.isArray(obj)) {
        return sanitizeArray(obj);
    }

    let newObj = {};

    for (var prop in obj) {
        // skip loop if the property is from prototype
        if (!obj.hasOwnProperty(prop)) continue;
        let value = obj[prop];
        let propType = typeof value;

        switch (propType) {
            case "undefined":
                break;
            case "object":
                if (Array.isArray(value)) {
                    newObj[prop] = sanitizeArray(value);
                } else {
                    newObj[prop] = sanitizeObject(value);
                }
                break;
            case "boolean":
            case "number":
                newObj[prop] = value;
                break;
            case "string":
                newObj[prop] = sanitizeHtml(value, sanitizeOptions);
                break;
            default:
            // don't give the object the property if it isn't one of these things
        }
    }

    return newObj;
}


function sanitizeArray(arr) {
    if (!arr) {
        return undefined;
    }

    const sanitizedArr = arr.map(function (value) {
        let valueType = (typeof value);

        switch (valueType) {
            case "object":
                if (Array.isArray(value)) {
                    return sanitizeArray(value);
                } else {
                    return sanitizeObject(value);
                }
                break;
            case "boolean":
            case "number":
                return value;
                break;
            case "string":
                return sanitizeHtml(value, sanitizeOptions);
                break;
            case "undefined":
            default:
                // don't give the object the property if it isn't one of these things
                return undefined;
        }
    });

    return sanitizedArr;
}


// remove any empty pieces from an object or array all the way down
function removeEmptyFields(something) {
    if (typeof something !== "object") {
        return something;
    } else {
        if (Array.isArray(something)) {
            return removeEmptyArrayFields(something);
        } else {
            return removeEmptyObjectFields(something);
        }
    }
}


// remove any empty pieces from an object
function removeEmptyObjectFields(obj) {
    let newObj = {};

    for (var prop in obj) {
        // skip loop if the property is from prototype
        if (!obj.hasOwnProperty(prop)) continue;
        let value = obj[prop];

        // don't add the value if it is some sort of empty
        if (!valueIsEmpty(value)) {
            // go down through the levels of the object if it is an object, then add it
            if (typeof value === "object") {
                // remove empty fields from the value
                valueWithEmptyFieldsRemoved = removeEmptyFields(value);
                // only add the value if it is still non-empty
                if (!valueIsEmpty(valueWithEmptyFieldsRemoved)) {
                    newObj[prop] = valueWithEmptyFieldsRemoved;
                }
            } else {
                // value is not empty, add it to the new object
                newObj[prop] = value;
            }
        }
    }

    return newObj;
}

// remove any empty pieces from an array
function removeEmptyArrayFields(arr) {
    let newArr = [];

    newArr = arr.map(function(item){
        return removeEmptyFields(item);
    });

    newArr = newArr.filter(function(item) {
        return !valueIsEmpty(item);
    });

    return newArr;
}


// returns true if the thing is equal to some non-emptyish thing
function valueIsEmpty(thing) {
    if (typeof thing === "object") {
        if (Array.isArray(thing)) {
            return thing.length === 0;
        } else {
            return objectIsEmpty(thing);
        }
    } else {
        return (thing === undefined || thing === null || thing === "");
    }
}


// returns true if the object is {}
function objectIsEmpty(obj) {
    if (obj === null || obj === undefined) { return true; }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}


function verifyUser(user, verificationToken) {
    return user.verificationToken && user.verificationToken == verificationToken;
}


// test a function for how long it takes
async function speedTest(trials, functionToTest) {
    let total = 0;
    for (let i = 1; i <= trials; i++) {
        const millisStart = (new Date()).getTime();

        const returnValue = functionToTest();

        if (typeof returnValue === "object" && typeof returnValue.then === "function") {
            await returnValue;
        }

        const millisEnd = (new Date()).getTime();
        console.log(`${(millisEnd - millisStart)} milliseconds`);
        total += (millisEnd - millisStart);
    }
    const average = total / trials;

    console.log(`\nAverage time: ${average} milliseconds`);
}


// DOES NOT WORK FOR REMOVING DUPLICATE OBJECTS, ONLY STRINGS/INTS
function removeDuplicates(a) {
    // the hash object
    let seen = {};
    // array to be returned
    let out = [];
    // length of array to be checked
    const len = a.length;
    // position in array to be returned
    let j = 0;
    // go through each element in the given array
    for(let i = 0; i < len; i++) {
        // the item in the given array
        const item = a[i];
        // if seen[item] === 1, we have seen it before
        if(seen[item] !== 1) {
            // we haven't seen the item before, so mark it seen...
            seen[item] = 1;
            // ...and add it to the list to be returned
            out[j++] = item;
        }
    }
    // return the new duplicate-free array
    return out;
}


// DANGEROUS, returns user with all fields
async function getAndVerifyUser(userId, verificationToken) {
    return new Promise(async function(resolve, reject) {
        // get the user from the db
        let user = undefined;
        try {
            user = await Users.findById(userId);
        } catch (getUserError) {
            console.log("Error getting user from the database: ", getUserError);
            reject({status: 500, message: "Server error, try again later", error: getUserError});
        }

        if (!user) {
            console.log("User not found from id: ", userId);
            reject({status: 404, message: "User not found. Contact Moonshot.", error: `No user with id ${userId}.`})
        }

        // verify user's identity
        if (!verificationToken && user.verificationToken !== verificationToken) {
            console.log(`Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`);
            reject({status: 500, message: "Invalid credentials.", error: `Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`});
        }

        resolve(user);
    })
}


const helperFunctions = {
    sanitize,
    removeEmptyFields,
    verifyUser,
    removePassword,
    getUserByQuery,
    sendEmail,
    safeUser,
    userForAdmin,
    getFirstName,
    removeDuplicates,
    randomInt,
    frontEndUser,
    getAndVerifyUser,
    speedTest,

    COMPLETE_CLEAN,
    FOR_EMPLOYER,
    NO_TOKENS
}


module.exports = helperFunctions;
