const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');
const credentials = require('../credentials');

var Users = require('../models/users.js');
var Employers = require('../models/employers.js');
var Emailaddresses = require('../models/emailaddresses.js');

// strictly sanitize, only allow bold and italics in input
const sanitizeOptions = {
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: []
}

const helperFunctions = {
    sanitize,
    removeEmptyFields,
    verifyUser,
    removePassword,
    printUsersFromPathway,
    getUserByQuery,
    sendEmail,
    safeUser,
    userForAdmin,
    getFirstName,
    sendBizUpdateCandidateErrorEmail,
    removeDuplicates
}


// TODO delete this as soon as we have a good way of seeing all users within a pathway
function printUsersFromPathway(pathwayIdToCheck) {
    const pathwayUsersQuery = {
        $or: [
            {
                pathways: {
                    $elemMatch: {
                        pathwayId: pathwayIdToCheck
                    }
                }
            },
            {
                completedPathways: {
                    $elemMatch: {
                        pathwayId: pathwayIdToCheck
                    }
                }
            }
        ]
    };
    Users.find(pathwayUsersQuery, function(err, users) {
        console.log("err is: ", err);

        users.forEach(function(user) {
            let userPath = user.pathways.find(function(path) {
                return path.pathwayId == pathwayIdToCheck;
            });
            let currentStep = userPath ? userPath.currentStep : "completed";

            const ourEmails = ["ameyer24@wisc.edu", "austin.thomas.meyer@gmail.com", "frizzkitten@gmail.com", "svdorn@wisc.edu", "treige@wisc.edu", "jye39@wisc.edu", "stevedorn9@gmail.com", "kyle.treige@gmail.com"];
            if (!ourEmails.includes(user.email)) {
                console.log("\n\nname: ", user.name, "\nemail: ", user.email, "\ncurrent step: ", currentStep);
            }
        })
    })
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
    if (recipients.length === 0) {
        callback(false, "Couldn't send email. No recipient.")
        return;
    }

    // get the list of email addresses that have been opted out
    let recipientList = "";
    Emailaddresses.findOne({name: "optedOut"}, function(err, optedOut) {
        const optedOutStudents = optedOut.emails;
        recipients.forEach(function(recipient) {
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
        });

        // don't send an email if it's not going to be sent to anyone
        if (recipientList === "") {
            callback(false, "Couldn't send email. Recipients are on the opt-out list.")
            return;
        }

        // the default email account to send emails from
        let from = '"Moonshot" <do-not-reply@moonshotlearning.org>';
        let authUser = credentials.emailUsername;
        let authPass = credentials.emailPassword;
        if (sendFrom) {
            if (sendFrom === "Kyle Treige") {
                from = '"Kyle Treige" <kyle@moonshotlearning.org>';
                authUser = credentials.kyleEmailUsername;
                authPass = credentials.kyleEmailPassword;
            } else {
                from = '"' + sendFrom + '" <do-not-reply@moonshotlearning.org>';
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
    Employers.findOne(query, function(err, foundUser) {
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


// function to send an email to us if the associated businesses were not updated
function sendBizUpdateCandidateErrorEmail(email, pathwayId, pathwayStatus) {
    try {
        console.log("ERROR " + pathwayStatus + " STUDENT AS A BUSINESS' CANDIDATE");
        // const errorEmailRecipients = ["ameyer24@wisc.edu", "stevedorn9@gmail.com"];
        const errorEmailRecipients = ["ameyer24@wisc.edu"];
        const errorEmailSubject = "Error " + pathwayStatus + " User Into Business Candidates Array";
        const errorEmailContent =
            "<p>User email: " + email + "</p>"
            + "<p>PathwayId: " + pathwayId + "</p>";
        const sendFrom = "Moonshot";
        // send an email to us saying that the user wasn't added to the business' candidates list
        sendEmail(errorEmailRecipients, errorEmailSubject, errorEmailContent, sendFrom, undefined, function(errorEmailSucces, errorEmailMsg) {
            if (errorEmailMsg) {
                throw "error";
            }
        })
    } catch (e) {
        console.log("ERROR SENDING EMAIL ALERTING US THAT A STUDENT WAS NOT ADDED AS A BUSINESS CANDIDATE AFTER PATHWAY " + pathwayStatus + ". STUDENT EMAIL: ", email, ". PATHWAY: ", pathwayId);
    }
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



module.exports = helperFunctions;
