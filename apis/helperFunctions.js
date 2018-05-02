const sanitizeHtml = require('sanitize-html');
var Users = require('../models/users.js');
var Employers = require('../models/employers.js');

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
    getUserByQuery
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

module.exports = helperFunctions;
