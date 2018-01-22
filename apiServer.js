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

// APIs
var mongoose = require('mongoose');
// MONGO LAB - OLD
//mongoose.connect('mongodb://testUser:test@ds111476.mlab.com:11476/bookshop')
// MONGO LAB - NEW
const dbConnectLink = 'mongodb://' + credentials.dbUsername + ':' + credentials.dbPassword + '@ds125146.mlab.com:25146/testmoonshot'
mongoose.connect(dbConnectLink);
// LOCAL DB
//mongoose.connect('mongodb://localhost:27017/bookshop');


var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));
// --->>> SET UP SESSIONS <<<---
app.use(session({
    secret: credentials.secretString,
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}, //7 days in milliseconds
    store: new MongoStore({mongooseConnection: db, ttl: 7 * 24 * 60 * 60})
    // ttl: 7 days * 24 hours * 60 minutes * 60 seconds
}));

app.post('/signOut', function (req, res) {
    req.session.userId = undefined;
    req.session.hashedVerificationToken = undefined;
    req.session.save(function(err) {
        if (err) {
            console.log("error removing user session: ", err);
        }
        res.json("success");
    })
})

// GET USER SESSION
app.get('/userSession', function (req, res) {
    if (typeof req.session.userId !== 'undefined') {
        // TODO this could be a source of slowdown, if site is running too slow
        // consider changing the session to hold the entire user. This will take
        // more memory but will be faster

        getUserByQuery({_id: req.session.userId}, function (user) {
            //bcrypt.compare(user.verificationToken, req.session.hashedVerificationToken, function(err, tokenMatches) {
            //    if (tokenMatches) {
                    res.json(user);
            //    } else {
            //        console.log("verification tokens did not match when getting user from session");
            //        res.json(undefined);
            //    }
            //});
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

//----->> POST USER <<------
app.post('/users', function (req, res) {
    var user = req.body[0];

    // sanitize user info
    for (var prop in user) {
        // skip loop if the property is from prototype
        if (!user.hasOwnProperty(prop)) continue;
        if (typeof user[prop] === "string") {
            user[prop] = sanitizeHtml(user[prop], sanitizeOptions);
        }
    }

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
                    // store the user in the db
                    Users.create(user, function (err, user) {
                        if (err) {
                            console.log(err);
                        }
                        cleanUser(user, function(cleanedUser) {
                            res.json(cleanedUser);
                        })
                    })
                } else {
                    res.status(401).send("An account with that email address already exists.");
                }
            });
        });
    });
});

app.post('/verifyEmail', function (req, res) {
    const token = req.body.token;

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

        Users.findOneAndUpdate(query, update, options, function (err, user) {
            if (err) {
                console.log(err);
            }

            user.password = undefined;
            res.json(user);
        });
    });
});

// VERIFY CHANGE PASSWORD
app.post('/users/changePasswordForgot', function (req, res) {
    let token = req.body.token;
    let password = req.body.password;

    // sanitize token
    token = sanitizeHtml(token, sanitizeOptions);
    password = sanitizeHtml(password, sanitizeOptions);

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

                    newUser.password = undefined;
                    res.json(newUser);
                });
            })
        })
    });
});

// SEND EMAIL
app.post('/sendVerificationEmail', function (req, res) {
    let email = sanitizeHtml(req.body.email, sanitizeOptions);
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
app.post('/users/registerForPathway', function(req, res) {
    let recipient1 = "kyle@moonshotlearning.org";
    let subject1 = "Student Registration for " + req.body.pathway;
    let content1 = "<div>"
        + "<h3>Student Registration for Pathway:</h3>"
        + "<h4>Pathway: "
        + req.body.pathway
        + "</h4>"
        + "<h4>Student: "
        + req.body.name
        + "</h4>"
        + "<h4>Student Email: "
        + req.body.email
        + "</h4>"
        + "<p>If the student doesn't get back to you soon with an email, make sure to reach out to them.</p>"
        + "<p>-Moonshot</p>"
        +  "</div>";

    let name = req.body.name.replace(/(([^\s]+\s\s*){1})(.*)/,"$1").trim();
    let recipient2 = req.body.email;
    let subject2 = "First steps for " + req.body.pathway + " Pathway - book a 15 min call";
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
app.post('/users/forBusinessEmail', function (req, res) {

    let message = "None";
    if (req.body.message) {
        message = req.body.message;
    }
    let recipient = "kyle@moonshotlearning.org";
    let subject = 'Moonshot Sales Lead - From For Business Page';
    let content = "<div>"
        + "<h3>Sales Lead from For Business Page:</h3>"
        + "<p>Name: "
        + req.body.name
        + "</p>"
        + "<p>Company: "
        + req.body.company
        + "</p>"
        + "<p>Title: "
        + req.body.title
        + "</p>"
        + "<p>Email: "
        + req.body.email
        + "</p>"
        + "<p>Phone Number: "
        + req.body.phone
        + "</p>"
        + "<p>Positions they're hiring for: "
        + req.body.positions
        + "</p>"
        + "<p>Message: "
        + message
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

// SEND COMING SOON EMAIL
app.post('/users/comingSoonEmail', function (req, res) {

    let recipient = "kyle@moonshotlearning.org";
    let subject = 'Moonshot Coming Soon Pathway';
    let content = "<div>"
        + "<h3>Pathway:</h3>"
        + "<p>Name: "
        + req.body.name
        + "<p>Email: "
        + req.body.email
        + "</p>"
        + "<p>Pathway: "
        + req.body.pathway
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
app.post('/users/contactUsEmail', function (req, res) {

    let message = "None";
    if (req.body.message) {
        message = req.body.message;
    }
    let recipient = "kyle@moonshotlearning.org";
    let subject = 'Moonshot Pathway Question -- Contact Us Form';
    let content = "<div>"
        + "<h3>Questions from pathway:</h3>"
        + "<p>Name: "
        + req.body.name
        + "</p>"
        + "<p>Email: "
        + req.body.email
        + "</p>"
        + "<p>Message: "
        + message
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

// SEND EMAIL FOR PASSWORD RESET
app.post('/forgotPassword', function (req, res) {

    let email = sanitizeHtml(req.body.email, sanitizeOptions);
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
    nodemailer.createTestAccount((err, account) => {

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
    });
}

app.post('/getUserById', function(req, res) {
    const _id = sanitizeHtml(req.body._id, sanitizeOptions);
    const query = { _id };
    getUserByQuery(query, function (user) {
        res.json(user);
    })
});

app.post('/getUserByQuery', function (req, res) {
    const query = sanitizeHtml(req.body.query, sanitizeOptions);
    const user = getUserByQuery(query, function (user) {
        res.json(user);
    });
});

function getUserByQuery(query, callback) {
    Users.findOne(query, function (err, foundUser) {
        if (foundUser) {
            foundUser.password = undefined;
            callback(foundUser);
            return;
        }
        if (err) {
            console.log(err);
        }
        callback(undefined);
        return;
    });
}

// LOGIN USER
app.post('/login', function (req, res) {
    const reqUser = req.body.user;
    let saveSession = req.body.saveSession;

    if (typeof saveSession !== "boolean") {
        saveSession = false;
    }
    var email = sanitizeHtml(reqUser.email, sanitizeOptions);
    var password = sanitizeHtml(reqUser.password, sanitizeOptions);

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

                    cleanUser(user, function(newUser) {
                        user = newUser;
                        if (saveSession) {
                            req.session.userId = user._id;
                            req.session.hashedVerificationToken = user.hashedVerificationToken;
                            req.session.save(function (err) {
                                if (err) {
                                    console.log("error saving user session", err);
                                }
                                res.json(user);
                            });
                        } else {
                            res.json(user);
                            return;
                        }
                    });

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

function cleanUser(user, callback) {
    const saltRounds = 10;
    bcrypt.hash(user.verificationToken, saltRounds, function(err, hash) {
        let newUser = user;
        newUser.password = undefined;
        newUser.verificationToken = undefined;
        newUser.hashedVerificationToken = hash;
        callback(newUser);
    });
}


//----->> GET USERS <<------
app.get('/users', function (req, res) {
    Users.find(function (err, users) {
        if (err) {
            console.log(err);
        }
        res.json(users);
    })
});

//----->> DELETE USER <<------
app.delete('/users/:_id', function (req, res) {
    var query = {_id: sanitizeHtml(req.params._id, sanitizeOptions)};

    Users.remove(query, function (err, user) {
        if (err) {
            console.log(err);
        }
        res.json(user);
    })
});

//----->> UPDATE USER <<------
app.put('/users/:_id', function (req, res) {
    var user = req.body;

    // sanitize user info
    for (var prop in user) {
        // skip loop if the property is from prototype
        if (!user.hasOwnProperty(prop)) continue;
        if (typeof user[prop] === "string") {
            user[prop] = sanitizeHtml(user[prop], sanitizeOptions);
        }
    }

    var query = {_id: sanitizeHtml(req.params._id, sanitizeOptions)};

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
            Users.findOneAndUpdate(query, update, options, function (err, users) {
                if (err) {
                    console.log(err);
                }

                users.password = undefined;
                res.json(users);
            });
        }

    });
});

//----->> CHANGE PASSWORD <<------
app.put('/users/changepassword/:_id', function (req, res) {
    var user = req.body;
    var query = {_id: sanitizeHtml(req.params._id, sanitizeOptions)};

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
                        Users.findOneAndUpdate(query, update, options, function (err, users) {
                            if (err) {
                                console.log(err);
                            }
                            users.password = undefined;
                            res.json(users);
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
    const numPathways = parseInt(req.query.numPathways);

    // gets the most popular pathways, the number of pathways is numPathways
    Pathways.find()
        .sort({avgRating: -1})
        .limit(numPathways)
        .select("name previewImage sponsor estimatedCompletionTime deadline price")
        .exec(function (err, pathways) {
            if (err) {
                res.status(500).send("Not able to get top pathways");
            } else if (pathways.length == 0) {
                res.status(500).send("No pathways found");
            } else {
                // // if there weren't enough pathways
                // if (pathways.length < numPathways) {
                //     for (let i = pathways.length; i < numPathways; i++) {
                //         // extend the pathways with the last pathway until you have
                //         // the number you wanted
                //         pathways.push(pathways[i - 1]);
                //     }
                // }
                res.json(pathways);
            }
        });

});

//----->> GET LINK BY ID <<-----
app.get('/getLink', function (req, res) {
    const _id = req.query._id;
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
    const _id = req.query._id;
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
    const _id = req.query._id;
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
app.get('/getPathwayById', function (req, res) {
    const _id = req.query._id;
    const query = {_id: _id};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by id")
        } else {
            res.json(pathway);
        }

    })
});

//----->> SEARCH PATHWAYS <<------
app.get('/search', function (req, res) {
    const MAX_PATHWAYS_TO_RETURN = 1000;
    let query = {};

    const term = req.query.searchTerm;
    if (term && term !== "") {
        // if there is a search term, add it to the query
        const termRegex = new RegExp(req.query.searchTerm);
        query["name"] = termRegex;
    }

    const queryNOTYET = req.body.query;
    let limit = parseInt(req.query.limit);
    if (limit === NaN) {
        limit = MAX_PATHWAYS_TO_RETURN;
    }
    const sortNOTYET = req.body.sort;
    const selectNOTYET = req.body.select;

    // add category to query if it exists
    const category = req.query.category;
    if (category && category !== "") {
        query["tags"] = category;
    }

    // add company to query if it exists
    const company = req.query.company;
    if (company && company !== "") {
        query["sponsor.name"] = company;
    }

    //const limit = 4;
    const sort = {avgRating: -1};
    const select = "name previewImage sponsor estimatedCompletionTime deadline price tags";

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
    const userId = req.body.params.userId;
    const pathwayId = req.body.params.pathwayId;
    const stepNumber = req.body.params.stepNumber;
    const subStepNumber = req.body.params.subStepNumber;

    Users.findById(userId, function(err, user) {
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
    infoType = req.query.infoType;
    const userId = sanitizeHtml(req.query.userId, sanitizeOptions);

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

app.post("/addInterests", function(req, res) {
    const interests = req.body.params.interests;
    const userId = req.body.params.userId;

    if (interests && userId) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            if (err) {
                console.log(err);
            }

            for (let i = 0; i < interests.length; i++) {
                // only add the interest if the user didn't already have it
                if (user.info.interests.indexOf(interests[i]) === -1) {
                    user.info.interests.push(interests[i]);
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

app.post("/updateInterests", function(req, res) {
    const interests = req.body.params.interests;
    const userId = req.body.params.userId;

    if (interests && userId) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            if (err) {
                console.log(err);
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
    const goals = req.body.params.goals;
    const userId = req.body.params.userId;

    if (userId && goals) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            if (err) {
                console.log(err);
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
    const info = req.body.params.info;
    const userId = req.body.params.userId;

    if (info && userId) {
        // When true returns the updated document
        Users.findById(userId, function(err, user) {
            if (err) {
                console.log(err);
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


//----->> GET IMAGES <<------
// app.get('/images', function (req, res) {
//     const imgFolder = __dirname + '/public/images/';
//     // REQUIRE FILE SYSTEM
//     const fs = require('fs');
//     // READ ALL FILES IN THE DIRECTORY
//     fs.readdir(imgFolder, function (err, files) {
//         if (err) {
//             return console.error(err);
//         }
//         //CREATE AN EMPTY ARRAY
//         const filesArr = [];
//         // ITERATE ALL IMAGES IN THE DIRECTORY AND ADD TO THE ARRAY
//         files.forEach(function (file) {
//             filesArr.push({name: file});
//         });
//         // SEND THE JSON RESPONSE WITH THE ARRAY
//         res.json(filesArr);
//     })
// })

// END APIs

app.listen(3001, function (err) {
    if (err) {
        return console.log(err);
    }
})
