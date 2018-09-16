const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');
const credentials = require('../credentials');

const Users = require('../models/users.js');
const Emailaddresses = require('../models/emailaddresses.js');
const Businesses = require('../models/businesses.js');
const Skills = require('../models/skills.js');

const errors = require("./errors");


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


// Stack implementation
function Stack() { this.data = []; }
Stack.prototype.push = function(record) { this.data.push(record); }
Stack.prototype.pop = function() { return this.data.pop(); }
Stack.prototype.bottom = function() { return this.data[0]; }
Stack.prototype.top = function() { return this.data[this.data.length - 1]; }
Stack.prototype.size = function() { return this.data.length; }


const FOR_USER = [
    "_id",
    "info",
    "name",
    "email",
    "admin",
    "skills",
    "redirect",
    "verified",
    "userType",
    "positions",
    "profileUrl",
    "skillTests",
    "onboarding",
    "phoneNumber",
    "hideProfile",
    "dateSignedUp",
    "businessInfo",
    "emailToContact",
    "adminQuestions",
    "referredByCode",
    "currentPosition",
    // "psychometricTest",
    "verificationToken",
    "firstBusinessUser",
    "agreedToSkillTerms",
    "termsAndConditions",
    "hasFinishedOnboarding",
    "sawMyCandidatesInfoBox",
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

// shuffles a general array, used for shuffling questions around
function shuffle(arr) {
    let array = arr.slice();
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


function randomInt(lowBound, highBound) {
    const range = highBound - lowBound;
    return Math.floor(Math.random() * (range + 1)) + lowBound;
}


function getFirstName(name) {
    // return empty string on invalid input
    if (typeof name !== "string" || name.length === 0) { return ""; }

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


// find out if a variable potentially has emails to use
function hasNoEmails(recipients) {
    return (!recipients || (Array.isArray(recipients) && recipients.length === 0));
}


// send an email and return a promise - required arg fields are recipients, subject, and content
async function sendEmailPromise(args) {
    return new Promise(async function(resolve, reject) {
        // if arguments are not provided
        if (!args || typeof args !== "object") {
            return reject("Invalid arguments. Usage: sendEmailPromise({recipients: ['austin@gmail.com'], subject: 'New Stuff', ...})");
        }

        // addresses that will receive the email
        let recipients = args.recipients;
        if (hasNoEmails(recipients)) { recipients = args.recipient; }
        if (hasNoEmails(recipients)) { return reject(new Error("No recipients given.")); }
        // subject of the email
        const subject = args.subject;
        // body of the email
        const content = args.content;
        // OPTIONAL: who the email is being sent from (the sender) - default is Moonshot
        const sendFrom = args.sendFrom;
        // OPTIONAL: attachments files
        const attachments = args.attachments;

        // make sure all the required fields are provided
        if (!recipients || !subject || !content) {
            return reject("Recipients, subject, and content are all required arguments.");
        }

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
        else { return reject("Recipients should be a list of strings."); }

        // if no recipients are given
        if (recipientArray.length === 0) {
            return reject("No email recipients provided.");
        }

        // find the object with all the people who have opted out
        try { var optedOut = await Emailaddresses.findOne({name: "optedOut"}); }
        catch (findOptOutError) {
            console.log("Error finding email addresses of those who have opted out.");
            return reject(findOptOutError);
        }

        // get a string of emails to send to that haven't opted out
        const recipientList = createRecipientList(recipientArray, optedOut.emails);

        // don't send an email if it's not going to be sent to anyone
        if (recipientList === "") {
            return reject("Couldn't send email. Recipients are on the opt-out list or no valid emails were given.");
        }

        // the default email account to send emails from
        let from;
        let authUser;
        let authPass;
        if (sendFrom) {
            if (sendFrom === "Kyle Treige") {
                from = '"Kyle Treige" <kyle@moonshotinsights.io>';
                authUser = credentials.kyleEmailUsername;
                authPass = credentials.kyleEmailPassword;
            }
            // else if (sendFrom === "Justin Ye") {
            //     from = '"Justin Ye" <justin@moonshotinsights.io>';
            //     authUser = credentials.justinEmailUsername;
            //     authPass = credentials.justinEmailPassword;
            // }
        }
        // default is to send from Moonshot
        if (!from || !authUser || !authPass) {
            from = '"Moonshot" <do-not-reply@moonshotinsights.io>';
            authUser = credentials.emailUsername;
            authPass = credentials.emailPassword;
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
            if (error) { return reject(error); }
            return resolve();
        });
    });
}


// remove emails that have opted out, create a string like "ameyer24@wisc.edu, svdorn9@gmail.com"
function createRecipientList(recipientArray, optedOutEmailsArray) {
    // create a pseudo-hashtable object to keep track of emails that have opted out
    let optedOutEmailsObject = {};
    // go through each email that has opted out ...
    optedOutEmailsArray.forEach(ooEmail => {
        // ... and add it to the pseudo-hashtable
        optedOutEmailsObject[ooEmail.toLowerCase()] = true;
    });
    // the string that will contain the final result
    let recipientList = "";
    // go through each email address given
    recipientArray.forEach(recipient => {
        // make sure the email is a legitimate address
        if (isValidEmail(recipient)) {
            // make sure the email isn't on the opted-out list
            if (!optedOutEmailsObject[recipient.toLowerCase()]) {
                // add the email to the list of recipients
                if (recipientList === "") { recipientList = recipient; }
                // if this isn't the first recipient, add a comma beforehand
                else { recipientList = recipientList + ", " + recipient; }
            }
        }
    });

    return recipientList;
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

    if (typeof obj !== "object" || typeof obj.hasOwnProperty !== "function") {
        console.log("sanitizeObject got a non-object: ", obj);
        return undefined;
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
            return reject({status: 500, message: "Server error, try again later", error: getUserError});
        }

        if (!user) {
            console.log("User not found from id: ", userId);
            return reject({status: 404, message: "User not found. Contact Moonshot.", error: `No user with id ${userId}.`})
        }

        // verify user's identity
        if (!verificationToken && user.verificationToken !== verificationToken) {
            console.log(`Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`);
            return reject({status: 500, message: "Invalid credentials.", error: `Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`});
        }

        return resolve(user);
    })
}

// get and verify user from express request
async function getUserFromReq(req, requestType) {
    return new Promise(async function(resolve, reject) {
        // for GET requests, req.params will contain userId and verification token
        if (requestType === "GET") { argContainer = "query"; }
        // for POST requests, req.body will contain them
        else { argContainer = "body"; }

        // make sure req and req.body are objects
        if (typeof req !== "object" || typeof req[argContainer] !== "object") {
            return reject({status: 400, message: errors.BAD_REQUEST, error: `Req.${argContainer} must be an object.`});
        }

        // get and verify valitidy of necessary arguments
        const { userId, verificationToken } = sanitize(req[argContainer]);
        const stringArgs = [ userId, verificationToken ];
        if (!validArgs({ stringArgs })) {
            return reject({status: 400, message: errors.BAD_REQUEST, error: "userId and/or verificationToken not a string"});
        }

        // get user that made this call
        try { var user = await getAndVerifyUser(userId, verificationToken); }
        catch (getUserError) {
            // if the error is nicely formatted, just return it as is
            if (getUserError.message && getUserError.status && getUserError.error) {
                return reject(getUserError);
            } else { // otherwise return a nicely formatted error
                return reject({status: 500, message: errors.SERVER_ERROR, error: getUserError});
            }
        }

        return resolve(user);
    });
}


// DANGEROUS, returns user with all fields
async function getUserAndBusiness(userId, verificationToken) {
    return new Promise(async function(resolve, reject) {
        // get the user
        try { var user = await getAndVerifyUser(userId, verificationToken); }
        // just throw any caught error for the caller to deal with
        catch (error) { return reject(error); }

        // have to work for a company
        if (!user.businessInfo || !user.businessInfo.businessId) {
            return reject({status: 403, message: errors.PERMISSIONS_ERROR, error: "Business id not provided within user object."});
        }

        // get the business the user works for
        try { var business = await Businesses.findById(user.businessInfo.businessId); }
        catch (getBusinessError) {
            return reject({status: 500, message: errors.SERVER_ERROR, error: getBusinessError})
        }

        // if no business was found, return unsuccessfully
        if (!business) {
            return reject({status: 500, message: errors.SERVER_ERROR, error: "No business found from business id."});
        }

        return resolve({user, business});
    })
}


// always sets the due date to be 11:59pm
function lastPossibleSecond(date, daysToAdd) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate() + (typeof daysToAdd === "number" ? daysToAdd : 0);
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
    return typeof email === "string" && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
}


// checks if a file has the correct type based on the extension
function isValidFileType(fileName, allowedFileTypes) {
    // make sure arguments are valid
    if (typeof fileName !== "string") {
        console.log("Invalid usage of isValidFileType()! First argument must be the name of the file (e.g. 'dingus.png')");
        return false;
    }
    if (!Array.isArray(allowedFileTypes)) {
        console.log("Invalid usage of isValidFileType()! Second argument must be an array of extensions (e.g. ['csv', 'pdf'])");
        return false;
    }

    // get the file extension from the end of the file name
    let extension = fileName.split('.').pop().toLowerCase();
    // look through the list of allowed file types, if any matches, success
    const isValid = allowedFileTypes.includes(extension);

    return isValid;
}


// determine if arguments to a function are valid
// options = {
//     stringArgs: [ String ],
//     allowEmptyStrings: Boolean, *optional*
//     numberArgs: [ Number ],
//     objectArgs: [ Object ],
//     arrayArgs: [ [ Anything ] ]
// }
function validArgs(options) {
    // all the types of arguments we have to check as well as what each of their
    // checks for validity are
    toCheck = [
        { argType: "numberArgs", check: (n) => { return typeof n === "number"; } },
        { argType: "objectArgs", check: (o) => { return o && typeof o === "object"; } },
        { argType: "arrayArgs", check: (a) => { return Array.isArray(a); } }
    ];

    // by default, strings are not valid if they are empty
    let stringCheck = (s) => { return s && typeof s === "string" };
    // if option to allow empty strings is true ...
    if (options.allowEmptyStrings) {
        // ... change the string check to not check truthiness
        stringCheck = (s) => { return typeof s === "string" };
    }
    // add strings to list of things to check
    toCheck.push({ argType: "stringArgs", check: stringCheck });

    // assume all arguments are valid
    allValid = true;

    // go through each type of argument
    toCheck.forEach(argInfo => {
        // the array of arguments to check (could be the string array or number or whatever)
        const args = options[argInfo.argType];
        // if that array of args was actually passed in as an array
        if (Array.isArray(args)) {
            // go through each provided argument ...
            args.forEach(arg => {
                // ... check if it's valid ...
                if (!argInfo.check(arg)) {
                    // ... if it's not valid, mark that an argument is invalid
                    allValid = false;
                }
            });
        }
    });

    return allValid;
}


// logs the arguments provided
// example: logArgs(req.body, ["businessId", "positionId"]);
function logArgs(parent, args) {
    console.log("Arguments: ");
    args.forEach(arg => { console.log(arg, ": ", parent[arg]); });
}


// logs an error with line numbers and such
function logError(...args) {
    console.log("ERROR");
    args.forEach(arg => { console.log(arg); });
    let stack = (new Error).stack;
    stack = stack.substring(stack.indexOf(")") + 1);
    //stack.shift();
    console.log("Stacktrace: ", stack);
}


// checks if a password is secure enough to be stored
function isValidPassword(password) {
    const MIN_PASSWORD_LENGTH = 8;
    return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}


// checks if a value is truthy (not null or undefined or empty string)
function truthy(thing) { return !!thing; }


// check if a child property exists on an object, and optionally checks if the
// EX: if we have an object named user like this:
// { info: { name: "Austin" } }
// this returns true: propertyExists(user, ["info", "name"], "string")
// this returns true: propertyExists(user, ["info", "name"])
// this returns false: propertyExists(user, ["info", "name"], "object")
// this returns false: propertyExists(user, ["info", "career"])
function propertyExists(object, propertyTree, type) {
    let parent = object;
    // if the parent does not exist, property can't exist
    if (!parent) { return false; }
    // if no properties given, property can't exist
    if (!Array.isArray(propertyTree) || propertyTree.length === 0) { return false; }

    // start with the first property in the tree
    let treePropIndex = 0;
    // go through each property in the tree
    while (treePropIndex < propertyTree.length) {
        // make sure the parent is an object so it can have given properties
        if (typeof parent !== "object") { return false; }
        // name of the object property
        const propName = propertyTree[treePropIndex];
        // if the property is not truthy (does not exist), fail
        if (!parent[propName]) { return false; }
        // the property is legit, so set the parent to be the value of the child prop
        parent = parent[propName];
        // move to the next property
        treePropIndex++;
    }
    // at this point, parent is the value we wanted to check
    // if there is a defined wanted type, check for it
    if (truthy(type)) { return typeof parent === type; }
    // otherwise return that the property is valid
    else { return true; }
}


// email addresses of all the founders
const founderEmails = process.env.NODE_ENV === "production" ? ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com", "ameyer24@wisc.edu"] : [process.env.DEV_EMAIL];


// standard email footer
function emailFooter(userEmail) {
    let moonshotUrl = process.env.NODE_ENV === "development" ? 'http://localhost:8081/' : 'https://moonshotinsights.io/';

    return (
        `<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>
        <div style="text-align:center"><a href="${moonshotUrl}" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px; "src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a></div>
        <div style="text-align:left;width:100%;display:inline-block;">
            <div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">
                <i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>
                <a style="color:#C8C8C8; margin-top:20px;" href="${moonshotUrl}unsubscribe?email=${userEmail}">Opt-out of future messages.</a></i>
            </div>
        </div>`
    );
}


const helperFunctions = {
    sanitize,
    removeEmptyFields,
    verifyUser,
    sendEmail,
    sendEmailPromise,
    getFirstName,
    removeDuplicates,
    randomInt,
    shuffle,
    frontEndUser,
    getAndVerifyUser,
    getUserFromReq,
    getUserAndBusiness,
    speedTest,
    lastPossibleSecond,
    findNestedValue,
    isValidEmail,
    isValidPassword,
    isValidFileType,
    validArgs,
    logArgs,
    logError,
    truthy,
    propertyExists,
    emailFooter,

    Queue,
    Stack,

    FOR_USER,
    founderEmails,
    devMode: !!(process.env.NODE_ENV === "development"),
    devEmail: process.env.DEV_EMAIL
}


module.exports = helperFunctions;
