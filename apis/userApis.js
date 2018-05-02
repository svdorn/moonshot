var Users = require('../models/users.js');


// get helper functions
const helperFunctions = require('./helperFunctions.js');
const sanitize = helperFunctions.sanitize;
const removeEmptyFields = helperFunctions.removeEmptyFields;
const verifyUser = helperFunctions.verifyUser;
const removePassword = helperFunctions.removePassword;


const userApis = {
    signOut
}


// signs the user out by marking their session id as undefined
function signOut(req, res) {
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


module.exports = userApis;
