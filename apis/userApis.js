var Users = require('../models/users.js');
var Employers = require('../models/employers.js');

var bcrypt = require('bcryptjs');


// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser,
        userForAdmin,
        getFirstName
} = require('./helperFunctions.js');


const userApis = {
    POST_signOut,
    POST_keepMeLoggedIn,
    GET_keepMeLoggedIn,
    GET_session,
    POST_session,
    POST_verifyEmail,
    POST_changePasswordForgot
}


function GET_session(req, res) {
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
}


function POST_session(req, res) {
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
}


// signs the user out by marking their session id as undefined
function POST_signOut(req, res) {
    req.session.userId = undefined;
    req.session.save(function (err) {
        if (err) {
            console.log("error removing user session: ", err);
            res.json("failure removing user session");
        } else {
            res.json("success");
        }
    })
}


// change session to store whether user wants default of "Keep Me Logged In"
// to be checked or unchecked
function POST_keepMeLoggedIn(req, res) {
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
}


// get the setting to stay logged in or out
function GET_keepMeLoggedIn(req, res) {
    let setting = sanitize(req.session.stayLoggedIn);
    if (typeof setting !== "boolean") {
        setting = false;
    }
    res.json(setting);
}


// verify user's email so they can sign in
function POST_verifyEmail(req, res) {
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
            return res.status(500).send("Server error, try again later");
        }

        if (!user) {
            return res.status(404).send("User not found from url");
        }

        user.verified = true;
        user.emailVerificationToken = undefined;

        user.save(function(updateErr, updatedUser) {
            if (updateErr) {
                console.log("Error saving user's verified status to true: ", updateErr);
                return res.status(500).send("Server error, try again later");
            }

            // we don't save the user session if logging in as business user
            // because it is likely the account was created on a different computer
            if (userType === "employer") {
                return res.json(updatedUser.email);
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
                return res.json(removePassword(updatedUser));
            }
            // otherwise, bring the user to the login page
            else {
                return res.json("go to login");
            }
        });
    });
}


function POST_changePasswordForgot(req, res) {
    let token = sanitize(req.body.token).toString();
    let password = sanitize(req.body.password);

    var query = {passwordToken: token};
    Users.findOne(query, function (err, user) {
        if (err) {
            console.log("Error trying to find user from password token: ", err);
            return res.status(500).send("Server error, try again later");
        }

        if (!user) {
            return res.status(404).send("User not found from link");
        }

        const currentTime = Date.now();
        if (currentTime > user.passwordTokenExpirationTime) {
            return res.status(401).send("Time ran out, try sending email again");
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
                        return res.status(500).send("Error saving new password");
                    }

                    // successfully created new password
                    return res.json(removePassword(newUser));
                });
            })
        })
    });
}


module.exports = userApis;
