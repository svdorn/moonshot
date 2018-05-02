var Users = require('../models/users.js');
var Employers = require('../models/employers.js');


// get helper functions
const helperFunctions = require('./helperFunctions.js');
const sanitize = helperFunctions.sanitize;
const removeEmptyFields = helperFunctions.removeEmptyFields;
const verifyUser = helperFunctions.verifyUser;
const removePassword = helperFunctions.removePassword;


const userApis = {
    POST_signOut,
    POST_keepMeLoggedIn,
    GET_keepMeLoggedIn
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
