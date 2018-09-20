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
        getAndVerifyUser,
        getFirstName,
        getUserFromReq,
        frontEndUser,
        validArgs,
        logArgs,
        logError,
        randomInt,
        shuffle,
        lastPossibleSecond,
        newObjectFromProps
} = require('./helperFunctions');

const { calculatePsychScores } = require("./psychApis");


// will contain all the exports
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
    try {
        var [ newQ, totalAdminQuestions ] = await Promise.all([
            getNewAdminQuestion(user),
            Adminqs.countDocuments({ "requiredFor": user.userType })
        ]);
    }
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
        // the current progress in the step
        const stepProgress = (user.adminQuestions.questions.length / totalAdminQuestions) * 100;
        // return the new question to answer
        toReturn = { evaluationState: { componentInfo: newQ.question, showIntro: false, stepProgress } };
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
        // get only the needed info on the current question
        const currentQuestion = newObjectFromProps(
            updatedPsych.psychTest.currentQuestion, "body", "leftOption", "rightOption", "questionId"
        );
        // return the new question to answer
        toReturn = {
            evaluationState: {
                componentInfo: currentQuestion,
                showIntro: false,
                stepProgress: updatedPsych.stepProgress
            },
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
        toReturn = { evaluationState: {
            componentInfo: updatedTest.componentQuestion,
            showIntro: false,
            stepProgress: updatedTest.stepProgress
        } };
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
        // if the cognitive test was updated by the getNewCognitiveQuestion function,
        // save it to the user
        if (updatedTest.cognitiveTest) { user.cognitiveTest = updatedTest.cognitiveTest; }
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
            evaluationState: {
                componentInfo: updatedTest.componentQuestion,
                showIntro: false,
                stepProgress: updatedTest.stepProgress
            },
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
    if (!user.positions[positionIndex].appliedStartDate) {
        user.positions[positionIndex].appliedStartDate = new Date();
    } if (!user.positions[positionIndex].startDate) {
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

    // check if they have finished the eval already
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


// only to be called from other apis, adds an eval to a user object
module.exports.addEvaluation = async function(user, businessId, positionId, startDate) {
    return new Promise(async function(resolve, reject) {
        if (!user) { return reject("Invalid user."); }
        if (!Array.isArray(user.positions)) { user.positions = []; }

        // check if the user already has the position
        const alreadyHasPosition = user.positions.some(userPosition => {
            return userPosition.businessId.toString() === businessId.toString && userPosition.positionId.toString() === positionId.toString();
        });
        if (alreadyHasPosition) {
            return reject(`user already had position with id ${positionId} in their positions array`);
        }

        // get the position object
        try { var position = await getPosition(businessId, positionId); }
        catch (getPositionError) { return reject(getPositionError); }

        // TODO - look at this and see if anything needs re-doing or can be gotten rid of

        // go through the user's skills to see which they have completed already;
        // this assumes the user won't have any in-progress skill tests when they
        // start a position evaluation
        let testIndex = 0;
        let skillTestIds = [];
        let userSkillTests = user.skillTests;
        position.skills.forEach(skillId => {
            // if the user has already completed this skill test ...
            if (userSkillTests.some(completedSkill => {
                return completedSkill.skillId.toString() === skillId.toString();
            })) {
                // ... add it to the front of the list and increase test index so we
                // know to skip it
                skillTestIds.unshift(skillId);
                testIndex++;
            }

            // if the user hasn't already completed this skill test, just add it
            // to the end of the array
            else { skillTestIds.push(skillId); }
        });

        // see if the user has already finished the psych analysis
        const hasTakenPsychTest = user.psychometricTest && user.psychometricTest.endDate;

        // if we're trying to take a test that is past the number of tests we
        // have, we must be done with all the skill tests
        const doneWithSkillTests = testIndex >= skillTestIds.length;

        // if the user has finished the psych test and all skill tests
        // and there are no frqs, the user has finished already
        const finished = hasTakenPsychTest && doneWithSkillTests;
        const now = new Date();
        const appliedEndDate = finished ? now : undefined;

        // get the assigned date from the function call
        const assignedDate = startDate;
        let deadline = undefined;
        // if a start date was assigned, figure out the deadline
        if (assignedDate) {
            const daysAllowed = position.timeAllotted;
            if (daysAllowed != undefined) {
                deadline = lastPossibleSecond(assignedDate, daysAllowed);
            }
        }

        // this information will change depending on whether it's a candidate or employee
        let userTypeSpecificInfo = {};
        if (user.userType === "candidate") {
            userTypeSpecificInfo = {
                isDismissed: false,
                hiringStage: "Not Contacted",
                hiringStageChanges: [{
                    hiringStage: "Not Contacted",
                    isDismissed: false,
                    // status changed to Not Contacted just now
                    dateChanged: now
                }]
            }
        } else if (user.userType === "employee") {
            userTypeSpecificInfo.gradingComplete = false
        }

        // starting info about the position
        const typeAgnosticInfo = {
            businessId: businessId,
            positionId: position._id,
            name: position.name,
            appliedStartDate: now,
            appliedEndDate,
            assignedDate,
            deadline,
            // no scores have been calculated yet
            scores: undefined,
            skillTestIds,
            testIndex
        }

        const newPosition = Object.assign(userTypeSpecificInfo, typeAgnosticInfo);

        // add the starting info to the user
        user.positions.push(newPosition);
        // position must be last in the array
        posIndex = user.positions.length - 1;

        // return successfully
        return resolve({ user, finished, userPositionIndex: posIndex });
    });
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

        // grade the test
        try { cognitiveTest.score = await getCognitiveScore(cognitiveTest); }
        catch (gradeError) { return reject(gradeError); }
        console.log(`User ${user._id} finished GCA test with score: `, cognitiveTest.score);

        // save all the new info
        user.cognitiveTest = cognitiveTest;

        // return the graded test
        return resolve(user);
    });
}


// get the score for a full cognitive test
// export it only for internal use
module.exports.getCognitiveScore = getCognitiveScore;
async function getCognitiveScore(cognitiveTest) {
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

    return (totalValue / totalWeight);
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
    // if the answer was flipped in the front end, invert the answer
    const flipper = currQuestion.frontEndFlipped ? -1 : 1;
    // save whether the front end was flipped
    response.frontEndFlipped = currQuestion.frontEndFlipped;
    // save the actual answer
    response.answer = answer * flipper;

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
        autoSubmittedAnswerUsed,
        assumedIncorrect: false
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
                try { user.positions[positionIndex] = gradeEval(user, user.positions[positionIndex], position); }
                catch (gradeError) { return reject(gradeError); }
            }
        }

        resolve({ user, evaluationState });
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
// exported for internal use only
module.exports.gradeEval = gradeEval;
function gradeEval(user, userPosition, position) {
    // CURRENTLY SCORE IS MADE OF MOSTLY PSYCH AND A TINY BIT OF SKILLS
    // GRADE ALL THE SKILLS
    const overallSkill = gradeAllSkills(user, position);

    // get the gca score
    const gca = typeof user.cognitiveTest === "object" ? user.cognitiveTest.score : undefined;

    /* ------------------------->> GRADE PSYCH <<---------------------------- */
    // predict growth
    const growth = gradeGrowth(user, position, gca);
    // predict performance
    const performance = gradePerformance(user, position, overallSkill, gca);
    // predict longevity
    const longevity = gradeLongevity(user, position);
    /* <<------------------------ END GRADE PSYCH ------------------------->> */

    /* ------------------------->> GRADE OVERALL <<-------------------------- */
    // grade the overall score
    //const overallScore = gradeOverall({ gca, growth, performance, longevity }, position.weights);
    const overallScore = gradeOverall({ gca, growth, performance, longevity });

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
    let totalWeight = 0;
    let totalValue = 0;

    const subscoreWeights = [["performance", .6], ["growth", .4]];

    // go through each subscore and add it and its weight if wanted
    subscoreWeights.forEach(sw => {
        const subscore = subscores[sw[0]];
        if (typeof subscore === "number") {
            const weight = sw[1];
            totalWeight += weight;
            totalValue += weight * subscore;
        }
    });

    // if there are no contributors to score, score must be 0 bc can't divide by 0
    return totalWeight === 0 ? 0 : totalValue / totalWeight;
    //
    // console.log("weights: ", weights);
    // let totalValue = 0;
    // let totalWeight = 0;
    // // go through every score type (gca, performance, etc) and add its weighted value
    // for (let scoreType in subscores) {
    //     if (!subscores.hasOwnProperty(scoreType)) continue;
    //     console.log("scoreType: ", scoreType);
    //     console.log("subscores[scoreType]: ", subscores[scoreType]);
    //     // only use the score if it exists as a number
    //     if (typeof subscores[scoreType] === "number") {
    //         // get the weight of the type
    //         let weight = weights ? weights[scoreType] : undefined;
    //         console.log("weights[scoreType]: ", weights[scoreType]);
    //         // if weight not provided, assume weighed at .2
    //         if (typeof weight !== "number") {
    //             console.log("Invalid weight of: ", weight, " for score type: ", scoreType, " in position with id: ", position._id);
    //             if (scoreType === "gca") { weight = .51; }
    //             else if (scoreType === "performance") { weight = .23 }
    //             else { weight = 0; }
    //         }
    //         console.log("weight is: ", weight);
    //         totalValue += subscores[scoreType] * weight;
    //         totalWeight += weight;
    //     }
    // }
    // console.log("overall score: ", (totalValue/totalWeight));
    // return (totalValue / totalWeight);
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


// get predicted growth for specific position
function gradeGrowth(user, position, gcaScore) {
    // get the user's psych test scores
    const psych = user.psychometricTest;
    // get all the ideal factors from the position
    const growthFactors = position.growthFactors;
    // the added-up weighted factor score values
    let totalGrowthValue = 0;
    // the total weight of all factors, will divide by this to get the final score
    let totalGrowthWeight = 0;
    // go through every factor
    psych.factors.forEach(factor => {
        let totalFactorValue = 0;
        let totalFactorWeight = 0;
        // find the corresponding ideal factor scores within the position
        const idealFactor = growthFactors.find(iFactor => iFactor.factorId.toString() === factor.factorId.toString());
        // use this factor if it is has ideal facets and is Conscientiousness or Extraversion
        if (idealFactor && ["Conscientiousness", "Extraversion"].includes(factor.name)) {
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
            // get factor weight; .5 for Conscientiousness, .19 for Extraversion
            let factorWeight = factor.name === "Conscientiousness" ? .5 : .19;
            // add the weighted score so it can be averaged
            totalGrowthValue += factorScore * factorWeight;
            totalGrowthWeight += factorWeight;
        }
    });

    // include gca in growth score
    if (typeof gcaScore === "number") {
        const gcaWeight = .53;
        totalGrowthValue += gcaScore * gcaWeight;
        totalGrowthWeight += gcaWeight;
    }

    console.log("total growth value: ", totalGrowthValue);
    console.log("total growth weight: ", totalGrowthWeight);

    // get the weighted average of the factors
    const growth = totalGrowthValue / totalGrowthWeight;

    // return the predicted performance
    return growth;


    // // get the user's psych test scores
    // const psych = user.psychometricTest;
    // // find conscientiousness, as that's the only factor that matters for now
    // const conscFactor = psych.factors.find(factor => factor.name === "Conscientiousness");
    // // how many facets are in the factor
    // let numFacets = 0;
    // // total value, can be divided by numFacets later to get average
    // let addedUpFacets = 0;
    // // go through each facet and find its standardized facet score
    // conscFactor.facets.forEach(facet => {
    //     // add facet score to the total value
    //     addedUpFacets += facet.score;
    //     numFacets++;
    // });
    // // the weighted average of the facets
    // let growth = 94.847 + (10 * (addedUpFacets / numFacets));
    // // incorporate gca if it exists
    // if (typeof gcaScore === "number") {
    //     const gcaWeights = {
    //         "Sales": 2.024,
    //         "Support": 1.889,
    //         "Developer": 3.174,
    //         "Marketing": 2.217,
    //         "Product": 2.217,
    //         "General": 2.217
    //     }
    //     console.log("position.positionType: ", position.positionType);
    //     let gcaWeight = gcaWeights[position.positionType];
    //     // manager positions have different gca weighting
    //     if (position.isManager) { gcaWeight = 2.9; }
    //     if (!gcaWeight) { gcaWeight = 2.217; }
    //     console.log("gcaWeight: ", gcaWeight);
    //     // weigh psych to skills 3:1
    //     growth = (growth + (gcaWeight * gcaScore)) / (1 + gcaWeight);
    // }
    //
    // console.log("growth: ", growth);
    // // return the predicted performance
    // return growth;
}


// get predicted performance for specific position
function gradePerformance(user, position, overallSkill, gca) {
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

    // now include GCA score
    let psychWeight = position.weights && typeof position.weights.performance === "number" ? position.weights.performance : .23;
    let gcaWeight = position.weights && typeof position.weights.performance === "number" ? position.weights.performance : .51;
    performance = ((performance * psychWeight) + (gca * gcaWeight)) / (psychWeight + gcaWeight);

    // incorporate skills if taken
    if (typeof overallSkill === "number") {
        // weigh psych to skills 3:1
        performance = (.75 * performance) + (.25 * overallSkill);
    }

    // return the predicted performance
    return performance;
}


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
            evaluationState.stepProgress = 0;
        }

        // if user has not finished admin questions
        else if (!finished) {
            // mark Admin Questions as what the user is currently doing
            evaluationState.component = "Admin Questions";

            // get the current question from the db
            try {
                var [ question, totalAdminQuestions ] = await Promise.all([
                    Adminqs.findById(adminQs.currentQuestion.questionId),
                    Adminqs.countDocuments({ "requiredFor": user.userType })
                ]);
            }
            catch (getQuestionError) { reject(getQuestionError); }
            if (!question) { reject(`Current admin question not found. Id: ${adminQs.currentQuestion.questionId}`); }

            // add the current question for the user to answer
            evaluationState.componentInfo = question;
            // add the current progress
            evaluationState.stepProgress = (adminQs.questions.length / totalAdminQuestions) * 100;
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
            if (!psychStarted) {
                evaluationState.showIntro = true;
                evaluationState.stepProgress = 0;
            }

            // otherwise give the user their current psych question
            else {
                evaluationState.componentInfo = psych.currentQuestion;
                // find the current progress of the psych eval
                // number of facets in the entire psych test
                let totalFacets = 0;
                psych.factors.forEach(f1 => { f1.facets.forEach(f2 => { totalFacets++; }); });
                const numAnsweredQuestions = psych.usedQuestions ? psych.usedQuestions.length : 0;
                // update step progress
                evaluationState.stepProgress = (numAnsweredQuestions / (psych.questionsPerFacet * totalFacets)) * 100;
            }
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
                    if (!started) {
                        evaluationState.showIntro = true;
                        evaluationState.stepProgress = 0;
                    }
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
                            // update the step progress
                            const numAnswered = userSkill.attempts && userSkill.attempts.levels && userSkill.attempts.levels.length > 0 && userSkill.attempts.levels[0].questions ? userSkill.attempts.levels[0].questions.length : 0;
                            evaluationState.stepProgress = (numAnswered / questions) * 100;
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
            if (!cognitiveStarted) {
                evaluationState.showIntro = true;
                evaluationState.stepProgress = 0;
            }
            // otherwise give the user their current cognitive question
            else {
                // get all the questions, don't include whether each question is correct
                try { var questions = await GCA.find({}).select("-options.isCorrect"); }
                catch (getCognitiveError) { reject(getCognitiveError); }

                // get the current question
                const question = questions.find(q => q._id.toString() === cognitive.currentQuestion.questionId.toString());

                const componentQuestion = {
                    rpm: question.rpm,
                    options: question.options,
                    startDate: cognitive.currentQuestion.startDate,
                    questionId: question._id
                }

                evaluationState.componentInfo = componentQuestion;
                evaluationState.stepProgress = (cognitive.questions.length / questions.length) * 100;
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

        // 50% chance of flipping the question's right and left options
        if (randomInt(0,1) === 1) {
            const oldRight = question.rightOption;
            psych.currentQuestion.rightOption = question.leftOption;
            psych.currentQuestion.leftOption = oldRight;
            psych.currentQuestion.frontEndFlipped = true
        } else {
            psych.currentQuestion.frontEndFlipped = false;
        }

        // update everything that was changed
        factor.facets[facetIdx] = facet;
        psych.factors[factorIdx] = factor;

        // find the current progress of the psych eval
        // number of facets in the entire psych test
        let totalFacets = 0;
        psych.factors.forEach(f1 => { f1.facets.forEach(f2 => { totalFacets++; }); });
        const numAnsweredQuestions = psych.usedQuestions ? psych.usedQuestions.length : 0;

        // return the updated psych
        return resolve({
            psychTest: psych,
            stepProgress: (numAnsweredQuestions / (psych.questionsPerFacet * totalFacets)) * 100
        });
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

        // get the step progress
        const stepProgress = (userLevel.questions.length / dbQuestions.length) * 100;

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
        return resolve({ userSkill, componentQuestion, stepProgress });
    });
}


async function getNewCognitiveQuestion(cognitiveTest) {
    return new Promise(async function(resolve, reject) {
        // make sure the user cognitive test is valid
        if (typeof cognitiveTest !== "object") { reject(`Invalid cognitiveTest: ${cognitiveTest}`)}

        // create a list of ids of questions the user has already answered
        const answeredIds = cognitiveTest.questions.map(cogQ => cogQ.questionId);
        // query the db to find a question, can't be one that's already been used
        const query = { "_id": { "$nin": answeredIds } };
        // sort in ascending order so that we get the easiest difficulty
        const sort = { "difficulty": "ascending" };
        try { var unansweredQuestions = await GCA.find(query).sort(sort); }
        catch (getQError) { return reject(getQError); }

        // if we don't have any available questions, finished with the test
        if (unansweredQuestions.length === 0) { return resolve({ finished: true }); }

        // see if the user should be finished due to getting 3 questions wrong in a row
        if (cognitiveTest.questions.length >= 3) {
            // number of questions in a row the user has gotten wrong
            let wrongInARow = 0;
            // go through each question
            for (let qIdx = 0; qIdx < cognitiveTest.questions.length; qIdx++) {
                // if the user got the question right, reset the number of questions wrong in a row
                if (cognitiveTest.questions[qIdx].isCorrect) { wrongInARow = 0; }
                // otherwise increase the number of consecutive incorrect answers
                else { wrongInARow++; }
                // if the user got more than three wrong in a row, test is finished
                if (wrongInARow === 3) {
                    // mark the rest of the questions in the test as incorrect,
                    // as the assumption is that the user wouldn't be getting them right
                    // get the rest of the questions
                    try { var questions = await GCA.find(query); }
                    catch (getQsError) { return reject(getQsError); }
                    questions.forEach(q => {
                        cognitiveTest.questions.push({
                            questionId: q._id,
                            isCorrect: false,
                            overTime: false,
                            autoSubmittedAnswerUsed: false,
                            assumedIncorrect: true
                        });
                    });
                    // return saying we're done and give the updated test
                    return resolve({ finished: true, cognitiveTest });
                }
            }
        }

        // get the easiest question
        const question = unansweredQuestions[0];

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

        // progress within cognitive test
        const stepProgress = (cognitiveTest.questions.length / (cognitiveTest.questions.length + unansweredQuestions.length)) * 100;

        // create the question object for the eval component
        const componentQuestion = {
            rpm: question.rpm,
            options: opts.map(opt => { return { src: opt.src, _id: opt._id } } ),
            startDate,
            questionId: question._id
        }

        // return the new user's skill object and question
        return resolve({ cognitiveTest, componentQuestion, stepProgress });
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
