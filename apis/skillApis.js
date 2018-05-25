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
            if (!user.skillTests) {
                user.skillTests = [];
            }

            // see if user has already taken this test/is currently taking it
            let testIndex = user.skillTests.findIndex(skillTest => {
                return skillTest.skillId.toString() === skill._id.toString();
            });

            const hasEverTakenTest = typeof testIndex === "number" && testIndex > 0;

            // if the user has never taken the test before, start it for em
            if (!hasEverTakenTest) {
                initializeTest();
            }

            // if the user has taken the test before
            else {
                // the user's skill test object - has all their answers and attempts
                userSkill = user.skillTests[skillIndex];
                let attempts = userSkill.attempts;
                // check if the attempts array exists at all
                if (typeof attempts === "undefined") {
                    userSkill.attempts = [];
                }

                // user is not currently taking the test - needs to start it
                if (attempts.length === 0) {

                }

                else {
                    // last stored attempt is most recent attempt
                    let mostRecentAttempt = attempts[attempts.length];

                    // if the user is currently taking the test
                    if (mostRecentAttempt.inProgress === true) {

                    }

                    // if the user has not yet started the most recent attempt
                    else {

                    }
                }
            }

            if (typeof testIndex !== "number" || testIndex < 0) {
                // create the test object starting from the smallest part
                // (sub skills), and working up
                let levels = skill.levels.map(level => {
                    return {
                        levelNumber: level.levelNumber,
                        // questions is empty because they haven't answered any questions yet
                        questions: []
                    };
                });
                let currentAttempt = {
                    inProgress: true,
                    startDate: new Date(),
                    // always start at level one
                    currentLevel: 1,
                    levels
                }
                let newTest = {
                    skillId: skillTest._id,
                    attempts: [ currentAttempt ],
                };

                // always start at the first level
                const currentLevelNumber = 1;
                const currentLevelIndex = skill.levels.findIndex(level => {
                    return level === currentLevelNumber;
                });
                if (typeof currentLevelIndex !== "number" || currentLevelIndex < 0) {
                    console.log("Couldn't get first level index.");
                    return res.status(500).send("Invalid test.");
                }
                const levelFromTest = skill.levels[currentLevelIndex];
                const questionsFromTest = levelFromTest.questions;
                const questionIndex = Math.floor(Math.random() * questionsFromTest.length);
                const questionFromTest = questionsFromTest[questionIndex];

                // what gets stored in the user object in the db
                let currentQuestion = {
                    levelNumber: currentLevelNumber,
                    levelIndex: currentLevelIndex,
                    questionId: questionFromTest._id,
                    questionIndex: questionIndex,
                    startDate: new Date(),
                    correctAnswers: questionFromTest.correctAnswers
                }

                // what gets return to the user on the front end
                const currentQuestionToReturn = {
                    body: questionFromTest.body,
                    options: questionFromTest.options,
                    multiSelect: questionFromTest.multiSelect
                }

                newTest.currentQuestion = currentQuestion;

                // add the test to their list of skill tests
                user.skillTests.push(newTest);

                return res.json(currentQuestionToReturn);
            }

            // if they are currently taking it, return the question they're currently on
            else {


                return res.json(currentQuestionToReturn);
            }
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
