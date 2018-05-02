// get helper functions
const helperFunctions = require('./helperFunctions.js');
const sanitize = helperFunctions.sanitize;


const userApis = {
    // remove html tags from a variable (any type) to prevent code injection
    signOut: function (req, res) {
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
}


module.exports = userApis;
