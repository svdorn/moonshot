var Users = require('../models/users.js');
var Employers = require('../models/employers.js');


// get helper functions
const helperFunctions = require('./helperFunctions.js');
const sanitize = helperFunctions.sanitize;
const removeEmptyFields = helperFunctions.removeEmptyFields;
const verifyUser = helperFunctions.verifyUser;
const removePassword = helperFunctions.removePassword;
const getUserByQuery = helperFunctions.getUserByQuery;
const sendEmail = helperFunctions.sendEmail;
const safeUser = helperFunctions.safeUser;
const userForAdmin = helperFunctions.userForAdmin;
const getFirstName = helperFunctions.getFirstName;


const userApis = {
    POST_signOut,
    POST_keepMeLoggedIn,
    GET_keepMeLoggedIn,
    GET_session,
    POST_session
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


module.exports = userApis;
