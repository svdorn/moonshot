const Users = require('../models/users.js');
const Skills = require('../models/skills.js');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser
} = require('./helperFunctions.js');


const businessApis = {
    GET_skillByUrl,
    POST_answerSkillQuestion
}


// ----->> START APIS <<----- //


function POST_answerSkillQuestion(req, res) {
    return res.json({newQuestion: {}, finished: false});
}


function POST_startSkillEval(req, res) {
    try {
        let user = undefined;
        let skill = undefined;

        const userId = sanitize(req.query.userId);
        const verificationToken = sanitize(req.query.verificationToken);
        const skillUrl = sanitize(req.query.skillUrl);

        if (!userId || !verificationToken || !skillUrl) {
            return res.status(400).send("Not enough arguments provided.");
        }

        // get the user
        Users.findById(userId)
        .then(foundUser => {
            // ensure correct user was found and that they have permissions
            if (!foundUser) { return res.status(404).send("Could not find current user."); }
            if (foundUser.verificationToken !== verificationToken) {
                return res.status(403).send("Invalid user credentials.");
            }

            user = foundUser;
            startTest();
        })
        .catch(findUserErr => {
            console.log("Error finding user in the db when trying to get a skill by url: ", findUserErr);
            return res.status(500).send("Server error, try again later.");
        })

        // get the skill
        Skills.find({url: skillUrl})
        .then(foundSkills => {
            if (foundSkills.length === 0) { return res.status(404).send("Invalid skill."); }
            skill = foundSkills[0];
            startTest();
        })
        .catch(findSkillErr => {
            console.log("Error finding skill by url: ", findSkillErr);
            return res.status(500).send("Server error, try again later.");
        })

        function startTest() {
            // haven't yet found either the skill or user from the db
            if (!user || !skill) { return; }

            // make sure the user has a place to store their answers
            if (!user.skillsTest) {
                user.skillsTests = [];
            }



            return res.json(skill);
        }
    } catch(miscError) {
        console.log("Error getting skill by url: ", miscError);
        if (typeof res === "object" && typeof res.status === "function") {
            return res.status(500).send("Server error");
        }
    }
}


function GET_skillByUrl(req, res) {
    try {
        let user = undefined;
        let skill = undefined;

        const userId = sanitize(req.query.userId);
        const verificationToken = sanitize(req.query.verificationToken);
        const skillUrl = sanitize(req.query.skillUrl);

        if (!userId || !verificationToken || !skillUrl) {
            console.log("userId: ", userId);
            return res.status(400).send("Not enough arguments provided.");
        }

        // get the user
        Users.findById(userId)
        .then(foundUser => {
            // ensure correct user was found and that they have permissions
            if (!foundUser) { return res.status(404).send("Could not find current user."); }
            if (foundUser.verificationToken !== verificationToken) {
                return res.status(403).send("Invalid user credentials.");
            }

            user = foundUser;
            returnSkill();
        })
        .catch(findUserErr => {
            console.log("Error finding user in the db when trying to get a skill by url: ", findUserErr);
            return res.status(500).send("Server error, try again later.");
        })

        // get the skill
        Skills.find({url: skillUrl})
        .then(foundSkills => {
            if (foundSkills.length === 0) { return res.status(404).send("Invalid skill."); }
            skill = foundSkills[0];
            returnSkill();
        })
        .catch(findSkillErr => {
            console.log("Error finding skill by url: ", findSkillErr);
            return res.status(500).send("Server error, try again later.");
        })

        function returnSkill() {
            // haven't yet found either the skill or user from the db
            if (!user || !skill) { return; }

            return res.json(skill);
        }
    } catch(miscError) {
        console.log("Error getting skill by url: ", miscError);
        if (typeof res === "object" && typeof res.status === "function") {
            return res.status(500).send("Server error");
        }
    }
}


// ----->> END APIS <<----- //


module.exports = businessApis;
