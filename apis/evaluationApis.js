const Users = require('../models/users.js');
const Psychtests = require('../models/psychtests.js');
const Psychquestions = require('../models/psychquestions.js');
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
        logError,
        randomInt
} = require('./helperFunctions');


module.exports = {};


// answer a question that is shown on the administrative questions portion of an evaluation
module.exports.POST_answerAdminQuestion = async function(req, res) {
    const { userId, verificationToken, sliderAnswer, selectedId, selectedText, businessId, positionId } = sanitize(req.body);

    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("error getting user while trying to get admin questions: ", getUserError);
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
        console.log("error saving user while trying to answer admin question: ", saveUserError);
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
        console.log("error getting user while trying to get admin questions: ", getUserError);
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
    if (user.psychometricTest.currentQuestion && user.psychometricTest.currentQuestion.questionId && answer) {
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
    console.log("finished: ", updatedPsych.finished);
    if (updatedPsych.finished === true) {
        console.log("updatedPsych.finished is TRUE");
        // mark the psych test complete
        console.log("marking complete");
        user.psychometricTest = markPsychComplete(user.psychometricTest);

        console.log("calulating scores");
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

    // if not done with the admin questions
    else {
        // return the new question to answer
        toReturn = { evaluationState: { componentInfo: updatedPsych.psychTest.currentQuestion, showIntro: false } };
        // save the question as the current question for the user
        user.psychometricTest = updatedPsych.psychTest;
    }

    // save the user
    try { await user.save(); }
    catch (saveUserError) {
        console.log("error saving user while trying to answer admin question: ", saveUserError);
        return res.status(500).send({ serverError: true });
    }

    return res.status(200).send(toReturn);
}


// mark a psych test as finished
function markPsychComplete(psychTest) {
    console.log("MARKING COMPLETE");
    psychTest.inProgress = false;

    if (!psychTest.endDate) {
        const NOW = new Date();
        psychTest.endDate = NOW;
        psychTest.totalTime = NOW.getTime() - psychTest.startDate.getTime();
    }

    return psychTest;
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
        const incFacetIdx = psych.incompleteFacets.findIndex(f => f.facetId.toString() === facetId);
        // remove the facet from the incomplete facets array
        psych.incompleteFacets.splice(incFacetIdx, 1);
    }

    // save everything that was just changed
    facet.responses[facet.responses.length - 1] = response;
    factor.facets[facetIdx] = facet;
    psych.factors[factorIdx] = factor;

    // add to the number of psych questions answered
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


// advance to the next step and potentially finish the eval
async function advance(user, businessId, positionId) {
    return new Promise(async function(resolve, reject) {
        // get the current state of the evaluation
        try { var evaluationState = await getEvaluationState({ user, businessId, positionId }); }
        catch (getStateError) { reject(getStateError); }

        // check if the user finished the evaluation
        if (evaluationState.component === "Finished") {
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
                user.positions[positionIndex].appliedEndDate = new Date();
            }
        }

        resolve({ user, evaluationState });
    });
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
    try { var evaluationState = await getEvaluationState({ user, position }); }
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

        // add all the info about the current state of
        try {
            /* ADMIN QUESTIONS - ALL EVALS */
            evaluationState = await addAdminQuestionsInfo(user, evaluationState);

            /* PSYCH - ALL EVALS*/
            evaluationState = await addPsychInfo(user, evaluationState);

            /* GCA - ALL EVALS */
            // TODO: GCA

            /* SKILLS - SOME EVALS */
            evaluationState = await addSkillInfo(user, evaluationState, position);
        }
        catch (getStateError) { reject(getStateError); }


        // if the user finished all the componens, they're done
        if (!evaluationState.component) {
            evaluationState.component = "Finished";
        }

        // return the evaluation state
        return resolve(evaluationState);
    });
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

        resolve(evaluationState);
    });
}


// gets the next psych question for a user, or return finished if it's done
async function getNewPsychQuestion(psych) {
    return new Promise(async function(resolve, reject) {
        // if the user is done with the psych test, return saying so
        if (psych.incompleteFacets.length === 0) {
            console.log("resolving to finished: true");
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
        return resolve(psych);
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
        const wantedValues = "questionType text sliderMin sliderMax options";
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
