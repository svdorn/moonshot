var Users = require('../models/users.js');
var Employers = require('../models/employers.js');

var bcrypt = require('bcryptjs');
var crypto = require('crypto');


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
    POST_changePasswordForgot,
    POST_changePassword,
    POST_forgotPassword,
    GET_userByProfileUrl
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


function POST_changePassword(req, res) {
    var user = sanitize(req.body);
    var query = {_id: user._id};

    // if the field doesn't exist, $set will set a new field
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (saltErr, salt) {
        if (saltErr) {
            console.log("Error generating salt for resetting password: ", saltErr);
            return res.status(500).send("Server error. Could not change password.");
        }
        bcrypt.hash(user.password, salt, function (hashErr, hash) {
            // error encrypting the new password
            if (hashErr) {
                console.log("Error hashing user's new password when trying to reset password: ", hashErr);
                return res.status(500).send("Server error. Couldn't change password.");
            }

            Users.findOne(query, function (dbFindErr, userFromDB) {
                if (dbFindErr) {
                    console.log("Error finding the user that is trying to reset their password: ", dbFindErr);
                    return res.status(500).send("Server error. Couldn't change password.");
                }

                // CHECK IF A USER WAS FOUND
                if (!userFromDB) {
                    return res.status(404).send("Server error. Couldn't change password.");
                }

                bcrypt.compare(user.oldpass, userFromDB.password, function (passwordError, passwordsMatch) {
                    // error comparing passwords, not necessarily that the passwords don't match
                    if (passwordError) {
                        console.log("Error comparing passwords when trying to reset password: ", passwordError);
                        return res.status(500).send("Server error. Couldn't change password.");
                    }
                    // user gave the correct old password
                    else if (passwordsMatch) {
                        // update the user's password
                        userFromDB.password = hash;
                        // save the user in the db
                        userFromDB.save(function(saveErr, newUser) {
                            if (saveErr) {
                                console.log("Error saving user's new password when resetting: ", saveErr);
                                return res.status(500).send("Server error. Couldn't change password.");
                            } else {
                                //successfully changed user's password
                                return res.json(removePassword(newUser));
                            }
                        });
                    } else {
                        return res.status(400).send("Old password is incorrect.");
                    }
                });
            });
        });
    });
}


// send email for password reset
function POST_forgotPassword(req, res) {
    let email = sanitize(req.body.email);
    let query = {email: email};

    const user = getUserByQuery(query, function (err, user) {
        if (!user) {
            console.log("Couldn't find user to set their password change token.");
            return res.status(401).send("Cannot find user");
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
                    return res.status(500).send("Server error, try again later.");
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
}


function GET_userByProfileUrl(req, res) {
    if (typeof req.query !== "object") { return res.status(400).send("Bad url."); }

    const profileUrl = sanitize(req.query.profileUrl);
    const query = { profileUrl };
    getUserByQuery(query, function (err, user) {
        if (err) { return res.status(400).send("Bad url"); }
        return res.json(safeUser(user));
    });
}


module.exports = userApis;
