var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const credentials = require('./credentials');
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');


var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
// trust the first proxy encountered because we run through a proxy
app.set('trust proxy', 1);

// APIs
var mongoose = require('mongoose');
// MONGO LAB
const dbConnectLink = 'mongodb://' + credentials.dbUsername + ':' + credentials.dbPassword + '@ds125146.mlab.com:25146/testmoonshot'
mongoose.connect(dbConnectLink);

var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));
// --->>> SET UP SESSIONS <<<---
app.use(session({
    secret: credentials.secretString,
    saveUninitialized: false, // doesn't save a session if it is new but not modified
    rolling: true, // resets maxAge on session when user uses site again
    proxy: true, // must be true since we are using a reverse proxy
    resave: false, // session only saved back to the session store if session was modified,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
        // TODO uncomment this when pushing to aws less frequently.
        // secure being true makes cookies only save when on https so it'll screw up localhost stuff
        //secure: true // only make the cookie if accessing via https
        secure: false // save the cookie even if not on https
    },
    store: new MongoStore({mongooseConnection: db, ttl: 7 * 24 * 60 * 60})
    // ttl: 7 days * 24 hours * 60 minutes * 60 seconds
}));

app.post('/signOut', function (req, res) {
    req.session.userId = undefined;
    req.session.save(function(err) {
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
app.post("/keepMeLoggedIn", function(req, res) {
    if (typeof req.body.stayLoggedIn === "boolean") {
        req.session.stayLoggedIn = req.body.stayLoggedIn;
    } else {
        req.session.stayLoggedIn = false;
    }
    req.session.save(function(err) {
        if (err) {
            console.log("error saving 'keep me logged in' setting: ", err);
            res.json("error saving 'keep me logged in' setting");
        } else {
            res.json("success");
        }
    })
});


// get the setting to stay logged in or out
app.get("/keepMeLoggedIn", function(req, res) {
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
        getUserByQuery({_id: userId}, function (user) {
            res.json(removePassword(user));
        })
    }
    else {
        res.json(undefined);
    }
});

// --->>> END SESSION SET UP <<<---

var Users = require('./models/users.js');
var Pathways = require('./models/pathways.js');
var Articles = require('./models/articles.js');
var Videos = require('./models/videos.js');
var Quizzes = require('./models/quizzes.js');
var Links = require('./models/links.js');


// --->>> EXAMPLE PATHWAY CREATION <<<---

// const exampleLink = {
//     url: "https://www.youtube.com/watch?v=J3hH-JckQ-U",
//     company: "Treehouse"
// }
// Links.create(exampleLink, function(err, link) {
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
//             previewImage: "/images/Mortal_Kombat.png",
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


// update all users with a specific thing, used if something is changed about
// the user model
// Users.find({}, function(err, users) {
//     console.log("err is: ", err);
//     console.log("\n\nusers are: ", users);
//
//     for (let userIdx = 0; userIdx < users.length; userIdx++) {
//         let user = users[userIdx];
//         Users.count({name: user.name}, function(err, count) {
//             console.log("count of users with name ", user.name, ": ", count);
//             const randomNumber = crypto.randomBytes(32).toString('hex');
//             user.verificationToken = randomNumber;
//             user.save(function() {
//                 console.log("user saved");
//             });
//         });
//     }
// })

//----->> POST USER <<------
app.post('/user', function (req, res) {
    var user = req.body[0];

    user = sanitize(user);

    // hash the user's password
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            // change the stored password to be the hash
            user.password = hash;
            user.verified = false;

            // create user's verification strings
            user.emailVerificationToken = crypto.randomBytes(64).toString('hex');
            user.verificationToken = crypto.randomBytes(64).toString('hex');
            const query = {email: user.email};

            Users.findOne(query, function (err, foundUser) {
                if (err) {
                    console.log(err);
                }
                if (foundUser === null) {
                    // get count of users with that name to get the profile url
                    Users.count({name: user.name}, function(err, count) {
                        const randomNumber = crypto.randomBytes(8).toString('hex');
                        user.profileUrl = user.name.split(' ').join('-') + "-" + (count + 1) + "-" + randomNumber;

                        // store the user in the db
                        Users.create(user, function (err, newUser) {
                            if (err) {
                                console.log(err);
                            }

                            req.session.unverifiedUserId = newUser._id;
                            req.session.save(function(err) {
                                if (err) {
                                    console.log("error saving unverifiedUserId to session: ", err);
                                }
                            })

                            // no reason to return the user with tokens because
                            // they will have to verify themselves before they
                            // can do anything anyway
                            res.json(safeUser(newUser));
                        })
                    })
                } else {
                    res.status(401).send("An account with that email address already exists.");
                }
            });
        });
    });
});

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

    const sanitizedArr = arr.map(function(value) {
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

app.post('/verifyEmail', function (req, res) {
    const token = sanitize(req.body.token);

    var query = {emailVerificationToken: token};
    Users.findOne(query, function (err, user) {
        if (err || user == undefined) {
            res.status(404).send("User not found from token");
            return;
        }

        let query = {_id: user._id}

        // if the field doesn't exist, $set will set a new field
        var update = {
            '$set': {
                verified: true
            },
            '$unset': {
                emailVerificationToken: ""
            }
        };

        // When true returns the updated document
        var options = {new: true};

        Users.findOneAndUpdate(query, update, options, function (err, updatedUser) {
            if (err) {
                console.log(err);
            }

            // if the session has the user's id, can immediately log them in
            sessionUserId = sanitize(req.session.unverifiedUserId);
            req.session.unverifiedUserId = undefined;
            req.session.save(function(err) {
                if (err) {
                    console.log("error")
                }
            });
            if (sessionUserId && sessionUserId == updatedUser._id) {
                res.json(removePassword(updatedUser));
            }
            // otherwise, bring the user to the login page
            else {
                res.json("go to login");
            }

        });
    });
});

// VERIFY CHANGE PASSWORD
app.post('/user/changePasswordForgot', function (req, res) {
    let token = sanitize(req.body.token);
    let password = sanitize(req.body.password);

    var query = {passwordToken: token};
    Users.findOne(query, function (err, user) {
        if (err || user == undefined) {
            res.status(404).send("User not found from token");
            return;
        }

        const time = Date.now() - user.time;
        if (time > (1 * 60 * 60 * 1000)) {
            res.status(401).send("Time ran out, try sending email again");
        }

        let query = {_id: user._id};
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
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

                Users.findOneAndUpdate(query, update, options, function (err, newUser) {
                    if (err) {
                        console.log(err);
                    }

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

    Users.findOne(query, function (err, user) {
        let recipient = user.email;
        let subject = 'Verify email';
        let content =
             '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
            +   '<a href="https://www.moonshotlearning.org/" style="color:#00c3ff"><img style="height:100px;margin-bottom:20px"src="https://image.ibb.co/ndbrrm/Official_Logo_Blue.png"/></a><br/>'
            +   '<div style="text-align:justify;width:80%;margin-left:10%;">'
            +       '<span style="margin-bottom:20px;display:inline-block;">Thank you for joining Moonshot! To get going on your pathways and learning new skills, please <a href="https://www.moonshotlearning.org/verifyEmail?' + user.emailVerificationToken + '">verify your account</a>. Once you verify your account, you can start building your profile. We hope you have a blast!</span><br/>'
            +       '<span style="display:inline-block;">If you have any questions or concerns or if you just want to talk about the weather, please feel free to email us at <a href="mailto:Support@MoonshotLearning.org">Support@MoonshotLearning.com</a>.</span><br/>'
            +   '</div>'
            +   '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="https://www.moonshotlearning.org/verifyEmail?'
            +   user.emailVerificationToken
            +   '">VERIFY ACCOUNT</a>'
            +   '<div style="text-align:left;width:80%;margin-left:10%;">'
            +       '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
            +   '</div>'
            +'</div>';

        sendEmail(recipient, subject, content, function (success, msg) {
            if (success) {
                res.json(msg);
            } else {
                res.status(500).send(msg);
            }
        })
    });
});

// SEND EMAIL FOR REGISTERING FOR PATHWAYS
app.post('/user/registerForPathway', function(req, res) {
    const pathwayName = sanitize(req.body.pathway);
    const studentName = sanitize(req.body.name);
    const studentEmail = sanitize(req.body.email);

    let recipient1 = "kyle@moonshotlearning.org, justin@moonshotlearning.org, ameyer24@wisc.edu";
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
        +  "</div>";

    let name = studentName.replace(/(([^\s]+\s\s*){1})(.*)/,"$1").trim();
    let recipient2 = studentEmail;
    let subject2 = "First steps for " + pathwayName + " Pathway - book a 15 min call";
    let content2 = "<div>"
        + "<p>Hi " + name + "," + "</p>"
        + "<p>My name is Kyle and I’m one of the founders at Moonshot. We are excited for you to get going on the pathway!</p>"
        + "<p>Before you do we've got a few things to cover:<br/>"
        + "- There are limited scholarships that the sponsor company offers.<br/>"
        + "- So … We need to learn a bit about you first!<br/>"
        + "- Step 1: " +"<b><u>Send a link to your LinkedIn profile</u></b>" + " (not required but you can also attach"
        + " your resume, link to a project, something you are proud of, etc) to kyle@moonshotlearning.org." + "</p>"
        + "<p>If you have any questions, shoot me a message. I'll review everything and be back to you shortly!</p>"
        + "<p>Talk soon,<br/>"
        + "Kyle</p>"
        + "<p>-------------------------------------------<br/>"
        + "Kyle Treige, Co-Founder & CEO <br/>"
        + "<a href='https://www.moonshotlearning.org/' target='_blank'>Moonshot Learning</a><br/>"
        + "608-438-4478</p>"
        + "</div>";

    sendEmail(recipient1, subject1, content1, function (success, msg) {
        if (success) {
            sendEmail(recipient2, subject2, content2, function (success, msg) {
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
    let recipients = "kyle@moonshotlearning.org, justin@moonshotlearning.org";
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

    sendEmail(recipients, subject, content, function (success, msg) {
        if (success) {
            res.json("Email sent successfully, our team will be in contact with you shortly!");
        } else {
            res.status(500).send(msg);
        }
    })
});

app.post('/user/unsubscribeEmail', function (req, res) {

    let recipient = "kyle@moonshotlearning.org";
    let subject = 'URGENT ACTION - User Unsubscribe from Moonshot';
    let content = "<div>"
        + "<h3>This email is Unsubscribing from Moonshot Emails:</h3>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "</div>";

    sendEmail(recipient, subject, content, function (success, msg) {
        if (success) {
            res.json("You have successfully unsubscribed.");
        } else {
            res.status(500).send(msg);
        }
    })
});

// SEND COMING SOON EMAIL
app.post('/user/comingSoonEmail', function (req, res) {

    let recipient = "kyle@moonshotlearning.org, justin@moonshotlearning.org, ameyer24@wisc.edu";
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

    sendEmail(recipient, subject, content, function (success, msg) {
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
    let recipients = "kyle@moonshotlearning.org, justin@moonshotlearning.org";
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

    sendEmail(recipients, subject, content, function (success, msg) {
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

    const user = getUserByQuery(query, function (user) {
        if (user == undefined) {
            res.status(401).send("Cannot find user");
        } else {
            let recipient = user.email;
            let subject = 'Change Password';
            const newPasswordToken = crypto.randomBytes(64).toString('hex');
            const newTime = Date.now();

            let query2 = {_id: user._id};
            var update = {
                '$set': {
                    passwordToken: newPasswordToken,
                    time: newTime,
                }
            };

            var options = {new: true};

            Users.findOneAndUpdate(query2, update, options, function (err, foundUser) {
                if (err) {
                    console.log(err);
                }

                foundUser.password = undefined;
                let content = 'Click this link to change your password: '
                    + "<a href='https://www.moonshotlearning.org/changePassword?"
                    + newPasswordToken
                    + "'>Click me</a>";
                sendEmail(recipient, subject, content, function (success, msg) {
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

// callback needs to be a function of a success boolean and string to return
function sendEmail(recipients, subject, content, callback) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //nodemailer.createTestAccount((err, account) => {

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
                user: credentials.emailUsername,
                pass: credentials.emailPassword
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Moonshot Learning" <do-not-reply@moonshot.com>', // sender address
            to: recipients, // list of receivers
            subject: subject, // Subject line
            html: content // html body
        };

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
    //});
}

app.post('/getUserById', function(req, res) {
    const _id = sanitize(req.body._id);
    const query = { _id };
    getUserByQuery(query, function (user) {
        res.json(removePassword(user));
    })
});

app.post('/getUserByProfileUrl', function(req, res) {
    const profileUrl = sanitize(req.body.profileUrl);
    const query = { profileUrl };
    getUserByQuery(query, function (user) {
        res.json(safeUser(user));
    })
});

function getUserByQuery(query, callback) {
    Users.findOne(query, function (err, foundUser) {
        if (foundUser) {
            callback(removePassword(foundUser));
            return;
        } else {
            if (err) {
                console.log(err);
            }
            callback(undefined);
        }
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

    var query = {email: email};
    Users.findOne(query, function (err, user) {
        if (err) {
            res.status(500).send("Error performing query to find user in db. ", err);
            return;
        }

        // CHECK IF A USER WAS FOUND
        if (!user) {
            res.status(404).send("No user with that email was found.");
            return;
        }

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
}


// used when passing the user object back to the user, still contains sensitive
// data such as the user id and verification token
function removePassword(user) {
    let newUser = user;
    newUser.password = undefined;
    return newUser;
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
app.put('/user/:_id', function (req, res) {
    var user = sanitize(req.body);

    var query = {_id: sanitize(req.params._id)};

    // if the field doesn't exist, $set will set a new field
    var update = {
        '$set': {
            name: user.name,
            email: user.email
        }
    };

    // When true returns the updated document
    var options = {new: true};
    const findQuery = {email: user.email};
    Users.findOne(findQuery, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        let bool = false;
        if (foundUser === null) {
            bool = true;
        } else {
            if (foundUser._id == user._id) {
                bool = true;
            } else {
                res.status(401).send("Email is taken. Choose a different email.");
            }
        }
        if (bool) {
            Users.findOneAndUpdate(query, update, options, function (err, user) {
                if (err) {
                    console.log(err);
                }

                res.json(removePassword(user));
            });
        }

    });
});

//----->> CHANGE PASSWORD <<------
app.put('/user/changepassword/:_id', function (req, res) {
    var user = sanitize(req.body);
    var query = {_id: sanitize(req.params._id)};

    // sanitize user info
    for (var prop in user) {
        // skip loop if the property is from prototype
        if (!user.hasOwnProperty(prop)) continue;
        if (typeof user[prop] === "string") {
            user[prop] = sanitizeHtml(user[prop], sanitizeOptions);
        }
    }

    // if the field doesn't exist, $set will set a new field
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            // change the stored password to be the hash
            var update = {
                $set: {
                    password: hash
                }
            }
            // i think it has to be {_id: req.params._id} for the query
            Users.findOne(query, function (err, users) {
                if (err) {
                    res.status(500).send("Error performing query to find user in db. ", err);
                    return;
                }

                // CHECK IF A USER WAS FOUND
                if (!users) {
                    res.status(404).send("No user with that email was found.");
                    return;
                }

                bcrypt.compare(user.oldpass, users.password, function (passwordError, passwordsMatch) {
                    if (passwordError) {
                        res.status(500).send("Error logging in, try again later.");
                        return;
                    } else if (passwordsMatch) {
                        // When true returns the updated document
                        var options = {new: true};

                        // i think it has to be {_id: req.params._id} for the query
                        Users.findOneAndUpdate(query, update, options, function (err, user) {
                            if (err) {
                                console.log(err);
                            }
                            res.json(removePassword(user));
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
    const numPathways = parseInt(sanitize(req.query.numPathways));

    // gets the most popular pathways, the number of pathways is numPathways
    Pathways.find()
        .sort({avgRating: -1})
        .limit(numPathways)
        .select("name previewImage sponsor estimatedCompletionTime deadline price comingSoon")
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
            Users.findOne({_id: userId}, function(err, user) {
                if (err) {
                    console.log("error getting user: ", err);
                    res.status(500).send("Error getting pathway");
                    return;
                } else {
                    // check that user is who they say they are
                    if (verifyUser(user, verificationToken)) {
                        // check that user has access to that pathway
                        const hasAccessToPathway = user.pathways.some(function(path) {
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
app.get('/search', function (req, res) {
    const MAX_PATHWAYS_TO_RETURN = 1000;
    let query = {};

    const term = sanitize(req.query.searchTerm);
    if (term && term !== "") {
        // if there is a search term, add it to the query
        const termRegex = new RegExp(term);
        query["name"] = termRegex;
    }

    let limit = parseInt(sanitize(req.query.limit));
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
    const sort = {avgRating: -1};
    // only get these properties of the pathways
    const select = "name previewImage sponsor estimatedCompletionTime deadline price tags comingSoon url";

    Pathways.find(query)
        .limit(limit)
        .sort(sort)
        .select(select)
        .exec(function (err, pathways) {
            if (err) {
                res.status(500).send("Error getting searched-for pathways");
            } else {
                res.json(pathways);
            }
        })
});


app.post("/userCurrentStep", function (req, res) {
    const userId = sanitize(req.body.params.userId);
    const pathwayId = sanitize(req.body.params.pathwayId);
    const stepNumber = sanitize(req.body.params.stepNumber);
    const subStepNumber = sanitize(req.body.params.subStepNumber);
    const verificationToken = sanitize(req.body.params.verificationToken);

    Users.findById(userId, function(err, user) {
        if (!verifyUser(user, verificationToken)) {
            res.status(401).send("User does not have valid credentials to save step.");
            return;
        }

        let pathwayIndex = user.pathways.findIndex(function(path) {
            return path.pathwayId == pathwayId;
        });
        user.pathways[pathwayIndex].currentStep = {
            subStep: subStepNumber,
            step: stepNumber
        }
        user.save(function() {
            res.json(true);
        });
    })
    .catch(function(err) {
        console.log("error saving the current step, ", err);
    })
});

app.get("/infoByUserId", function(req, res) {
    infoType = sanitize(req.query.infoType);
    const userId = sanitize(req.query.userId);

    if (userId && infoType) {
        Users.findById(userId, function(err, user) {
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

// app.post("/addInterests", function(req, res) {
//     const interests = sanitize(req.body.params.interests);
//     const userId = sanitize(req.body.params.userId);
//     const verificationToken = sanitize(req.body.params.verificationToken);
//
//     if (interests && userId) {
//         // When true returns the updated document
//         Users.findById(userId, function(err, user) {
//             if (err) {
//                 console.log(err);
//             }
//
//             if (!verifyUser(user, verificationToken)) {
//                 res.status(401).send("User does not have valid credentials to add interests.");
//                 return;
//             }
//
//             for (let i = 0; i < interests.length; i++) {
//                 // only add the interest if the user didn't already have it
//                 if (user.info.interests.indexOf(interests[i]) === -1) {
//                     user.info.interests.push(interests[i]);
//                 }
//             }
//
//             user.save(function (err, updatedUser) {
//                 if (err) {
//                     res.send(false);
//                 }
//                 res.send(updatedUser);
//             });
//         })
//     } else {
//         res.send(undefined);
//     }
// });

app.post("/updateInterests", function(req, res) {
    const interests = sanitize(req.body.params.interests);
    const userId = sanitize(req.body.params.userId);
    const verificationToken = sanitize(req.body.params.verificationToken);

    if (interests && userId) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            //console.log('found user: ', user);
            if (err) {
                console.log(err);
            }

            if (!verifyUser(user, verificationToken)) {
                console.log("can't verify user");
                res.status(401).send("User does not have valid credentials to update interests.");
                return;
            }

            user.info.interests = interests;

            user.save(function (err, updatedUser) {
                if (err) {
                    res.send(false);
                }
                res.send(updatedUser);
            });
        })
    } else {
        res.send(undefined);
    }
});

app.post("/updateGoals", function(req, res) {
    const goals = sanitize(req.body.params.goals);
    const userId = sanitize(req.body.params.userId);
    const verificationToken = sanitize(req.body.params.verificationToken);

    if (userId && goals) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            if (err) {
                console.log(err);
            }

            if (!verifyUser(user, verificationToken)) {
                console.log("can't verify user");
                res.status(401).send("User does not have valid credentials to update goals.");
                return;
            }

            user.info.goals = goals;

            user.save(function (err, updatedUser) {
                if (err) {
                    res.send(false);
                }
                res.send(updatedUser);
            });
        })
    } else {
        res.send(undefined)
    }


});

app.post("/updateInfo", function(req, res) {
    const info = sanitize(req.body.params.info);
    const userId = sanitize(req.body.params.userId);
    const verificationToken = sanitize(req.body.params.verificationToken);

    if (info && userId) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            if (err) {
                console.log(err);
            }

            if (!verifyUser(user, verificationToken)) {
                console.log("can't verify user");
                res.status(401).send("User does not have valid credentials to update info.");
                return;
            }

            for (const prop in info) {
                if (info.hasOwnProperty(prop)) {
                    user.info[prop] = info[prop];
                }
            }

            user.save(function (err, updatedUser) {
                if (err) {
                    res.send(false);
                }
                res.send(updatedUser);
            });
        })
    } else {
        res.send(undefined);
    }
});

// END APIs

app.listen(3001, function (err) {
    if (err) {
        return console.log(err);
    }
})
