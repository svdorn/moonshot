var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const credentials = require('./credentials');
var bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const fileUpload = require('express-fileupload');


var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
// trust the first proxy encountered because we run through a proxy
app.set('trust proxy', 1);

// APIs
var mongoose = require('mongoose');
// MONGO LAB
const dbConnectLink = 'mongodb://' + credentials.dbUsername + ':' + credentials.dbPassword + '@ds141159-a0.mlab.com:41159,ds141159-a1.mlab.com:41159/moonshot?replicaSet=rs-ds141159';
mongoose.connect(dbConnectLink);

var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));


var Users = require('./models/users.js');
var Employers = require('./models/employers.js');
var Businesses = require('./models/businesses.js');
var Pathways = require('./models/pathways.js');
var Articles = require('./models/articles.js');
var Videos = require('./models/videos.js');
var Quizzes = require('./models/quizzes.js');
var Links = require('./models/links.js');
var Info = require('./models/info.js');
var Emailaddresses = require('./models/emailaddresses.js');
var Referrals = require('./models/referrals.js');


// --->>> SET UP SESSIONS <<<---
app.use(session({
    secret: credentials.secretString,
    saveUninitialized: false, // doesn't save a session if it is new but not modified
    rolling: true, // resets maxAge on session when user uses site again
    proxy: true, // must be true since we are using a reverse proxy
    resave: false, // session only saved back to the session store if session was modified,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
        // evaluates to true if in production, false if in development (i.e. NODE_ENV not set)
        secure: !!process.env.NODE_ENV // only make the cookie if accessing via https
    },
    store: new MongoStore({mongooseConnection: db, ttl: 7 * 24 * 60 * 60})
    // ttl: 7 days * 24 hours * 60 minutes * 60 seconds
}));


app.post('/signOut', function (req, res) {
    req.session.userId = undefined;
    req.session.save(function (err) {
        if (err) {
            console.log("error removing user session: ", err);
            res.json("failure removing user session");
        } else {
            res.json("success");
        }
    })
});

// change session to store whether user wants default of "Keep Me Logged In"
// to be checked or unchecked
app.post("/keepMeLoggedIn", function (req, res) {
    if (typeof req.body.stayLoggedIn === "boolean") {
        req.session.stayLoggedIn = req.body.stayLoggedIn;
    } else {
        req.session.stayLoggedIn = false;
    }
    req.session.save(function (err) {
        if (err) {
            console.log("error saving 'keep me logged in' setting: ", err);
            res.json("error saving 'keep me logged in' setting");
        } else {
            res.json("success");
        }
    })
});


// get the setting to stay logged in or out
app.get("/keepMeLoggedIn", function (req, res) {
    let setting = sanitize(req.session.stayLoggedIn);
    if (typeof setting !== "boolean") {
        setting = false;
    }
    res.json(setting);
});


// change session to store whether user wants default of "Keep Me Logged In"
// to be checked or unchecked
app.post("/user/hideProfile", function (req, res) {
    if (typeof req.body.hideProfile === "boolean") {
        req.session.stayLoggedIn = req.body.stayLoggedIn;
    } else {
        req.session.stayLoggedIn = false;
    }
    req.session.save(function (err) {
        if (err) {
            console.log("error saving 'keep me logged in' setting: ", err);
            res.json("error saving 'keep me logged in' setting");
        } else {
            res.json("success");
        }
    })
});


// get the setting to stay logged in or out
app.get("/user/hideProfile", function (req, res) {
    let setting = sanitize(req.session.stayLoggedIn);
    if (typeof setting !== "boolean") {
        setting = false;
    }
    res.json(setting);
});

// GET USER SESSION
app.get('/userSession', function (req, res) {
    if (typeof req.session.userId === 'string') {
        const userId = sanitize(req.session.userId);
        getUserByQuery({_id: userId}, function (err, user) {
            // if no user found, the user was probably deleted. remove the
            // user from the session and don't log in
            if (!user || user == null) {
                req.session.userId = undefined;
                req.session.save(function(err) {
                    res.json(undefined);
                })
                return;
            } else {
                res.json(removePassword(user));
            }
        })
    }
    else {
        res.json(undefined);
    }
});


app.post('/userSession', function(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);

    // check if option to stay logged in is true
    const saveSession = sanitize(req.session.stayLoggedIn);
    if (!saveSession) {
        return;
    }

    if (!userId || !verificationToken) {
        res.json("either no userId or no verification token");
        return;
    }

    // get the user from the id, check the verification token to ensure they
    // have the right credentials to stay logged in
    getUserByQuery({_id: userId}, function(error, foundUser) {
        if (foundUser.verificationToken == verificationToken) {
            req.session.userId = userId;

            // save user id to session
            req.session.save(function(err) {
                if (err) {
                    console.log("error saving user id to session: ", err2);
                } else {
                    res.json(true);
                    return;
                }
            });
        } else {
            res.json("incorrect user credentials");
            return;
        }
    });
})


// --->>> END SESSION SET UP <<<---




// --->>> EXAMPLE PATHWAY CREATION <<<---

// const exampleInfo = {
//     contentArray: []
// }
// Info.create(exampleInfo, function(err, link) {
//     console.log(err);
//     console.log(link);
// })

// const exampleVideo = {
//     link: "https://www.youtube.com/watch?v=3IW3kAGcLM0"
// }
//
// Videos.create(exampleVideo, function(err, video) {
//     console.log(err);
//     console.log(video);
//
//     const exampleQuiz = {
//         name: "Big quiz",
//         random: false,
//         numQuestions: 1,
//         questions: [{
//             order: 1,
//             options: [{
//                 body: "What is the answer to life?",
//                 answers: [{
//                     body: "42",
//                     correct: true
//                 },
//                 {
//                     body: "6",
//                     correct: false
//                 }],
//                 multipleCorrect: false,
//                 needAllCorrect: true
//             }]
//         }]
//     }
//
//     Quizzes.create(exampleQuiz, function(err2, quiz) {
//         console.log(err2);
//         console.log(quiz);
//
//         const examplePathway = {
//             name: "Create Video Game AI",
//             previewImage: "/images/BigData.jpg",
//             sponsor: { name: "Blizzard", logo: "/Logos/Blizzard.png" },
//             estimatedCompletionTime: "16 Hours",
//             deadline: new Date(2018, 7, 6, 0, 0, 0, 0),
//             price: "Free",
//             comments: [{ email: "frizzkitten@gmail.com", body: "amazing pathway, I learned so much stuff", date: new Date(2017, 11, 19, 11, 37, 5, 6) }],
//             ratings: [{ email: "frizzkitten@gmail.com", rating: 3 }, { email: "misterkelvinn@gmail.com", rating: 2 }],
//             avgRating: 2.5,
//             tags: [ "Artifical Intelligence", "Programming", "Video Games" ],
//             projects: [{
//                 name: "Make a Dota 2 AI",
//                 description: "Have it beat Elon Musk's",
//                 difficulty: "Hard",
//                 estimatedTime: "17 Hours"
//             }],
//             steps: [
//                 {
//                     order: 1,
//                     name: "Get started",
//                     contentType: "video",
//                     contentID: video._id,
//                     comments: [{ email: "misterkelvinn@gmail.com", body: "what a great first step", date: new Date(2017, 9, 9, 1, 33, 2, 9) }]
//                 },
//                 {
//                     order: 2,
//                     name: "Review what you learned in the first step",
//                     contentType: "quiz",
//                     contentID: quiz._id,
//                     comments: [{ email: "acethebetterone@gmail.com", body: "2 hard 4 me", date: new Date(2017, 6, 3, 1, 33, 2, 9) }]
//                 }
//             ]
//         }
//
//         Pathways.create(examplePathway, function(err3, pathway) {
//             console.log(err3);
//             console.log(pathway);
//         });
//     })
// });

// --->>> END EXAMPLE PATHWAY CREATION <<<---


// strictly sanitize, only allow bold and italics in input
const sanitizeOptions = {
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: []
}


// print all users from a specific pathway
// nwm: "5a80b3cf734d1d0d42e9fcad"
// sw: "5a88b4b8734d1d041bb6b386"

// printUsersFromPathway("5a88b4b8734d1d041bb6b386");

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


// update all users with a specific thing, used if something is changed about
// the user model
// Pathways.find({}, function(err, pathways) {
//     console.log("err is: ", err);
//
//     for (let pathwayIdx = 0; pathwayIdx < pathways.length; pathwayIdx++) {
//         let pathway = pathways[pathwayIdx];
//         //pathway.userType = "candidate";
//
//         let steps = pathway.steps;
//
//         for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
//             let step = steps[stepIndex];
//             let subSteps = step.subSteps;
//
//             for (let subStepIndex = 0; subStepIndex < subSteps.length; subStepIndex++) {
//                 let subStep = subSteps[subStepIndex];
//
//                 if (subStep.contentType === "quiz") {
//                     pathway.steps[stepIndex].subSteps[subStepIndex].required = true;
//                 }
//             }
//         }
//
//         pathway.save(function() {
//             console.log("pathway saved");
//         });
//     }
// })


//----->> POST USER <<------
app.post('/user', function (req, res) {
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
                    res.status(500).send("Error creating account, try with a different email or try again later.");
                    return;
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
                            }
                        })
                    })
                } else {
                    res.status(401).send("An account with that email address already exists.");
                }
            });
        });
    });
});


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


app.post("/endOnboarding", function (req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const removeRedirectField = sanitize(req.body.removeRedirectField);

    const query = {_id: userId, verificationToken};
    let update = {
        '$set': {
            hasFinishedOnboarding: true
        }
    };

    if (removeRedirectField) {
        update['$unset'] = { redirect: "" }
    }

    // When true returns the updated document
    const options = {new: true};

    Users.findOneAndUpdate(query, update, options, function (err, updatedUser) {
        if (!err && updatedUser) {
            res.json(removePassword(updatedUser));
        } else {
            res.status(500).send("Error ending onboarding.");
        }
    });
});


app.post('/verifyEmail', function (req, res) {
    const token = sanitize(req.body.token);
    const userType = sanitize(req.body.userType);

    // query form business user database if the user is a business user
    const DB = (userType === "employer") ? Employers : Users;

    if (!token) {
        res.status(400).send("Url not in the right format");
        return;
    }

    var query = {emailVerificationToken: token};
    DB.findOne(query, function (err, user) {
        if (err) {
            console.log("Error trying to find user from verification token");
            res.status(500).send("Server error, try again later");
            return;
        }

        if (!user) {
            res.status(404).send("User not found from url");
            return;
        }

        user.verified = true;
        user.emailVerificationToken = undefined;

        user.save(function(updateErr, updatedUser) {
            if (updateErr) {
                console.log("Error saving user's verified status to true: ", updateErr);
                res.status(500).send("Server error, try again later");
                return;
            }

            // we don't save the user session if logging in as business user
            // because it is likely the account was created on a different computer
            if (userType === "employer") {
                res.json(updatedUser.email);
                return;
            }

            // if the session has the user's id, can immediately log them in
            sessionUserId = sanitize(req.session.unverifiedUserId);
            req.session.unverifiedUserId = undefined;

            req.session.userId = sessionUserId;

            req.session.save(function (err) {
                if (err) {
                    console.log("Error saving session after verifying user: ", err);
                }
            });

            if (sessionUserId && sessionUserId == updatedUser._id) {
                res.json(removePassword(updatedUser));
                return;
            }
            // otherwise, bring the user to the login page
            else {
                res.json("go to login");
                return;
            }
        });
    });
});

// VERIFY CHANGE PASSWORD
app.post('/user/changePasswordForgot', function (req, res) {
    let token = sanitize(req.body.token).toString();
    let password = sanitize(req.body.password);

    var query = {passwordToken: token};
    Users.findOne(query, function (err, user) {
        if (err) {
            console.log("Error trying to find user from password token: ", err);
            res.status(500).send("Server error, try again later");
            return;
        }

        if (!user) {
            res.status(404).send("User not found from link");
            return;
        }

        const currentTime = Date.now();
        if (currentTime > user.passwordTokenExpirationTime) {
            res.status(401).send("Time ran out, try sending email again");
            return;
        }

        let query = {_id: user._id};
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                // change the stored password to be the hash
                const newPassword = hash;
                // if the field doesn't exist, $set will set a new field
                // can be verified because the user had to go to their email
                // to get to this page
                var update = {
                    '$set': {
                        password: newPassword,
                        verified: true
                    },
                    '$unset': {
                        passwordToken: "",
                        passwordTokenExpirationTime: "",
                    }
                };

                // When true returns the updated document
                var options = {new: true};

                Users.findOneAndUpdate(query, update, options, function (err, newUser) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Error saving new password");
                        return;
                    }

                    // successfully created new password
                    res.json(removePassword(newUser));
                });
            })
        })
    });
});


// SEND EMAIL
app.post('/sendVerificationEmail', function (req, res) {
    let email = sanitize(req.body.email);
    let query = {email: email};

    let moonshotUrl = 'https://www.moonshotlearning.org/';
    // if we are in development, links are to localhost
    if (!process.env.NODE_ENV) {
        moonshotUrl = 'http://localhost:8081/';
    }

    Users.findOne(query, function (err, user) {
        let recipient = [user.email];
        let subject = 'Verify email';
        let content =
            '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                    + '<div style="text-align:justify;width:80%;margin-left:10%;">'
                    + '<span style="margin-bottom:20px;display:inline-block;">Thank you for joining Moonshot! To get going on your pathways, learning new skills, and building your profile for employers, please <a href="' + moonshotUrl + 'verifyEmail?token=' + user.emailVerificationToken + '">verify your account</a>.</span><br/>'
                    + '<span style="display:inline-block;">If you have any questions or concerns or if you just want to talk about the weather, please feel free to email us at <a href="mailto:Support@MoonshotLearning.org">Support@MoonshotLearning.org</a>.</span><br/>'
                    + '</div>'
                + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="' + moonshotUrl + 'verifyEmail?token='
                + user.emailVerificationToken
                + '">VERIFY ACCOUNT</a>'
                + '<div style="text-align:left;width:80%;margin-left:10%;">'
                    + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
                    + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                    + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                    + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + user.email + '">Opt-out of future messages.</a></i>'
                    + '</div>'
                + '</div>'
            + '</div>';

        const sendFrom = "Moonshot";
        sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
            if (success) {
                res.json(msg);
            } else {
                res.status(500).send(msg);
            }
        })
    });
});


// SEND EMAIL FOR REGISTERING FOR PATHWAYS
app.post('/user/registerForPathway', function (req, res) {
    const pathwayName = sanitize(req.body.pathway);
    const studentName = sanitize(req.body.name);
    const studentEmail = sanitize(req.body.email);

    let recipient1 = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "ameyer24@wisc.edu"];
    let subject1 = "Student Registration for " + pathwayName;
    let content1 = "<div>"
        + "<h3>Student Registration for Pathway:</h3>"
        + "<h4>Pathway: "
        + pathwayName
        + "</h4>"
        + "<h4>Student: "
        + studentName
        + "</h4>"
        + "<h4>Student Email: "
        + studentEmail
        + "</h4>"
        + "<p>If the student doesn't get back to you soon with an email, make sure to reach out to them.</p>"
        + "<p>-Moonshot</p>"
        + "</div>";

    let name = studentName.replace(/(([^\s]+\s\s*){1})(.*)/, "$1").trim();
    let recipient2 = [studentEmail];
    let subject2 = "First steps for " + pathwayName + " Pathway - book a 15 min call";
    let content2 = "<div>"
        + "<p>Hi " + name + "," + "</p>"
        + "<p>My name is Kyle and I’m one of the founders at Moonshot. We are excited for you to get going on the pathway!</p>"
        + "<p>Before you do we've got a few things to cover:<br/>"
        + "- There are limited scholarships that the sponsor company offers.<br/>"
        + "- So … We need to learn a bit about you first!<br/>"
        + "- Step 1: " + "<b><u>Send a link to your LinkedIn profile</u></b>" + " (not required but you can also attach"
        + " your resume, link to a project, something you are proud of, etc) to kyle@moonshotlearning.org." + "</p>"
        + "<p>If you have any questions, shoot me a message. I'll review everything and be back to you shortly!</p>"
        + "<p>Talk soon,<br/>"
        + "Kyle</p>"
        + "<p>-------------------------------------------<br/>"
        + "Kyle Treige, Co-Founder & CEO <br/>"
        + "<a href='https://www.moonshotlearning.org/' target='_blank'>Moonshot</a><br/>"
        + "608-438-4478</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipient1, subject1, content1, sendFrom, undefined, function (success, msg) {
        if (success) {
            sendEmail(recipient2, subject2, content2, sendFrom, undefined, function (success, msg) {
                if (success) {
                    res.json("Check your email for instructions on how to get started.");
                } else {
                    res.status(500).send(msg);
                }
            })
        } else {
            res.status(500).send(msg);
        }
    })
});

// SEND EMAIL FOR FOR BUSINESS
app.post('/user/forBusinessEmail', function (req, res) {

    let message = "None";
    if (req.body.message) {
        message = sanitize(req.body.message);
    }
    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Moonshot Sales Lead - From For Business Page';
    let content = "<div>"
        + "<h3>Sales Lead from For Business Page:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "</p>"
        + "<p>Company: "
        + sanitize(req.body.company)
        + "</p>"
        + "<p>Title: "
        + sanitize(req.body.title)
        + "</p>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Phone Number: "
        + sanitize(req.body.phone)
        + "</p>"
        + "<p>Positions they're hiring for: "
        + sanitize(req.body.positions)
        + "</p>"
        + "<p>Message: "
        + message
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Email sent successfully, our team will notify you of your results shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
});


app.post("/alertLinkClicked", function(req, res) {
    const name = sanitize(req.body.params.name);
    const id = sanitize(req.body.params.userId);
    const link = sanitize(req.body.params.link);

    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Someone just clicked the NWM Culture Index Link';
    let content = "<div>"
        + "<h3>Send an email to Northwestern Mutual (Preston) telling him NOT to interview this person until we give him the go-ahead. Make sure this is the right link, it's possible that this email hasn't been updated in the codebase yet but there are other links that you'll need to be notified of.</h3>"
        + "<p>User's Name: "
        + name
        + "</p>"
        + "<p>User's id: "
        + id
        + "</p>"
        + "<p>Link that was clicked: "
        + link
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json(true);
        } else {
            console.log("ERROR SENDING EMAIL SAYING THAT THE NWM LINK WAS CLICKED");
            res.json(false);
        }
    });
});


// SEND EMAIL FOR SOMEBODY COMPLETING PATHWAY
app.post('/user/completePathway', async function(req, res) {
    const successMessage = "Pathway marked complete, our team will be in contact with you shortly!";
    const errorMessage = "Error marking pathway complete, try again or contact us.";

    const userName = sanitize(req.body.userName);
    const userId = sanitize(req.body._id);
    const verificationToken = sanitize(req.body.verificationToken);
    const pathwayName = sanitize(req.body.pathwayName);
    const pathwayId = sanitize(req.body.pathwayId);
    const email = sanitize(req.body.email);
    const phoneNumber = sanitize(req.body.phoneNumber);
    let referralCode = sanitize(req.body.referralCode);

    // the referral info that will be included in the email to Moonshot founders
    let referralInfo = "";

    // the user that will be found in the db
    let user = undefined;
    // the pathway that will be found in the db
    let pathway = undefined;

    // get the user from the db
    Users.findById(userId)
    .then(foundUser => {
        // if we can't find the user
        if (foundUser == null) {
            console.log("Could not find the user that was trying to complete a pathway.");
            return res.status(400).send("You don't have the right credentials to complete the pathway.");
        }

        // if the user doesn't have the right verification token
        if (foundUser.verificationToken !== verificationToken) {
            console.log("User did not have the right verification token when trying to complete a pathway.");
            return res.status(400).send("You don't have the right credentials to complete the pathway.");
        }

        // set the api-wide user object
        user = foundUser;

        // if the pathway has already been found, check if all the questions
        // have been completed, then mark pathway complete
        if (pathway) {
            checkIfAllQuestionsCompleted();
        }
    })
    // if there's an error getting the user
    .catch(findUserError => {
        console.log("Error finding user when user tried to complete a pathway: ", findUserError);
        return res.status(500).send("Server error, try again later.");
    });


    // get the pathway that the user is completing; only need the steps because
    // those are the only things we verify
    Pathways.findById(pathwayId)
    .select("steps.subSteps.order steps.subSteps.name steps.subSteps.contentID steps.subSteps.contentType steps.subSteps.required steps.order steps.name skills")
    .then(foundPathway => {
        // no pathway found
        if (!foundPathway) {
            console.log("Couldn't find pathway that user tried to complete. Pathway id searched for: ", pathwayId);
            return res.status(404).send("Couldn't find that pathway, sorry!");
        }

        // set the api-wide pathway object
        pathway = foundPathway;
        // if the user has already been found, check if all the questions
        // have been completed, then mark pathway complete
        if (user) {
            checkIfAllQuestionsCompleted();
        }
    })
    // error finding the pathway
    .catch(findPathwayError => {
        console.log("Error finding the pathway that the user says they completed: ", findPathwayError);
        return res.status(500).send("Server error, try again later.");
    })

    // function executed after finding the user and the pathway
    // checks if the user actually completed the pathway, then moves on to
    // completing the pathway
    function checkIfAllQuestionsCompleted() {
        // see if the user has any answers at all
        let userHasAnswers = false;
        if (typeof user.answers === "object") {
            userHasAnswers = true;
        }

        let incompleteSteps = [];

        // go through each step to see if the user completed all the subSteps
        pathway.steps.forEach(step => {
            // go through each subStep to see if the user has completed them
            step.subSteps.forEach(subStep => {
                // only quizzes will have answers, ignore all other subSteps
                if (subStep.contentType !== "quiz") {
                    return;
                }

                // only add this to incomplete steps if it is required
                if (subStep.required !== true) {
                    return;
                }

                // this subStep is a quiz; see if the user has an answer for it
                if (!userHasAnswers || !user.answers[subStep.contentID]) {
                    // add this substep to the list of incomplete steps
                    incompleteSteps.push({
                        stepNumber: step.order,
                        stepName: step.name,
                        subStepNumber: subStep.order,
                        subStepName: subStep.name
                    })
                }
            });
        });

        // if there are any incomplete steps, don't let the user finish the pathway
        if (incompleteSteps.length > 0) {
            console.log("User tried to finish a pathway without finishing all the steps.");
            console.log("user: ", user);
            console.log("pathway name: ", pathway.name);
            console.log("incompleteSteps: ", incompleteSteps);

            return res.status(400).send({incompleteSteps});
        }

        // deal with referral code, then mark pathway complete and add user to
        // business accounts

        // remove punctuation and spaces from referral code
        if (referralCode) {
            referralCode = referralCode.replace(/&amp;|&quot;|&apos;/g,"").replace(/[.,\/#!$%\^&\*;:{}'"=\-_`~()]/g,"").replace(/\s/g,"").toLowerCase();
        }

        // this gets executed before the code above, it executes all that when it's ready
        if (referralCode) {
            referralInfo = "<p>Referral Code: " + referralCode + "</p>";

            Referrals.findOne({referralCode}, function(error, referrer) {
                if (error || referrer == null || (referrer.email == undefined && referrer.name == undefined)) {
                    referralInfo = referralInfo + "<p>However, no user is associated with that referral code.</p>";
                } else {
                    referralInfo = referralInfo + "<p>Referrer's email: " + referrer.email + "</p><p>Referrer's Name: " + referrer.name + ". Make sure this isn't the same as the user who completed the pathway.</p>";
                }
                finishPathway();
            });
        } else {
            finishPathway();
        }
    }

    // emails moonshot founders telling them someone finished a pathway,
    // saves user with completed pathway, adds users to business accounts
    function finishPathway() {
        let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com", "ameyer24@wisc.edu"];
        let subject = 'ACTION REQUIRED: Somebody completed pathway';
        let content = "<div>"
            + "<h3>A User has just completed this pathway:</h3>"
            + "<p>User: "
            + userName
            + "</p>"
            + "<p>User id: "
            + userId
            + "</p>"
            + "<p>Pathway: "
            + pathwayName
            + "</p>"
            + "<p>Contact them with this email: "
            + email
            + "</p>"
            + "<p>or this phone number: "
            + phoneNumber
            + "</p>"
            + referralInfo
            + "</div>";


        // mark pathway complete and change emailTo
        user.emailToContact = sanitize(req.body.email);
        user.phoneNumber = sanitize(req.body.phoneNumber);
        // find the user's pathway object corresponding to the pathway that was
        // marked complete
        const pathwayIndex = user.pathways.findIndex(function(path) {
            return path.pathwayId.toString() == pathwayId.toString();
        });
        // if the pathway was found in their current pathways, remove it
        // from current pathways and add it to completed pathways
        if (typeof pathwayIndex === "number" && pathwayIndex >= 0) {
            let completedPathway = user.pathways[pathwayIndex];
            const newPathwayObject = {
                pathwayId: completedPathway.pathwayId,
                dateAdded: completedPathway.dateAdded,
                dateCompleted: new Date()
            }

            // Put pathway into completed pathways and remove it from current pathways
            user.completedPathways.push(newPathwayObject);
            user.pathways.splice(pathwayIndex, 1);
        }
        // if the user didn't have that pathway in the first place, don't let them complete it
        else {
            console.log("User tried to complete a pathway without having it in their list of current pathways.");
            console.log("user: ", user);
            console.log("pathwayId: ", pathwayId);
            return res.status(403).send("Must have signed up for that pathway to complete it.");
        }

        // add the user's new skills that they gained from this
        if (Array.isArray(pathway.skills)) {
            pathway.skills.forEach(function(skill) {
                // only add the skill if the user does not already have it
                const notFound = -1;
                if (user.skills.findIndex(function(userSkill) {
                    return userSkill === skill;
                }) === notFound) {
                    user.skills.push(skill);
                }
            });
        }

        // save the user's new info in the db
        user.save(function(err, updatedUser) {
            // safe-guard against us getting a null updatedUser
            let userToReturn = updatedUser;
            if (err || updatedUser == null || updatedUser == undefined) {
                console.log("Error marking pathway: " + pathway.name + " as complete for user with email: " + user.email + ": ", err);
                userToReturn = user;
                content = content + "<div>User's new info was not successfully saved in the database. Look into it.</div>"
            }

            // get the associated businesses (the ones that have
            // this pathway's id in their associated pathway ids array)
            // TODO: when refactoring for db speed/minimal data sent,
            // this would be a good query to work with. try to return
            // only the right candidate
            Businesses.find({pathwayIds: pathwayId})
            .select("pathwayIds candidates")
            .exec(function (findBizErr, businesses) {
                if (findBizErr) {
                    console.log("Error finding businesses corresponding to the pathway user is trying to complete: ", findBizErr);
                    sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "completing");
                    return;
                }

                // iterate through each business that has this pathway
                businesses.forEach(function(business) {
                    let candidates = business.candidates;

                    // find the candidate index within the business' candidate array
                    const userIdString = user._id.toString();
                    const userIndex = candidates.findIndex(function(candidate) {
                        return candidate.userId.toString() == userIdString;
                    });

                    // the candidate's current location
                    const location = user.info && user.info.location ? user.info.location : "";

                    // if candidate doesn't exist, add them along with the pathway
                    if (userIndex == -1) {
                        let candidateToAdd = {
                            userId: user._id,
                            location: location,
                            profileUrl: user.profileUrl,
                            name: user.name,
                            // give the business the email that the candidate wants to be contacted at, not their login email
                            email: userToReturn.emailToContact ? userToReturn.emailToContact : userToReturn.email,
                            // will only have this pathway if the candidate didn't exist before
                            pathways: [{
                                _id: pathwayId,
                                name: pathwayName,
                                hiringStage: "Not Contacted",
                                completionStatus: "Complete"
                            }]
                        }
                        business.candidates.push(candidateToAdd);
                    }

                    // candidate did previously exist
                    else {
                        let candidate = candidates[userIndex];

                        // change their email to contact just in case they changed it
                        business.candidates[userIndex].email = userToReturn.emailToContact ? userToReturn.emailToContact : userToReturn.email;

                        // check if they have the current pathway (will be -1 if they don't)
                        const pathwayIndex = candidate.pathways.findIndex(function(path) {
                            return path._id == pathwayId;
                        });

                        // if the have the current pathway, mark them as having completed it
                        if (pathwayIndex > -1) {
                            business.candidates[userIndex].pathways[pathwayIndex].completionStatus = "Complete";
                        }

                        // if they don't have the current pathway, add the pathway and mark it complete
                        else {
                            business.candidates[userIndex].pathways.push({
                                _id: pathwayId,
                                name: pathwayName,
                                hiringStage: "Not Contacted",
                                completionStatus: "Complete",
                                isDismissed: false
                            })
                        }
                    }

                    // save the businesses in db
                    business.save(function(updateBizErr, updatedBiz) {
                        if (updateBizErr || updatedBiz == null) {
                            sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "completing");
                        }
                    });
                });
            });

            // only send email if in production
            if (process.env.NODE_ENV) {
                // send an email to us saying that the user completed a pathway
                const sendFrom = "Moonshot";
                sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
                    if (success) {
                        res.json({message: successMessage, user: userToReturn});
                    } else {
                        res.status(500).send({message: errorMessage, user: userToReturn});
                    }
                });
            } else {
                // if not in production, just send success message to user
                res.json({message: successMessage, user: userToReturn});
            }
        });
    }
});


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


app.post('/createReferralCode', function(req, res) {
    const name = sanitize(req.body.name);
    // make it to lower case so that it's case insensitive
    const email = sanitize(req.body.email).toLowerCase();

    let sendReferralEmail = function(theCode) {
        // if we're in development (on localhost) navigate to localhost
        let moonshotUrl = "https://www.moonshotlearning.org/";
        if (!process.env.NODE_ENV) {
            moonshotUrl = "http://localhost:8081/";
        }
        const recipient = [email];
        const subject = "Moonshot Referral Code";
        const emailContent =
            "<div style='color:black'>"
            +   "<p>Hello " + name + ",</p>"

            +   "<p>Thank you for signing up as a Moonshot referrer! With us, you can shape the future of the workforce and get paid to do it. Moonshot trains and evaluates college students and recent graduates in skills and positions needed by employers. We do this by creating course pathways that evaluate candidates in positions that our employer partners are hiring for. <a href='https://moonshotlearning.org/discover'>Check out all of our live Pathways</a>.</p>"

            +   "<p>You will earn $300 for everyone you send our way that gets a job through the Moonshot site.</p>"

            +   "<p>For you to receive credit for a Moonshot user, the user must do one of the following:</p>"
            +   "<p>1. Input your referral code (this is your code: " + theCode + ") at the end of the Pathway when asked how he or she heard about Moonshot.</p>"
            +   "<p>2. Sign up by coming through your unique referrer link: <br/><a href='" + moonshotUrl + "?referralCode=" + theCode + "'>" + moonshotUrl + "?referralCode=" + theCode + "</a></p>"

            +   "<p>A lot of people start by sharing with friends in person and on social media. The people really on their game carry around cards to be ready for any situation. (Let me know if you want card designs to print off.)</p>"

            +   "<p>I'm always excited to strategize tactics and techniques to attract candidates. Shoot me a message if you would like to brainstorm. Remember, all of your outreach must be in accordance with the Moonshot Affiliate Agreement you accepted.</p>"

            +   "<p>Happy referring!</p>"
            +   "<p>Kyle</p>"

            +   "<p>-----------------------------</p>"
            +   "<div style='font-size:12px'>Kyle Treige, Co-Founder & CEO<br/>"
            +   "<a href='" + moonshotUrl + "'>Moonshot<br/>"
            +   "kyle@moonshotlearning.org<br/>"
            +   "608-438-4478</div>"

            +   '<div style="font-size:10px; color:#C8C8C8; margin-top:30px; margin-bottom:30px;">'
            +       '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
            +       '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + email + '">Opt-out of future messages.</a></i>'
            +   '</div>'

            + "</div>";

        // send email to user who asked for a referral code with the info about the code
        const sendFrom = "Kyle Treige";
        sendEmail(recipient, subject, emailContent, sendFrom, undefined, function (success, msg) {
            if (!success) {
                console.log("Email not sent to user about referral code. Message: ", msg);
            }
        })
    }

    const query = {email};

    Referrals.findOne(query, function(err, user) {
        // if there was an error somewhere along the way getting the user
        if (err) {
            res.status(500).send("Server error, try again later.");
            return;
        }
        // if this user has not already asked for a referral code
        else if (user == null) {
            // create the referral code randomly
            const referralCode = crypto.randomBytes(4).toString('hex');
            // the amount we said we'd pay the user for their friend using this code
            const incentive = "$300";
            const userBeingCreated = {name, email, referralCode, incentive}

            // TODO: check if the referral code was already created, make a new
            // one if so

            Referrals.create(userBeingCreated, function(error, newUser) {
                // if there was an error creating the user
                if (error) {
                    res.status(500).send("Server error, try again later.");
                    return;
                } else {
                    sendReferralEmail(newUser.referralCode);
                    res.json(newUser.referralCode);
                    return;
                }
            });
        }
        // if the user has asked for a referral code in the past
        else {
            // if the user already has a referral code, give them that
            sendReferralEmail(user.referralCode);
            res.json(user.referralCode);
            return;
        }
    });
});


app.post('/user/unsubscribeEmail', function (req, res) {

    let recipient = ["kyle@moonshotlearning.org"];
    let subject = 'URGENT ACTION - User Unsubscribe from Moonshot';
    let content = "<div>"
        + "<h3>This email is Unsubscribing from Moonshot Emails:</h3>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("You have successfully unsubscribed.");
        } else {
            res.status(500).send(msg);
        }
    });

    const optOutError = function(error) {
        console.log("ERROR ADDING EMAIL TO OPT OUT LIST: " + req.body.email);
        console.log("The error was: ", error);
        let recipient = ["ameyer24@wisc.edu"];
        let subject = "MOONSHOT - URGENT ACTION - User was not unsubscribed"
        let content = "<div>"
            + "<h3>This email could not be added to the optOut list:</h3>"
            + "<p>Email: "
            + sanitize(req.body.email)
            + "</p>"
            + "</div>";
        sendEmail(recipient, subject, content, sendFrom, undefined, function(){});
    }

    // add email to list of unsubscribed emails
    Emailaddresses.findOne({name: "optedOut"}, function(err, optedOut) {
        if (err) {
            optOutError(err);
        }
        else {
            console.log("adding to opted-out list: ", req.body.email)
            optedOut.emails.push(req.body.email);
            optedOut.save(function(err2, newOptedOut) {
                if (err2) {
                    optOutError(err2);
                }
            });
        }
    });
});


// SEND COMING SOON EMAIL
app.post('/user/comingSoonEmail', function (req, res) {

    let recipient = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "ameyer24@wisc.edu"];
    let subject = 'Moonshot Coming Soon Pathway';
    let content = "<div>"
        + "<h3>Pathway:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Pathway: "
        + sanitize(req.body.pathway)
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Email sent successfully, our team will be in contact with you shortly!");
        } else {
            res.status(500).send(msg);
        }
    })
});

// SEND EMAIL FOR CONTACT US
app.post('/user/contactUsEmail', function (req, res) {

    let message = "None";
    if (req.body.message) {
        message = sanitize(req.body.message);
    }
    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Moonshot Pathway Question -- Contact Us Form';
    let content = "<div>"
        + "<h3>Questions from pathway:</h3>"
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
});

// SEND EMAIL FOR PASSWORD RESET
app.post('/forgotPassword', function (req, res) {

    let email = sanitize(req.body.email);
    let query = {email: email};

    const user = getUserByQuery(query, function (err, user) {
        if (!user) {
            console.log("Couldn't find user to set their password change token.");
            res.status(401).send("Cannot find user");
            return;
        } else {
            // token that will go in the url
            const newPasswordToken = crypto.randomBytes(64).toString('hex');
            // password token expires in one hour (minutes * seconds * milliseconds)
            const newTime = Date.now() + (60 * 60 * 1000);

            const query2 = {_id: user._id};
            const update = {
                '$set': {
                    passwordToken: newPasswordToken,
                    passwordTokenExpirationTime: newTime,
                }
            };

            const options = {new: true};

            Users.findOneAndUpdate(query2, update, options, function (err, foundUser) {
                if (err) {
                    console.log("Error giving user reset-password token: ", err);
                    res.status(500).send("Server error, try again later.");
                    return;
                }

                // if we're in development (on localhost) navigate to localhost
                let moonshotUrl = "https://www.moonshotlearning.org/";
                if (!process.env.NODE_ENV) {
                    moonshotUrl = "http://localhost:8081/";
                }
                const recipient = [user.email];
                const subject = 'Change Password';

                const content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                        + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                            + '<div style="text-align:justify;width:80%;margin-left:10%;">'
                            + "<span style='margin-bottom:20px;display:inline-block;'>Hello! We got a request to change your password. If that wasn't from you, you can ignore this email and your password will stay the same. Otherwise click here:</span><br/>"
                            + '</div>'
                        + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:5px 20px 20px;" href="' + moonshotUrl + 'changePassword?token='
                        + newPasswordToken
                        + '">Change Password</a>'
                        + '<div style="text-align:left;width:80%;margin-left:10%;">'
                            + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                                + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                                + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + user.email + '">Opt-out of future messages.</a></i>'
                            + '</div>'
                        + '</div>'
                    + '</div>';

                const sendFrom = "Moonshot";
                sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                    if (success) {
                        res.json(msg);
                    } else {
                        res.status(500).send(msg);
                    }
                })
            });
        }
    })
});

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

app.post('/getUserById', function (req, res) {
    const _id = sanitize(req.body._id);
    const query = {_id};
    getUserByQuery(query, function (err, user) {
        if (err) {
            res.status(500).send("User not found.");
        } else {
            res.json(safeUser(user));
        }
    })
});

app.post('/getUserByProfileUrl', function (req, res) {
    const profileUrl = sanitize(req.body.profileUrl);
    const query = { profileUrl };
    getUserByQuery(query, function (err, user) {
        console.log("safeUser is: ", safeUser);
        res.json(safeUser(user));
    })
});

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


// LOGIN USER
app.post('/login', function (req, res) {
    const reqUser = sanitize(req.body.user);
    let saveSession = sanitize(req.body.saveSession);

    if (typeof saveSession !== "boolean") {
        saveSession = false;
    }
    var email = reqUser.email;
    var password = reqUser.password;

    let user = null;

    // searches for user by case-insensitive email
    const emailRegex = new RegExp(email, "i");
    var query = {email: emailRegex};
    Users.findOne(query, function (err, foundUser) {
        if (err) {
            res.status(500).send("Error performing query to find user in db. ", err);
            return;
        }

        // the code that executes once a user is found in the db
        let tryLoggingIn = function() {
            bcrypt.compare(password, user.password, function (passwordError, passwordsMatch) {
                // if hashing password fails
                if (passwordError) {
                    res.status(500).send("Error logging in, try again later.");
                    return;
                }
                // passwords match
                else if (passwordsMatch) {
                    // check if user verified email address
                    if (user.verified) {
                        user = removePassword(user);
                        if (saveSession) {
                            req.session.userId = user._id;
                            req.session.save(function (err) {
                                if (err) {
                                    console.log("error saving user session", err);
                                }
                                res.json(removePassword(user));
                            });
                        } else {
                            res.json(removePassword(user));
                            return;
                        }
                    }
                    // if user has not yet verified email address, don't log in
                    else {
                        res.status(401).send("Email not yet verified");
                        return;
                    }
                }
                // wrong password
                else {
                    res.status(400).send("Password is incorrect.");
                    return;
                }
            });
        }

        // CHECK IF A USER WAS FOUND
        if (!foundUser || foundUser == null) {
            // CHECK IF THE USER IS IN THE BUSINESS USER DB
            Employers.findOne(query, function(err2, foundEmployer) {
                if (err2) {
                    res.status(500).send("Error performing query to find user in business user db. ", err);
                    return;
                }

                if (!foundEmployer || foundEmployer == null) {
                    console.log('looked in business db, none found')
                    res.status(404).send("No user with that email was found.");
                    return;
                }

                user = foundEmployer;
                tryLoggingIn();
                return;
            });
        }
        // USER FOUND IN USER DB
        else {
            user = foundUser;
            tryLoggingIn();
            return;
        }


    });
});


// this user object can now safely be seen by anyone
function safeUser(user) {
    let newUser = Object.assign({}, user);
    newUser.password = undefined;
    newUser._id = undefined;
    newUser.verificationToken = undefined;
    newUser.emailVerificationToken = undefined;
    newUser.passwordToken = undefined;
    newUser.answers = undefined;
    // doing Object.assign with a document from the db can lead to the new object
    // having a bunch of properties we don't want with the actual object ending
    // up in newObj._doc, so take the ._doc property if it exists and treat it
    // as the actual object
    if (newUser._doc) {
        newUser = newUser._doc;
    }
    return newUser;
}

// same as safe user except it has the user's answers to questions
function userForAdmin(user) {
    let newUser = Object.assign({}, user)._doc;
    newUser.password = undefined;
    newUser._id = undefined;
    newUser.verificationToken = undefined;
    newUser.emailVerificationToken = undefined;
    newUser.passwordToken = undefined;
    return newUser;
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


//----->> DELETE USER <<------
app.delete('/user/:_id', function (req, res) {
    var query = {_id: sanitize(req.params._id)};

    Users.remove(query, function (err, user) {
        if (err) {
            console.log(err);
        }
        res.json(safeUser(user));
    })
});

//----->> UPDATE USER <<------
app.post('/user/changeSettings', function (req, res) {
    const user = sanitize(req.body);
    const password = user.password;

    if (!user.password || !user.name || !user.email) {
        console.log("Not all arguments provided for settings change.");
        res.status(400).send("No fields can be empty.");
        return;
    }

    const userQuery = {_id: user._id}

    Users.findOne(userQuery, function(findUserErr, foundUser) {
        // if error while trying to find current user
        if (findUserErr) {
            console.log("Error finding user in db when trying to update settings: ", findUserErr);
            res.status(500).send("Settings couldn't be updated. Try again later.");
            return;
        }

        if (!foundUser) {
            console.log("Didn't find a user with given id when trying to update settings.");
            res.status(500).send("Settings couldn't be updated. Try again later.");
            return;
        }

        bcrypt.compare(password, foundUser.password, function (passwordError, passwordsMatch) {
            // error comparing password to user's password, doesn't necessarily
            // mean that the password is wrong
            if (passwordError) {
                console.log("Error comparing passwords when trying to update settings: ", passwordError);
                res.status(500).send("Settings couldn't be updated. Try again later.");
                return;
            }

            // user entered wrong password
            if (!passwordsMatch) {
                res.status(400).send("Incorrect password");
                return;
            }

            // see if there's another user with the new email
            const emailQuery = {email: user.email};
            Users.findOne(emailQuery, function(emailQueryErr, userWithEmail) {
                // don't want two users with the same email, so in case of db search
                // failure, return unsuccessfully
                if (emailQueryErr) {
                    console.log("Error trying to find a user with the same email address as the one provided by user trying to change settings: ", emailQueryErr);
                    res.status(500).send("Settings couldn't be updated. Try again later.");
                    return;
                }

                // someone else already has that email
                if (userWithEmail && userWithEmail._id.toString() != foundUser._id.toString()) {
                    res.status(400).send("That email address is already taken.");
                    return;
                }

                // all is good, update the user (as long as email and name are not blank)
                if (user.email) {
                    foundUser.email = user.email;
                }
                if (user.name) {
                    foundUser.name = user.name;
                }
                if (typeof user.hideProfile === "boolean") {
                    foundUser.hideProfile = user.hideProfile;
                }

                console.log("hideProfile: ", user.hideProfile);

                foundUser.save(function(saveErr, newUser) {
                    // if there is an error saving the user's info
                    if (saveErr) {
                        console.log("Error when saving user's changed info: ", saveErr);
                        res.status(500).send("Settings couldn't be updated. Try again later.");
                        return;
                    }

                    console.log("newUser: ", newUser);

                    // settings change successful
                    res.json(newUser);
                })
            });
        });
    })
});


//----->> ADD PATHWAY <<------
// CURRENTLY ONLY ALLOWS NWM AND SINGLEWIRE AND CURATE AND DREAMHOME PATHWAYS TO BE ADDED
app.post("/user/addPathway", function (req, res) {
    const _id = sanitize(req.body._id);
    const verificationToken = sanitize(req.body.verificationToken);
    const pathwayId = sanitize(req.body.pathwayId);
    const pathwayName = sanitize(req.body.pathwayName);


    if (_id && pathwayId && verificationToken) {
        // TODO: REMOVE THIS, CHANGE HOW THIS FUNCTION WORKS ONCE WE START
        // ADDING PATHWAYS BESIDES NWM AND SINGLEWIRE
        if (pathwayId !== "5a80b3cf734d1d0d42e9fcad" && pathwayId !== "5a88b4b8734d1d041bb6b386" && pathwayId !== "5abc12cff36d2805e28d27f3" && pathwayId !== "5ac3bc92734d1d4f8afa8ac4") {
            res.status(403).send("You cannot currently sign up for that pathway.");
            return;
        }


        // When true returns the updated document
        Users.findById(_id, function (err, user) {
            if (err) {
                console.log("Error finding user by id when trying to add a pathway: ", err);
                res.status(500).send("Server error, try again later.");
                return;
            }

            if (user.verificationToken !== verificationToken) {
                res.status(403).send("You do not have permission to add a pathway.");
                return;
            }

            for (let i = 0; i < user.pathways.length; i++) {
                if (user.pathways[i].pathwayId == req.body.pathwayId) {
                    console.log(user.pathways[i].pathwayId);
                    console.log(req.body.pathwayId);
                    res.status(401).send("You can't sign up for pathway more than once");
                    return;
                }
            }
            for (let i = 0; i < user.completedPathways.length; i++) {
                if (user.completedPathways[i].pathwayId == req.body.pathwayId) {
                    res.status(401).send("You can't sign up for a completed pathway");
                    return;
                }
            }
            const pathway = {
                dateAdded: new Date(),
                pathwayId: pathwayId,
                currentStep: {
                    subStep: 1,
                    step: 1
                }
            };
            user.pathways.push(pathway);

            user.save(function (saveErr, updatedUser) {
                if (saveErr) {
                    console.log("Error saving user with new pathway: ", saveErr);
                    res.status(500).send("Server error, try again later.");
                    return;
                }

                try {
                    // send email to everyone to alert them of the added pathway (if in production mode)
                    if (process.env.NODE_ENV) {
                        let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com", "ameyer24@wisc.edu"];
                        let subject = 'New Pathway Sign Up';
                        let content =
                            '<div>'
                            +   '<p>A user signed up for a pathway.</p>'
                            +   '<p>Name: ' + updatedUser.name + '</p>'
                            +   '<p>email: ' + updatedUser.email + '</p>'
                            +   '<p>Pathway: ' + pathwayName + '</p>'
                            + '</div>';

                        console.log("Sending email to alert us about new user sign up.");

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

                // add this user to the candidates list for all businesses associated with this pathway
                Businesses.find({pathwayIds: pathwayId})
                    .select("pathwayIds candidates")
                    .exec(function (findBizErr, businesses) {
                        if (findBizErr) {
                            // error finding business
                            sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "adding");
                        } else {
                            // iterate through each business that has this pathway
                            businesses.forEach(function(business) {
                                let candidates = business.candidates;

                                // find the candidate index within the business' candidate array
                                const userIdString = user._id.toString();
                                const userIndex = candidates.findIndex(function(candidate) {
                                    if (!candidate.userId) {
                                        return false;
                                    }
                                    return candidate.userId.toString() == userIdString;
                                });

                                // the candidate's current location
                                const location = user.info && user.info.location ? user.info.location : "";

                                // if candidate doesn't exist, add them along with the pathway
                                if (userIndex == -1) {
                                    let candidateToAdd = {
                                        userId: user._id,
                                        name: user.name,
                                        profileUrl: user.profileUrl,
                                        location: location,
                                        // give the business the email that the candidate wants to be contacted at, not their login email
                                        email: user.emailToContact ? user.emailToContact : user.email,
                                        // will only have this pathway if the candidate didn't exist before
                                        pathways: [{
                                            _id: pathwayId,
                                            name: pathwayName,
                                            hiringStage: "Not Contacted",
                                            completionStatus: "In Progress"
                                        }]
                                    }
                                    business.candidates.push(candidateToAdd);
                                }

                                // candidate did previously exist
                                else {
                                    let candidate = candidates[userIndex];

                                    // check if they have the current pathway (will be -1 if they don't)
                                    const pathwayIndex = candidate.pathways.findIndex(function(path) {
                                        return path._id == pathwayId;
                                    });

                                    // if the have the current pathway, mark them as having it in progress
                                    if (pathwayIndex > -1) {
                                        business.candidates[userIndex].pathways[pathwayIndex].completionStatus = "In Progress";
                                    }

                                    // if they don't have the current pathway, add the pathway and mark it in progress
                                    else {
                                        business.candidates[userIndex].pathways.push({
                                            _id: pathwayId,
                                            name: pathwayName,
                                            hiringStage: "Not Contacted",
                                            completionStatus: "In Progress"
                                        })
                                    }
                                }
                                // save the businesses in db
                                business.save(function(updateBizErr, updatedBiz) {
                                    if (updateBizErr || updatedBiz == null) {
                                        sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "adding");
                                    }
                                });
                            });
                        }
                    });

                res.send(removePassword(updatedUser));
            });
        })
    } else {
        res.status(400).send("Bad request.");
        return;
    }
});

//----->> CHANGE PASSWORD <<------
app.post('/user/changepassword', function (req, res) {
    var user = sanitize(req.body);
    var query = {_id: user._id};

    // if the field doesn't exist, $set will set a new field
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (saltErr, salt) {
        if (saltErr) {
            console.log("Error generating salt for resetting password: ", saltErr);
            res.status(500).send("Server error. Could not change password.");
            return;
        }
        bcrypt.hash(user.password, salt, function (hashErr, hash) {
            // error encrypting the new password
            if (hashErr) {
                console.log("Error hashing user's new password when trying to reset password: ", hashErr);
                res.status(500).send("Server error. Couldn't change password.");
                return;
            }

            Users.findOne(query, function (dbFindErr, userFromDB) {
                if (dbFindErr) {
                    console.log("Error finding the user that is trying to reset their password: ", dbFindErr);
                    res.status(500).send("Server error. Couldn't change password.");
                    return;
                }

                // CHECK IF A USER WAS FOUND
                if (!userFromDB) {
                    res.status(404).send("Server error. Couldn't change password.");
                    return;
                }

                bcrypt.compare(user.oldpass, userFromDB.password, function (passwordError, passwordsMatch) {
                    // error comparing passwords, not necessarily that the passwords don't match
                    if (passwordError) {
                        console.log("Error comparing passwords when trying to reset password: ", passwordError);
                        res.status(500).send("Server error. Couldn't change password.");
                        return;
                    }
                    // user gave the correct old password
                    else if (passwordsMatch) {
                        // update the user's password
                        userFromDB.password = hash;
                        // save the user in the db
                        userFromDB.save(function(saveErr, newUser) {
                            if (saveErr) {
                                console.log("Error saving user's new password when resetting: ", saveErr);
                                res.status(500).send("Server error. Couldn't change password.");
                                return;
                            } else {
                                //successfully changed user's password
                                res.json(removePassword(newUser));
                                return;
                            }
                        });
                    } else {
                        res.status(400).send("Old password is incorrect.");
                        return;
                    }
                });
            });
        });
    });
});

//----->> GET TOP PATHWAYS <<------
app.get('/topPathways', function (req, res) {
    const numPathways = parseInt(sanitize(req.query.numPathways), 10);

    // gets the most popular pathways, the number of pathways is numPathways;
    // only show the ones that are ready for users to see
    Pathways.find({showToUsers: true})
        .sort({avgRating: 1})
        .limit(numPathways)
        .select("name previewImage sponsor estimatedCompletionTime deadline price comingSoon showComingSoonBanner url")
        .exec(function (err, pathways) {
            if (err) {
                res.status(500).send("Not able to get top pathways");
            } else if (pathways.length == 0) {
                res.status(500).send("No pathways found");
            } else {
                res.json(pathways);
            }
        });
});

//----->> GET LINK BY ID <<-----
app.get('/getLink', function (req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Links.findOne(query, function (err, link) {
        if (err) {
            console.log("error in get link by id")
        } else {
            res.json(link);
        }

    })
});

//----->> GET ARTICLE BY ID <<-----
app.get('/getArticle', function (req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Articles.findOne(query, function (err, article) {
        if (err) {
            console.log("error in get article by id")
        } else {
            res.json(article);
        }

    })
});


//----->> GET ARTICLE BY ID <<-----
app.get('/getPathwayInfo', function (req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Info.findOne(query, function (err, info) {
        if (err) {
            console.log("error in get article by id")
        } else {
            res.json(info);
        }

    })
});


//----->> GET QUIZ BY ID <<-----
app.get('/getQuiz', function (req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Quizzes.findOne(query, function (err, quiz) {
        if (err) {
            console.log("error in get quiz by id")
            res.status(404).send("Quiz not found");
        } else {
            if (quiz != null) {
                quiz.correctAnswerNumber = undefined;
            }
            res.json(quiz);
        }

    })
});

//----->> GET VIDEO BY ID <<-----
app.get('/getVideo', function (req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Videos.findOne(query, function (err, link) {
        if (err) {
            console.log("error in get video by id")
        } else {
            res.json(link);
        }

    })
});

//----->> GET PATHWAY BY ID <<-----
app.get('/pathwayByIdNoContent', function (req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by id")
        } else {
            if (pathway) {
                res.json(removeContentFromPathway(pathway));
            } else {
                res.json(undefined);
            }
        }

    })
});

//----->> GET PATHWAY BY URL <<-----
app.get('/pathwayByPathwayUrlNoContent', function (req, res) {
    const pathwayUrl = sanitize(req.query.pathwayUrl);
    const query = {url: pathwayUrl};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by url")
        } else if (pathway) {
            res.json(removeContentFromPathway(pathway));
        } else {
            res.status(404).send("No pathway found");
        }

    })
});

app.get('/pathwayByPathwayUrl', function (req, res) {
    const pathwayUrl = sanitize(req.query.pathwayUrl);
    const userId = sanitize(req.query.userId);
//    const hashedVerificationToken = req.query.hashedVerificationToken;

    const verificationToken = sanitize(req.query.verificationToken);
    const query = {url: pathwayUrl};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by url");
            res.status(404).send("Error getting pathway by url");
            return;
        } else if (pathway) {
            // get the user from the database, can't trust user from frontend
            // because they can change their info there
            Users.findOne({_id: userId}, function (err, user) {
                if (err) {
                    console.log("error getting user: ", err);
                    res.status(500).send("Error getting pathway");
                    return;
                } else {
                    // check that user is who they say they are
                    if (verifyUser(user, verificationToken)) {
                        // check that user has access to that pathway
                        const hasAccessToPathway = user.pathways.some(function (path) {
                            return pathway._id.toString() == path.pathwayId.toString();
                        })
                        if (hasAccessToPathway) {
                            res.json(pathway);
                            return;
                        } else {
                            res.status(403).send("User does not have access to this pathway.");
                            return;
                        }
                    } else {
                        console.log("verification token does not match")
                        res.status(403).send("Incorrect user credentials");
                        return;
                    }
                }
            })
        } else {
            res.status(404).send("No pathway found");
        }

    })
});

function verifyUser(user, verificationToken) {
    return user.verificationToken && user.verificationToken == verificationToken;
}

function removeContentFromPathway(pathway) {
    if (pathway) {
        steps = pathway.steps;
        if (steps) {
            for (let i = 0; i < steps.length; i++) {
                steps[i].substeps = undefined;
            }
            pathway.steps = steps;
        }
    }

    return pathway;
}

//----->> SEARCH PATHWAYS <<------
app.get('/pathways/search', function (req, res) {
    const MAX_PATHWAYS_TO_RETURN = 1000;
    let query = {showToUsers: true};

    let term = sanitize(req.query.searchTerm);
    if (term && term !== "") {
        // if there is a search term, add it to the query
        const termRegex = new RegExp(term, "i");
        query["name"] = termRegex;
    }

    let limit = parseInt(sanitize(req.query.limit), 10);
    if (limit === NaN) {
        limit = MAX_PATHWAYS_TO_RETURN;
    }
    const sortNOTYET = sanitize(req.body.sort);

    // add category to query if it exists
    const category = sanitize(req.query.category);
    if (category && category !== "") {
        query["tags"] = category;
    }

    // add company to query if it exists
    const company = sanitize(req.query.company);
    if (company && company !== "") {
        query["sponsor.name"] = company;
    }

    //const limit = 4;
    const sort = {avgRating: 1};
    // only get these properties of the pathways
    const select = "name previewImage sponsor estimatedCompletionTime deadline price tags comingSoon showComingSoonBanner url";

    Pathways.find(query)
        .limit(limit)
        .sort(sort)
        .select(select)
        .exec(function (err, pathways) {
            console.log("pathways: ", pathways);
            if (err) {
                res.status(500).send("Error getting searched-for pathways");
            } else {
                res.json(pathways);
            }
        });
});


app.get("/pathways/getAllCompaniesAndCategories", function(req, res) {
    Pathways.find()
    .select("sponsor.name tags")
    .exec(function(err, pathways) {
        if (err) {
            console.log("Error finding pathways when getting all companies and categories.");
            res.json({companies: [], categories: []});
        } else if (!pathways) {
            res.json({companies: [], categories: []});
        } else {
            let companies = [];
            let categories = [];

            // go through each pathway, add the sponsor name and tags to the lists
            pathways.forEach(function(pathway) {
                // only add tags and company names if they exist
                if (pathway && pathway.sponsor && pathway.sponsor.name) {
                    companies.push(pathway.sponsor.name);
                }
                if (pathway && pathway.tags) {
                    categories = categories.concat(pathway.tags);
                }
            })

            companies = removeDuplicates(companies);
            categories = removeDuplicates(categories);
            res.json({companies, categories})
        }
    });
});


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


// VERIFY THAT THE GIVEN USER IS AN ADMIN FROM USER ID AND VERIFICATION TOKEN
function verifyAdmin(userId, verificationToken) {
    // async call, lets us use await
    return new Promise((resolve, reject) => {
        Users.findById(userId, function(findUserErr, foundUser) {
            // db error finding the user
            if (findUserErr) {
                console.log("Error finding admin user by id: ", findUserErr);
                resolve(false);
            }
            // no user found with that id, so can't be an admin user
            else if (!foundUser) {
                resolve(false);
            }
            // user found
            else {
                // wrong verification token, user does not have valid credentials
                if (foundUser.verificationToken != verificationToken) {
                    console.log("Someone tried to get verify an admin user with the wrong verification token. User is: ", foundUser);
                    resolve(false);
                }
                // return whether the user is an admin
                else {
                    resolve(foundUser.admin);
                }
            }
        });
    });
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
                resolve(undefined);
                return;
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
            Employers.findById(userId)
            .then(foundEmployer => {
                // if employer couldn't be found from the given id
                if (!foundEmployer) {
                    console.log("Couldn't find employer in the database when trying to verify them.");
                    printInfo();
                    resolve(undefined);
                    return;
                }
                // make sure the employer has the right verification token
                if (foundEmployer.verificationToken !== verificationToken) {
                    console.log("Employer gave wrong verification token when trying to be verified.");
                    printInfo();
                    resolve(undefined);
                    return;
                }
                // employer is real, return successfully if position in company verified
                verifiedUser = true;
                if (verifiedPosition) {
                    console.log("returning true");
                    resolve(business);
                    return;
                }
            })
            .catch(findEmployerErr => {
                console.log("Error finding employer in db when trying to verify employer: ", findEmployerErr);
                printInfo();
                resolve(undefined);
                return;
            })


            // make sure the employer is in the business' employer id array
            Businesses.findById(businessId)
            .then(foundBusiness => {
                if (!foundBusiness) {
                    console.log("Did not find business when trying to verify employer.");
                    printInfo();
                    resolve(undefined);
                    return;
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
                    resolve(undefined);
                    return;
                }

                // employer does work for this company, return successfully if they are verified
                verifiedPosition = true;
                business = foundBusiness
                if (verifiedUser) {
                    console.log("returning true");
                    resolve(business);
                    return;
                }
            })
            .catch(findBusinessErr => {
                console.log("Error finding business in db when trying to verify employer: ", findBusinessErr);
                printInfo();
                resolve(undefined);
                return;
            });
        }
        // some error, probably in the database, so employer can't be verified
        catch (error) {
            console.log("Error verifying employer: ", error);
            resolve(undefined);
            return;
        }
    });
}


app.get("/infoForAdmin", function(req, res) {
    const query = sanitize(req.query);
    const _id = query.userId;
    const verificationToken = query.verificationToken;

    if (!_id || !verificationToken) {
        console.log("No user id or verification token for user trying to get admin info.");
        res.status(403).send("User does not have valid credentials.");
        return;
    }

    const adminQuery = { _id, verificationToken };

    Users.findOne(adminQuery, function(err, user) {
        if (err) {
            console.log("Error finding admin user: ", err);
            res.status(500).send("Error finding current user in db.");
            return;
        } else if (!user || !user.admin || !(user.admin === "true" || user.admin === true) ) {
            res.status(403).send("User does not have valid credentials.");
            return;
        } else {
            Users.find()
                .sort({name: 1})
                .select("name email profileUrl")
                .exec(function (err2, users) {
                    if (err2) {
                        res.status(500).send("Not able to get users for admin.");
                        return;
                    } else if (users.length == 0) {
                        res.status(500).send("No users found for admin.");
                        return;
                    } else {
                        res.json(users);
                        return;
                    }
                });
        }
    });
});


app.get("/userForAdmin", function(req, res) {
    const query = sanitize(req.query);
    const _id = query.adminUserId;
    const verificationToken = query.verificationToken;
    const profileUrl = query.profileUrl;

    if (!_id || !verificationToken) {
        console.log("No user id or verification token for user trying to get admin info.");
        res.status(403).send("User does not have valid credentials.");
        return;
    }

    if (!profileUrl) {
        console.log("No user info requested.");
        res.status(400).send("No user info requested.");
        return;
    }

    const adminQuery = { _id, verificationToken };

    Users.findOne(adminQuery, function(err, adminUser) {
        if (err) {
            console.log("Error finding admin user: ", err);
            res.status(500).send("Error finding current user in db.");
            return;
        } else if (!adminUser || !adminUser.admin || !(adminUser.admin === "true" || adminUser.admin === true) ) {
            res.status(403).send("User does not have valid credentials.");
            return;
        } else {
            Users.findOne({profileUrl}, function(error, user) {
                if (error) {
                    console.log("Error getting user for admin: ", error);
                    res.status(500).send("Error getting user for admin.");
                    return;
                } else if (!user) {
                    console.log("User not found when trying to find user for admin.");
                    res.status(404).send("User not found.");
                    return;
                } else {
                    // have the user, now have to get their pathways to return

                    let pathways = [];
                    let completedPathways = [];
                    let foundPathways = 0;
                    let foundCompletedPathways = 0;

                    // quizzes will look like
                    // { <subStepId>: quizObject, ... }
                    let quizzes = {};
                    let requiredNumQuizzes = 0;
                    let foundQuizzes = 0;

                    // scores will be an object with every question with an objective answer
                    // scores[questionId] will be true if the answer is correct
                    // false if the answer is incorrect
                    let scores = {}

                    let returnIfFoundEverything = function() {
                        // if we have found all of the pathways, return all the info to the front end
                        if (foundPathways === user.pathways.length && foundCompletedPathways === user.completedPathways.length && foundQuizzes === requiredNumQuizzes) {
                            // grade the user's answers
                            // console.log("quizzes: ", quizzes);
                            // console.log("user.answers: ", user.answers);
                            for (let questionId in quizzes) {
                                let quiz = quizzes[questionId];
                                // skip anything that is not a quiz
                                if (!quizzes.hasOwnProperty(questionId)) { continue; }

                                // if the user answered the question and the question has a correct answer, grade it
                                if (quiz.hasCorrectAnswers && user.answers[questionId]) {
                                    // if it's a multiple choice question
                                    if (quiz.questionType === "multipleChoice" || quiz.questionType === "twoOptions") {
                                        // get the answer value the user put in
                                        let userAnswerValue = user.answers[questionId].value;
                                        let isCorrect = false;
                                        // if there is an array of correct answers
                                        if (Array.isArray(quiz.correctAnswerNumber)) {
                                            // see if the answer value the user put in is one of the right answers
                                            isCorrect = quiz.correctAnswerNumber.some(function(answerNumber) {
                                                // return true if the answer value is a correct one
                                                return answerNumber === userAnswerValue;
                                            })
                                        }
                                        // if there is a single correct answer
                                        else {
                                            isCorrect = quiz.correctAnswerNumber == userAnswerValue;
                                        }

                                        scores[questionId] = isCorrect;
                                    }
                                }
                            }

                            res.json({
                                user: userForAdmin(user),
                                pathways,
                                completedPathways,
                                quizzes,
                                scores
                            });
                            return;
                        }
                    }

                    let getQuizzesFromPathway = function(path) {
                        if (path && path.steps) {
                            // find quizzes that go with this pathway
                            for (let stepIndex = 0; stepIndex < path.steps.length; stepIndex++) {
                                let step = path.steps[stepIndex];
                                for (let subStepIndex = 0; subStepIndex < step.subSteps.length; subStepIndex++) {
                                    let subStep = step.subSteps[subStepIndex];
                                    if (subStep.contentType === "quiz") {
                                        // new quiz found, have to retrieve it before returning
                                        requiredNumQuizzes++;

                                        Quizzes.findOne({_id: subStep.contentID}, function(quizErr, quiz) {
                                            foundQuizzes++;
                                            if (quizErr) {
                                                console.log("Error getting question: ", quizErr);
                                            } else {
                                                quizzes[subStep.contentID] = quiz;
                                            }

                                            returnIfFoundEverything();
                                        })
                                    }
                                }
                            }
                        }
                    }

                    // if the user has no pathways or completed pathways, return simply their info
                    if (user.pathways.length === 0 && user.completedPathways.lengh === 0) {
                        res.json({
                            user: userForAdmin(user),
                            pathways,
                            completedPathways
                        });
                        return;
                    }

                    for (let pathwaysIndex = 0; pathwaysIndex < user.pathways.length; pathwaysIndex++) {
                        Pathways.findOne({_id: user.pathways[pathwaysIndex].pathwayId}, function(pathErr, path) {
                            if (pathErr) {
                                console.log(pathErr);
                            }
                            pathways.push(path);
                            // mark that we have found another pathway
                            foundPathways++;

                            getQuizzesFromPathway(path);





                            // if we have found all of the pathways, return all the info to the front end
                            // if (foundPathways === user.pathways.length && foundCompletedPathways === user.completedPathways.length && foundQuizzes === requiredNumQuizzes) {
                            //     res.json({
                            //         user: userForAdmin(user),
                            //         pathways,
                            //         completedPathways
                            //     });
                            //     return;
                            // }
                            returnIfFoundEverything();
                        })
                    }

                    for (let completedPathwaysIndex = 0; completedPathwaysIndex < user.completedPathways.length; completedPathwaysIndex++) {
                        Pathways.findOne({_id: user.completedPathways[completedPathwaysIndex].pathwayId}, function(pathErr, path) {
                            if (pathErr) {
                                console.log(pathErr);
                            }
                            completedPathways.push(path);
                            // mark that we have found another pathway
                            foundCompletedPathways++;

                            getQuizzesFromPathway(path);

                            returnIfFoundEverything();
                            // if we have found all of the pathways, return all the info to the front end
                            // if (foundPathways === user.pathways.length && foundCompletedPathways === user.completedPathways.length && foundQuizzes === requiredNumQuizzes) {
                            //     res.json({
                            //         user: userForAdmin(user),
                            //         pathways,
                            //         completedPathways
                            //     });
                            //     return;
                            // }
                        })
                    }
                }
            });
        }
    });
});


app.post("/userCurrentStep", function (req, res) {
    const userId = sanitize(req.body.params.userId);
    const pathwayId = sanitize(req.body.params.pathwayId);
    const stepNumber = sanitize(req.body.params.stepNumber);
    const subStepNumber = sanitize(req.body.params.subStepNumber);
    const verificationToken = sanitize(req.body.params.verificationToken);

    Users.findById(userId, function (err, user) {
        if (!verifyUser(user, verificationToken)) {
            res.status(401).send("User does not have valid credentials to save step.");
            return;
        }

        let pathwayIndex = user.pathways.findIndex(function (path) {
            return path.pathwayId == pathwayId;
        });
        user.pathways[pathwayIndex].currentStep = {
            subStep: subStepNumber,
            step: stepNumber
        }
        user.save(function () {
            res.json(true);
        });
    })
        .catch(function (err) {
            console.log("error saving the current step, ", err);
        })
});

app.get("/infoByUserId", function (req, res) {
    infoType = sanitize(req.query.infoType);
    const userId = sanitize(req.query.userId);

    if (userId && infoType) {
        Users.findById(userId, function (err, user) {
            if (err) {
                res.status(500).send("Could not get user");
            } else {
                // if the user doesn't have info saved in db, return empty array
                if (!user.info) {
                    res.json([]);
                }
                res.json(user.info[infoType]);
            }
        });
    } else {
        res.send(undefined);
    }
});


app.post("/updateAnswer", function (req, res) {
    let params, userId, verificationToken, quizId, answer;
    try {
        // get all the parameters
        params = sanitize(req.body.params);
        userId = params.userId;
        verificationToken = params.verificationToken;
        quizId = params.quizId;
        answer = params.answer;
    } catch (e) {
        res.status(400).send("Wrong request format.");
        return;
    }

    Users.findById(userId, function (findErr, user) {
        if (findErr) {
            console.log("Error finding user by id when trying to update answer: ", findErr);
            res.status(404).send("Current user not found.");
            return;
        }

        if (!verifyUser(user, verificationToken)) {
            console.log("can't verify user");
            res.status(401).send("User does not have valid credentials to update answers.");
            return;
        }

        // create answers object for user if it doesn't exist or is the wrong format
        if (!user.answers || typeof user.answers !== "object" || Array.isArray(user.answers)) {
            user.answers = {};
        }

        // update the user's answer to the given question
        user.answers[quizId.toString()] = answer;
        // so that Mongoose knows to update the answers object in the db
        user.markModified('answers');

        user.save(function (saveErr, updatedUser) {
            if (saveErr) {
                console.log("Error updating answer to a question: ", saveErr)
                res.status(500).send("Server error, try again later.");
                return;
            }
            res.send(removePassword(updatedUser));
        });
    })
});


app.post("/updateAllOnboarding", function (req, res) {
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
});


// --->> BUSINESS APIS <<--- //

//----->> POST EMPLOYER <<------
// creates a new user at the same company the current user works for
app.post('/employer', function (req, res) {
    let newUser = sanitize(req.body.newUser);
    let currentUser = sanitize(req.body.currentUser);

    // if no user given
    if (!newUser) {
        res.status(400).send("No user to create was sent.");
        return;
    }

    // if no current user
    if (!currentUser) {
        res.status(403).send("Must be logged in to create a business user.");
        return;
    }

    let query = {_id: currentUser._id};
    Employers.findOne(query, function (err, currentUserFromDB) {
        if (err) {
            console.log("error getting current user on business user creation: ", err);
            res.status(500).send("Error, try again later.");
            return;
        }

        // current user not found in db
        if (!currentUserFromDB || currentUserFromDB == null) {
            res.status(500).send("Your account was not found.");
            return;
        }

        // if current user does not have the right verification token
        if (!currentUser.verificationToken || currentUser.verificationToken !== currentUserFromDB.verificationToken) {
            res.status(403).send("Current user has incorrect credentials.");
            return;
        }

        // if current user does not have correct permissions
        if (currentUserFromDB.userType !== "employer") {
            res.status(403).send("User does not have the correct permissions to create a new business user.");
            return;
        }

        if (!currentUserFromDB.company || !currentUserFromDB.company.companyId) {
            res.status(403).send("User does not have an attached business.");
        }

        // hash the user's temporary password
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err2, hash) {
                // change the stored password to be the hash
                newUser.password = hash;
                newUser.verified = false;
                newUser.company = currentUserFromDB.company;

                // create user's verification strings
                newUser.emailVerificationToken = crypto.randomBytes(64).toString('hex');
                newUser.verificationToken = crypto.randomBytes(64).toString('hex');
                const query = {email: newUser.email};

                // check if there's already a user with that email
                getUserByQuery(query, function(error, foundUser) {
                    if (error && error !== null) {
                        console.log(error);
                        res.status(500).send("Error creating new user, try again later or contact support.");
                        return;
                    }

                    // if found user is null, that means no user with that email already exists,
                    // which is what we want
                    if (foundUser == null || foundUser == undefined) {
                        // store the user in the db
                        Employers.create(newUser, function (err4, newUserFromDB) {
                            if (err4) {
                                console.log(err4);
                                res.status(500).send("Error, please try again later.");
                                return;
                            }

                            // add the user to the company
                            const companyQuery = {_id: currentUserFromDB.company.companyId};
                            Businesses.findOne(companyQuery, function(err5, company) {
                                if (err5) {
                                    console.log(err5);
                                    res.status(500).send("Error adding user to company record.");
                                    return;
                                }

                                company.employerIds.push(newUserFromDB._id);
                                // save the new company info with the new user's id
                                company.save(function(err6) {
                                    if (err6) {
                                        console.log(err56);
                                        res.status(500).send("Error adding user to company record.");
                                        return;
                                    }

                                    // success, send back the name of the company they work for
                                    res.json(company.name);
                                });
                            });
                        })
                    } else {
                        res.status(401).send("An account with that email address already exists.");
                    }
                });
            });
        });
    });
});


// SEND BUSINESS USER VERIFICATION EMAIL
app.post('/sendEmployerVerificationEmail', function (req, res) {
    let email = sanitize(req.body.email);
    let companyName = sanitize(req.body.companyName);
    let query = {email: email};

    Employers.findOne(query, function (err, user) {
        let recipient = user.email;
        let subject = 'Verify email';
        let content =
             '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
            +   '<a href="https://www.moonshotlearning.org/" style="color:#00c3ff"><img style="height:100px;margin-bottom:20px"src="https://image.ibb.co/ndbrrm/Official_Logo_Blue.png"/></a><br/>'
            +   '<div style="text-align:justify;width:80%;margin-left:10%;">'
            +       '<span style="margin-bottom:20px;display:inline-block;">You have been signed up for Moonshot through ' + companyName + '! Please <a href="https://www.moonshotlearning.org/verifyEmail?userType=employer&token=' + user.emailVerificationToken + '">verify your account</a> to start finding your next great hire.</span><br/>'
            +       '<span style="display:inline-block;">If you have any questions or concerns, please feel free to email us at <a href="mailto:Support@MoonshotLearning.org">Support@MoonshotLearning.com</a>.</span><br/>'
            +   '</div>'
            +   '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="https://www.moonshotlearning.org/verifyEmail?userType=employer&token='
            +   user.emailVerificationToken
            +   '">VERIFY ACCOUNT</a>'
            +   '<div style="text-align:left;width:80%;margin-left:10%;">'
            +       '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
            +   '</div>'
            +'</div>';

        const sendFrom = "Moonshot";
        sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
            if (success) {
                res.json(msg);
            } else {
                res.status(500).send(msg);
            }
        })
    });
});


// VERIFY CHANGE PASSWORD
app.post('/changeTempPassword', function (req, res) {
    const userInfo = sanitize(req.body);

    const email = userInfo.email;
    const oldPassword = userInfo.oldPassword;
    const password = userInfo.password;

    var query = {email};
    Employers.findOne(query, function (err, user) {
        if (err || user == undefined || user == null) {
            res.status(404).send("User not found.");
            return;
        }

        if (!user.verified) {
            res.status(403).send("Must verify email before changing password.")
            return;
        }

        bcrypt.compare(oldPassword, user.password, function (passwordError, passwordsMatch) {
            if (!passwordsMatch || passwordError) {
                console.log("if there was an error, it was: ", passwordError);
                console.log("passwords match: ", passwordsMatch)
                res.status(403).send("Old password is incorrect.");
                return;
            }

            query = {_id: user._id};
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function (err2, salt) {
                bcrypt.hash(password, salt, function (err3, hash) {
                    if (err2 || err3) {
                        console.log("errors in hashing: ", err2, err3);
                        res.status(500).send("Error saving new password.");
                        return;
                    }

                    // change the stored password to be the hash
                    const newPassword = hash;
                    // if the field doesn't exist, $set will set a new field
                    var update = {
                        '$set': {
                            password: newPassword
                        },
                        '$unset': {
                            passwordToken: "",
                            time: '',
                        }
                    };

                    // When true returns the updated document
                    var options = {new: true};

                    Employers.findOneAndUpdate(query, update, options, function (err4, newUser) {
                        if (err4) {
                            console.log(err4);
                            res.status(500).send("Error saving new password.");
                            return;
                        }

                        res.json(removePassword(newUser));
                    });
                });
            });
        });
    });
});


// GET A COMPANY'S PATHWAY NAMES
app.get("/business/pathways", function(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        res.status(400).send("Bad request.");
        return;
    }

    Employers.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their pathways: ", findBUserErr);
            res.status(500).send("Server error, try again later.");
            return;
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            res.status(403).send("You do not have permission to access pathway info.");
            return;
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            res.status(403).send("You do not have permission to access pathway info.");
            return;
        }

        const companyId = user.company.companyId;
        Businesses.findById(companyId, function(findBizErr, company) {
            if (findBizErr) {
                console.log("Error finding business when trying to search for pathways: ", findBizErr);
                res.status(500).send("Server error, try again later.");
                return;
            }

            if (!company) {
                console.log("Business not found when trying to search for pathways.");
                res.status(500).send("Server error, try again later.");
                return;
            }

            // if the business doesn't have an associated user with the given
            // user id, don't let them see this business' candidates
            const userIdString = userId.toString();
            if (!company.employerIds.some(function(bizUserId) {
                return bizUserId.toString() === userIdString;
            })) {
                console.log("User tried to log in to a business with an id that wasn't in the business' id array.");
                res.status(403).send("You do not have access to this business' pathways.");
                return;
            }

            // if we got to this point it means the user is allowed to see pathways

            let pathwayQuery = { '_id': { $in: company.pathwayIds } }

            // find names of all the pathways associated with the business
            Pathways.find(pathwayQuery)
                .select("name")
                .exec(function(findPathwaysErr, pathways) {
                    if (findPathwaysErr) {
                        res.status(500).send("Server error, couldn't get pathways to search by.");
                    } else {
                        const pathwaysToReturn = pathways.map(function(path) {
                            return {name: path.name, _id: path._id};
                        })
                        res.json(pathwaysToReturn);
                    }
                });
        });
    })
});


// SEARCH FOR CANDIDATES
app.get("/business/candidateSearch", function(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        res.status(400).send("Bad request.");
        return;
    }

    Employers.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their candidates: ", findBUserErr);
            res.status(500).send("Server error, try again later.");
            return;
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            res.status(403).send("You do not have permission to access candidate info.");
            return;
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            res.status(403).send("You do not have permission to access candidate info.");
            return;
        }

        const companyId = user.company.companyId;
        Businesses.findById(companyId, function(findBizErr, company) {
            if (findBizErr) {
                console.log("Error finding business when trying to search for candidates: ", findBizErr);
                res.status(500).send("Server error, try again later.");
                return;
            }

            if (!company) {
                console.log("Business not found when trying to search for candidates.");
                res.status(500).send("Server error, try again later.");
                return;
            }

            // if the business doesn't have an associated user with the given
            // user id, don't let them see this business' candidates
            const userIdString = userId.toString();
            if (!company.employerIds.some(function(bizUserId) {
                return bizUserId.toString() === userIdString;
            })) {
                console.log("User tried to log in to a business with an id that wasn't in the business' id array.");
                res.status(403).send("You do not have access to this business' candidates.");
                return;
            }

            // if we got to this point it means the user is allowed to see candidates

            // all of a company's candidates
            const allCandidates = company.candidates;

            const searchTerm = sanitize(req.query.searchTerm);
            const hiringStage = sanitize(req.query.hiringStage);
            const pathway = sanitize(req.query.pathway);

            let candidatesToReturn = [];

            // go through each candidate, only add them if they match all
            // the search factors
            allCandidates.forEach(function(candidate) {
                if (searchTerm) {
                    // case insensitive search term regex
                    const termRegex = new RegExp(searchTerm, "i");
                    // if neither name nor email match search term, don't add
                    if (!(termRegex.test(candidate.email) || termRegex.test(candidate.name))) {
                        return;
                    }
                }
                if (hiringStage || pathway) {
                    // go through each of the candidates pathways, if they aren't
                    // at this hiring stage for any, return
                    const hasStageAndPathway = candidate.pathways.some(function(path) {
                        // if only looking for a certain pathway, just look for matching pathway
                        if (!hiringStage) {
                            return path.name == pathway;
                        }
                        // if only looking for certain hiring stage, just look for matching hiring stage
                        else if (!pathway) {
                            return path.hiringStage == hiringStage;
                        }
                        // otherwise look for a matching pathway name AND hiring stage on the same pathway
                        else {
                            return path.hiringStage == hiringStage && path.name == pathway;
                        }
                    });
                    if (!hasStageAndPathway) {
                        return;
                    }
                }

                // if the candidate made it past all the search terms, add them
                candidatesToReturn.push(candidate);
            });

            res.json(candidatesToReturn);
        });
    })
});


app.post("/resumeScorer/uploadResume", function(req, res) {
    try {
        const email = sanitize(req.body.email);
        const name = sanitize(req.body.name);
        const desiredCareers = sanitize(req.body.desiredCareers);
        const skills = sanitize(req.body.skills);
        const resumeFile = req.files.resumeFile;
        const resumeFileName = resumeFile.name;

        // only allow certain file types to be uploaded
        let extension = resumeFileName.split('.').pop().toLowerCase();
        const allowedFileTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
        if (!allowedFileTypes.some(function(fileType) {
           return fileType === extension;
        })) {
           console.log(`User tried to upload a file of type .${extension}, which is not allowed.`);
           return res.status(400).send("Wrong file type.");
        }

        let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "ameyer24@wisc.edu"];

        let subject = 'Resume To Be Scored';
        let content =
            '<div>'
            +   '<p>New resume to be scored.</p>'
            +   '<p>Name: ' + name + '</p>'
            +   '<p>email: ' + email + '</p>'
            +   '<p>Skills: ' + skills + '</p>'
            +   '<p>Desired Careers: ' + desiredCareers + '</p>'
            + '</div>';
        let attachments = [{
            filename: resumeFileName,
            content: new Buffer(resumeFile.data,'7bit')
        }];

        const sendFrom = "Moonshot";
        sendEmail(recipients, subject, content, sendFrom, attachments, function (success, msg) {
            // on failure
            if (!success) {
                console.log("Error sending sign up alert email: ", msg);
                res.status(500).send("Error uploading resume, try again later.");
                return;
            }
            // on success
            return res.json("Success!");
        })
    }
    catch (error) {
        console.log("Error sending resume to Kyle: ", error);
        return res.status(500).send("Error uploading, try again later.");
    }
});


// post a new business to the db
app.post("/business", async function(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const businessName = sanitize(body.businessName);
    const initialUserName = sanitize(body.initialUserName);
    const initialUserPassword = sanitize(body.initialUserPassword);
    const initialUserEmail = sanitize(body.initialUserEmail);

    // validate admin is admin user
    const isAdmin = await verifyAdmin(userId, verificationToken);
    if (!isAdmin) {
        res.status(403).send("You do not have permission to add businesses.");
        return;
    }

    try {
        // check if another business with that name already exists
        const businessNameQuery = {name: businessName};
        const foundBiz = await Businesses.findOne(businessNameQuery);

        // business already exists with that name
        if (foundBiz) {
            res.status(400).send("A business already exists with that name. Try a different name.");
            return;
        }

        // no business exists with that name, can go ahead and make new business
        const newBusiness = {
            name: businessName
        };

        // make the business in the db
        let createdBusiness = await Businesses.create(newBusiness);

        // check if a user (business- or non-business-) with the email provided
        // already exists
        const userEmailQuery = {email: initialUserEmail};
        getUserByQuery(userEmailQuery, function(findUserErr, foundUser) {
            // error looking for user by email
            if (findUserErr) {
                console.log("Error looking for a user by email: ", findUserErr);
                res.json("Successful business creation, but couldn't create initial user.");
                return;
            }
            // user found with that email so can't create it
            else if (foundUser) {
                res.json("Successful business creation, but user with that email already exists.");
                return;
            }

            // can create the initial user

            // function that will create employer and save them to the business
            // once the business has been created
            // executes right after creation once hash as been made
            const createEmployerWithPassword = async (createHashErr, hash) => {
                const newEmployer = {
                    name: initialUserName,
                    email: initialUserEmail,
                    password: hash,
                    userType: "employer",
                    verificationToken: crypto.randomBytes(64).toString('hex'),
                    verified: true,
                    company: {
                        name: createdBusiness.name,
                        companyId: createdBusiness._id
                    }
                };
                // create the employer
                try {
                    let createdEmployer = await Employers.create(newEmployer);

                    // ensure the business has a list of business user ids
                    if (!Array.isArray(createdBusiness.businessUserIds)) {
                        createdBusiness.employerIds = [];
                    }
                    // add the employer to the business' list of recruiters
                    createdBusiness.employerIds.push(createdEmployer._id);

                    try {
                        // save the business with the new user in it
                        await createdBusiness.save();
                        // everything succeeded
                        res.json("Success!");
                        return;
                    }
                    // error saving employer to business' array of business user ids
                    catch (saveBizUserIdsErr) {
                        console.log("error saving employer to business' array of business user ids: ", saveBizUserIdsErr);
                        res.json("Successful business creation but error associating new business user with business.");
                        return;
                    }
                }
                // error creating the new user
                catch (createEmployerErr) {
                    console.log("Error creating new employer: ", createEmployerErr);
                    res.json("Successful business creation, but could not create initial user.");
                    return;
                }
            }

            // hash password and create the employer
            const SALT_ROUNDS = 10;
            bcrypt.hash(initialUserPassword, SALT_ROUNDS, createEmployerWithPassword);
        });
    }
    // error at some point in business creation
    catch (dbError) {
        console.log("Database error during creation: ", dbError);
        res.status(500).send("Server error, try again later.");
        return;
    }
});

// UPDATE HIRING STAGE OF A CANDIDATE (NOT CONTACTED, CONTACTED, INTERVIEWING, HIRED)
app.post("/business/updateHiringStage", async function(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const companyId = sanitize(body.companyId);
    const candidateId = sanitize(body.candidateId);
    const hiringStage = sanitize(body.hiringStage);
    const isDismissed = sanitize(body.isDismissed);
    const pathwayId = sanitize(body.pathwayId);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !verificationToken || !companyId || !candidateId || !hiringStage || typeof isDismissed !== "boolean" || !pathwayId) {
        console.log("Not all arguments provided to /business/updateHiringStage");
        console.log("userId: ", userId);
        console.log("verificationToken: ", verificationToken);
        console.log("companyId: ", companyId);
        console.log("candidateId: ", candidateId);
        console.log("hiringStage: ", hiringStage);
        console.log("isDismissed: ", isDismissed);
        console.log("pathwayId: ", pathwayId);
        res.status(400).send("Bad request.");
        return;
    }

    // ensure the hiring stage provided is valid
    const validHiringStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
    if (!validHiringStages.includes(hiringStage)) {
        console.log("Invalid hiring stage provided.");
        return res.status(400).send("Invalid hiring stage provided.");
    }

    // verify the employer is actually a part of this organization
    verifyEmployerAndReturnBusiness(userId, verificationToken, companyId)
    .then(business => {
        // if employer does not have valid credentials
        if (!business) {
            console.log("Employer tried to change candidate's hiring status but could not be verified.");
            res.status(403).send("You do not have permission to change a candidate's hiring stage.");
            return;
        }

        // the index of the candidate in the business' candidate array
        const candidateIndex = business.candidates.findIndex(currCandidate => {
            return currCandidate.userId.toString() === candidateId.toString();
        });

        let candidate = business.candidates[candidateIndex];
        // get the index of the pathway in the user's pathways array
        const pathwayIndex = candidate.pathways.findIndex(currPathway => {
            return currPathway._id.toString() === pathwayId;
        })

        // change the candidate's hiring stage and dismissal status to match
        // the arguments that were passed in
        candidate.pathways[pathwayIndex].isDismissed = isDismissed;
        candidate.pathways[pathwayIndex].hiringStage = hiringStage;
        candidate.pathways[pathwayIndex].hiringStageEdited = new Date();

        // update the candidate in the business object
        business.candidates[candidateIndex] = candidate;

        // save the business
        business.save()
        .then(updatedBusiness => {
            return res.json("success");
        })
        .catch(updateBusinessErr => {
            return res.status(500).send("failure!");
        });
    })
    .catch(verifyEmployerErr => {
        console.log("Error when trying to verify employer when they were trying to edit a candidate's hiring stage: ", verifyEmployerErr);
        res.status(500).send("Server error, try again later.");
        return;
    })

    // TODO make sure the timestamp of the last change is before the timestamp given
    // if it isn't, don't change the user

});


// --->> END BUSINESS APIS <<--- //

// END APIs

app.listen(3001, function (err) {
    if (err) {
        return console.log(err);
    }
})
