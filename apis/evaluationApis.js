const Users = require('../models/users.js');
const Psychtests = require('../models/psychtests.js');
const Psychquestions = require('../models/psychquestions.js');
const GCA = require('../models/cognitivequestions.js');
const Skills = require('../models/skills.js');
const Businesses = require('../models/businesses.js');
const Adminqs = require("../models/adminqs");

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require("mongoose");

const errors = require('./errors.js');

// get helper functions
const { sanitize,
        verifyUser,
        sendEmail,
        getAndVerifyUser,
        getFirstName,
        getUserFromReq,
        frontEndUser,
        validArgs,
        logArgs,
        logError,
        randomInt,
        shuffle
} = require('./helperFunctions');

const { calculatePsychScores } = require("./psychApis");


module.exports = {};


// answer a question that is shown on the administrative questions portion of an evaluation
module.exports.POST_answerAdminQuestion = async function(req, res) {
    let { userId, verificationToken, businessId, positionId, sliderAnswer, selectedId, selectedText, dropDownResponses } = sanitize(req.body);

    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // make sure the user has a place to store the response
    if (!user.adminQuestions) { user.adminQuestions = {}; }
    // add a start date if the user hadn't started yet
    if (!user.adminQuestions.startDate) { user.adminQuestions.startDate = new Date();  }
    // if the user didn't have a place to store old questions, add it
    if (!Array.isArray(user.adminQuestions.questions)) { user.adminQuestions.questions = []; }

    // if the user has a current question, answer it
    if (user.adminQuestions.currentQuestion && user.adminQuestions.currentQuestion.questionId) {
        // add the response - works for both slider and multipleChoice questions
        const newAnswer = {
            questionId: user.adminQuestions.currentQuestion.questionId,
            sliderAnswer,
            selectedId,
            selectedText,
            dropDownResponses
        }
        // add the response to the array of answered questions
        user.adminQuestions.questions.push(newAnswer);
    }

    // get a new admin question for the user
    try { var newQ = await getNewAdminQuestion(user); }
    catch (getQuestionError) {
        console.log("Error getting new admin question: ", getQuestionError);
        return res.status(500).send({ serverError: true });
    }

    // what will be returned to the front end
    let toReturn;

    // if the user already answered all the admin questions, they're done
    // move on to the next stage
    if (newQ.finished === true) {
        // mark admin questions as finished
        user.adminQuestions.endDate = new Date();

        // calculate the new evaluation state
        try {
            // move on to the next component, potentially finishing eval
            const { user: updatedUser, evaluationState } = await advance(user, businessId, positionId);
            // will return the user and the new eval state
            user = updatedUser;
            toReturn = { user: frontEndUser(user), evaluationState };
        }
        catch (advanceError) {
            console.log("Error advancing after admin questions finished: ", advanceError);
            return res.status(500).send({ serverError: true });
        }
    }

    // if not done with the admin questions
    else {
        // return the new question to answer
        toReturn = { evaluationState: { componentInfo: newQ.question, showIntro: false } };
        // save the question as the current question for the user
        user.adminQuestions.currentQuestion = { questionId: newQ.question._id };
    }

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user while trying to answer admin question: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send(toReturn);
}


// answer a question that is shown on the psychometric portion of an evaluation
module.exports.POST_answerPsychQuestion = async function(req, res) {
    const { userId, verificationToken, answer, businessId, positionId } = sanitize(req.body);

    // get the user
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // if the user hasn't started the psych test, start it for them
    if (!user.psychometricTest || !user.psychometricTest.startDate) {
        try { user.psychometricTest = await newPsychTest(); }
        catch (startPsychError) {
            console.log("Error starting psych test: ", startPsychError);
            return res.status(500).send({ serverError: true });
        }
    }

    // if the user has a current question and an answer is given, save the answer
    if (user.psychometricTest.currentQuestion && user.psychometricTest.currentQuestion.questionId && typeof answer === "number") {
        user.psychometricTest = addPsychAnswer(user.psychometricTest, answer)
    }

    // checks if the test is over, if not gets a new question
    try { var updatedPsych = await getNewPsychQuestion(user.psychometricTest); }
    catch (getQuestionError) {
        console.log("Error getting new psych question: ", getQuestionError);
        return res.status(500).send({ serverError: true });
    }

    // what will be returned to the front end
    let toReturn;

    // if the user already answered all the psych questions, they're done
    // move on to the next stage
    if (updatedPsych.finished === true) {
        // mark the psych test complete
        user.psychometricTest = markPsychComplete(user.psychometricTest);

        // calculate the user's scores from their answers
        user = calculatePsychScores(user)

        // calculate the new evaluation state
        try {
            // move on to the next component, potentially finishing eval
            const { user: updatedUser, evaluationState } = await advance(user, businessId, positionId);
            // will return the user and the new eval state
            user = updatedUser;
            toReturn = { user: frontEndUser(user), evaluationState };
        }
        catch (advanceError) {
            console.log("Error advancing after psych finished: ", advanceError);
            return res.status(500).send({ serverError: true });
        }
    }

    // if not done with the psych questions
    else {
        // save the question as the current question for the user
        user.psychometricTest = updatedPsych.psychTest;
        // return the new question to answer
        toReturn = {
            evaluationState: { componentInfo: updatedPsych.psychTest.currentQuestion, showIntro: false },
            user
        };
    }

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user while trying to answer psych question: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send(toReturn);
}


// start/answer a question for skill tests
module.exports.POST_answerSkillQuestion = async function(req, res) {
    const { userId, verificationToken, selectedId, businessId, positionId } = sanitize(req.body);

    // get the user
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // user has to be taking an eval to answer a skill question
    if (!user.evalInProgress) {
        console.log("No eval in progress when user tried to answer a skill question.");
        return res.status(400).send({ notSignedUp: true });
    }

    // whether the user should be returned to the front end
    let returnUser = false;

    // if the user hasn't started the skill test, start it for them
    if (!user.evalInProgress.skillId) {
        try {
            const update = await startNewSkill(user);
            user = update.user;
            returnUser = update.returnUser;
        }
        catch (startSkillError) {
            console.log("Error starting skill test: ", startSkillError);
            return res.status(500).send({ serverError: true });
        }
    }

    // id of the skill in progress
    const skillId = user.evalInProgress.skillId.toString();

    // get index of skill
    const skillIdx = user.skillTests.findIndex(s => s.skillId.toString() === skillId);
    if (skillIdx < 0) {
        console.log("No in-progress skill id.");
        return res.status(500).send({ serverError: true });
    }

    // get the skill from the user object
    let userSkill = user.skillTests[skillIdx];

    // if the user has a current question and an answer is given, save the answer
    if (userSkill.currentQuestion && userSkill.currentQuestion.questionId && typeof selectedId === "string") {
        user.skillTests[skillIdx] = addSkillAnswer(userSkill, selectedId);
    }

    // checks if the test is over, if not gets a new question
    try { var updatedTest = await getNewSkillQuestion(user.skillTests[skillIdx]); }
    catch (getQuestionError) {
        console.log("Error getting new skill question: ", getQuestionError);
        return res.status(500).send({ serverError: true });
    }

    // what will be returned to the front end
    let toReturn;

    // if the user already answered all the psych questions, they're done
    // move on to the next stage
    if (updatedTest.finished === true) {
        // mark the skill test complete and score it
        user.skillTests[skillIdx] = markSkillComplete(user.skillTests[skillIdx]);

        // tell the position that this skill is donezo
        user.evalInProgress.skillId = undefined;

        // calculate the new evaluation state
        try {
            // move on to the next component, potentially finishing eval
            const { user: updatedUser, evaluationState } = await advance(user, businessId, positionId);
            // will return the user and the new eval state
            user = updatedUser;
            toReturn = { user: frontEndUser(user), evaluationState };
        }
        catch (advanceError) {
            console.log("Error advancing after skill finished: ", advanceError);
            return res.status(500).send({ serverError: true });
        }
    }

    // if not done with the skill questions
    else {
        // return the new question to answer
        toReturn = { evaluationState: { componentInfo: updatedTest.componentQuestion, showIntro: false } };
        // save the question as the current question for the user
        user.skillTests[skillIdx] = updatedTest.userSkill;
        // return the user if wanted
        if (returnUser) { toReturn.user = user; }
    }

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user while trying to answer skill question: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send(toReturn);
}


module.exports.POST_skipAdminQuestions = async function(req, res) {
    const { userId, verificationToken, selectedId, businessId, positionId } = sanitize(req.body);

    // get the user
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send({ serverError: true });
    }

    // user has to be taking an eval to skip the admin questions
    if (!user.evalInProgress) {
        console.log("No eval in progress when user tried to skip the eval questions.");
        return res.status(400).send({ notSignedUp: true });
    }

    // get the current time
    const NOW = new Date();

    // make sure the user has the necessary admin questions fields to mark it finished
    if (typeof user.adminQuestions !== "object") { user.adminQuestions = {}; }
    // give admin questions a start date if none exists
    if (!user.adminQuestions.startDate) { user.adminQuestions.startDate = NOW; }
    // mark the user as not wanting to answer any of the admin questions
    user.adminQuestions.skipped = true;
    // mark the admin questions as completed if not already marked
    if (!user.adminQuestions.endDate) { user.adminQuestions.endDate = NOW; }

    // move on to the next component, potentially finishing eval
    const { user: updatedUser, evaluationState } = await advance(user, businessId, positionId);

    // save the user
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user who tried to skip admin questions: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    // return the user and the new eval state
    return res.status(200).send({ user: frontEndUser(user), evaluationState });
}


// start/answer a question for skill tests
module.exports.POST_answerCognitiveQuestion = async function(req, res) {
    const { userId, verificationToken, selectedId, businessId, positionId } = sanitize(req.body);

    // get the user
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user while trying to answer cognitive questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // whether the user should be returned to the front end
    let returnUser = false;

    // if the user hasn't started the cognitive test, start it for them
    if (!user.cognitiveTest || !user.cognitiveTest.startDate) {
        try {
            user.cognitiveTest = await newCognitiveTest();
            returnUser = true;
        }
        catch (startCognitiveError) {
            console.log("Error starting cognitive test: ", startCognitiveError);
            return res.status(500).send({ serverError: true });
        }
    }

    // if the user has already finished the cognitive test, can't take it again
    else if (user.cognitiveTest && user.cognitiveTest.endDate) {
        console.log("User tried to answer cognitive question after having finished test. User: ", user);
        return res.status(400).send({ message: "Already finished cognitive test." });
    }

    // get the cognitive test from the user object
    let gcaTest = user.cognitiveTest;

    // if the user has a current question and an answer is given, save the answer
    if (gcaTest.currentQuestion && gcaTest.currentQuestion.questionId) {
        user.cognitiveTest = addCognitiveAnswer(user.cognitiveTest, selectedId);
    }

    // checks if the test is over, if not gets a new question
    try { var updatedTest = await getNewCognitiveQuestion(user.cognitiveTest); }
    catch (getQuestionError) {
        console.log("Error getting new cognitive question: ", getQuestionError);
        return res.status(500).send({ serverError: true });
    }

    // what will be returned to the front end
    let toReturn;

    // if the user already answered all the cognitive questions, they're done
    // move on to the next stage
    if (updatedTest.finished === true) {
        // mark the cognitive test complete and score it
        try { user = await finishCognitive(user); }
        catch(finishError) {
            console.log("Error finishing user's cognitive test: ", finishError);
            return res.status(500).send({ serverError: true });
        }

        // calculate the new evaluation state
        try {
            // move on to the next component, potentially finishing eval
            const { user: updatedUser, evaluationState } = await advance(user, businessId, positionId);
            // will return the user and the new eval state
            user = updatedUser;
            toReturn = { user: frontEndUser(user), evaluationState };
        }
        catch (advanceError) {
            console.log("Error advancing after skill finished: ", advanceError);
            return res.status(500).send({ serverError: true });
        }
    }

    // if not done with the skill questions
    else {
        // return the new question to answer
        toReturn = {
            evaluationState: { componentInfo: updatedTest.componentQuestion, showIntro: false },
        };
        // set cognitive test to most updated version of itself
        user.cognitiveTest = updatedTest.cognitiveTest;
        if (returnUser) { toReturn.user = user; }
    }

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user while trying to answer skill question: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send(toReturn);
}


// answer a question for a skill test because user ran out of time, not because user hit next
module.exports.POST_answerOutOfTimeCognitive = async function(req, res) {
    const { userId, verificationToken, selectedId } = sanitize(req.body);

    // get the user
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user while trying to answer cognitive questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // if the user doesn't have a current question, can't auto-answer it
    if (!user.cognitiveTest || !user.cognitiveTest.currentQuestion) {
        console.log("User automatically submitted question but had no current question: ", user);
        return res.status(400).send({ message: "No question to answer." });
    }

    // if the user has already finished the cognitive test, can't auto-answer a question
    else if (user.cognitiveTest && user.cognitiveTest.endDate) {
        console.log("User automatically submitted question after having finished test. User: ", user);
        return res.status(400).send({ message: "Already finished cognitive test." });
    }

    // check if the current question was started at between 55 and 65 seconds ago
    const startDate = new Date(user.cognitiveTest.currentQuestion.startDate);
    const now = new Date();
    const timeElapsed = now.getTime() - startDate.getTime();
    if (timeElapsed < 55000 ) {
        // if time is < 55 seconds, doesn't make sense that the question ran out of time
        // if time is > 65 seconds, user could have submitted this at any time
        console.log("Invalid amount of time elapsed while auto submitting a question: ", timeElapsed);
        return res.status(400).send({ message: "Invalid auto-save." });
    }

    // save the auto-submitted answer
    user.cognitiveTest.currentQuestion.autoSubmittedAnswerId = selectedId;

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user while trying to auto-save cognitive question: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send({ success: true });
}


// gets the full current state of the evaluation
module.exports.GET_currentState = async function(req, res) {
    // get everything needed from request
    const { userId, verificationToken, businessId, positionId } = sanitize(req.query);
    // if the ids are not strings, return bad request error
    if (!validArgs({ stringArgs: [businessId, positionId] })) {
        logArgs(req.query, ["businessId", "positionId"]);
        return res.status(400).send({ badRequest: true });
    }

    // get the current user
    try {
        var [user, position] = await Promise.all([
            getAndVerifyUser(userId, verificationToken),
            getPosition(businessId, positionId)
        ]);
    }
    catch (getUserError) {
        logError("Error getting user when trying to get current eval state: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : errors.SERVER_ERROR);
    }

    // get the current state of the evaluation
    try { var { evaluationState } = await getEvaluationState({ user, position }); }
    catch (getStateError) {
        console.log("Error getting evaluation state when starting eval: ", getStateError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send({ evaluationState });
}


// starts an evaluation
module.exports.POST_start = async function(req, res) {
    // get everything needed from request
    const { userId, verificationToken, businessId, positionId } = sanitize(req.body);
    // if the ids are not strings, return bad request error
    if (!validArgs({ stringArgs: [businessId, positionId] })) {
        logArgs(req.query, ["businessId", "positionId"]);
        return res.status(400).send({ badRequest: true });
    }

    // get the current user
    try {
        var [user, position] = await Promise.all([
            getAndVerifyUser(userId, verificationToken),
            getPosition(businessId, positionId)
        ]);
    }
    catch (getUserError) {
        logError("Error getting user when trying to get current eval state: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : errors.SERVER_ERROR);
    }

    // make sure the user is enrolled in the position
    const positionIndex = userPositionIndex(user, positionId, businessId);
    if (positionIndex < 0) {
        console.log(`User did not have position with positionId: ${positionId}, businessId: ${businessId}`);
        return res.status(403).send({ notSignedUp: true });
    }

    // set the user's current position to the one given
    user.evalInProgress = { businessId, positionId }
    // mark the position as started
    const NOW = new Date();
    if (user.positions[positionIndex].appliedStartDate) {
        user.positions[positionIndex].appliedStartDate = new Date();
    } if (user.positions[positionIndex].startDate) {
        user.positions[positionIndex].startDate = new Date();
    }

    // save the user
    try { await user.save(); }
    catch (saveError) {
        console.log("Error saving user with new eval in progress: ", saveError);
        return res.status(500).send({ serverError: true });
    }

    // get the current state of the evaluation
    try { var { evaluationState } = await getEvaluationState({ user, position }); }
    catch (getStateError) {
        console.log("Error getting evaluation state when starting eval: ", getStateError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send({ user: frontEndUser(user), evaluationState });
}


// gets results for a user and influencers
module.exports.GET_initialState = async function(req, res) {
    // get everything needed from request
    const { userId, verificationToken, businessId, positionId } = sanitize(req.query);
    // if the ids are not strings, return bad request error
    if (!validArgs({ stringArgs: [businessId, positionId] })) {
        logArgs(req.query, ["businessId", "positionId"]);
        return res.status(400).send({ badRequest: true });
    }

    // get the current user
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user when trying to get current eval state: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : errors.SERVER_ERROR);
    }

    // find the index of the position within the user's positions array
    const positionIndex = userPositionIndex(user, positionId, businessId);
    // if the index is invalid, the user never signed up for this position
    if (positionIndex < 0) { return res.status(403).send({notSignedUp: true}); }

    // get the position from the database
    try { var position = await getPosition(businessId, positionId); }
    catch (getPositionError) {
        console.log(`Error getting position when trying to get initial state - businessId: ${businessId}, positionId: ${positionId}: `, getPositionError);
        return res.status(500).send({ serverError: true });
    }

    // TODO: check if they have finished the eval already
    if (user.positions[positionIndex].appliedEndDate) {
        return res.status(200).send({ finished: true });
    }

    // if user is in-progress on any position
    if (user.evalInProgress && user.evalInProgress.businessId && user.evalInProgress.positionId) {
        // check if it is the position they are currently on
        if (user.evalInProgress.businessId.toString() === businessId && user.evalInProgress.positionId.toString() === positionId) {
            // tell the user that this position has already been started, then
            // ask if they are ready to continue
            return res.status(200).send({ alreadyInProgress: true });
        }
        // if not, ask if they want to continue the eval they were on before
        // or if they want to work on this new one - send them the businessId
        // and positionId so they have a link to the in-progress eval
        else { return res.status(200).send({ evalInProgress: user.evalInProgress }); }
    }
    // no eval is in progress, return that they have not started this position
    // and are ready to
    else { return res.status(200).send({ readyToStart: true }); }
}


// start the next skill in an eval
async function startNewSkill(user) {
    return new Promise(async function(resolve, reject) {
        // whether the user should be returned to the front end
        let returnUser = false;

        // mark that they agreed to the skill terms (had to have to get here)
        if (!user.agreedToSkillTerms) {
            user.agreedToSkillTerms = true;
            returnUser = true;
        }

        // get the current position
        try { var position = await getPosition(user.evalInProgress.businessId, user.evalInProgress.positionId); }
        catch (getPositionError) { return reject(getPositionError); }

        // make the skill tests array if it didn't exist
        if (!Array.isArray(user.skillTests)) { user.skillTests = []; }

        // delete any skill that has been started but not finished
        let skillIdx = 0;
        while(skillIdx < user.skillTests.length) {
            if (user.skillTests[skillIdx] && typeof user.skillTests[skillIdx].mostRecentScore !== "number") {
                user.skillTests.splice(skillIdx, 1);
            } else {
                skillIdx++;
            }
        }

        // find out what the current skill id should be by going through each position skill
        for (posSkillIdx = 0; posSkillIdx < position.skills.length; posSkillIdx++) {
            const skillId = position.skills[posSkillIdx].toString();
            // seeing if the user has NOT completed this one already
            const userSkills = user.skillTests;
            const skillCompleted = userSkills.some(s => {
                return s.skillId.toString() === skillId && typeof s.mostRecentScore === "number";
            });
            // if the skill is not completed, marks it as the current one
            if (!skillCompleted) { user.evalInProgress.skillId = skillId; break; }
        }

        // if the user already finished all needed skills
        if (!user.evalInProgress.skillId) { return reject("No unfinished skills needed."); }

        // get the skill from db
        try { var skill = await Skills.findById(user.evalInProgress.skillId); }
        catch (getSkillTest) { return reject(getSkillTest); }

        // add the new skill test
        user.skillTests.push({
            skillId: skill._id,
            name: skill.name,
            attempts: [{
                inProgress: true,
                startDate: new Date(),
                currentLevel: 1,
                levels: [{
                    levelNumber: 1,
                    questions: []
                }]
            }]
        });

        return resolve({ user, returnUser });
    });
}


// mark a skill test as finished
function markSkillComplete(userSkill) {
    // make sure userSkill is valid
    if (typeof userSkill !== "object") { throw new Error(`Invalid userSkill: ${userSkill}`); }

    // get one and only attempt
    let userAttempt = userSkill.attempts[0];

    // record time meta-data
    const NOW = new Date();
    userAttempt.endDate = NOW;
    userAttempt.totalTime = NOW.getTime() - (new Date(userAttempt.startDate)).getTime();

    // get a score for the skill
    userSkill.mostRecentScore = scoreSkillFromAttempt(userAttempt);

    // return updated user skill
    return userSkill;
}


// get a score from the number of correct answers
function scoreSkillFromAttempt(attempt) {
    /* FOR NOW JUST SCORING OUT OF 100 THEN ADDING 30 */

    // make sure arg is valid
    if (typeof attempt !== "object") { throw new Error(`Invalid attempt: ${attempt}`); }

    // total questions in the test
    const totalQuestions = attempt.levels[0].questions.length;
    // number of questions answered correctly
    let numberCorrect = 0;

    // go through every question in the first and only level, count up number correct
    attempt.levels[0].questions.forEach(q => { if (q.isCorrect) { numberCorrect++ } } );

    // get final score
    const scoreOutOf100 = (numberCorrect / totalQuestions) * 100;
    const score = scoreOutOf100 + 30;

    // return the final score
    return score;
}


// mark a psych test as finished
function markPsychComplete(psychTest) {
    psychTest.inProgress = false;

    if (!psychTest.endDate) {
        const NOW = new Date();
        psychTest.endDate = NOW;
        psychTest.totalTime = NOW.getTime() - psychTest.startDate.getTime();
    }

    return psychTest;
}


// mark the cognitive test as finished
async function finishCognitive(user) {
    return new Promise(async function(resolve, reject) {
        let cognitiveTest = user.cognitiveTest;

        cognitiveTest.inProgress = false;

        if (!cognitiveTest.endDate) {
            const NOW = new Date();
            cognitiveTest.endDate = NOW;
            cognitiveTest.totalTime = NOW.getTime() - cognitiveTest.startDate.getTime();
        }

        // ----------------------->> GRADE THE TEST <<----------------------- //

        // get the ids of all the questions the user answered
        const answeredIds = cognitiveTest.questions.map(q => q.questionId);
        // query to get all the questions from the db
        const query = { "_id": { "$in": answeredIds } };
        // get all the questions in normal object form
        try { var questions = await GCA.find(query).select("_id difficulty discrimination guessChance").lean(); }
        catch (getQuestionsError) { return reject(getQuestionsError); }
        // go through each question
        questions.forEach((dbQ, index) => {
            // get the question in the user object correlating to this question
            const userQuestion = cognitiveTest.questions.find(q => q.questionId.toString() === dbQ._id.toString());
            // add whether the user is correct to the question
            // if the user went over on time, mark it incorrect for grading
            questions[index].isCorrect = userQuestion.isCorrect && !userQuestion.overTime;
        });

        // the value of all sampled points times their weights added up together
        let totalValue = 0;
        // all the weights added up
        let totalWeight = 0;

        // calculate the average theta value
        // calculate the value of the function at every point from 0 to 200
        // going up by .1 every iteration
        for (let theta = 0; theta <= 200; theta += .1) {
            // calculate the value of the likelihood function times the normal
            // distribution at this point
            const value = expectationAPriori(questions, theta);
            // the weight is equal to the value of the likelihood function * normal distribution
            totalValue += theta * value;
            totalWeight += value;
        }

        cognitiveTest.score = totalValue / totalWeight;

        console.log(`User ${user._id} finished GCA test with score: `, cognitiveTest.score);

        // <<--------------------- FINISH GRADING TEST -------------------->> //

        user.cognitiveTest = cognitiveTest;

        // return the graded test
        return resolve(user);
    });
}


// this function gets the value needed for bayesian expectation a priori calculation
// it is simply the theta likelihood times the normal distribution of scores for
// the population
// the reason we do this is to account for the possibility that someone gets every
// question right or every question wrong, as that would get them a score involving
// infinity either way
// using expectation a priori also involves getting the average weighted value
// instead of the max of this function because it can then account for the asymmetry
// in the IRF caused by the guessing chance
function expectationAPriori(questions, theta) {
    return thetaLikelihood(questions, theta) * normalDistribution(theta);
}
// this function graphs the likelihood that a user has any given theta
// return value is the probability that a user will have the given theta
// does this by multiplying item response functions for each question along with
// whether the user was correct or incorrect for that question
function thetaLikelihood(questions, theta) {
    let value = 1;
    // go through each question
    questions.forEach(question => {
        // find the value of the item response function at that point
        const irfValue = itemResponseFunction(question, theta);
        // if the user got the question right, multiply the likelihood by the
        // normal item response function for the question
        if (question.isCorrect) { value *= irfValue }
        // otherwise multiply it by 1 minus the value to show it's more likely
        // that the user's true theta value is lower
        else { value *= 1 - irfValue; }
    });
    // return the product of all the IRF values
    return value;
}
// normal distribution of scores across the distribution
// this should ideally be a perfectly normal distribution with mean of
// 100 and standard deviation of 15
// assume that's what it is because we don't have the data yet to know
// what the actual mean and std dev are
function normalDistribution(theta) {
    const mean = 100;
    const standardDeviation = 15;
    // formula: (1/(stddev * sqrt(2pi)) * e ^ (-(((theta - mean)/stddev)^2) / 2)
    const scalar = 1 / (standardDeviation * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow(((theta - mean) / standardDeviation), 2);
    return scalar * Math.pow(Math.E, exponent);
}
// the probability of getting a question right based on the question's:
// difficulty (how hard the question is)
// discrimination (how good the question is at determining theta)
// guessChance (chance user will get question right just by guessing)
// as well as theta (general cognitive ability of the user)
function itemResponseFunction(question, theta) {
    const { guessChance, difficulty, discrimination } = question;
    const numerator = 1 - guessChance;
    const denominator = 1 + Math.pow(Math.E, -(discrimination * (theta - difficulty)));
    return guessChance + (numerator / denominator);
}


// returns a psych test with the given answer
function addPsychAnswer(psych, answer) {
    let factors = psych.factors;
    const currQuestion = psych.currentQuestion;

    // best to convert to strings for easier comparisons
    const questionId = currQuestion.questionId.toString();
    const factorId = currQuestion.factorId.toString();
    const facetId = currQuestion.facetId.toString();

    // get the index of the factor within the user's psych factors array
    const factorIdx = psych.factors.findIndex(factor => factor.factorId.toString() === factorId);
    // if the factor doesn't exist in the factors array, invalid factor id
    if (factorIdx < 0) { throw new Error(`Invalid factor id: ${factorId}`); }
    // get the factor from the index
    let factor = psych.factors[factorIdx];

    // get the index of the facet within the factor
    const facetIdx = factor.facets.findIndex(facet => facet.facetId.toString() === facetId);
    // if the factor doesn't exist in the factors array, invalid factor id
    if (facetIdx < 0) { throw new Error(`Invalid facet id: ${facetId}`); }
    // get the facet from the index
    let facet = factor.facets[facetIdx];

    // get the most recent response, which is where the answer will be saved
    let response = facet.responses[facet.responses.length - 1];
    // save whether the score should be inverted
    response.invertScore = currQuestion.invertScore;
    // save which question got answered
    response.answeredId = questionId;
    // save the meta-data
    response.endDate = new Date();
    response.totalTime = response.endDate.getTime() - new Date(response.startDate).getTime();
    // save the actual answer
    response.answer = answer;

    // mark the question as no longer available for use
    psych.usedQuestions.push(questionId);

    // check if the facet is done being tested for
    if (facet.responses.length === psych.questionsPerFacet) {
        // find the index of the facet within the incomplete facets array
        const incFacetIdx = psych.incompleteFacets.findIndex(f => f.toString() === facetId);
        // remove the facet from the incomplete facets array
        psych.incompleteFacets.splice(incFacetIdx, 1);
    }

    // save everything that was just changed
    facet.responses[facet.responses.length - 1] = response;
    factor.facets[facetIdx] = facet;
    psych.factors[factorIdx] = factor;

    // add to the number of psych questions answered
    if (typeof psych.numQuestionsAnswered !== "number") { psych.numQuestionsAnswered = 0; }
    psych.numQuestionsAnswered++;

    // remove the just-answered question
    psych.currentQuestion = undefined;

    // return the new psych test with the saved answer
    return psych;
}


// return a fresh new just-started psych eval
async function newPsychTest() {
    return new Promise(async function(resolve, reject) {
        // get all the psych questions from the db
        try { var dbPsych = await Psychtests.findOne({}); }
        catch (getPsychError) { reject(getPsychError); }

        // if the psych questions weren't found in the db
        if (!dbPsych) { reject("Psych test not found in db."); }

        // make the incomplete facet list with the ids of all facets
        let incompleteFacets = [];
        dbPsych.factors.forEach(factor => {
            factor.facets.forEach(facet => {
                incompleteFacets.push(facet._id);
            });
        });

        // the factors that need to be tested for
        let factors = dbPsych.factors.map(factor => {
            let facets = factor.facets.map(facet => {
                return {
                    weight: facet.weight,
                    facetId: facet._id,
                    name: facet.name,
                    responses: []
                }
            })

            return { factorId: factor._id, name: factor.name, facets }
        });

        // new empty psych test
        resolve({
            inProgress: true,
            // starting right now
            startDate: new Date(),
            // currently not allowing any rephrases, change later
            rephrase: false,
            numRephrasesAllowed: 0,
            // 1 question per facet in development mode, 3 in production
            questionsPerFacet: process.env.NODE_ENV === "development" ? 1 : 3,
            incompleteFacets,
            factors
        });
    });
}

// return a fresh new just-started cognitive eval
async function newCognitiveTest() {
    return new Promise(async function(resolve, reject) {
        // new empty cognitive test
        resolve({
            inProgress: true,
            // starting right now
            startDate: new Date(),
            // hasn't answered any questions yet
            questions: []
        });
    });
}


// adds an answer for the current skill test question
function addSkillAnswer(userSkill, selectedId) {
    // make sure arguments are valid
    if (typeof userSkill !== "object" || typeof selectedId !== "string") {
        return reject(`Invalid arguments to addSkillAnswer. userSkill: ${userSkill}, selectedId: ${selectedId}`);
    }

    // only allowing one attempt
    let attempt = userSkill.attempts[0];

    // get the current question from the user object
    let userCurrQ = userSkill.currentQuestion;

    // get the current level - only allowing skills with one level at the moment
    let userLevel = attempt.levels[0];

    // only one answer can be correct, see if the answer is correct
    const isCorrect = userCurrQ.correctAnswer.toString() === selectedId.toString();

    // time meta-data
    const startDate = new Date(userCurrQ.startDate);
    const endDate = new Date();
    const totalTime = endDate.getTime() - startDate.getTime();

    // add the question to the list of finished questions
    userLevel.questions.push({
        questionId: userCurrQ.questionId,
        isCorrect,
        answerId: selectedId,
        startDate,
        endDate,
        totalTime
    });

    // save this info back to the user object
    attempt.levels[0] = userLevel;
    userSkill.attempts[0] = attempt;

    // delete the current question
    userSkill.currentQuestion = undefined;

    // return the updated skill
    return userSkill;
}


// adds an answer for the current cognitive test question
function addCognitiveAnswer(cognitive, selectedId) {
    // get the current question from the user object
    let userCurrQ = cognitive.currentQuestion;

    // time meta-data
    const startDate = new Date(userCurrQ.startDate);
    const endDate = new Date();
    const totalTime = endDate.getTime() - startDate.getTime();

    // delay time (65 seconds) to see if they took too long on the question or not. There is some internet delay
    let overTime = false;
    if (totalTime > 65000) { overTime = true; }

    // check if a valid answer was provided
    let validAnswer = typeof selectedId === "string";

    // if over on time or didn't provide an answer, check if the user already
    // has an answer that was auto-submitted
    let autoSubmittedAnswerUsed = false;
    if ((overTime || !validAnswer) && userCurrQ.autoSubmittedAnswerId != undefined) {
        // change the selected id to the one that was answered
        selectedId = userCurrQ.autoSubmittedAnswerId;
        // know answer is valid
        validAnswer = true;
        // answer was not over time ...
        overTime = false;
        // but the user did click "next" after time was up, so their auto-submitted
        // answer was used - this is just for data purposes, not for any further logic
        autoSubmittedAnswerUsed = true;
    }

    // only one answer can be correct, see if the answer is correct
    const isCorrect = validAnswer && userCurrQ.correctAnswer.toString() === selectedId.toString();

    // add the question to the list of finished questions
    cognitive.questions.push({
        questionId: userCurrQ.questionId,
        isCorrect,
        answerId: selectedId,
        startDate,
        endDate,
        totalTime,
        overTime,
        autoSubmittedAnswerUsed
    });

    // delete the current question
    cognitive.currentQuestion = undefined;

    // return the updated test
    return cognitive;
}


// advance to the next step and potentially finish the eval
async function advance(user, businessId, positionId) {
    return new Promise(async function(resolve, reject) {
        // get the current state of the evaluation
        try { var { evaluationState, position } = await getEvaluationState({ user, businessId, positionId }); }
        catch (getStateError) { reject(getStateError); }

        // check if the user finished the evaluation
        if (evaluationState.component === "Finished") {
            // position is no longer the position in progress
            user.evalInProgress = undefined;

            // find the position within the user's positions array
            const positionIndex = user.positions.findIndex(pos => {
                return (
                    pos.positionId.toString() === positionId.toString() &&
                    pos.businessId.toString() === businessId.toString()
                );
            });

            // make sure the user has the position
            if (positionIndex < 0) { reject(`User does not have position with id: ${positionId}, businessId: ${positionId}`); }

            // mark the position eval as finished
            if (!user.positions[positionIndex].appliedEndDate) {
                // give it an end date
                user.positions[positionIndex].appliedEndDate = new Date();
                // score the user
                try { user.positions[positionIndex] = await gradeEval(user, user.positions[positionIndex], position); }
                catch (gradeError) { return reject(gradeError); }
                // Send notification emails
                if (user.userType === "candidate") {
                    sendNotificationEmails(businessId, user);
                }
            }
        }

        resolve({ user, evaluationState });
    });
}


async function sendNotificationEmails(businessId, user) {
    return new Promise(async function(resolve, reject) {
        const ONE_DAY = 1000 * 60 * 60 * 24;
        let time = ONE_DAY;

        let moonshotUrl = 'https://www.moonshotinsights.io/';
        // if we are in development, links are to localhost
        if (process.env.NODE_ENV === "development") {
            moonshotUrl = 'http://localhost:8081/';
        }

        const findById = { _id: businessId };

        const business = await Businesses.findOne(findById).select("name positions");

        // send email to candidate
        let recipient = [user.email];
        console.log("recipient: ", recipient);
        let subject = "You've Finished Your Evaluation!";
        let content =
            '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                + '<p style="width:95%; display:inline-block; text-align:left;">Hi ' + getFirstName(user.name) + ',</p>'
                + '<p style="width:95%; display:inline-block; text-align:left;">My name is Justin and I am the Chief Product Officer at Moonshot Insights. I saw that you finished your evaluation for ' + business.name
                + '. I just wanted to let you know your results have been sent to the employer. Sit tight and we will keep you posted. I wish you the best of luck!</p><br/>'
                + '<p style="width:95%; display:inline-block; text-align:left;">If you have any questions at all, please feel free to shoot me an email at <b style="color:#0c0c0c">Justin@MoonshotInsights.io</b>. I&#39;m always on call and look forward to hearing from you.</p>'
                + '<p style="width:95%; display:inline-block; text-align:left;">Sincerely,<br/><br/>Justin Ye<br/><i>Chief Product Officer</i><br/><b style="color:#0c0c0c">Justin@MoonshotInsights.io</b></p>'
                + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                + '<div style="text-align:left;width:95%;display:inline-block;">'
                    + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                    + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                    + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + user.email + '">Opt-out of future messages.</a></i>'
                    + '</div>'
                + '</div>'
            + '</div>';

        const sendFrom = "Moonshot";
        sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {

        })

        const businessUserQuery = {
            "$and": [
                { "businessInfo.businessId": businessId },
                { "userType": "accountAdmin" }
            ]
        }
        try {
            let users  = await Users.find(businessUserQuery).select("name email notifications")
            if (!users) {
                resolve("No users found.");
            }
            let recipient = {};
            let promises = [];
            for (let i = 0; i < users.length; i++) {
                recipient = users[i];
                const notifications = users[i].notifications;
                let interval = "day";
                if (notifications) {
                    // If a delayed email has already been sent, don't send another
                    if (notifications.waiting) {
                        continue;
                    }

                    var timeDiff = Math.abs(new Date() - notifications.lastSent);

                    switch(notifications.time) {
                        case "Weekly":
                            interval = "week";
                            time = ONE_DAY * 7;
                            break;
                        case "Every 2 Days":
                            interval = "2 days";
                            time = ONE_DAY * 2;
                            break;
                        case "Every 5 Days":
                            interval = "5 days";
                            time = ONE_DAY * 5;
                            break;
                        case "Daily":
                            interval = "day";
                            time = ONE_DAY;
                            break;
                        case "never":
                            time = 0;
                            continue;
                            break;
                        default:
                            interval = "day";
                            time = 0;
                            break;
                    }
                } else {
                    continue;
                }

                let timeDelay = 0;

                if (timeDiff < time) {
                    timeDelay = new Date((notifications.lastSent.getTime() + time)) - (new Date());
                } else {
                    timeDelay = 0;
                }

                promises.push(sendDelayedEmail(recipient, timeDelay, notifications.lastSent, business.positions, interval, notifications.firstTime));
                recipient = {};
                time = 0;
            }
            try {
                const sendingEmails = await Promise.all(promises);
            } catch (err) {
                console.log("error sending emails to businesses after date: ", err);
                reject("Error sending emails to businesses after date.")
            }
        } catch (getUserError) {
            console.log("error getting user when sending emails: ", getUserError);
            return reject("Error getting user.");
        }
    });
}


async function sendDelayedEmail(recipient, time, lastSent, positions, interval, firstTime) {
    return new Promise(async function(resolve, reject) {

        if (time > 0) {
            const idQuery = {
                "_id" : recipient._id
            }
            const updateQuery = {
                "notifications.waiting" : true
            }
            try {
                await Users.findOneAndUpdate(idQuery, updateQuery);
            } catch(err) {
                console.log("error updating lastSent date for user email notifications: ", err);
                reject("Error updating lastSent date for user email notifications.")
            }
        }

        setTimeout(async function() {
            let moonshotUrl = 'https://moonshotinsights.io/';
            // if we are in development, links are to localhost
            if (process.env.NODE_ENV === "development") {
                moonshotUrl = 'http://localhost:8081/';
            }

            // Set the reciever of the email
            let reciever = [];
            reciever.push(recipient.email);

            let positionCounts = [];

            let promises = [];
            let names = [];

            // TODO: get the number of candidates for each position in the correct time
            for (let i = 0; i < positions.length; i++) {
                const completionsQuery = {
                   "userType": "candidate",
                   "positions": {
                       "$elemMatch": {
                           "$and": [
                               { "positionId": mongoose.Types.ObjectId(positions[i]._id) },
                               { "appliedEndDate": { "$gte" : lastSent  } }
                           ]
                       }
                   }
                }
                names.push(positions[i].name);
                promises.push(Users.countDocuments(completionsQuery));
            }

            const counts = await Promise.all(promises);
            // Number of overall candidates
            let numCandidates = 0;

            let countsSection = '<div style="margin-top: 20px">';
            for (let i = 0; i < counts.length; i++) {
                numCandidates += counts[i];
                if (counts[i] > 0) {
                    if (counts[i] === 1) {
                        countsSection += (
                            '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d; width:95%; display:inline-block; text-align:left;">'
                                +'<b style="color:#0c0c0c; display:inline-block">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + positions[i].name + ':&nbsp;</b>'
                                +'<div style="display:inline-block">' + counts[i] + ' candidate completion in the past ' + interval + '</div>'
                            +'</div>'
                        );
                    } else {
                        countsSection += (
                            '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d; width:95%; display:inline-block; text-align:left;">'
                                +'<b style="color:#0c0c0c; display:inline-block">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + positions[i].name + ':&nbsp;</b>'
                                +'<div style="display:inline-block">' + counts[i] + ' candidate completions in the past ' + interval + '</div>'
                            +'</div>'
                        );
                    }
                }
            }

            // add closing div to counts section
            countsSection += '</div>';

            // Section that introduces purpose of email, is different if it is first time sending notificaiton email
            let introSection = '<div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">';
            if (firstTime) {
                introSection += (
                    'My name is Justin and I&#39;m the Chief Product Officer at Moonshot Insights. I&#39;ll be sending you emails updating you when candidates complete your evaluations so that you can view their results and move the hiring process along quickly. Here&#39;s your first update:</div>'
                )
            } else {
                introSection += (
                    'It&#39;s Justin again with a quick update on your evaluations:</div>'
                )
            }
            // If there are multiple position evaluations going on at once
            const multipleEvals = counts.length > 1;

            // Create the emails
            let subject = numCandidates + ' Candidates Completed Your Evaluation';
            if (numCandidates < 2) {
                subject = numCandidates + ' Candidate Completed Your Evaluation';
            }
            if (multipleEvals) {
                subject = subject.concat("s");
            }

            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="width:95%; display:inline-block; text-align:left;">Hi ' + getFirstName(recipient.name) + ',</div>'
                    + introSection
                    + countsSection + '<br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'myCandidates'
                    + '">See Results</a>'
                    + '<div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">If you have any questions, please feel free to shoot me a message at <b style="color:#0c0c0c">Justin@MoonshotInsights.io</b>. To add your next evaluation, you can go <b style="color:#C8C8C8;" ><a href="' + moonshotUrl + 'myEvaluations?open=true">here</a></b>.</div>'
                    + '<div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">Sincerely,<br/><br/>Justin Ye<br/><i>Chief Product Officer</i><br/><b style="color:#0c0c0c">Justin@MoonshotInsights.io</b></div>'
                    + '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>'
                    + '<div style="text-align:left;width:95%;display:inline-block;">'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'settings">Change the frequency of your notifications.</a></i><br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe">Opt-out of future messages.</a></i>'+ '</div>'
                    + '</div>'
                + '</div>';

                const sendFrom = "Moonshot";
                sendEmail(reciever, subject, content, sendFrom, undefined, function (success, msg) {
                })
                // Update the lastSent day of the user and the waiting to be false
                const idQuery = {
                    "_id" : recipient._id
                }
                const updateQuery = {
                    "notifications.lastSent" : new Date(),
                    "notifications.waiting" : false,
                    "notifications.firstTime" : false
                }
                try {
                    await Users.findOneAndUpdate(idQuery, updateQuery);
                } catch(err) {
                    console.log("error updating lastSent date for user email notifications: ", err);
                    reject("Error updating lastSent date for user email notifications.")
                }
                resolve(true);
            }
        , time);
    });
}


// get the current state of an evaluation, including the current stage, what
// stages have been completed, and what stages are next
// requires: user AND ((positionId and businessId) OR position object)
async function getEvaluationState(options) {
    return new Promise(async function(resolve, reject) {
        if (typeof options !== "object") { return reject("No options object provided"); }
        const user = options.user;
        if (typeof user !== "object") { return reject(`user should be object, but was ${typeof user}`); }

        // get the position object
        let position;
        // if the position was passed in, just set position equal to that
        if (options.position && typeof options.position === "object") { position = options.position; }
        // otherwise get the position from the businessId and positionId
        else if (options.positionId && options.businessId) {
            try { position = await getPosition(options.businessId, options.positionId); }
            catch (getPositionError) { return reject(getPositionError); }
        }
        // if no way to find position was given, fail
        else { return reject(`Need position or positionId and businessId. position: ${options.position} positionId: ${options.positionId} businessId: ${options.businessId}`); }

        let currentStage = undefined;
        let evaluationState = {
            // the steps (stages) that the user already finished
            completedSteps: [],
            // the steps the user still has to complete
            incompleteSteps: [],
            // the component the user is currently on (psych, cga, etc...)
            component: undefined
        };

        // add all the info about the current state of
        try {
            /* ADMIN QUESTIONS - ALL EVALS */
            evaluationState = await addAdminQuestionsInfo(user, evaluationState);

            /* PSYCH - ALL EVALS*/
            evaluationState = await addPsychInfo(user, evaluationState);

            /* GCA - ALL EVALS */
            evaluationState = await addCognitiveInfo(user, evaluationState);

            /* SKILLS - SOME EVALS */
            evaluationState = await addSkillInfo(user, evaluationState, position);
        }
        catch (getStateError) { reject(getStateError); }


        // if the user finished all the componens, they're done
        if (!evaluationState.component) {
            evaluationState.component = "Finished";
            // return the position too since they'll probably have to get graded now
            return resolve({ evaluationState, position });
        }

        // return the evaluation state
        return resolve({ evaluationState });
    });
}


// grades an evaluation based on all the components
async function gradeEval(user, userPosition, position) {
    // CURRENTLY SCORE IS MADE OF MOSTLY PSYCH AND A TINY BIT OF SKILLS
    // GRADE ALL THE SKILLS
    const overallSkill = gradeAllSkills(user, position);

    // get the gca score
    const gca = typeof user.cognitiveTest === "object" ? user.cognitiveTest.score : undefined;

    /* ------------------------->> GRADE PSYCH <<---------------------------- */
    // predict growth
    const growth = gradeGrowth(user, position, gca);
    // predict performance
    const performance = gradePerformance(user, position, overallSkill);
    // predict longevity
    const longevity = gradeLongevity(user, position);
    /* <<------------------------ END GRADE PSYCH ------------------------->> */

    /* ------------------------->> GRADE OVERALL <<-------------------------- */
    // grade the overall score
    const overallScore = gradeOverall({ gca, growth, performance, longevity }, position.weights);

    // // the components that make up the overall score
    // const overallContributors = [growth, performance, longevity];
    //
    // // get the average of the contributors
    // let overallScore = 0;
    // let numContributors = 0;
    // overallContributors.forEach(contributor => {
    //     // if the contributor score exists (was predicted)
    //     if (typeof contributor === "number") {
    //         overallScore += contributor;
    //         numContributors++;
    //     }
    // });
    // // get the average if there is at least one contributor
    // if (numContributors > 0) { overallScore = overallScore / numContributors; }
    // // otherwise just give them a score of 100
    // else { overallScore = 100; }
    /* <<----------------------- END GRADE OVERALL ------------------------>> */

    // update user's scores on the position eval
    userPosition.scores = {
        overall: overallScore,
        skill: overallSkill,
        culture: undefined,
        growth, longevity, performance
    }

    console.log(userPosition.scores);

    // return the updated user position
    return userPosition;
}


// calculate the overall score based on sub-scores like gca and performance
function gradeOverall(subscores, weights) {
    let totalValue = 0;
    let totalWeight = 0;
    // go through every score type (gca, performance, etc) and add its weighted value
    for (let scoreType in subscores) {
        if (!subscores.hasOwnProperty(scoreType)) continue;
        // only use the score if it exists as a number
        if (typeof subscores[scoreType] === "number") {
            // get the weight of the type
            let weight = weights ? weights[scoreType] : undefined;
            // if weight not provided, assume weighed at .2
            if (typeof weight !== "number") {
                console.log("Invalid weight of: ", weight, " for score type: ", scoreType, " in position with id: ", position._id);
                if (scoreType === "gca") { weight = .51; }
                else if (scoreType === "performance") { weight = .23 }
                else { weight = 0; }
            }
            console.log("weight is: ", weight);
            totalValue += subscores[scoreType] * weight;
            totalWeight += weight;
        }
    }
    console.log("overall score: ", (totalValue/totalWeight));
    return (totalValue / totalWeight);
}


// grade every skill from a position to get an overall score
function gradeAllSkills(user, position) {
    let overallSkill = undefined;
    // check if skills are part of the position
    if (Array.isArray(position.skills) && position.skills.length > 0) {
        // will be the AVERAGE of all skill scores
        overallSkill = 0;
        // go through each of the user's skills
        user.skillTests.forEach(skillTest => {
            // if the position requires this skill ...
            if (position.skills.some(s => s.toString() === skillTest.skillId.toString())) {
                // ... add the score to the average
                overallSkill += skillTest.mostRecentScore;
            }
        });
        // divide the added up skill scores by the number of skills to get the average
        overallSkill = overallSkill / position.skills.length;
    }

    // return the calculated score (could be undefined)
    return overallSkill;
}


// // get predicted growth for specific position
// function gradeGrowth(user, position) {
//     // start at a score of 0, 100 will be added after scaling
//     let growth = 0;
//
//     // how many facets are involved in the growth calculation
//     let numGrowthFacets = 0;
//
//     // go through each factor to get to each facet
//     const userFactors = user.psychometricTest.factors;
//     // make sure there are factors used in growth - otherwise growth will be 100
//     if (Array.isArray(position.growthFactors)) {
//         // go through each factor that affects growth
//         position.growthFactors.forEach(growthFactor => {
//             // find the factor within the user's psych test
//             const userFactor = userFactors.find(factor => { return factor.factorId.toString() === growthFactor.factorId.toString(); });
//
//             // add the number of facets in this factor to the total number of growth facets
//             numGrowthFacets += growthFactor.idealFacets.length;
//
//             // go through each facet to find the score compared to the ideal output
//             growthFactor.idealFacets.forEach(idealFacet => {
//                 // find the facet within the user's psych test
//                 const userFacet = userFactor.facets.find(facet => { return facet.facetId.toString() === idealFacet.facetId.toString(); });
//
//                 // the score that the user needs for the max pq
//                 const idealScore = idealFacet.score;
//
//                 // how far off of the ideal score the user got
//                 const difference = Math.abs(idealScore - userFacet.score);
//
//                 // subtract the difference from the predictive score
//                 growth -= difference;
//
//                 // add the absolute value of the facet score, making the
//                 // potential predictive score higher
//                 growth += Math.abs(idealScore);
//             })
//         });
//     }
//
//     // the max pq for growth in this position
//     const maxGrowth = position.maxGrowth ? position.maxGrowth : 190;
//
//     // growth multiplier is highest growth score divided by number of growth
//     // facets divided by 5 (since each growth facet has a max score in either direction of 5)
//     // can only have a growth multiplier if there are growth facets, so if
//     // there are no growth facets, set multiplier to 1
//     const growthMultiplier = numGrowthFacets > 0 ? ((maxGrowth - 100) / numGrowthFacets) / 5 : 1;
//
//     // to get to the potential max score, multiply by the multiplier
//     growth *= growthMultiplier;
//
//     // add the starting growth pq
//     growth += 100;
//
//     // return the calculated growth score
//     return growth;
// }


// get predicted growth for specific position
function gradeGrowth(user, position, gcaScore) {
    // get the user's psych test scores
    const psych = user.psychometricTest;
    // find conscientiousness, as that's the only factor that matters for now
    const conscFactor = psych.factors.find(factor => factor.name === "Conscientiousness");
    // how many facets are in the factor
    let numFacets = 0;
    // total value, can be divided by numFacets later to get average
    let addedUpFacets = 0;
    // go through each facet and find its standardized facet score
    conscFactor.facets.forEach(facet => {
        // add facet score to the total value
        addedUpFacets += facet.score;
        numFacets++;
    });
    // the weighted average of the facets
    let growth = 94.847 + (10 * (addedUpFacets / numFacets));
    // incorporate gca if it exists
    if (typeof gcaScore === "number") {
        const gcaWeights = {
            "Sales": 2.024,
            "Support": 1.889,
            "Development": 3.174,
            "Marketing": 2.217,
            "Product": 2.217
        }
        console.log("position.positionType: ", position.positionType);
        let gcaWeight = gcaWeights[position.positionType];
        // manager positions have different gca weighting
        if (position.isManager) { gcaWeight = 2.9; }
        if (!gcaWeight) { gcaWeight = 2.217; }
        console.log("gcaWeight: ", gcaWeight);
        // weigh psych to skills 3:1
        growth = (growth + (gcaWeight * gcaScore)) / (1 + gcaWeight);
    }

    console.log("growth: ", growth);
    // return the predicted performance
    return growth;
}


// get predicted performance for specific position
function gradePerformance(user, position, overallSkill) {
    // get the user's psych test scores
    const psych = user.psychometricTest;
    // get all the ideal factors from the position
    const idealFactors = position.idealFactors;
    // the added-up weighted factor score values
    let totalPerfValue = 0;
    // the total weight of all factors, will divide by this to get the final score
    let totalPerfWeight = 0;
    // go through every factor
    psych.factors.forEach(factor => {
        let totalFactorValue = 0;
        let totalFactorWeight = 0;
        // find the corresponding ideal factor scores within the position
        const idealFactor = idealFactors.find(iFactor => iFactor.factorId.toString() === factor.factorId.toString());
        // use this factor if it is has ideal facets
        if (idealFactor) {
            console.log("Ideal factor: ", factor.name);
            // go through each facet and find its standardized facet score
            factor.facets.forEach(facet => {
                // find the corresponding ideal facet
                const idealFacet = idealFactor.idealFacets.find(iFacet => iFacet.facetId.toString() === facet.facetId.toString());
                // facet multiplier ensures that the scaled facet is score is between 0 and 10
                const facetMultiplier = 10 / Math.max(Math.abs(idealFacet.score - 5), Math.abs(idealFacet.score + 5));
                // the distance between the ideal facet score and the actual facet
                // score, scaled to be min 0 max 10
                const scaledFacetScore = facetMultiplier * Math.abs(idealFacet.score - facet.score);
                // get facet weight; default facet weight is 1
                let facetWeight = typeof idealFacet.weight === "number" ? idealFacet.weight : 1;
                // add the weighted value to be averaged
                totalFactorValue += scaledFacetScore * facetWeight;
                totalFactorWeight += facetWeight;

                console.log("facet scaled score: ", scaledFacetScore);
                console.log("facetWeight: ", facetWeight);
            });
            // the weighted average of the facets
            const factorScore = 144.847 - (10 * (totalFactorValue / totalFactorWeight));
            // get factor weight; default factor weight is 1
            let factorWeight = typeof idealFactor.weight === "number" ? idealFactor.weight : 1;
            // add the weighted score so it can be averaged
            totalPerfValue += factorScore * factorWeight;
            totalPerfWeight += factorWeight;
        }
    });
    // get the weighted average of the factors
    let performance = totalPerfValue / totalPerfWeight;
    // incorporate skills if taken
    if (typeof overallSkill === "number") {
        // weigh psych to skills 3:1
        performance = (.75 * performance) + (.25 * overallSkill);
    }
    // return the predicted performance
    return performance;
}



// get predicted performance for specific position
// function gradePerformance(user, position, overallSkill) {
//     // get the function type of the position ("Development", "Support", etc)
//     const type = position.positionType;
//     // get the user's psych test
//     const psych = user.psychometricTest;
//     // the weights for this position type
//     let weights = performanceWeights[type];
//     // if the type isn't valid, just use the general ones
//     if (!weights) {
//         console.log(`Position with id ${position._id} had type: `, type, " which was invalid. Using General weights.");
//         weights = performanceWeights["General"];
//     }
//     // the added-up weighted factor score values
//     let totalValue = 0;
//     // the total weight of all factors, will divide by this to get the final score
//     let totalWeight = 0;
//     // go through every factor,
//     psych.factors.forEach(factor => {
//         // get the average of all the facets for the factor
//         const factorAvg = factor.score;
//         // get the standardized factor score
//         const stdFactorScore = (factorAvg * 10) + 94.847;
//         // get the weight of the factor for this position
//         const weight = weights[factor.name];
//         // if the weight is invalid, don't use this factor in calculation
//         if (typeof weight !== "number") {
//             console.log("Invalid weight: ", weight, " in factor ", factor, ` of position with id ${position._id}`);
//         } else {
//             // add the weighted factor score to the total value
//             totalValue += stdFactorScore * weight;
//             // add the weight to the total weight
//             totalWeight += weight;
//         }
//     });
//     // if the total weight is 0, something has gone terribly wrong
//     if (totalWeight === 0) { throw new Error("Total factor weight of 0. Invalid psych factors."); }
//     // otherwise calculate the final weighted average score and return it
//     return (totalValue / totalWeight);
// }



// // OLD VERSION OF GRADING PERFORMANCE USING IDEAL OUTPUTS
// // get predicted performance for specific position
// function gradePerformance(user, position, overallSkill) {
//     // add to the score when a non-zero facet score is ideal
//     // subtract from the score whatever the differences are between the
//     // ideal facets and the actual facets
//     let performance = undefined;
//
//     const userFactors = user.psychometricTest.factors;
//     if (Array.isArray(position.idealFactors) && position.idealFactors.length > 0) {
//         // start at 100 as the baseline
//         let psychPerformance = 100;
//
//         // go through each factor to get to each facet
//         position.idealFactors.forEach(idealFactor => {
//             // find the factor within the user's psych test
//             const userFactor = userFactors.find(factor => { return factor.factorId.toString() === idealFactor.factorId.toString(); });
//
//             // go through each facet to find the score compared to the ideal output
//             idealFactor.idealFacets.forEach(idealFacet => {
//                 // find the facet within the user's psych test
//                 const userFacet = userFactor.facets.find(facet => { return facet.facetId.toString() === idealFacet.facetId.toString(); });
//
//                 // the score that the user needs for the max pq
//                 const idealScore = idealFacet.score;
//
//                 // how far off of the ideal score the user got
//                 const difference = Math.abs(idealScore - userFacet.score);
//
//                 // subtract the difference from the predictive score
//                 psychPerformance -= difference;
//
//                 // add the absolute value of the facet score, making the
//                 // potential predictive score higher
//                 psychPerformance += Math.abs(idealScore);
//             });
//         });
//
//         // take skills into account if there were any in the eval
//         if (typeof overallSkill === "number") {
//             // psych will account for 80% of prediction, skills 20%
//             performance = (psychPerformance * .8) + (overallSkill * .2);
//         }
//
//         // otherwise performance is just psych performance
//         else { performance = psychPerformance; }
//     }
//
//     // return calculated performance
//     return performance;
// }


// get predicted longevity for specific position
function gradeLongevity(user, position) {
    // longevity is predicted as 190 - (2 * difference between scores and ideal outputs)
    let longevity = undefined;

    // how many facets are involved in the longevity calculation
    let numLongevityFacets = 0;

    // make sure there are factors used in longevity - otherwise longevity will be undefined
    const userFactors = user.psychometricTest.factors;
    if (Array.isArray(position.longevityFactors) && position.longevityActive) {
        longevity = 190;
        // go through each factor that affects longevity
        position.longevityFactors.forEach(longevityFactor => {
            // find the factor within the user's psych test
            const userFactor = userFactors.find(factor => { return factor.factorId.toString() === longevityFactor.factorId.toString(); });

            // add the number of facets in this factor to the total number of longevity facets
            numLongevityFacets += longevityFactor.idealFacets.length;

            // go through each facet to find the score compared to the ideal output
            longevityFactor.idealFacets.forEach(idealFacet => {
                // find the facet within the user's psych test
                const userFacet = userFactor.facets.find(facet => { return facet.facetId.toString() === idealFacet.facetId.toString(); });

                // the score that the user needs for the max pq
                const idealScore = idealFacet.score;

                // how far off of the ideal score the user got
                const difference = Math.abs(idealScore - userFacet.score);

                // subtract the difference from the predictive score
                longevity -= (2 * difference);
            })
        });
    }

    // return predicted longevity for the position
    return longevity;
}


// add in info about current admin questions state
async function addAdminQuestionsInfo(user, evaluationState) {
    return new Promise(async function(resolve, reject) {
        const adminQs = user.adminQuestions;
        const started = typeof adminQs === "object" && adminQs.startDate;
        const finished = started && adminQs.endDate;

        // if user has not started OR for some reason don't have a current question and aren't done
        if (!started || (!finished && !adminQs.currentQuestion)) {
            // user is on admin question stage but needs to be shown instructions
            evaluationState.component = "Admin Questions";
            evaluationState.showIntro = true;
        }

        // if user has not finished admin questions
        else if (!finished) {
            // mark Admin Questions as what the user is currently doing
            evaluationState.component = "Admin Questions";

            // get the current question from the db
            try { var question = await Adminqs.findById(adminQs.currentQuestion.questionId); }
            catch (getQuestionError) { reject(getQuestionError); }
            if (!question) { reject(`Current admin question not found. Id: ${adminQs.currentQuestion.questionId}`); }

            // add the current question for the user to answer
            evaluationState.componentInfo = question;
        }

        // if user has finished admin questions, add it as a finished stage
        else { evaluationState.completedSteps.push({ stage: "Admin Questions" }); }

        resolve(evaluationState);
    });
}


// add in info about the current state of the psych test
async function addPsychInfo(user, evaluationState) {
    return new Promise(async function(resolve, reject) {
        const psych = user.psychometricTest;

        // if the user has finished the psych eval, add it to the finished pile
        if (psych && psych.endDate) {
            evaluationState.completedSteps.push({ stage: "Psychometrics" });
        }

        // if there is already a current component, throw psych in the incomplete pile
        else if (evaluationState.component){
            evaluationState.incompleteSteps.push({ stage: "Psychometrics" });
        }

        // at this point, psych must be current component
        else {
            // mark the current stage as the psych test
            evaluationState.component = "Psychometrics";

            // if the user has not started the psych test, show the intro for it
            const psychStarted = psych && psych.currentQuestion && psych.startDate;
            if (!psychStarted) { evaluationState.showIntro = true; }

            // otherwise give the user their current psych question
            else { evaluationState.componentInfo = psych.currentQuestion; }
        }

        resolve(evaluationState);
    });
}


// add in info about the current state of skills
async function addSkillInfo(user, evaluationState, position) {
    return new Promise(async function(resolve, reject) {
        // see if there even are skills in the position
        if (Array.isArray(position.skills) && position.skills.length > 0) {
            // grab the user's skill tests that they already have
            const userSkills = user.skillTests;
            // go through each skill within the position
            for (let skillIdx = 0; skillIdx < position.skills.length; skillIdx++) {
                // convert to string to save a couple cycles
                const skillIdString = position.skills[skillIdx].toString();
                // find the skill within the user's skills array
                const userSkill = userSkills.find(uSkill => uSkill.skillId.toString() === skillIdString);
                // whether the user started and finished the skill test
                const started = !!userSkill && !!userSkill.currentQuestion;
                const finished = !!started && typeof userSkill.mostRecentScore === "number";

                // if the user already finished the skill, add to finished list
                if (finished) { evaluationState.completedSteps.push({ stage: "Skill" }); }

                // if the user's current component has already been determined ...
                else if (evaluationState.component) {
                    // ... add the skill to the list of incomplete steps
                    evaluationState.incompleteSteps.push({ stage: "Skill" });
                }

                // if this skill is the current thing the user is doing
                else {
                    evaluationState.component = "Skill";
                    // if the user has not started, show them the intro to the skill
                    if (!started) { evaluationState.showIntro = true; }
                    // otherwise give the user the current question to answer
                    else {
                        const currQ = userSkill.currentQuestion;
                        // get this skill from the db
                        try {
                            var skill = await Skills
                                .findById(userSkill.skillId)
                                .select("levels.questions.body levels.questions._id levels.questions.options.body levels.questions.options._id");

                            // get the question from the skill
                            const questions = skill.levels[0].questions;
                            const question = questions.find(q => q._id.toString() === currQ.questionId.toString());

                            // give this question to eval state so user can see it
                            evaluationState.componentInfo = question;
                        }
                        catch (getSkillError) { reject(getSkillError); }
                    }
                }
            }
        }

        resolve(evaluationState);
    });
}


// add in info about the current state of cognitive
async function addCognitiveInfo(user, evaluationState) {
    return new Promise(async function(resolve, reject) {
        const cognitive = user.cognitiveTest;

        // if the user has finished the psych eval, add it to the finished pile
        if (cognitive && cognitive.endDate) {
            evaluationState.completedSteps.push({ stage: "Cognitive" });
        }

        // if there is already a current component, throw cognitive in the incomplete pile
        else if (evaluationState.component){
            evaluationState.incompleteSteps.push({ stage: "Cognitive" });
        }

        // at this point, cognitive must be current component
        else {
            // mark the current stage as the psych test
            evaluationState.component = "Cognitive";

            // if the user has not started the psych test, show the intro for it
            const cognitiveStarted = cognitive && cognitive.currentQuestion && cognitive.startDate;
            if (!cognitiveStarted) { evaluationState.showIntro = true; }
            // otherwise give the user their current cognitive question
            else {
                try {
                    var question = await GCA
                        // find the question with the id of the user's current question
                        .findById(cognitive.currentQuestion.questionId)
                        // don't include whether each question is correct
                        .select("-options.isCorrect")
                }
                catch (getCognitiveError) { reject(getCognitiveError); }

                const componentQuestion = {
                    rpm: question.rpm,
                    options: question.options,
                    startDate: cognitive.currentQuestion.startDate,
                    questionId: question._id
                }

                evaluationState.componentInfo = componentQuestion;
             }
        }

        resolve(evaluationState);
    });
}


// gets the next psych question for a user, or return finished if it's done
async function getNewPsychQuestion(psych) {
    return new Promise(async function(resolve, reject) {
        // if the user is done with the psych test, return saying so
        if (psych.incompleteFacets.length === 0) {
            return resolve({ finished: true });
        }

        // query the db to find a question
        const query = {
            // want the question to be from a facet that needs more questions
            "facetId": { "$in": psych.incompleteFacets },
            // can't be a questions we've already used
            "_id": { "$nin": psych.usedQuestions }
        }
        try { var availableQs = await Psychquestions.find(query); }
        catch (getQsError) { return reject(getQsError); }

        // if we don't have any available questions somehow
        if (availableQs.length === 0) { return reject("Ran out of questions!"); }

        // pick a random question from the list of potential questions
        const questionIdx = randomInt(0, availableQs.length - 1);
        const question = availableQs[questionIdx];

        // get the index of the factor within the user's psych factors array
        const factorIdx = psych.factors.findIndex(factor => factor.factorId.toString() === question.factorId.toString());
        // if the factor doesn't exist in the factors array, invalid factor id
        if (factorIdx < 0) { return reject(`Invalid factor id: ${question.factorId}`); }
        // get the factor from the index
        let factor = psych.factors[factorIdx];

        // get the index of the facet within the factor
        const facetIdx = factor.facets.findIndex(facet => facet.facetId.toString() === question.facetId.toString());
        // if the factor doesn't exist in the factors array, invalid factor id
        if (facetIdx < 0) { return reject(`Invalid facet id: ${facetId}`); }
        // get the facet from the index
        let facet = factor.facets[facetIdx];

        // make sure the facet has a responses array
        if (!Array.isArray(facet.responses)) { facet.responses = []; }
        // start the timer on the current question
        facet.responses.push({ startDate: new Date() });

        // create the new current question
        psych.currentQuestion = question;
        psych.currentQuestion.questionId = question._id
        psych.currentQuestion._id = undefined;

        // update everything that was changed
        factor.facets[facetIdx] = facet;
        psych.factors[factorIdx] = factor;

        // return the updated psych
        return resolve({ psychTest: psych });
    });
}


// gets the next skill question for user (if test is not over)
async function getNewSkillQuestion(userSkill) {
    return new Promise(async function(resolve, reject) {
        // make sure the user skill is valid
        if (typeof userSkill !== "object") { reject(`Invalid userSkill: ${userSkill}`)}

        // get the skill test from the db
        try { var dbSkill = await Skills.findById(userSkill.skillId); }
        catch (getSkillError) { return reject(getSkillError); }

        // get the current (only) skill attempt and current (only) level
        let userAttempt = userSkill.attempts[0];
        let userLevel = userAttempt.levels[0];

        // if the user has answered every question in the only level of the test
        const dbQuestions = dbSkill.levels[0].questions;
        if (userLevel.questions.length === dbQuestions.length) {
            // test is finished, return saying so
            return resolve({ finished: true });
        }

        // otherwise make an object that lets us know which question ids have been answered
        let answeredIds = {};
        userLevel.questions.forEach(q => answeredIds[q.questionId.toString()] = true);

        // get a list of questions that have not been answered
        const availableQs = dbQuestions.filter(q => !answeredIds[q._id.toString()]);

        // get a random question from that list
        const questionIdx = randomInt(0, availableQs.length - 1);
        const question = availableQs[questionIdx];

        // figure out id of correct answer for that question
        const correctAnswer = question.options.find(opt => opt.isCorrect)._id;

        // mark it as the current question
        userSkill.currentQuestion = {
            levelNumber: 1,
            levelIndex: 0,
            questionId: question._id,
            startDate: new Date(),
            correctAnswer
        }

        // create the question object for the eval component
        const componentQuestion = {
            body: question.body,
            options: question.options.map(opt => { return { body: opt.body, _id: opt._id } } )
        }

        // return the new user's skill object and question
        return resolve({ userSkill, componentQuestion });
    });
}


async function getNewCognitiveQuestion(cognitiveTest) {
    return new Promise(async function(resolve, reject) {
        // make sure the user cognitive test is valid
        if (typeof cognitiveTest !== "object") { reject(`Invalid cognitiveTest: ${cognitiveTest}`)}

        // create a list of ids of questions the user has already answered
        const answeredIds = cognitiveTest.questions.map(cogQ => cogQ.questionId);

        // query the db to find a question
        const query = {
            // can't be a question we've already used
            "_id": { "$nin": answeredIds }
        }
        try { var availableQs = await GCA.find(query); }
        catch (getQsError) { return reject(getQsError); }

        // if we don't have any available questions, finished with the test
        if (availableQs.length === 0) { return resolve({ finished: true }); }

        // pick a random question from the list of potential questions
        const questionIdx = randomInt(0, availableQs.length - 1);
        let question = availableQs[questionIdx];

        // figure out id of correct answer for that question
        const correctAnswer = question.options.find(opt => opt.isCorrect)._id;

        // shuffle the options
        const opts = shuffle(question.options);

        const startDate = new Date();

        // mark it as the current question
        cognitiveTest.currentQuestion = {
            questionId: question._id,
            startDate,
            correctAnswer
        }

        // create the question object for the eval component
        const componentQuestion = {
            rpm: question.rpm,
            options: opts.map(opt => { return { src: opt.src, _id: opt._id } } ),
            startDate,
            questionId: question._id
        }

        // return the new user's skill object and question
        return resolve({ cognitiveTest, componentQuestion });
    });
}


// gets the next admin question for a user
async function getNewAdminQuestion(user) {
    return new Promise(async function(resolve, reject) {
        const answeredIds = user.adminQuestions.questions.map(question => question.questionId);
        // want only ...
        const query = {
            // ... questions that are required for the current user's type
            "requiredFor": user.userType,
            // ... and haven't already been answered
            "_id": { "$nin": answeredIds }
        };
        // the values we want for the questions
        const wantedValues = "questionType text sliderMin sliderMax options dropDown";
        // get all the necessary admin questions
        try { var questions = await Adminqs.find(query).select(wantedValues); }
        catch (getQuestionsError) { return reject(getQuestionsError); }

        // if the user already finished all the required questions
        if (questions.length === 0) { return resolve({ finished: true }); }

        // the user is not done, just grab the first available question
        return resolve({ question: questions[0] });
    });
}


// gets the index of the position within user's positions array; -1 if not found
function userPositionIndex(user, positionId, businessId) {
    try {
        var positionIdString = positionId.toString();
        var businessIdString = businessId.toString();
    } catch (getArgsError) {
        console.log("Invalid arguments to userPositionIndex(). ", getArgsError);
        return -1;
    }
    if (typeof user !== "object" || !Array.isArray(user.positions)) {
        console.log("Error: user must be a user object with positions. Was given: ", user);
        return -1;
    }
    return user.positions.findIndex(position => {
        return (
            position.positionId.toString() === positionIdString &&
            position.businessId.toString() === businessIdString
        );
    });
}


// get a const position from a business
async function getPosition(businessId, positionId) {
    return new Promise(async function(resolve, reject) {
        // get the business with that id and only the matching position
        const query = {
            "_id": businessId,
        }

        // get the one business that satisfies the query
        try { var business = await Businesses.findOne(query); }
        catch (getBizError) { return reject(getBizError); }

        // get the index of the position
        const posIndex = business.positions.findIndex(
            pos => pos._id.toString() === positionId.toString()
        );

        // if no business was found with that position id and business id
        if (!business) { return reject(`No business with id ${businessId} and a position with id: ${positionId}`); }

        // only one position can have that id, so must be the one and only position
        return resolve(business.positions[posIndex]);
    });
}
