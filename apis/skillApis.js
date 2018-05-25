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
    POST_answerSkillQuestion,
    POST_startOrContinueTest
}


// ----->> START APIS <<----- //


function POST_answerSkillQuestion(req, res) {
    return res.json({newQuestion: {}, finished: false});
}


function POST_startOrContinueTest(req, res) {
    try {
        let user = undefined;
        let skill = undefined;

        const userId = sanitize(req.body.userId);
        const verificationToken = sanitize(req.body.verificationToken);
        const skillUrl = sanitize(req.body.skillUrl);

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
            checkIfStarted();
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
            checkIfStarted();
        })
        .catch(findSkillErr => {
            console.log("Error finding skill by url: ", findSkillErr);
            return res.status(500).send("Server error, try again later.");
        })

        function checkIfStarted() {
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

            const hasEverTakenTest = typeof testIndex === "number" && testIndex >= 0;

            // if the user has never taken this test before, start it for em
            if (!hasEverTakenTest) {
                let newSkillTest = {
                    skillId: skill._id,
                    currentQuestion: {},
                    attempts: []
                }
                // add the new skill test (which has no attempts) to the user
                user.skillTests.push(newSkillTest);
                // we know this is testIndex because it was just pushed
                testIndex = user.skillTests.length - 1;
                // get a start date and a question and errthang
                startNewAttempt(testIndex);
            }

            // if the user has taken this test in the past or is currently taking this test
            else {
                let attempts = user.skillTests[testIndex].attempts;
                let mostRecentAttempt = attempts[attempts.length - 1];
                // if the user is coming back after already having started the test
                if (mostRecentAttempt.inProgress === true) {
                    getCurrentQuestion(testIndex);
                }
                // if the user is starting a new attempt
                else {
                    startNewAttempt(testIndex);
                }
            }

            function startNewAttempt(testIndex) {
                let attemptLevels = skill.levels.map(skillLevel => {
                    return {
                        levelNumber: skillLevel.levelNumber,
                        // empty because the user hasn't answered any questions yet
                        questions: []
                    }
                })
                let newAttempt = {
                    // starting the test NOW
                    inProgress: true,
                    startDate: new Date(),
                    // always start at the first level
                    currentLevel: 1,
                    levels: attemptLevels
                }
                // add the new attempt to the list of attempts
                user.skillTests[testIndex].attempts.push(newAttempt);
                const currentAttemptIndex = user.skillTests[testIndex].attempts.length - 1;

                getNewQuestion(testIndex, currentAttemptIndex);
            }

            // get a new question - for skill tests that hadn't been started before
            async function getNewQuestion(testIndex, currentAttemptIndex) {
                const testLevels = skill.levels;
                // always gonna start at the first level
                const firstLevel = skill.levels[0];
                const testQuestions = firstLevel.questions;

                // get a random question from the firt level
                testQuestionIndex = Math.floor(Math.random() * testQuestions.length);
                testQuestion = testQuestions[testQuestionIndex];
                const currentQuestionForDB = {
                    levelNumber: firstLevel.levelNumber,
                    levelIndex: 0,
                    questionId: testQuestion._id,
                    questionIndex: testQuestionIndex,
                    // starting this question right now
                    startDate: new Date(),
                    correctAnswers: testQuestion.correctAnswers
                }

                // set the current question for the user
                user.skillTests[testIndex].currentQuestion = currentQuestionForDB;

                const questionToReturn = {
                    body: testQuestion.body,
                    options: testQuestion.options,
                    multiSelect: testQuestion.multiSelect
                }

                try {
                    const updatedUser = await user.save();
                } catch(saveErr) {
                    console.log("Error saving user when starting skill test: ", saveErr);
                }

                return res.json({question:questionToReturn, skillName: skill.name});
            }

            // get the question the user left off on
            function getCurrentQuestion(testIndex) {
                // the current question info the user has stored
                const userCurrentQuestion = user.skillTests[testIndex].currentQuestion;
                // the levels with all the question info
                const testLevels = skill.levels;
                // get the current question's level so we can get the actual question
                // with the body and options
                let currentTestLevelIndex = userCurrentQuestion.levelIndex
                let currentTestLevel = testLevels[currentTestLevelIndex];
                // make sure we actually have the right test level
                if (currentTestLevel.levelNumber !== userCurrentQuestion.levelNumber) {
                    currentTestLevelIndex = testLevels.findIndex(level => {
                        return level.levelNumber === userCurrentQuestion.levelNumber;
                    });
                    // couldn't find the test level from db
                    if (!currentTestLevelIndex || currentTestLevelIndex < 0) {
                        console.log("Couldn't find right test level. Looking for level number: ", userCurrentQuestion.levelNumber);
                        return res.status(500).send("Server error, try again later or contact Moonshot or employer.");
                    }
                    // found it, set it
                    else { currentTestLevel = testLevels[currentTestLevelIndex]; }
                }

                // repeat the process to get the question info we want from the level
                const testQuestions = currentTestLevel.questions;
                // get the current question
                let currentTestQuestionIndex = userCurrentQuestion.questionIndex;
                console.log('userCurrentQuestion: ', userCurrentQuestion);
                let currentTestQuestion;
                try {
                    currentTestQuestion = testQuestions[currentTestQuestionIndex];
                } catch (err) {
                    currentTestQuestion = {_id: "-1" }
                }
                // make sure we actually have the right test level
                if (currentTestQuestion._id.toString() !== userCurrentQuestion.questionId.toString()) {
                    currentTestQuestionIndex = testQuestions.findIndex(q => {
                        return q._id.toString() === userCurrentQuestion.questionId.toString();
                    });
                    // couldn't find the test question from db
                    if (!currentTestQuestionIndex || currentTestQuestionIndex < 0) {
                        console.log("Couldn't find right test question. Looking for question id: ", userCurrentQuestion.questionId);
                        return res.status(500).send("Server error, try again later or contact Moonshot or employer.");
                    }
                    // found it, set it
                    else { currentTestQuestion = testLevels[currentTestQuestionIndex]; }
                }

                // the info that is actually needed by the front end for the user to answer the question
                const currentQuestionToReturn = {
                    body: currentTestQuestion.body,
                    options: currentTestQuestion.options,
                    multiSelect: currentTestQuestion.multiSelect
                }
                return res.json({question: currentQuestionToReturn, skillName: skill.name});
            }

            // // if the user has taken the test before
            // else {
            //     // the user's skill test object - has all their answers and attempts
            //     userSkill = user.skillTests[skillIndex];
            //     let attempts = userSkill.attempts;
            //     // check if the attempts array exists at all
            //     if (typeof attempts === "undefined") {
            //         userSkill.attempts = [];
            //     }
            //
            //     // user is not currently taking the test - needs to start it
            //     if (attempts.length === 0) {
            //
            //     }
            //
            //     else {
            //         // last stored attempt is most recent attempt
            //         let mostRecentAttempt = attempts[attempts.length];
            //
            //         // if the user is currently taking the test
            //         if (mostRecentAttempt.inProgress === true) {
            //
            //         }
            //
            //         // if the user has not yet started the most recent attempt
            //         else {
            //
            //         }
            //     }
            // }
            //
            // if (typeof testIndex !== "number" || testIndex < 0) {
            //     // create the test object starting from the smallest part
            //     // (sub skills), and working up
            //     let levels = skill.levels.map(level => {
            //         return {
            //             levelNumber: level.levelNumber,
            //             // questions is empty because they haven't answered any questions yet
            //             questions: []
            //         };
            //     });
            //     let currentAttempt = {
            //         inProgress: true,
            //         startDate: new Date(),
            //         // always start at level one
            //         currentLevel: 1,
            //         levels
            //     }
            //     let newTest = {
            //         skillId: skillTest._id,
            //         attempts: [ currentAttempt ],
            //     };
            //
            //     // always start at the first level
            //     const currentLevelNumber = 1;
            //     const currentLevelIndex = skill.levels.findIndex(level => {
            //         return level === currentLevelNumber;
            //     });
            //     if (typeof currentLevelIndex !== "number" || currentLevelIndex < 0) {
            //         console.log("Couldn't get first level index.");
            //         return res.status(500).send("Invalid test.");
            //     }
            //     const levelFromTest = skill.levels[currentLevelIndex];
            //     const questionsFromTest = levelFromTest.questions;
            //     const questionIndex = Math.floor(Math.random() * questionsFromTest.length);
            //     const questionFromTest = questionsFromTest[questionIndex];
            //
            //     // what gets stored in the user object in the db
            //     let currentQuestion = {
            //         levelNumber: currentLevelNumber,
            //         levelIndex: currentLevelIndex,
            //         questionId: questionFromTest._id,
            //         questionIndex: questionIndex,
            //         startDate: new Date(),
            //         correctAnswers: questionFromTest.correctAnswers
            //     }
            //
            //     // what gets return to the user on the front end
            //     const currentQuestionToReturn = {
            //         body: questionFromTest.body,
            //         options: questionFromTest.options,
            //         multiSelect: questionFromTest.multiSelect
            //     }
            //
            //     newTest.currentQuestion = currentQuestion;
            //
            //     // add the test to their list of skill tests
            //     user.skillTests.push(newTest);
            //
            //     return res.json(currentQuestionToReturn);
            // }
            //
            // // if they are currently taking it, return the question they're currently on
            // else {
            //
            //
            //     return res.json(currentQuestionToReturn);
            // }
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
