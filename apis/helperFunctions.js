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


// Queue implementation
function Queue() { this.data = []; }
Queue.prototype.enqueue = function(record) { this.data.unshift(record); }
Queue.prototype.dequeue = function() { return this.data.pop(); }
Queue.prototype.first = function() { return this.data[0]; }
Queue.prototype.last = function() { return this.data[this.data.length - 1]; }
Queue.prototype.size = function() { return this.data.length; }


const FOR_USER = [
    "_id",
    "verificationToken",
    "name",
    "email",
    "emailToContact",
    "phoneNumber",
    "userType",
    "admin",
    "termsAndConditions",
    "firstBusinessUser",
    "hideProfile",
    "profileUrl",
    "dateSignedUp",
    "hasFinishedOnboarding",
    "positions",
    "referredByCode",
    "verified",
    "skills",
    "skillTests",
    "info",
    "redirect",
    "businessInfo",
    "adminQuestions",
    "psychometricTest",
    "currentPosition",
    "sawMyCandidatesInfoBox"
];

// removes information from a db user object so that it can be passed for that
// same user on the front end; second argument is array of fields to include
function frontEndUser(dbUser, fieldsToInclude) {
    // create a new empty user
    let newUser = {};
    let userProperties;

    // if toObject is a function, that means dbUser is a Mongoose object, so we
    // have to use toObject to make it into a normal object
    if (typeof dbUser.toObject === "function") {
        userProperties = dbUser.toObject();
    }
    // otherwise it is already a normal object
    else { userProperties = dbUser; }

    // if no fields are included, assume it's for the user
    if (!Array.isArray(fieldsToInclude)) { fieldsToInclude = FOR_USER; }

    // go through every property that should be included; if it has any special
    // requirements, deal with them, otherwise just take the wanted property
    fieldsToInclude.forEach(field => {
        // has to be a string to be a valid user object attribute
        if (typeof field === "string") {
            switch (field) {
                // if we need to return the psych test
                case "psychometricTest":
                    // see if the user has anything for the psych test
                    const psychTest = userProperties.psychometricTest;
                    if (psychTest && typeof psychTest === "object") {
                        // create a clean test
                        let cleanPsychTest = {};
                        // copy in the easy fields
                        cleanPsychTest.numQuestionsAnswered = psychTest.numQuestionsAnswered;
                        cleanPsychTest.inProgress = psychTest.inProgress;
                        cleanPsychTest.startDate = psychTest.startDate;
                        cleanPsychTest.endDate = psychTest.endDate;
                        cleanPsychTest.factors = psychTest.factors;

                        // find out how many questions there are total for the progress bar
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

                        // only applies if the user is currently taking the test
                        const currentQuestion = psychTest.currentQuestion;
                        if (currentQuestion && typeof currentQuestion === "object") {
                            cleanPsychTest.currentQuestion = {
                                body: currentQuestion.body,
                                leftOption: currentQuestion.leftOption,
                                rightOption: currentQuestion.rightOption,
                                questionId: currentQuestion.questionId
                            }
                        }

                        // save the psych test to the front-end user
                        newUser.psychometricTest = cleanPsychTest;
                    }
                    break;
                // both of these will give you the same thing; it's called positionInProgress
                // in the backend but currentPosition in the front end
                case "positionInProgress":
                case "currentPosition":
                    // make sure the field exists
                    if (userProperties.positionInProgress) {
                        // find the index of the position the user is applying to
                        const positionInProgressString = userProperties.positionInProgress.toString();
                        const positionIndex = userProperties.positions.findIndex(pos => {
                            return pos.positionId.toString() === positionInProgressString;
                        });
                        position = userProperties.positions[positionIndex];
                        // give the user the current position info
                        newUser.currentPosition = {
                            inProgress: true,
                            name: position.name,
                            agreedToSkillTestTerms: position.agreedToSkillTestTerms,
                            skillTests: position.skillTestIds,
                            testIndex: position.testIndex,
                            freeResponseQuestions: position.freeResponseQuestions
                        }
                    }
                    break;
                default:
                    // by default just include the field
                    newUser[field] = userProperties[field];
                    break;
            }
        }

    })

    // return the updated user, ready for front-end use
    return newUser;
}


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


// callback needs to be a function of a success boolean and string to return;
// takes an ARRAY of recipient emails
function sendEmail(recipients, subject, content, sendFrom, attachments, callback) {
    // recipientArray is an array of strings while recipientList is one string with commas
    let recipientArray = [];
    // if only one recipient was given, in string form, and it is an actual email address
    if (typeof recipients === "string" && isValidEmail(recipients)) {
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
        return callback(false, "Invalid argument. Recipients should be a list of strings.");
    }

    if (recipientArray.length === 0) {
        return callback(false, "Couldn't send email. No recipient.")
    }

    // get the list of email addresses that have been opted out
    let recipientList = "";
    Emailaddresses.findOne({name: "optedOut"}, function(err, optedOut) {
        const optedOutStudents = optedOut.emails;
        recipientArray.forEach(recipient => {
            // make sure the email is a legitimate address
            if (isValidEmail(recipient)) {
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
            return callback(false, "Couldn't send email. Recipients are on the opt-out list or no valid emails were given.")
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
                return callback(false, "Error sending email to user");
            }
            return callback(true, "Email sent! Check your email.");
        });
    })
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


// always sets the due date to be 11:59pm
function lastPossibleSecond(date, daysToAdd) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate() + daysToAdd;
    const hour = 23;
    const minute = 59;
    const second = 59;
    return (new Date(year, month, day, hour, minute, second));
}


// find the value of a certain attribute within an object
function findNestedValue(obj, wantedAttribute, nestedLevels, traverseArrays) {
    // can't find anything if object is undefined
    if (!obj) { return undefined; }
    // wanted attribute is necessary for this to function
    if (typeof wantedAttribute !== "string") { throw ("wantedAttribute must be a string - wantedAttribute: " + wantedAttribute); }
    // if no nested levels value given, nest 4 times
    if (typeof nestedLevels !== "number") { nestedLevels = 4; }
    // assume we shouldn't go through arrays if the option isn't given
    if (typeof traverseArrays !== "boolean") { traverseArrays = false; }

    // create a queue of objects to dig through
    let q = new Queue();
    // the current object to look through
    let currentObj = obj;
    // add the top-level object to the queue
    q.enqueue({object: obj, level: 0});
    // go through the queue until the attribute is found or the queue is empty
    do {
        currentObj = q.dequeue();
        // see if we found the value as a prop of the current object, if not, add all
        // the properties of this object to the queue
        const foundValue = addValuesToQueue(currentObj);
        // return the value if it was found
        if (foundValue) { return foundValue; }
    }
    // keep checking until the queue is empty
    while (q.size() > 0);

    // property never found
    return undefined;

    function addValuesToQueue(currentObject) {
        const o = currentObject.object;
        const level = currentObject.level;
        // if o is not an object, can't check its values, so move on
        if (typeof o !== "object") { return; }

        // if the object is an array ...
        else if (Array.isArray(o)) {
            // ... make sure we should add array elements and that we haven't
            // reached the maximum search depth
            if (traverseArrays && level < nestedLevels) {
                // go through every element of the array
                o.forEach(value => {
                    // add the element to the queue
                    q.enqueue({object: value, level: level + 1});
                });
            }
        }

        // it is an object, so check it
        else {
            // go through every property the object has
            for (const prop in o) {
                // don't check the property if it's a default object property
                if (!o.hasOwnProperty(prop)) { continue; }
                // get the value of the current property
                const value = o[prop];
                // return value if found
                if (prop === wantedAttribute) { return value; }
                // otherwise, if the value is an object ...
                else if (typeof value === "object" && level < nestedLevels) {
                    // ... add it to the queue
                    q.enqueue({object: value, level: level + 1});
                }
            }
        }
        // value not found in this object
        return undefined;
    }
}


// checks if an email is of the correct form (i.e. name@something.blah )
function isValidEmail(email) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
}


const helperFunctions = {
    sanitize,
    removeEmptyFields,
    verifyUser,
    sendEmail,
    getFirstName,
    removeDuplicates,
    randomInt,
    frontEndUser,
    getAndVerifyUser,
    speedTest,
    lastPossibleSecond,
    findNestedValue,
    isValidEmail,

    FOR_USER
}


module.exports = helperFunctions;
