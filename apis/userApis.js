var Users = require('../models/users.js');

// get helper functions
const helperFunctions = require('./helperFunctions.js');
const sanitize = helperFunctions.sanitize;
const removeEmptyFields = helperFunctions.removeEmptyFields;
const verifyUser = helperFunctions.verifyUser;
const removePassword = helperFunctions.removePassword;


const userApis = {
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
    },

    updateAllOnboarding: function (req, res) {
        const info = sanitize(req.body.params.info);
        const goals = sanitize(req.body.params.goals);
        const interests = sanitize(req.body.params.interests);
        const userId = sanitize(req.body.params.userId);
        const verificationToken = sanitize(req.body.params.verificationToken);

        if (userId && verificationToken) {
            // When true returns the updated document
            Users.findById(userId, function (findErr, user) {
                if (findErr) {
                    console.log("Error finding user when updating info during onboarding: ", findErr);
                    res.status(500).send("Server error");
                    return;
                }

                if (!verifyUser(user, verificationToken)) {
                    console.log("Couldn't verify user when trying to update onboarding info.");
                    res.status(401).send("User does not have valid credentials to update info.");
                    return;
                }

                if (info) {
                    // if info exists, try to save it
                    const fullInfo = removeEmptyFields(info);

                    for (const prop in fullInfo) {
                        // only use properties that are not inherent to all objects
                        if (info.hasOwnProperty(prop)) {
                            console.log("updating " + prop + " to ", fullInfo[prop]);
                            user.info[prop] = fullInfo[prop];
                        }
                    }
                }

                // if goals exist, save them
                if (goals) {
                    user.info.goals = goals
                }

                // if interests exist, save them
                if (interests) {
                    user.info.interests = interests;
                }

                user.save(function (saveErr, updatedUser) {
                    if (saveErr) {
                        console.log("Error saving user information when updating info from onboarding: ", saveErr);
                        res.status(500).send("Server error, couldn't save information.");
                        return;
                    }
                    res.send(removePassword(updatedUser));
                });
            })
        } else {
            console.log("Didn't have info or a user id or both.")
            res.status(403).send("Bad request.");
        }
    }
}


module.exports = userApis;
