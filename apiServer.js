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

// SAVE USER SESSION
app.post('/userSession', function (req, res) {
    let userId = req.body.userId;
    req.session.userId = userId;
    req.session.save(function (err) {
        if (err) {
            console.log("error saving user session", err);
        }
        res.json(req.session.userId);
    });
});

// GET USER SESSION
app.get('/userSession', function (req, res) {
    if (typeof req.session.userId !== 'undefined') {
        // TODO this could be a source of slowdown, if site is running too slow
        // consider changing the session to hold the entire user. This will take
        // more memory but will be faster
        getUserByQuery({_id: req.session.userId}, function (user) {
            res.json(user);
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


// --->>> EXAMPLE PATHWAY CREATION <<<---

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
//             comments: [{ username: "frizzkitten", body: "amazing pathway, I learned so much stuff", date: new Date(2017, 11, 19, 11, 37, 5, 6) }],
//             ratings: [{ username: "frizzkitten", rating: 3 }, { username: "kelvinnkat", rating: 2 }],
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
//                     comments: [{ username: "kelvinnkat", body: "what a great first step", date: new Date(2017, 9, 9, 1, 33, 2, 9) }]
//                 },
//                 {
//                     order: 2,
//                     name: "Review what you learned in the first step",
//                     contentType: "quiz",
//                     contentID: quiz._id,
//                     comments: [{ username: "acethebetterone", body: "2 hard 4 me", date: new Date(2017, 6, 3, 1, 33, 2, 9) }]
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

    console.log("SIGNING UP A USER: ");
    console.log(user.username);

    // hash the user's password
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            // change the stored password to be the hash
            user.password = hash;
            user.verified = false;

            // create user's verification string
            user.verificationToken = crypto.randomBytes(64).toString('hex');
            console.log("verificationToken is: ", user.verificationToken);
            const query = {username: user.username};

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
                        res.json(user);
                    })
                } else {
                    res.status(401).send("Username already exists, choose new username.");
                }
            });
        });
    });
});

app.post('/verifyEmail', function (req, res) {
    const token = req.body.token;

    var query = {verificationToken: token};
    Users.findOne(query, function (err, user) {
        if (err || user == undefined) {
            res.status(404).send("User not found from token");
            return;
        }

        console.log("Found user from ver token: ");
        console.log(user.username);
        console.log("verification status: ");
        console.log(user.verified);

        let query = {_id: user._id}

        // if the field doesn't exist, $set will set a new field
        var update = {
            '$set': {
                verified: true
            },
            '$unset': {
                verificationToken: ""
            }
        };

        // When true returns the updated document
        var options = {new: true};

        Users.findOneAndUpdate(query, update, options, function (err, user) {
            if (err) {
                console.log(err);
            }

            console.log("logging in user ", user.username);
            user.password = undefined;
            res.json(user);
        });
    });
});

// VERIFY CHANGE PASSWORD
app.post('/users/changePasswordForgot', function (req, res) {
    let token = req.body.token;
    let password = req.body.password;
    console.log(token);

    // sanitize token
    token = sanitizeHtml(token, sanitizeOptions);
    password = sanitizeHtml(password, sanitizeOptions);

    var query = {passwordToken: token};
    Users.findOne(query, function (err, user) {
        if (err || user == undefined) {
            res.status(404).send("User not found from token");
            return;
        }

        console.log("Found user from ver token: ");
        console.log(user.username);
        const time = Date.now() - user.time;
        console.log("time is : " + time);
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

                    console.log("logging in user ", newUser.username);
                    newUser.password = undefined;
                    res.json(newUser);
                });
            })
        })
    });
});

// SEND EMAIL
app.post('/sendVerificationEmail', function (req, res) {
    console.log("ABOUT TO TRY TO SEND EMAIL");

    let username = sanitizeHtml(req.body.username, sanitizeOptions);
    let query = {username: username};

    Users.findOne(query, function (err, user) {
        let recipient = user.email;
        let subject = 'Verify email';
        let content = 'Click this link to verify your account: '
            + "<a href='http://localhost:3000/verifyEmail?"
            + user.verificationToken
            + "'>Click me</a>";

        sendEmail(recipient, subject, content, function (success, msg) {
            if (success) {
                res.json(msg);
            } else {
                res.status(500).send(msg);
            }
        })
    });
});

// SEND EMAIL FOR FOR BUSINESS
app.post('/users/forBusinessEmail', function (req, res) {

    let message = "None";
    if (req.body.message) {
        message = req.body.message;
    }
    let recipient = "kyle.treige@moonshotlearning.org";
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
            console.log("new pass token" + newPasswordToken);

            let query2 = {_id: user._id};
            var update = {
                '$set': {
                    passwordToken: newPasswordToken,
                    time: newTime,
                }
            };
            console.log(update);

            var options = {new: true};

            Users.findOneAndUpdate(query2, update, options, function (err, foundUser) {
                if (err) {
                    console.log(err);
                }

                console.log(foundUser);

                console.log("foundUser pass token: " + foundUser.passwordToken);
                foundUser.password = undefined;
                let content = 'Click this link to change your password:'
                    + "<a href='http://localhost:3000/changePassword?"
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
    console.log("here");
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
            console.log('Message sent: %s', info.messageId);
            callback(true, "Email sent! Check your email.");
            return;
        });
    });
}

app.post('/getUserByQuery', function (req, res) {
    const query = sanitizeHtml(req.body.query, sanitizeOptions);
    const user = getUserByQuery(query, function (user) {
        res.json(user);
    });
});

function getUserByQuery(query, callback) {
    Users.findOne(query, function (err, foundUser) {
        if (foundUser !== null) {
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
    var username = sanitizeHtml(req.body.username, sanitizeOptions);
    var password = sanitizeHtml(req.body.password, sanitizeOptions);

    console.log("TRYING TO LOG IN USER: ");
    console.log(username);
    console.log("initial pass: " + password);

    var query = {username: username};
    Users.findOne(query, function (err, user) {
        if (err) {
            console.log("error performing query to find user in db", err);
            res.status(500).send("Error performing query to find user in db. ", err);
            return;
        }

        // CHECK IF A USER WAS FOUND
        if (!user) {
            console.log('no user found');
            res.status(404).send("No user with that username was found.");
            return;
        }
        console.log("users pass: " + user.password);

        bcrypt.compare(password, user.password, function (passwordError, passwordsMatch) {
            // if hashing password fails
            if (passwordError) {
                console.log("error hashing password");
                res.status(500).send("Error logging in, try again later.");
                return;
            }
            // passwords match
            else if (passwordsMatch) {
                // check if user verified email address
                if (user.verified) {
                    console.log("LOGGING IN USER: ", user.username);
                    user.password = undefined;
                    res.json(user);
                    return;
                }
                // if user has not yet verified email address, don't log in
                else {
                    console.log("user hasn't verified email yet");
                    res.status(401).send("Email not yet verified");
                    return;
                }
            }
            // wrong password
            else {
                console.log('wrong password');
                res.status(400).send("Password is incorrect.");
                return;
            }
        });
    });


});

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
    console.log("in api server");
    console.log(user);
    console.log(query);

    // if the field doesn't exist, $set will set a new field
    var update = {
        '$set': {
            username: user.username,
            name: user.name,
            email: user.email
        }
    };

    // When true returns the updated document
    var options = {new: true};
    const findQuery = {username: user.username};
    console.log(findQuery);
    Users.findOne(findQuery, function (err, foundUser) {
        console.log("inside");
        if (err) {
            console.log(err);
        }
        let bool = false;
        if (foundUser === null) {
            bool = true;
        } else {
            if (foundUser._id == user._id) {
                console.log("id's equal");
                bool = true;
            } else {
                res.status(401).send("Username is taken. Choose a different username");
            }
        }
        if (bool) {
            Users.findOneAndUpdate(query, update, options, function (err, users) {
                if (err) {
                    console.log(err);
                }

                console.log("printing users" + users);
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
                    res.status(404).send("No user with that username was found.");
                    return;
                }

                bcrypt.compare(user.oldpass, users.password, function (passwordError, passwordsMatch) {
                    if (passwordError) {
                        console.log("error hashing password");
                        res.status(500).send("Error logging in, try again later.");
                        return;
                    } else if (passwordsMatch) {
                        console.log("ok");
                        // When true returns the updated document
                        var options = {new: true};

                        // i think it has to be {_id: req.params._id} for the query
                        Users.findOneAndUpdate(query, update, options, function (err, users) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("printing users" + users);
                            users.password = undefined;
                            res.json(users);
                        });
                    } else {
                        console.log('wrong password');
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
        .sort({rating: -1})
        .limit(numPathways)
        .select("name previewImage sponsor estimatedCompletionTime deadline price")
        .exec(function (err, pathways) {
            if (err) {
                console.log("ERROR GETTING TOP PATHWAYS: ");
                console.log(err)
                res.status(500).send("Not able to get top pathways");
            } else if (pathways.length == 0) {
                console.log("No pathways found");
                res.status(500).send("No pathways found");
            } else {
                // if there weren't enough pathways
                if (pathways.length < numPathways) {
                    for (let i = pathways.length; i < numPathways; i++) {
                        // extend the pathways with the last pathway until you have
                        // the number you wanted
                        pathways.push(pathways[i - 1]);
                    }
                }
                console.log(pathways);
                res.json(pathways);
            }
        });

});

//----->> GET PATHWAY BY ID <<-----
app.get('/getPathwayById', function (req, res) {
    console.log("here");
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

    console.log("category is: ", req.query.category);

    // add category to query if it exists
    const category = req.query.category;
    if (category && category !== "") {
        query["tags"] = category;
    }

    // add company to query if it exists
    const company = req.query.company;
    console.log("company is", company)
    if (company && company !== "") {
        query["sponsor.name"] = company;
    }

    console.log("query is ", query);

    //const limit = 4;
    const sort = {};
    const select = "name previewImage sponsor estimatedCompletionTime deadline price tags";

    Pathways.find(query)
        .limit(limit)
        .sort(sort)
        .select(select)
        .exec(function (err, pathways) {
            if (err) {
                console.log("error getting searched-for pathways", err);
                res.status(500).send("Error getting searched-for pathways");
            } else {
                console.log(pathways);
                res.json(pathways);
            }
        })

    // Pathways.find(query, function (err, pathways) {
    //     if (err){
    //         console.log(err);
    //     }
    //     res.json(pathways);
    // })
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
    console.log('API Server is listening on http://localhost:3001');
})
