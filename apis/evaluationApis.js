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
function addPsychAnswer(psychTest, answer) {
    let factors = psychTest.factors;
    const currentQuestion = psychTest.currentQuestion;

    const factorId = currentQuestion.factorId;
    const factorIndex = currentQuestion.factorIndex;
    const facetId = currentQuestion.facetId;
    const facetIndex = currentQuestion.facetIndex;

    // find out how many questions have already been answered for this facet
    // get the factor of the question that was answered
    let factor = factors[factorIndex];
    // make sure we have the right factor
    if (factor.factorId.toString() !== factorId.toString()) {
        factorIndex = factors.findIndex(currFactor => {
            return currFactor.factorId.toString() === factorId.toString();
        });
        if (!factorIndex || factorIndex === -1) {
            console.log("Couldn't find factor with id: ", factorId);
            return res.status(400).send("Bad input.");
        }
        factor = factors[factorIndex];
    }

    let facets = factor.facets;
    let facet = facets[facetIndex];
    // make sure we have the right facet
    if (facet.facetId.toString() !== facetId.toString()) {
        facetIndex = facets.findIndex(currFacet => {
            return currFacet.facetId.toString() === facetId.toString();
        });
        if (!facetIndex || facetIndex === -1) {
            console.log("Couldn't find facet with id: ", factorId);
            return res.status(400).send("Bad input.");
        }
        facet = facets[facetIndex];
    }

    // if this question hasn't been started, can't answer it
    if (facet.responses.length === 0) {
        console.log("Facet.responses.length was 0.");
        return res.status(400).send("Haven't started that question yet.");
    }

    // the most recent response is the one that will always be edited
    let response = facet.responses[facet.responses.length - 1];
    response.answer = currentQuestion.invertScore === true ? answer*(-1) : answer;
    response.answeredId = currentQuestion.questionId;
    response.invertScore = currentQuestion.invertScore;
    response.endDate = new Date();
    const startDateMillis = (new Date(response.startDate)).getTime();
    // record number of milliseconds between starting and ending the question
    response.totalTime = response.endDate.getTime() - startDateMillis;

    // save the question as not available for use anymore
    facet.usedQuestions.push(currentQuestion.questionId);

    // save the response within the facet
    facet.responses[facet.responses.length - 1] = response;
    facets[facetIndex] = facet;
    factor.facets = facets;

    // create the number of questions answered field if it doesn't exist
    if (typeof psychTest.numQuestionsAnswered !== "number") {
        psychTest.numQuestionsAnswered = 0;
    }
    // let the test know that another questions has been answered
    psychTest.numQuestionsAnswered++;

    // check if the facet is done being tested for
    if (facet.responses.length === psychTest.questionsPerFacet) {
        const indexOfFacetIndexToRemove = factor.incompleteFacets.findIndex(incompleteFacetIndex => {
            return incompleteFacetIndex === facetIndex;
        })
        // remove this facet so we know not to test for it again
        factor.incompleteFacets.splice(indexOfFacetIndexToRemove, 1);
    }

    factors[factorIndex] = factor;
    psychTest.factors = factors;

    // check if the factor is done being tested for
    if (factor.incompleteFacets.length === 0) {
        const indexOfFactorIndexToRemove = psychTest.incompleteFactors.findIndex(incompleteFactorIndex => {
            return incompleteFactorIndex === factorIndex;
        });
        // remove this factor so we know not to test for it again
        psychTest.incompleteFactors.splice(indexOfFactorIndexToRemove, 1);
    }

    return psychTest;
}


// return a fresh new just-started psych eval
async function newPsychTest() {
    return new Promise(async function(resolve, reject) {
        // get all the psych questions from the db
        try { var dbPsych = await Psychtests.findOne({}); }
        catch (getPsychError) { reject(getPsychError); }

        // if the psych questions weren't found in the db
        if (!dbPsych) { reject("Psych test not found in db."); }

        // make the incompleteFactors list; will end up as [0, 1, 2, ...] for however many factors there are
        const numFactors = dbPsych.factors.length;
        let incompleteFactors = [];
        for (let factorIndex = 0; factorIndex < numFactors; factorIndex++) {
            incompleteFactors.push(factorIndex);
        }

        // the factors that need to be tested for
        let factors = dbPsych.factors.map(factor => {
            const numFacets = factor.facets.length;
            let incompleteFacets = [];
            for (let facetIndex = 0; facetIndex < numFacets; facetIndex++) {
                incompleteFacets.push(facetIndex);
            }

            let facets = factor.facets.map(facet => {
                return {
                    weight: facet.weight,
                    facetId: facet._id,
                    name: facet.name,
                    responses: []
                }
            })

            return {
                factorId: factor._id,
                name: factor.name,
                incompleteFacets,
                facets
            }
        });

        // new empty psych test
        resolve({
            inProgress: true,
            startDate: new Date(),
            // currently not allowing any rephrases, change later
            rephrase: false,
            numRephrasesAllowed: 0,
            // 1 question per facet in development mode, 3 in production
            questionsPerFacet: process.env.NODE_ENV === "development" ? 1 : 3,
            incompleteFactors,
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


// TODO: jesus christ this is ugly, refactor this
// gets the next admin question for a user
async function getNewPsychQuestion(psychTest) {
    return new Promise(async function(resolve, reject) {
        // if the user is done with the psych test, return saying so
        console.log("psychTest.incompleteFactors.length:", psychTest.incompleteFactors.length);
        if (psychTest.incompleteFactors.length === 0) {
            console.log("resolving to { finished: true} ");
            return resolve({ finished: true });
        }

        // the index of the factor that will be tested next
        // pick a random index from the index of factors that are not yet finished
        const newFactorIndex = psychTest.incompleteFactors[randomInt(0, psychTest.incompleteFactors.length-1)];
        let newFactor = psychTest.factors[newFactorIndex];
        const newFactorId = newFactor.factorId;
        const newFacetIndex = newFactor.incompleteFacets[randomInt(0, newFactor.incompleteFacets.length-1)]
        let newFacet = newFactor.facets[newFacetIndex];
        const newFacetId = newFacet.facetId;

        // the actual psych test with all its questions
        try { var dbPsych = await Psychtests.findOne({}); }
        catch (getPsychTestError) { reject(getPyschTestError); }

        // get the factor from the db so we can assign a new question
        let testFactor = undefined;
        // try using the index that we have stored. if the ids match, we have the right factor
        if (dbPsych.factors[newFactorIndex]._id.toString() === newFactorId.toString()) {
            testFactor = dbPsych.factors[newFactorIndex];
        }
        // otherwise we need to search for the right factor
        else {
            testFactor = dbPsych.factors.find(currTestFactor => {
                return currTestFactor._id.toString() === newFactorId.toString();
            })
        }
        // if the real factor wasn't found
        if (!testFactor) {
            reject(`Couldn't find the actual test factor from the factor id \
                    in the user object. Factor id: ${newFactorId}`);
        }

        // get the facet from the db so we can assign a new question
        let testFacet = undefined;
        // try using the index that we have stored. if the ids match, we have the right factor
        if (testFactor.facets[newFacetIndex]._id.toString() === newFacetId.toString()) {
            testFacet = testFactor.facets[newFacetIndex];
        }
        // otherwise we need to search for the right factor
        else {
            testFacet = testFactor.facets.find(currTestFacet => {
                return currTestFacet._id.toString() === newFacetId.toString();
            })
        }
        // if the real facet wasn't found
        if (!testFacet) {
            reject(`Couldn't find the actual test facet from the factor id \
                    in the user object. Factor id: ${newFacetId}`);
        }

        // factor and facet have been found
        // now find a random question
        let newQuestionIndex = Math.floor(Math.random() * testFacet.questions.length);
        // if this is the index of a question that has already been used, find
        // a question that has not yet been used
        let questionCounter = 0;
        while (newFacet.usedQuestions.some(questionId => {
            return questionId.toString() === testFacet.questions[newQuestionIndex]._id.toString();
        })) {
            newQuestionIndex++;
            questionCounter++;
            // can't have a question index out of bounds, that would be sad
            if (newQuestionIndex >= testFacet.questions.length) {
                newQuestionIndex = 0;
            }

            // if we have tried all the questions and all have been used, we
            // somehow ran out
            if (questionCounter > testFacet.questions.length) { reject("Ran out of questions!"); }
        }

        // if responses isn't an array, make it one
        if (!Array.isArray(newFacet.responses)) { newFacet.responses = []; }
        // add the new response that is currently in the making
        newFacet.responses.push({ startDate: new Date(), skips: [] });

        // we now have a question
        const newQuestion = testFacet.questions[newQuestionIndex];
        psychTest.currentQuestion = {
            factorIndex: newFactorIndex,
            factorId: newFactor.factorId,
            facetIndex: newFacetIndex,
            facetId: newFacet.facetId,
            questionId: newQuestion._id,
            responseIndex: newFacet.responses.length - 1,
            body: newQuestion.body,
            leftOption: newQuestion.leftOption,
            rightOption: newQuestion.rightOption,
            invertScore: newQuestion.invertScore
        }

        // update the user with the info about the new question
        newFactor.facets[newFacetIndex] = newFacet;
        psychTest.factors[newFactorIndex] = newFactor;

        // return the updated psych test
        return resolve({ psychTest });
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
