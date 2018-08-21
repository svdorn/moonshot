const Users = require('../models/users.js');
const Psychtests = require('../models/psychtests.js');
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
        getUserFromReq,
        frontEndUser,
        validArgs,
        logArgs,
        logError
} = require('./helperFunctions');


const evaluationApis = {
    GET_initialState,
    GET_currentState,
    POST_start,
    POST_answerAdminQuestion
}


// answer a question that is shown on the administrative questions portion of an evaluation
async function POST_answerAdminQuestion(req, res) {
    const { userId, verificationToken, sliderAnswer, selectedId, selectedText } = sanitize(req.body);

    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // make sure the user has a place to store the response
    if (!user.adminQuestions) { user.adminQuestions = { startDate: new Date() }; }
    if (!Array.isArray(user.adminQuestions.questions)) { user.adminQuestions.questions = []; }

    // if the user has a current question, answer it
    if (user.adminQuestions.currentQuestion && user.adminQuestions.currentQuestions.questionId) {
        // add the response - works for both slider and mulitpleChoice questions
        const newAnswer = {
            user.adminQuestions.currentQuestions.questionId,
            sliderAnswer,
            selectedId,
            selectedText
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

    // if the user already answered all the admin questions, they're done
    // move on to the next stage
    if (newQ.finished === true) {
        // TODO
    }

    // otherwise, return the new question to answer
    else {
        // TODO
    }

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("error saving user while trying to answer admin question");
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send({ evaluationState });
    //return res.json(frontEndUser(user));
}


// gets the full current state of the evaluation
async function GET_currentState(req, res) {
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
    try { var evaluationState = await getEvaluationState({ user, position }); }
    catch (getStateError) {
        console.log("Error getting evaluation state when starting eval: ", getStateError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send({ evaluationState });
}


// starts an evaluation
async function POST_start(req, res) {
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
    user.positions[positionIndex].appliedStartDate = new Date();

    // save the user
    try { await user.save(); }
    catch (saveError) {
        console.log("Error saving user with new eval in progress: ", saveError);
        return res.status(500).send({ serverError: true });
    }

    // get the current state of the evaluation
    try { var evaluationState = await getEvaluationState({ user, position }); }
    catch (getStateError) {
        console.log("Error getting evaluation state when starting eval: ", getStateError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send({ user: frontEndUser(user), evaluationState });
}


// gets results for a user and influencers
async function GET_initialState(req, res) {
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

        /* ADMIN QUESTIONS - ALL EVALS */
        evaluationState = addAdminQuestionsInfo(user, evaluationState);

        /* PSYCH - ALL EVALS*/
        evaluationState = addPsychInfo(user, evaluationState);

        /* GCA - ALL EVALS */
        // TODO: GCA

        /* SKILLS - SOME EVALS */
        evaluationState = addSkillInfo(user, evaluationState, position);

        // if the user finished all the componens, they're done
        if (!evaluationState.component) {
            evaluationState.component = "Finished";
        }

        // return the evaluation state
        return resolve(evaluationState);
    });
}


// add in info about current admin questions state
function addAdminQuestionsInfo(user, evaluationState) {
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
        // add the current question for the user to answer
        evaluationState.componentInfo = adminQs.currentQuestion;
    }

    // if user has finished admin questions, add it as a finished stage
    else { evaluationState.completedSteps.push({ stage: "Admin Questions" }); }

    return evaluationState;
}


// add in info about the current state of the psych test
function addPsychInfo(user, evaluationState) {
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

    return evaluationState;
}


// add in info about the current state of skills
function addSkillInfo(user, evaluationState, position) {
    // see if there even are skills in the position
    if (Array.isArray(position.skills) && position.skills.length > 0) {
        // grab the user's skill tests that they already have
        const userSkills = user.skillTests;
        // go through each skill within the position
        position.skills.forEach(skillId => {
            // convert to string to save a couple cycles
            const skillIdString = skillId.toString();
            // find the skill within the user's skills array
            const userSkill = userSkills.find(userSkill => userSkill.skillId.toString() === skillIdString);
            // whether the user started and finished the skill test
            const started = userSkill && userSkill.currentQuestion;
            const finished = started && typeof mostRecentScore === "number";

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
                    evaluationState.componentInfo = {
                        // TODO
                        hyello: "STILL NEED TO DO THIS PART"
                    };
                }
            }
        })
    }

    return evaluationState;
}




// get the current state of the user's psych test
async function getPsychState(user) {
    return new Promise(async function(resolve, reject) {
        // TODO:
        console.log("NEED TO GET PSYCH STATE");
        return reject("Haven't coded this part yet");
    });
}


// gets the next admin question for a user
async function getNewAdminQuestion(user) {
    return new Promise(async function(resolve, reject) {
        const answeredIds = user.adminQuestions.questions.map(question => question.questionId);
        console.log(answeredIds);
        // want only ...
        const query = {
            // ... questions that are required for the current user's type
            "requiredFor": user.userType,
            // ... and haven't already been answered
            "_id": { "$nin": answeredIds }
        };
        // the values we want for the questions
        const wantedValues = "questionType text sliderMin sliderMax options";
        // get all the necessary admin questions
        try { var questions = await Adminqs.find(query).select(wantedValues); }
        catch (getQuestionsError) { return reject(getQuestionsError); }

        // if the user already finished all the required questions
        if (questions.length === 0) {
            console.log("FINISHED ADMIN QUESTIONS");
            return resolve({ finished: true });
        }

        // the user is not done, just grab the first available question
        return resolve({ question: questions[0] });
    });
}


// creates an admin questions object for a new user who has not done them before
function newAdminQuestionsObject(userType) {
    let adminQuestions = {
        // user has not started or finished the admin questions
        started: false,
        finished: false,
        // everyone answers demographics questions
        demographics: []
    };
    // add self rating questions to employees taking eval
    if (userType === "employee") { adminQuestions.selfRating = []; }
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
            "positions": {
                "$elemMatch": {
                    "_id": positionId
                }
            }
        }

        // get the one business that satisfies the query
        try { var business = await Businesses.findOne(query); }
        catch (getBizError) { return reject(getBizError); }

        // if no business was found with that position id and business id
        if (!business) { return reject(`No business with id ${businessId} and a position with id: ${positionId}`); }

        // only one position can have that id, so must be the one and only position
        return resolve(business.positions[0]);
    });
}


module.exports = evaluationApis;
