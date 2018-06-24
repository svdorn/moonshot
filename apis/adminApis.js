var Businesses = require('../models/businesses.js');
var Employers = require('../models/employers.js');
var Users = require('../models/users.js');
const Skills = require('../models/skills');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const errors = require('./errors');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser,
        userForAdmin,
        getFirstName,
        frontEndUser,
        getAndVerifyUser
} = require('./helperFunctions.js');


const adminApis = {
    POST_alertLinkClicked,
    POST_business,
    GET_info,
    GET_allSkills,
    GET_skill,
    POST_saveSkill
}


async function POST_saveSkill(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const skill = sanitize(req.body.skill);

    // get the user and the requested skill
    let dbSkill;
    try {
        // get the user
        const user = await getAndVerifyUser(userId, verificationToken);
        // if the user isn't an admin, don't let them see all the skills
        if (user.admin !== true) {
            return res.status(403).send(errors.PERMISSIONS_ERROR);
        }

        // if it's a new skill, create and return the new skill
        if (!skill._id) {
            // count all the skills with the same name ...
            const skillCount = await Skills.count({name: skill.name});
            // ... and generate a random number ...
            const randomNumber = crypto.randomBytes(4).toString('hex');
            // ... so that we can make the skill url
            skill.url = `${skill.name}-${skillCount}-${randomNumber}`;
            // create skill and return its id
            return res.json(await Skills.create(skill));
        }

        // otherwise update the old skill
        else {
            // find the skill by id
            const findQuery = { "_id": mongoose.Types.ObjectId(skill._id) };
            // update all admin-changeable aspects of the skill
            const updateQuery = {
                $set: {
                    "name": skill.name,
                    "levels": skill.levels
                }
            }
            // return the new document after update
            const options = { returnNewDocument: true };

            // update skill and return its id
            return res.json(await Skills.findOneAndUpdate(findQuery, updateQuery, options));
        }
    } catch (getUserOrUpdateSkillError) {
        console.log("Error updating skill for admin: ", getUserOrUpdateSkillError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


// get one skill so the admin can edit it
async function GET_skill(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const skillId = sanitize(req.query.skillId);

    console.log("skillId: ", skillId);

    // get the user and the requested skill
    try {
        const [user, skill] = await Promise.all([
            // get user
            getAndVerifyUser(userId, verificationToken),
            // get all skills
            Skills.findById(skillId)
        ]);

        // if the user isn't an admin, don't let them see all the skills
        if (user.admin !== true) {
            return res.status(403).send(errors.PERMISSIONS_ERROR);
        }

        // return the skill to the admin
        return res.json(skill);
    } catch (getUserOrSkillsError) {
        console.log("Error getting skill for admin: ", getUserOrSkillsError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


// get all the skills so the admin can get to the edit pages for them
async function GET_allSkills(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user and all the skills
    try {
        const [user, skills] = await Promise.all([
            // get user
            getAndVerifyUser(userId, verificationToken),
            // get all skills
            Skills.find({}).select("name _id")
        ]);

        // if the user isn't an admin, don't let them see all the skills
        if (user.admin !== true) {
            return res.status(403).send(errors.PERMISSIONS_ERROR);
        }

        // return all the skills to the admin
        return res.json(skills);
    } catch (getUserOrSkillsError) {
        console.log("Error getting skills for admin: ", getUserOrSkillsError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


function POST_alertLinkClicked(req, res) {
    const name = sanitize(req.body.params.name);
    const id = sanitize(req.body.params.userId);
    const link = sanitize(req.body.params.link);

    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io"];
    let subject = 'Someone just clicked the NWM Culture Index Link';
    let content = "<div>"
        + "<h3>Send an email to Northwestern Mutual (Preston) telling him NOT to interview this person until we give him the go-ahead. Make sure this is the right link, it's possible that this email hasn't been updated in the codebase yet but there are other links that you'll need to be notified of.</h3>"
        + "<p>User's Name: "
        + name
        + "</p>"
        + "<p>User's id: "
        + id
        + "</p>"
        + "<p>Link that was clicked: "
        + link
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            return res.json(true);
        } else {
            console.log("ERROR SENDING EMAIL SAYING THAT THE NWM LINK WAS CLICKED");
            return res.json(false);
        }
    });
}


async function POST_business(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const businessName = sanitize(body.businessName);
    const initialUserName = sanitize(body.initialUserName);
    const initialUserPassword = sanitize(body.initialUserPassword);
    const initialUserEmail = sanitize(body.initialUserEmail);

    // validate admin is admin user
    const isAdmin = await verifyAdmin(userId, verificationToken);
    if (!isAdmin) {
        return res.status(403).send("You do not have permission to add businesses.");
    }

    try {
        // check if another business with that name already exists
        const businessNameQuery = {name: businessName};
        const foundBiz = await Businesses.findOne(businessNameQuery);

        // business already exists with that name
        if (foundBiz) {
            return res.status(400).send("A business already exists with that name. Try a different name.");
        }

        // count the businesses so we can make a unique business code
        let businessCount = 0;
        try {
            businessCount = await Businesses.count({});
        } catch (countError) {
            console.log("error counting businesses: ", countError);
            return res.status(500).send("Error counting businesses.");
        }

        // make the unique code
        const HEX = 16;
        let code = businessCount.toString(HEX);
        // add extra zeroes to the beginning so all codes are the same length
        const END_CODE_LENGTH = 6;
        while (code.length < END_CODE_LENGTH) {
            code = "0" + code;
        }
        // add some randomness to the code
        code = crypto.randomBytes(1).toString('hex') + code;

        // no business exists with that name, can go ahead and make new business
        const newBusiness = {
            name: businessName,
            code
        };

        // make the business in the db
        let createdBusiness = await Businesses.create(newBusiness);

        // check if a user (business- or non-business-) with the email provided
        // already exists
        const userEmailQuery = {email: initialUserEmail};
        getUserByQuery(userEmailQuery, function(findUserErr, foundUser) {
            // error looking for user by email
            if (findUserErr) {
                console.log("Error looking for a user by email: ", findUserErr);
                return res.json("Successful business creation, but couldn't create initial user.");
            }
            // user found with that email so can't create it
            else if (foundUser) {
                return res.json("Successful business creation, but user with that email already exists.");
            }

            // can create the initial user

            // function that will create employer and save them to the business
            // once the business has been created
            // executes right after creation once hash as been made
            const createEmployerWithPassword = async (createHashErr, hash) => {
                const newEmployer = {
                    name: initialUserName,
                    email: initialUserEmail,
                    password: hash,
                    userType: "employer",
                    verificationToken: crypto.randomBytes(64).toString('hex'),
                    verified: true,
                    company: {
                        name: createdBusiness.name,
                        companyId: createdBusiness._id
                    }
                };
                // create the employer
                try {
                    let createdEmployer = await Employers.create(newEmployer);

                    // ensure the business has a list of business user ids
                    if (!Array.isArray(createdBusiness.businessUserIds)) {
                        createdBusiness.employerIds = [];
                    }
                    // add the employer to the business' list of recruiters
                    createdBusiness.employerIds.push(createdEmployer._id);

                    try {
                        // save the business with the new user in it
                        await createdBusiness.save();
                        // everything succeeded
                        return res.json("Success!");
                    }
                    // error saving employer to business' array of business user ids
                    catch (saveBizUserIdsErr) {
                        console.log("error saving employer to business' array of business user ids: ", saveBizUserIdsErr);
                        return res.json("Successful business creation but error associating new business user with business.");
                    }
                }
                // error creating the new user
                catch (createEmployerErr) {
                    console.log("Error creating new employer: ", createEmployerErr);
                    return res.json("Successful business creation, but could not create initial user.");
                }
            }

            // hash password and create the employer
            const SALT_ROUNDS = 10;
            bcrypt.hash(initialUserPassword, SALT_ROUNDS, createEmployerWithPassword);
        });
    }
    // error at some point in business creation
    catch (dbError) {
        console.log("Database error during creation: ", dbError);
        return res.status(500).send("Server error, try again later.");
    }
}


function GET_info(req, res) {
    const query = sanitize(req.query);
    const _id = query.userId;
    const verificationToken = query.verificationToken;

    if (!_id || !verificationToken) {
        console.log("No user id or verification token for user trying to get admin info.");
        return res.status(403).send("User does not have valid credentials.");
    }

    const adminQuery = { _id, verificationToken };

    Users.findOne(adminQuery, function(err, user) {
        if (err) {
            console.log("Error finding admin user: ", err);
            return res.status(500).send("Error finding current user in db.");
        } else if (!user || !user.admin || !(user.admin === "true" || user.admin === true) ) {
            return res.status(403).send("User does not have valid credentials.");
        } else {
            Users.find()
            .sort({name: 1})
            .select("name email profileUrl")
            .exec(function (err2, users) {
                if (err2) {
                    return res.status(500).send("Not able to get users for admin.");
                } else if (users.length == 0) {
                    return res.status(500).send("No users found for admin.");
                } else {
                    return res.json(users);
                }
            });
        }
    });
}


// VERIFY THAT THE GIVEN USER IS AN ADMIN FROM USER ID AND VERIFICATION TOKEN
function verifyAdmin(userId, verificationToken) {
    // async call, lets us use await
    return new Promise((resolve, reject) => {
        Users.findById(userId, function(findUserErr, foundUser) {
            // db error finding the user
            if (findUserErr) {
                console.log("Error finding admin user by id: ", findUserErr);
                resolve(false);
            }
            // no user found with that id, so can't be an admin user
            else if (!foundUser) {
                resolve(false);
            }
            // user found
            else {
                // wrong verification token, user does not have valid credentials
                if (foundUser.verificationToken != verificationToken) {
                    console.log("Someone tried to get verify an admin user with the wrong verification token. User is: ", foundUser);
                    resolve(false);
                }
                // return whether the user is an admin
                else {
                    resolve(foundUser.admin);
                }
            }
        });
    });
}


module.exports = adminApis;
