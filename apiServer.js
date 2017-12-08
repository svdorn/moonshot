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
    secret: 'mySecretString',
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 2}, //2 days in milliseconds
    store: new MongoStore({mongooseConnection: db, ttl: 2 * 24 * 60 * 60})
    // ttl: 2 days * 24 hours * 60 minutes * 60 seconds
}));
// SAVE SESSION CART API
app.post('/cart', function (req, res) {
    var cart = req.body;
    req.session.cart = cart;
    req.session.save(function (err) {
        if (err) {
            console.log(err);
        }
        res.json(req.session.cart);
    })
})
// GET SESSION CART API
app.get('/cart', function (req, res) {
    if (typeof req.session.cart !== 'undefined') {
        res.json(req.session.cart);
    }
})
// --->>> END SESSION SET UP <<<---

var Users = require('./models/users.js');

//----->> POST USER <<------
app.post('/users', function (req, res) {
    var user = req.body[0];

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
            user.verificationString = undefined;
            res.json(user);
        });
    });
});

// SEND EMAIL
app.post('/sendVerificationEmail', function (req, res) {
    console.log("ABOUT TO TRY TO SEND EMAIL");

    let username = req.body.username;
    let query = {username: username};

    Users.findOne(query, function (err, user) {
        let recipient = user.email;
        let subject = 'Verify email';
        let content = 'Click this link to verify your account: '
            + "<a href='http://localhost:3000/verifyEmail?"
            + user.verificationToken
            + "'>Click me</a>";

        sendEmail(recipient, subject, content, function(success, msg) {
            if (success) {
                res.json(msg);
            } else {
                res.status(500).send(msg);
            }
        })
    });
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
            console.log('Message sent: %s', info.messageId);
            callback(true, "Email sent! Check your email before logging in.");
            return;
        });
    });
}

// LOGIN USER
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

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

        bcrypt.compare(password, user.password, function(passwordError, passwordsMatch) {
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
                    user.verificationString = undefined;
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
    var query = {_id: req.params._id};

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
    var query = {_id: req.params._id};
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
    
    // i think it has to be {_id: req.params._id} for the query
    Users.findOneAndUpdate(query, update, options, function (err, users) {
        if (err) {
            console.log(err);
        }
        console.log("printing users" + users);
        users.password = undefined;
        res.json(users);
    });
});

//----->> CHANGE PASSWORD <<------
app.put('/users/changepassword/:_id', function (req, res) {
    var user = req.body;
    var query = {_id: req.params._id};

    // if the field doesn't exist, $set will set a new field
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            // change the stored password to be the hash
            var update = {
                $set : {
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

//----->> GET USER IMAGES <<------
app.get('/images', function (req, res) {
    const imgFolder = __dirname + '/public/images/';
    // REQUIRE FILE SYSTEM
    const fs = require('fs');
    // READ ALL FILES IN THE DIRECTORY
    fs.readdir(imgFolder, function (err, files) {
        if (err) {
            return console.error(err);
        }
        //CREATE AN EMPTY ARRAY
        const filesArr = [];
        // ITERATE ALL IMAGES IN THE DIRECTORY AND ADD TO THE ARRAY
        files.forEach(function (file) {
            filesArr.push({name: file});
        });
        // SEND THE JSON RESPONSE WITH THE ARRAY
        res.json(filesArr);
    })
})

// END APIs

app.listen(3001, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('API Server is listening on http://localhost:3001');
})
