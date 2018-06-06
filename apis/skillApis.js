const Users = require('../models/users.js');
const Skills = require('../models/skills.js');
const Businesses = require('../models/businesses.js');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser,
        randomInt,
        frontEndUser
} = require('./helperFunctions.js');


const businessApis = {
    //GET_skillByUrl,
    POST_answerSkillQuestion,
    POST_startOrContinueTest
}


// ----->> START APIS <<----- //


function POST_answerSkillQuestion(req, res) {
    let user = undefined;
    let skill = undefined;

    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const skillUrl = sanitize(req.body.skillUrl);
    const answerIds = sanitize(req.body.answerIds);

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
        recordAnswer();
    })
    .catch(findUserErr => {
        console.log("Error finding user in the db when trying to get a skill by url: ", findUserErr);
        return res.status(500).send("Server error, try again later.");
    })

    // get the skill
    // try using the skillUrl as an id because sometimes it comes in that way
    Skills.findById(skillUrl)
    .then(foundSkill => {
        if (foundSkill) {
            skill = foundSkill;
            recordAnswer();
        }
        else { throw "Couldn't find skill using url as id."; }
    })
    .catch(noSkillFromUrlError => {
        console.log(noSkillFromUrlError);
        Skills.find({url: skillUrl})
        .then(foundSkills => {
            if (foundSkills.length === 0 || !foundSkills[0]) { return res.status(404).send("Invalid skill."); }
            skill = foundSkills[0];
            recordAnswer();
        })
        .catch(findSkillErr => {
            console.log("Error finding skill by url: ", findSkillErr);
            return res.status(500).send("Server error, try again later.");
        })
    });

    async function recordAnswer() {
        if (!user || !skill) { return }

        // see if user has already taken this test/is currently taking it
        let userSkillIndex = user.skillTests.findIndex(skillTest => {
            return skillTest.skillId.toString() === skill._id.toString();
        });

        let userSkill = user.skillTests[userSkillIndex];
        // most recent (last) attempt is current one
        let attemptIndex = userSkill.attempts.length - 1;
        let attempt = userSkill.attempts[attemptIndex];
        let userCurrentQuestion = userSkill.currentQuestion;

        // record the answer in the user db
        let userLevelIndex = userCurrentQuestion.levelIndex;
        let userLevel = attempt.levels[userLevelIndex];
        if (userLevel.levelNumber !== userCurrentQuestion.levelNumber) {
            userLevelIndex = attempt.levels.findIndex(level => {
                return level.levelNumber === userCurrentQuestion.levelNumber;
            })
            userLevel = attempt.levels[userLevelIndex];
        }

        const correctAnswers = userCurrentQuestion.correctAnswers;
        let isCorrect = true;
        const numCorrectAnswers = correctAnswers.length;
        console.log("correctAnswers: ", correctAnswers);
        for (let correctAnswerIndex = 0; correctAnswerIndex < numCorrectAnswers; correctAnswerIndex++) {
            const correctAnswerId = correctAnswers[correctAnswerIndex].toString();
            console.log("correct answer id: ", correctAnswerId);
            // if this correct answer isn't included within the user's list of answers,
            // mark them as incorrect
            if (!answerIds.some(answerId => {
                return answerId.toString() === correctAnswerId.toString();
            })) {
                isCorrect = false;
                break;
            }
        }

        const startDate = userCurrentQuestion.startDate;
        const endDate = new Date();
        const totalTime = endDate.getTime() - startDate.getTime();

        userLevel.questions.push({
            questionId: userCurrentQuestion.questionId,
            isCorrect, answerIds, startDate, endDate, totalTime
        });
        // save this info back to the user object
        attempt.levels[userLevelIndex] = userLevel;
        userSkill.attempts[attemptIndex] = attempt;
        user.skillTests[userSkillIndex] = userSkill;

        // see if the user is done with the test
        // TODO make a legit way of seeing if the test is over
        // right now it just finishes if you answer one question
        if (true) {
            finishTest(userSkill, userSkillIndex, attempt, attemptIndex);
        }

        else { getNewQuestion(userSkillIndex, userLevelIndex, attempt, isCorrect, userSkill, attemptIndex); }
    }

    async function getNewQuestion(userSkillIndex, userLevelIndex, attempt, isCorrect, userSkill, attemptIndex) {
        // get a new question
        let newUserLevelIndex = userLevelIndex;
        // right answer and more levels exist
        if (isCorrect && userLevelIndex < attempt.levels.length - 1) {
            newUserLevelIndex++;
        }
        // wrong answer and lower levels exist
        else if (!isCorrect && userLevelIndex > 0) {
            newUserLevelIndex--;
        } // level has to stay the same otherwise
        let newUserLevel = attempt.levels[newUserLevelIndex];

        // get the test level
        const testLevelIndex = skill.levels.findIndex(level => {
            return level.levelNumber === newUserLevel.levelNumber;
        });
        const testLevel = skill.levels[testLevelIndex];

        // TODO: make this actually test if the percent of questions is small enough,
        // and if it is not, make it make a list of unused questions to pick from

        // see if the percent of used questions is small enough that we can just
        // get random questions until one has not been used

        const testLevelQuestions = testLevel.questions;
        const numTotalQuestions = testLevelQuestions.length;
        let questionIndex = 0;
        let questionId = undefined;
        let question = undefined;
        // get random indexes of questions until one of the indexes is of a question
        // that has not yet been answered
        let counter = 0;
        do {
            counter++;
            // if a question could not be found, finish the test
            if (counter > 100) {
                return finishTest(userSkill, userSkillIndex, attempt, attemptIndex);
            }
            questionIndex = randomInt(0, numTotalQuestions - 1);
            question = testLevelQuestions[questionIndex];
            questionId = question._id.toString();
        } while (newUserLevel.questions.some(answeredQuestion => answeredQuestion.questionId.toString() === questionId));

        const currentQuestionToStore = {
            levelNumber: testLevel.levelNumber,
            levelIndex: testLevelIndex,
            questionId,
            questionIndex,
            startDate: new Date(),
            correctAnswers: question.correctAnswers
        }

        userSkill.currentQuestion = currentQuestionToStore;
        // save this info and the previous new info into the user's current skill
        user.skillTests[userSkillIndex] = userSkill;

        const currentQuestionToReturn = {
            body: question.body,
            options: question.options,
            multiSelect: question.multiSelect
        }

        try {
            await user.save();
        } catch (saveUserErr) {
            console.log("Error saving user when answering skill question: ", saveUserErr);
            return res.status(500).send("Server error.");
        }

        res.json({updatedUser: frontEndUser(user), question: currentQuestionToReturn, skillName: skill.name, finished: false});
    }

    async function finishTest(userSkill, userSkillIndex, attempt, attemptIndex) {
        // attempt is over
        attempt.endDate = new Date();
        attempt.totalTime = attempt.endDate.getTime() - attempt.startDate.getTime();
        attempt.inProgress = false;

        // get rid of the current question
        userSkill.currentQuestion = undefined;

        // give the user a score
        // TODO actually score the user
        score = randomInt(85, 115);
        userSkill.mostRecentScore = score;
        attempt.score = score;

        // save all the new info
        userSkill.attempts[attemptIndex] = attempt;
        user.skills[userSkillIndex] = userSkill;

        // see if the user is doing an application to a position
        if (user.positionInProgress) {
            // get the position in progress
            const positionIndex = user.positions.findIndex(pos => {
                return pos.positionId.toString() === user.positionInProgress.toString();
            });
            // if the position in progress is one that the user actually signed up for
            if (typeof positionIndex === "number" && positionIndex >= 0) {
                // get the actual user position, not just the id
                let position = user.positions[positionIndex];

                // see if the position in progress includes this skill test
                const skillIdString = userSkill.skillId.toString();
                const testIndex = position.skillTestIds.findIndex(posSkillTestId => {
                    return posSkillTestId.toString() === skillIdString;
                });
                // if so, advance the progress of the position
                if (typeof testIndex === "number" && testIndex >= 0) {
                    // move the skill that was just completed to the beginning
                    // of the skills array
                    const completedId = position.skillTestIds.splice(testIndex, 1)[0];
                    position.skillTestIds.unshift(completedId);

                    // increment the skill index
                    position.testIndex++;

                    // if the test index is greater than or equal to the number of tests,
                    // user is done with skills section of the application
                    if (position.testIndex >= position.skillTestIds.length) {
                        // if there are no multiple choice questions, user is finished
                        if (!position.freeResponseQuestions || position.freeResponseQuestions.length === 0) {
                            // user is no longer taking a position evaluation
                            user.positionInProgress = undefined;

                            let business;
                            try {
                                business = await Businesses.findById(position.businessId);

                                // update the business to say that they have a user who has completed their application
                                let positionIndex = business.positions.findIndex(bizPos => {
                                    return bizPoz._id.toString() === user.positionId.toString();
                                });

                                let businessPos = business.positions[positionIndex];
                                // if the business doesn't contain the current user as an applicant already, add them
                                if (!businessPos.candidates.some(candidateId => {
                                    return candidateId.toString() === user._id.toString();
                                })) {
                                    businessPos.candidates.push(user._id);
                                }
                                // update the business with new completions and users in progress counts
                                if (typeof businessPos.completions !== "number") { businessPos.completions = 0; }
                                if (typeof businessPos.usersInProgress !== "number") { businessPos.usersInProgress = 1; }
                                businessPos.completions++;
                                businessPos.usersInProgress--;
                                business.positions[positionIndex] = businessPos;

                                try {
                                    await business.save()
                                } catch (saveBizError) {
                                    console.log("ERROR SAVING BUSINESS WHEN USER FINISHED APPLICATION: ", saveBizError);
                                }
                            } catch (updateBizWithCompletionError) {
                                console.log("ERROR SAVING BUSINESS WHEN USER FINISHED APPLICATION: ", updateBizWithCompletionError);
                            }
                        }
                    }

                    // make sure the position gets saved with the new info
                    user.positions[positionIndex] = position;
                }
            }

            // if the position in progress is not included in the user's positions,
            // something is very wrong; get rid of it
            else {
                user.positionInProgress = undefined;
            }
        }

        try {
            await user.save();
        } catch (saveUserError) {
            console.log("Error saving user when trying to finish test: ", saveUserError);
            return res.status(500).send("Server error.");
        }

        return res.json({finished: true, updatedUser: frontEndUser(user)});
    }
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
        });

        // get the skill
        // try using the skillUrl as an id because sometimes it comes in that way
        Skills.findById(skillUrl)
        .then(foundSkill => {
            if (foundSkill) {
                skill = foundSkill;
                checkIfStarted();
            }
            else { throw "Couldn't find skill using url as id."; }
        })
        .catch(noSkillFromUrlError => {
            console.log(noSkillFromUrlError);
            Skills.find({url: skillUrl})
            .then(foundSkills => {
                if (foundSkills.length === 0 || !foundSkills[0]) { return res.status(404).send("Invalid skill."); }
                skill = foundSkills[0];
                checkIfStarted();
            })
            .catch(findSkillErr => {
                console.log("Error finding skill by url: ", findSkillErr);
                return res.status(500).send("Server error, try again later.");
            })
        });



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

                return res.json({question: questionToReturn, skillName: skill.name, finished: false});
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
                return res.json({question: currentQuestionToReturn, skillName: skill.name, finished: false});
            }
        }
    } catch(miscError) {
        console.log("Error getting skill by url: ", miscError);
        if (typeof res === "object" && typeof res.status === "function") {
            return res.status(500).send("Server error");
        }
    }
}


// function GET_skillByUrl(req, res) {
//     try {
//         let user = undefined;
//         let skill = undefined;
//
//         const userId = sanitize(req.query.userId);
//         const verificationToken = sanitize(req.query.verificationToken);
//         const skillUrl = sanitize(req.query.skillUrl);
//
//         if (!userId || !verificationToken || !skillUrl) {
//             console.log("userId: ", userId);
//             return res.status(400).send("Not enough arguments provided.");
//         }
//
//         // get the user
//         Users.findById(userId)
//         .then(foundUser => {
//             // ensure correct user was found and that they have permissions
//             if (!foundUser) { return res.status(404).send("Could not find current user."); }
//             if (foundUser.verificationToken !== verificationToken) {
//                 return res.status(403).send("Invalid user credentials.");
//             }
//
//             user = foundUser;
//             returnSkill();
//         })
//         .catch(findUserErr => {
//             console.log("Error finding user in the db when trying to get a skill by url: ", findUserErr);
//             return res.status(500).send("Server error, try again later.");
//         })
//
//         // get the skill
//         Skills.find({url: skillUrl})
//         .then(foundSkills => {
//             if (foundSkills.length === 0) { return res.status(404).send("Invalid skill."); }
//             skill = foundSkills[0];
//             returnSkill();
//         })
//         .catch(findSkillErr => {
//             console.log("Error finding skill by url: ", findSkillErr);
//             return res.status(500).send("Server error, try again later.");
//         })
//
//         function returnSkill() {
//             // haven't yet found either the skill or user from the db
//             if (!user || !skill) { return; }
//
//             return res.json(skill);
//         }
//     } catch(miscError) {
//         console.log("Error getting skill by url: ", miscError);
//         if (typeof res === "object" && typeof res.status === "function") {
//             return res.status(500).send("Server error");
//         }
//     }
// }


// ----->> END APIS <<----- //


module.exports = businessApis;
