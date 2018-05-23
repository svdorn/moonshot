var Businesses = require('../models/businesses.js');
var Employers = require('../models/employers.js');
var Users = require('../models/users.js');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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


const employerApis = {
    POST_newEmployer,
    POST_sendVerificationEmail,
    POST_changeTempPassword
}


// creates a new user at the same company the current user works for
function POST_newEmployer(req, res) {
    let newUser = sanitize(req.body.newUser);
    let currentUser = sanitize(req.body.currentUser);

    // if no user given
    if (!newUser) {
        return res.status(400).send("No user to create was sent.");
    }

    // if no current user
    if (!currentUser) {
        return res.status(403).send("Must be logged in to create a business user.");
    }

    let query = {_id: currentUser._id};
    Employers.findOne(query, function (err, currentUserFromDB) {
        if (err) {
            console.log("error getting current user on business user creation: ", err);
            return res.status(500).send("Error, try again later.");
        }

        // current user not found in db
        if (!currentUserFromDB || currentUserFromDB == null) {
            return res.status(500).send("Your account was not found.");
        }

        // if current user does not have the right verification token
        if (!currentUser.verificationToken || currentUser.verificationToken !== currentUserFromDB.verificationToken) {
            return res.status(403).send("Current user has incorrect credentials.");
        }

        // if current user does not have correct permissions
        if (currentUserFromDB.userType !== "employer") {
            return res.status(403).send("User does not have the correct permissions to create a new business user.");
        }

        if (!currentUserFromDB.company || !currentUserFromDB.company.companyId) {
            return res.status(403).send("User does not have an attached business.");
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
                        return res.status(500).send("Error creating new user, try again later or contact support.");
                    }

                    // if found user is null, that means no user with that email already exists,
                    // which is what we want
                    if (foundUser == null || foundUser == undefined) {
                        // store the user in the db
                        Employers.create(newUser, function (err4, newUserFromDB) {
                            if (err4) {
                                console.log(err4);
                                return res.status(500).send("Error, please try again later.");
                            }

                            // add the user to the company
                            const companyQuery = {_id: currentUserFromDB.company.companyId};
                            Businesses.findOne(companyQuery, function(err5, company) {
                                if (err5) {
                                    console.log(err5);
                                    return res.status(500).send("Error adding user to company record.");
                                }

                                company.employerIds.push(newUserFromDB._id);
                                // save the new company info with the new user's id
                                company.save(function(err6) {
                                    if (err6) {
                                        console.log(err56);
                                        return res.status(500).send("Error adding user to company record.");
                                    }

                                    // success, send back the name of the company they work for
                                    return res.json(company.name);
                                });
                            });
                        })
                    } else {
                        return res.status(401).send("An account with that email address already exists.");
                    }
                });
            });
        });
    });
}


function POST_sendVerificationEmail(req, res) {
    let email = sanitize(req.body.email);
    let companyName = sanitize(req.body.companyName);
    let query = {email: email};

    Employers.findOne(query, function (err, user) {
        let recipient = [user.email];
        let subject = 'Verify email';
        let content =
             '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
            +   '<a href="https://www.moonshotinsights.io/" style="color:#00c3ff"><img style="height:100px;margin-bottom:20px"src="https://image.ibb.co/ndbrrm/Official_Logo_Blue.png"/></a><br/>'
            +   '<div style="text-align:justify;width:80%;margin-left:10%;">'
            +       '<span style="margin-bottom:20px;display:inline-block;">You have been signed up for Moonshot through ' + companyName + '! Please <a href="https://www.moonshotinsights.io/verifyEmail?userType=employer&token=' + user.emailVerificationToken + '">verify your account</a> to start finding your next great hire.</span><br/>'
            +       '<span style="display:inline-block;">If you have any questions or concerns, please feel free to email us at <a href="mailto:Support@moonshotinsights.io">Support@moonshotinsights.io</a>.</span><br/>'
            +   '</div>'
            +   '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="https://www.moonshotinsights.io/verifyEmail?userType=employer&token='
            +   user.emailVerificationToken
            +   '">VERIFY ACCOUNT</a>'
            +   '<div style="text-align:left;width:80%;margin-left:10%;">'
            +       '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
            +   '</div>'
            +'</div>';

        const sendFrom = "Moonshot";
        sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
            if (success) {
                return res.json(msg);
            } else {
                return res.status(500).send(msg);
            }
        })
    });
}


function POST_changeTempPassword(req, res) {
    const userInfo = sanitize(req.body);

    const email = userInfo.email;
    const oldPassword = userInfo.oldPassword;
    const password = userInfo.password;

    var query = {email};
    Employers.findOne(query, function (err, user) {
        if (err || user == undefined || user == null) {
            return res.status(404).send("User not found.");
        }

        if (!user.verified) {
            return res.status(403).send("Must verify email before changing password.")
        }

        bcrypt.compare(oldPassword, user.password, function (passwordError, passwordsMatch) {
            if (!passwordsMatch || passwordError) {
                console.log("if there was an error, it was: ", passwordError);
                console.log("passwords match: ", passwordsMatch)
                return res.status(403).send("Old password is incorrect.");
            }

            query = {_id: user._id};
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function (err2, salt) {
                bcrypt.hash(password, salt, function (err3, hash) {
                    if (err2 || err3) {
                        console.log("errors in hashing: ", err2, err3);
                        return res.status(500).send("Error saving new password.");
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
                            return res.status(500).send("Error saving new password.");
                        }

                        return res.json(removePassword(newUser));
                    });
                });
            });
        });
    });
}


module.exports = employerApis;
