const Businesses = require('../models/businesses.js');
const Users = require('../models/users.js');
const Skills = require('../models/skills');
const Psychtests = require('../models/psychtests');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const errors = require('./errors');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        sendEmail,
        getFirstName,
        frontEndUser,
        getAndVerifyUser
} = require('./helperFunctions.js');


const adminApis = {
    GET_allSkills,
    GET_skill,
    POST_saveSkill,
    GET_allBusinesses,
    GET_business,
    POST_saveBusiness,
    GET_blankPosition
}


async function POST_saveSkill(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    let skill = sanitize(req.body.skill);

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


async function GET_blankPosition(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user and questions for the psych test
    let user, psychTest;
    try {
        const [foundUser, foundTest] = await Promise.all([
            getAndVerifyUser(userId, verificationToken),
            Psychtests.findOne({})
        ])
        user = foundUser; psychTest = foundTest;
    } catch(getUserOrPsychError) {
        console.log("error getting user or psych test: ", getUserOrPsychError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // user has to be an admin to get a blank position
    if (user.admin !== true) {
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    // create an array of factors and facets with their names so that the position
    // can have ideal performance and growth factors
    const idealFactors = psychTest.factors.map(factor => {
        const idealFacets = factor.facets.map(facet => {
            return {
                name: facet.name,
                facetId: facet._id,
                score: ""
            }
        });
        return {
            name: factor.name,
            factorId: factor._id,
            idealFacets
        };
    });

    // defaults for all position values
    const position = {
        name: "",
        skills: [],
        skillNames: [],
        freeResponseQuestions: [],
        employeesGetFrqs: false,
        length: 60,
        timeAllotted: 14,
        idealFactors,
        growthFactors: idealFactors
    }

    return res.json(position);
}


async function POST_saveBusiness(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    let business = sanitize(req.body.business);
    let businessId;

    try {
        // get the user
        const user = await getAndVerifyUser(userId, verificationToken);
        // if the user isn't an admin, don't let them see all the skills
        if (user.admin !== true) {
            return res.status(403).send(errors.PERMISSIONS_ERROR);
        }

        let promises = [];
        if (Array.isArray(business.adminsToAdd)) {
            business.adminsToAdd.forEach(adminToAdd => {
                try { promises.push(createAdmin(adminToAdd.name, adminToAdd.email, adminToAdd.password, adminToAdd.title, businessId, business.name)); }
                catch(addAdminError) { console.log("error adding admin: ", addAdminError); }
            });
            // wait for all the users to get created
            await Promise.all(promises);
        }

        // TODO: make sure none of the emails provided have already been used for accounts
        // const adminEmails = business.adminsToAdd.map(accAdmin => {
        //
        // });
        // Users.findOne()

        // position attributes that can be updated in this function
        const newAttributes = ["name", "skills", "skillNames", "freeResponseQuestions", "employeesGetFrqs", "length", "timeAllotted", "idealFactors", "growthFactors"];
        // defaults for a new position
        const blankPosition = {
            open: false,
            currentlyHiring: false,
            candidates: [],
            employees: [],
            logo: "hr.png"
        }

        // if it's a new business, create the new business
        if (!business._id) {
            let newBusiness = {};
            newBusiness.name = business.name;
            newBusiness.emailNotifications = {
                time: "1 week",
                numCandidates: 0
            };
            newBusiness.employeeQuestions = [
                {
                    questionBody: "How long have they been at the company? (in years)",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 7
                    }
                },
                {
                    questionBody: "How much longer do you expect them to remain at the company? (in years)",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 7
                    }
                },
                {
                    questionBody: "How often are they late for work per week? (in days)",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 5
                    }
                },
                {
                    questionBody: "How would you rate their job performance?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How efficient are they at getting tasks done?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How often do they take employee leave days for illness or holiday, per year?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How would you rate their quality of work?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How much have they improved or grown since your first day together?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How much more responsibility have they been given since your first day together?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How likely are you to recommend them for a promotion in the next year?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                },
                {
                    questionBody: "How would you rate their potential for improvement and growth?",
                    questionType: "range",
                    range: {
                        lowRange: 0,
                        highRange: 10
                    }
                }
            ]

            newBusiness.positions = business.positions.map(position => {
                let newPosition = JSON.parse(JSON.stringify(blankPosition));

                newAttributes.forEach(attribute => {
                    newPosition[attribute] = position[attribute];
                });

                return newPosition;
            })

            // create the business and get its id
            businessId = (await Businesses.create(newBusiness))._id;
        }

        // otherwise update the old skill
        else {
            businessId = business._id;
            let foundBusiness;
            try {
                foundBusiness = await Businesses.findById(businessId);
            } catch (findBizErr) {
                console.log("error finding business to update: ", findBizErr);
                return res.status(500).send(errors.SERVER_ERROR);
            }

            // update every position
            business.positions.forEach(position => {
                let oldPositionIndex = 0;
                // if this is a position that already existed
                if (position._id) {
                    oldPositionIndex = foundBusiness.positions.findIndex(oldPosition => { return oldPosition._id.toString() === position._id.toString()})
                }
                // if this is a new position, add it
                else {
                    // index will be the index of the newly added position
                    oldPositionIndex = foundBusiness.positions.length;
                    // create a new position
                    foundBusiness.positions.push(JSON.parse(JSON.stringify(blankPosition)));
                }

                // update the position with all the valid new attribute values
                let updatedPosition = foundBusiness.positions[oldPositionIndex];
                newAttributes.forEach(attribute => {
                    updatedPosition[attribute] = position[attribute];
                });

                // go through each updateable position attribute and update it
                newAttributes.forEach(attribute => {
                    foundBusiness.positions[oldPositionIndex][attribute] = updatedPosition[attribute];
                });
            });

            // save the business
            let savedBiz;
            try { savedBiz = await foundBusiness.save(); }
            catch (saveError) {
                console.log("error saving business: ", saveError);
                return res.status(500).send(errors.SERVER_ERROR);
            }
        }

        // now that we are sure to have the business id, create any admins that were added
        let promises = [];
        if (Array.isArray(business.adminsToAdd)) {
            business.adminsToAdd.forEach(adminToAdd => {
                try { promises.push(createAdmin(adminToAdd.name, adminToAdd.email, adminToAdd.password, adminToAdd.title, businessId, business.name)); }
                catch(addAdminError) { console.log("error adding admin: ", addAdminError); }
            });
            // wait for all the users to get created
            await Promise.all(promises);
        }

        // return the business id
        return res.json(businessId);
    } catch (getUserOrUpdateSkillError) {
        console.log("Error updating skill for admin: ", getUserOrUpdateSkillError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


async function createAdmin(name, email, password, title, businessId, businessName) {
    return new Promise(async function(resolve, reject) {
        let user = {name, email, password};

        // --->>  THINGS WE NEED BEFORE THE USER CAN BE CREATED <<---   //
        // if the user has an email address no one else has used before
        let verifiedUniqueEmail = false;
        // if password was set up
        let createdLoginInfo = false;
        // whether we counted the users and created a profile url
        let madeProfileUrl = false;
        // <<-------------------------------------------------------->> //

        // --->>> THINGS WE CAN SET FOR USER WITHOUT ASYNC CALLS <<<--- //
        const NOW = new Date();
        // admin status must be changed in the db directly
        user.admin = false;
        // account admins added this way can log in without verifying email
        user.verified = true;
        // user has just signed up
        user.dateSignedUp = NOW;
        // hasn't had opportunity to do onboarding yet, but we set it to true cuz people don't have to do onboarding yet
        user.hasFinishedOnboarding = true;
        // infinite use, used to verify identify when making calls to backend
        user.verificationToken = crypto.randomBytes(64).toString('hex');
        // due to this being the create admin function we know they are an account admin
        user.userType = "accountAdmin";
        // assuming that this will be the first admin
        user.firstBusinessUser = true;
        // the company that was just created/updated
        user.businessInfo = { businessId, title }
        // <<-------------------------------------------------------->> //

        // --->>       VERIFY THAT USER HAS UNIQUE EMAIL          <<--- //
        Users.find({email: user.email})
        .then(foundUsers => {
            if (foundUsers.length > 0) {
                return reject("An account with that email address already exists.");
            } else {
                // mark that we are good to make this user, then try to do it
                verifiedUniqueEmail = true;
                makeUser();
            }
        })
        .catch(findUserError => {
            console.log("error finding user by email: ", findUserError);
            return reject("error seeing if there were any users with that email");
        });
        // <<-------------------------------------------------------->> //

        // --->> COUNT THE USERS WITH THIS NAME TO ALLOW PROFILE URL CREATION <<--- //
        Users.count({name: user.name})
        .then(count => {
            // create the user's profile url with the count after their name
            const randomNumber = crypto.randomBytes(8).toString('hex');
            user.profileUrl = user.name.split(' ').join('-') + "-" + (count + 1) + "-" + randomNumber;
            madeProfileUrl = true;
            makeUser();
        }).catch (countError => {
            console.log("Couldn't count the number of users: ", countError);
            return reject("Couldn't count the number of users with that name.");
        })
        // <<-------------------------------------------------------->> //

        // --->>            HASH THE USER'S PASSWORD              <<--- //
        const saltRounds = 10;
        bcrypt.hash(user.password, saltRounds, function(hashError, hash) {
            if (hashError) { console.log("hash error: ", hashError); return reject("Error hashing password."); }

            // change the stored password to be the hash
            user.password = hash;
            // mark that we have created verification token and password, then make the user
            createdLoginInfo = true;
            makeUser();
        });
        // <<-------------------------------------------------------->> //

        // --->>           CREATE AND UPDATE THE USER             <<--- //
        async function makeUser() {
            // make sure all pre-reqs to creating user are met
            if (!verifiedUniqueEmail || !createdLoginInfo || !madeProfileUrl) { return; }

            // make the user db object
            try {
                await Users.create(user);
                return resolve(true);
            } catch (createUserError) {
                console.log("Error creating user: ", createUserError);
                return reject("Error creating user.");
            }
        }
        // <<-------------------------------------------------------->> //
    });
}


// get one business so the admin can edit it
async function GET_business(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const businessId = sanitize(req.query.businessId);

    // get the user and the requested skill
    try {
        const businessUserQuery = {
            "$and": [
                { "businessInfo.businessId": businessId },
                { "userType": "accountAdmin" }
            ]
        }
        let [user, foundBusiness, psychTest, accountAdmins] = await Promise.all([
            // get user
            getAndVerifyUser(userId, verificationToken),
            // get all skills
            Businesses.findById(businessId).select("name positions._id positions.name positions.skills positions.skillNames positions.freeResponseQuestions positions.employeesGetFrqs positions.length positions.timeAllotted positions.idealFactors positions.growthFactors"),
            Psychtests.findOne({}),
            Users.find(businessUserQuery).select("name email")
        ]);

        // if the user isn't an admin, don't let them see the business
        if (user.admin !== true) {
            return res.status(403).send(errors.PERMISSIONS_ERROR);
        }

        let business = foundBusiness.toObject();

        // attach all the admins to the business
        business.accountAdmins = accountAdmins;

        // create an object that will allow us to map factor and facet ids to names
        let names = {};
        // for every factor ...
        psychTest.factors.forEach(factor => {
            // ... tell the names object that that factor's id correlates to its name
            names[factor._id] = factor.name;
            // for every facet within that factor ...
            factor.facets.forEach(facet => {
                // ... tell the names object that that facet's id correlates to its name
                names[facet._id] = facet.name;
            });
        });

        // go through every position in the business
        for (let positionIndex = 0; positionIndex < business.positions.length; positionIndex++) {
            let position = business.positions[positionIndex];
            let idealFactors = position.idealFactors;
            let growthFactors = position.growthFactors;
            // go through every ideal factor
            for (let idealFactorIndex = 0; idealFactorIndex < idealFactors.length; idealFactorIndex++) {
                let idealFactor = idealFactors[idealFactorIndex];
                let idealFacets = idealFactor.idealFacets;
                // add the name of the factor to the ideal factor
                business.positions[positionIndex].idealFactors[idealFactorIndex].name = names[idealFactor.factorId];
                for (let idealFacetIndex = 0; idealFacetIndex < idealFacets.length; idealFacetIndex++) {
                    let idealFacet = idealFacets[idealFacetIndex];
                    // add the name of the facet to the ideal facet
                    business.positions[positionIndex].idealFactors[idealFactorIndex].idealFacets[idealFacetIndex].name = names[idealFacet.facetId];
                }
            }

            // go through every ideal growth factor
            for (let growthFactorIndex = 0; growthFactorIndex < growthFactors.length; growthFactorIndex++) {
                let growthFactor = growthFactors[growthFactorIndex];
                let idealFacets = growthFactor.idealFacets;
                // add the name of the factor to the ideal factor
                business.positions[positionIndex].growthFactors[growthFactorIndex].name = names[growthFactor.factorId];
                for (let idealFacetIndex = 0; idealFacetIndex < idealFacets.length; idealFacetIndex++) {
                    let idealFacet = idealFacets[idealFacetIndex];
                    // add the name of the facet to the ideal facet
                    business.positions[positionIndex].growthFactors[growthFactorIndex].idealFacets[idealFacetIndex].name = names[idealFacet.facetId];
                }
            }
        }

        // return the business to the admin
        return res.json(business);
    } catch (getUserOrBusinessError) {
        console.log("Error getting skill for admin: ", getUserOrBusinessError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


// get all the businesses so the admin can get to the edit pages for them
async function GET_allBusinesses(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user and all the businesses
    try {
        const [user, businesses] = await Promise.all([
            // get user
            getAndVerifyUser(userId, verificationToken),
            // get all businesses
            Businesses.find({}).select("name _id")
        ]);

        // if the user isn't an admin, don't let them see all the businesses
        if (user.admin !== true) {
            return res.status(403).send(errors.PERMISSIONS_ERROR);
        }

        // return all the businesses to the admin
        return res.json(businesses);
    } catch (getUserOrBusinessesError) {
        console.log("Error getting businesses for admin: ", getUserOrBusinessesError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


module.exports = adminApis;
