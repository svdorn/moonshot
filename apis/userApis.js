var Users = require('../models/users.js');
var Employers = require('../models/employers.js');
var Psychtests = require('../models/psychtests.js');
var Skills = require('../models/skills.js');
var Businesses = require('../models/businesses.js');

var bcrypt = require('bcryptjs');
var crypto = require('crypto');


// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        removeIrrelevantInfoKeepToken,
        getUserByQuery,
        sendEmail,
        safeUser,
        userForAdmin,
        getFirstName
} = require('./helperFunctions.js');


const userApis = {
    POST_signOut,
    POST_keepMeLoggedIn,
    GET_keepMeLoggedIn,
    GET_session,
    POST_session,
    POST_verifyEmail,
    POST_changePasswordForgot,
    POST_forgotPassword,
    POST_changePassword,
    POST_changeSettings,
    GET_userByProfileUrl,
    POST_login,
    POST_currentPathwayStep,
    POST_startPositionEval,
    POST_startPsychEval,
    POST_answerPsychQuestion,
    GET_printPsychScore,
    POST_submitFreeResponse,

    POST_resetFrizz
}


async function GET_printPsychScore(req, res) {
    const userId = "5af493a242f28d407fefdc41";
    const verificationToken = "2246696e0517ce1e4d320a2023d7d1fd88e3fa537a17a50059d444aebefabc87f29927881df0eed1658968014aac4462d468b859c430a5fe5d9d84b2f1ecabab";

    //const userId = sanitize(req.body.userId);
    //const verificationToken = sanitize(req.body.verificationToken);

    let user = undefined;
    try {
        user = await Users.findById(userId);
    } catch(getUserError) {
        console.log(getUserError);
    }

    if (!user) {
        console.log("User not found when trying to calculate psych score. Id: ", userId);
        return res.status(404).send("User not found.");
    }

    if (user.verificationToken !== verificationToken || !verificationToken) {
        return res.status(403).send("Insufficient permission.");
    }

    const psych = user.psychometricTest;

    let total = 0.0;

    let factorCounter = 0;
    let facetCounter = 0;

    let facetTotal = 0;
    let factorTotal = 0;
    let responseCounter = 0;

    let factorScoresTotal = 0;

    let currFactor = undefined;

    psych.factors.forEach(factor => {
        factor.facets.forEach(facet => {
            facet.responses.forEach(response => {
                responseCounter++;
                facetTotal += response.answer;
            });
            let facetScore = facetTotal / responseCounter;
            factorTotal += facetScore;
            responseCounter = 0;
            facetCounter++;
            facetTotal = 0;
            console.log(`${facet.name} score: `, facetScore);

        });

        let factorScore = factorTotal / facetCounter;
        factorScoresTotal += factorScore;
        console.log(`${factor.name.toUpperCase()} SCORE = `, factorScore);
        facetCounter = 0;
        factorCounter++;
        factorTotal = 0;
    });

    const finalScore = factorScoresTotal / factorCounter;
    console.log("score: ", finalScore);
}


async function makeMockPsychData() {
    let user = await Users.findById("5a95fed783705f7be1f7c158");
    let psychometricTest = user.psychometricTest;
    for (let factorIndex = 0; factorIndex < psychometricTest.factors.length; factorIndex++) {
        let factor = psychometricTest.factors[factorIndex];

        factor.incompleteFacets = [];

        let facetTotal = 0;

        for (let facetIndex = 0; facetIndex < factor.facets.length; facetIndex++) {
            let facet = factor.facets[facetIndex];

            facet.score = Math.floor(Math.random() * 11) - 5;

            facetTotal += facet.score;

            factor.facets[facetIndex] = facet;
        }

        factor.score = facetTotal / factor.facets.length;

        psychometricTest.factors[factorIndex] = factor;
    }

    user.psychometricTest = psychometricTest;

    user.psychometricTest.endDate = new Date();

    user.save()
    .then(result => {
        console.log("result: ", result);
    })
    .catch(err => {
        console.log("err: ", err);
    })
}


async function POST_resetFrizz(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);

    let frizz;
    try {
        frizz = await getAndVerifyUser(userId, verificationToken);
    } catch (frizzError) {
        console.log("error getting frizz: ", frizzError);
        return res.status(500).send("Error getting user.");
    }

    if (frizz.email != "frizzkitten@gmail.com") {
        return res.status(403).send("Not logged in with right account.");
    }

    frizz.skillTests = undefined;
    frizz.psychometricTest = undefined;
    frizz.positions = undefined;
    frizz.positionInProgress = undefined;

    frizz.save()
    .then(newFrizz => {
        return res.json(removePassword(newFrizz));
    })
    .catch(error => {
        console.log("error resetting frizz: ", error);
        return res.status(500).send("ERROR");
    })
}


// DANGEROUS, returns user with all fields
async function getAndVerifyUser(userId, verificationToken) {
    return new Promise(async function(resolve, reject) {
        // get the user from the db
        let user = undefined;
        try {
            user = await Users.findById(userId);
        } catch (getUserError) {
            console.log("Error getting user from the database: ", getUserError);
            reject({status: 500, message: "Server error, try again later", error: getUserError});
        }

        if (!user) {
            console.log("User not found from id: ", userId);
            reject({status: 404, message: "User not found. Contact Moonshot.", error: `No user with id ${userId}.`})
        }

        // verify user's identity
        if (!verificationToken && user.verificationToken !== verificationToken) {
            console.log(`Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`);
            reject({status: 500, message: "Invalid credentials.", error: `Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`});
        }

        resolve(user);
    })
}


async function POST_submitFreeResponse(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const frqs = sanitize(req.body.frqs);

    let user;
    let business;

    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch(getUserError) {
        console.log("Error getting user when trying to start position eval: ", getUserError.error);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : "Server error.");
    }

    // make sure the user is in the middle of an eval
    if (!user.positionInProgress || !user.positionInProgress.positionId) {
        return res.status(400).send("You are not currently in the middle of a position evaluation.");
    }

    const positionInProgress = user.positionInProgress;
    const positionId = positionInProgress.positionId.toString();

    // get the business offering the current position
    const businessId = positionInProgress.businessId;
    try {
        business = await Businesses.findById(businessId)
    } catch (findBizErr) {
        console.log("Error getting business when trying to start position eval: ", findBizErr);
        return res.status(500).send("Server error.");
    };

    if (!business) { return res.status(500).send("Position not found."); }

    const now = new Date();

    // submitting the frq questions finishes the whole application, so add this
    // position to the user's list of position applications
    user.positions.push({
        businessId,
        positionId: positionInProgress.positionId,
        hiringStage: "Not Contacted",
        hiringStageChanges: [{hiringStage: "Not Contacted", dateChanged: now}],
        appliedStartDate: positionInProgress.startDate,
        appliedEndDate: now,
        scores: {},
        freeResponseQuestions: frqs
    })

    // user is no longer taking a position evaluation
    user.positionInProgress = undefined;

    let userSaved = false;
    let businessSaved = false;

    // save the user
    user.save()
    .then(response => {
        userSaved = true;
        returnToUser();
    })
    .catch(saveUserError => {
        res.status(500).send("Error saving responses.");
    })

    // update the business to say that they have a user who has completed their application
    let positionIndex = business.positions.findIndex(function(bizPos) {
        return bizPos._id.toString() === positionId;
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
    businessPos.usersInProgress++;
    business.positions[positionIndex] = businessPos;

    business.save()
    .then(response => {
        returnToUser();
        businessSaved = true;
    })
    .catch(error => {
        console.log("ERROR SAVING BUSINESS WHEN USER FINISHED APPLICATION: ", error);
        // return to the user even if there is an error so the user doesn't
        // know anything is wrong
        businessSaved = true;
        returnToUser();
    });

    function returnToUser() {
        if (userSaved && businessSaved) {
            res.json({updatedUser: removePassword(user)});
        }
    }
}


async function POST_startPositionEval(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const businessId = sanitize(req.body.businessId);
    const positionId = sanitize(req.body.positionId);
    const positionIdString = positionId.toString();

    let user;
    getAndVerifyUser(userId, verificationToken)
    .then(foundUser => {
        user = foundUser;

        // make sure the user isn't already in the middle of a position eval
        if (user.positionInProgress && user.positionInProgress.positionId && user.positionInProgress.positionId.toString() !== positionIdString) {
            return res.status(400).send("You are already in the middle of an evaluation!");
        }

        startEval();
    })
    .catch(getUserError => {
        console.log("getUserError: ", getUserError);
        console.log("Error getting user when trying to start position eval: ", getUserError.error);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : "Server error.");
    })

    let business;
    Businesses.findById(businessId)
    .then(foundBiz => {
        business = foundBiz;
        if (!business) { return res.status(500).send("No position found."); }
        startEval();
    })
    .catch(findBizErr => {
        console.log("Error getting business when trying to start position eval: ", findBizErr);
        return res.status(500).send("Server error.");
    });


    async function startEval() {
        // need both to be found before running through this
        if (!user || !business) { return; }

        const position = business.positions.find(pos => {
            return pos._id.toString() === positionIdString;
        });

        if (!position) {
            return res.status(400).send("Invalid position.");
        }

        let testIndex = 0;
        let skillTests = [];
        let userSkillTests = user.skillTests;
        // go through the user's skills to see which they have completed already
        // TODO: review: this assumes the user won't have any in-progress skill tests
        // when they start a position evalution; determine wheter that is an accurate assumption
        position.skills.forEach(skillId => {
            // if the user has already completed this skill test ...
            if (userSkillTests.some(completedSkill => {
                return completedSkill.skillId.toString() === skillId.toString();
            })) {
                // ... add it to the front of the list and increase test index so we
                // know to skip it
                skillTests.unshift(skillId);
                testIndex++;
            }

            // if the user hasn't already completed this skill test, just add it
            // to the end of the array
            else { skillTests.push(skillId); }
        });

        // create the free response objects that will be stored in the user db
        const numFRQs = position.freeResponseQuestions.length;
        let frqsForUser = [];
        for (let frqIndex = 0; frqIndex < numFRQs; frqIndex++) {
            const frq = position.freeResponseQuestions[frqIndex];
            frqsForUser.push({
                questionId: frq._id,
                questionIndex: frqIndex,
                response: undefined,
                body: frq.body,
                required: frq.required
            });
        }

        // position object within user's positions array
        let userPosition = {
            companyId: businessId,
            positionId,
            hiringStage: "Not Contacted",
            hiringStageChanges: [],
            appliedStartDate: new Date(),
            freeResponseQuestions: frqsForUser
        }

        user.positionInProgress = {
            inProgress: true,
            freeResponseQuestions: frqsForUser,
            businessId, positionId, skillTests, testIndex
        }

        const hasTakenPsychTest = user.psychometricTest && user.psychometricTest.inProgress === false;
        console.log("hasTakenPsychTest: ", hasTakenPsychTest);
        // if we're trying to take a test that is past the number of tests we
        // have, we must be done with all the skill tests
        const doneWithSkillTests = testIndex === skillTests.length;
        console.log("doneWithSkillTests: ", doneWithSkillTests);
        // where the user will be redirected now
        let nextUrl = "";
        // finished with the application just by hitting apply?
        let finished = false;
        // if the user hasn't taken the psychometric exam before, have them do that first
        if (!hasTakenPsychTest) {
            // sign up for the psych test
            user = await internalStartPsychEval(user);
            // get the user to the psych eval page
            nextUrl = "/psychometricAnalysis";
        }
        // otherwise, if the user hasn't done all the skills tests, have the
        // first incomplete skill test be first up
        else if (!doneWithSkillTests) {
            // get the url of the first test
            try {
                const skillTest = await Skills.findById(skillTests[testIndex]).select("url");
                nextUrl = `/skillTest/${skillTest.url}`;
            } catch (getSkillTestError) {
                console.log("Error getting skill test: ", getSkillTestError);
                return res.status(500).send("Server error.");
            }
        }
        // if the user has finished all skill and psych tests, give them the
        // free response questions they have to answer
        else if (frqsForUser.length > 0) {
            // uses the user's positionInProgress object to get the questions
            nextUrl = "/freeResponse";
        }
        // the user is finished already with the application
        else {
            userPosition.endDate() = new Date();
            finished = true;
            user.positionInProgress = undefined;
        }

        user.save().then(updatedUser => {
            return res.json({updatedUser: removePassword(updatedUser), finished, nextUrl});
        }).catch(saveUserErr => {
            return res.status(500).send("Server error, couldn't start position evaluation.");
        })
    }
}


async function POST_answerPsychQuestion(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    let user = undefined;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserErrorObj) {
        console.log("error getting user: ", getUserErrorObj);
        return res.status(getUserErrorObj.status).send(getUserErrorObj.message);
    }

    const answer = sanitize(req.body.answer);
    //const answer = -4;

    // verify that the answer provided is valid
    const MINIMUM_SCORE = -5;
    const MAXIMUM_SCORE = 5;
    if (typeof answer !== "number" || answer < MINIMUM_SCORE || answer > MAXIMUM_SCORE) {
        console.log(`User with id ${userId} tried to answer a psych question with an invalid answer.`);
        return res.status(400).send("Invalid input.");
    }

    let psychometricTest = user.psychometricTest;

    // if the test is not in progress the user can't complete a question
    if (!psychometricTest.inProgress) {
        console.log(`User with id ${userId} tried to answer a question without test being in progress.`);
        return res.status(403).send("You can't answer a question after finishing the analysis!");
    }

    let factors = psychometricTest.factors;
    const currentQuestion = psychometricTest.currentQuestion;

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

    // check if the facet is done being tested for
    if (facet.responses.length === psychometricTest.questionsPerFacet) {
        const indexOfFacetIndexToRemove = factor.incompleteFacets.findIndex(incompleteFacetIndex => {
            return incompleteFacetIndex === facetIndex;
        })
        // remove this facet so we know not to test for it again
        factor.incompleteFacets.splice(indexOfFacetIndexToRemove, 1);
    }

    factors[factorIndex] = factor;
    psychometricTest.factors = factors;

    // check if the factor is done being tested for
    if (factor.incompleteFacets.length === 0) {
        const indexOfFactorIndexToRemove = psychometricTest.incompleteFactors.findIndex(incompleteFactorIndex => {
            return incompleteFactorIndex === factorIndex;
        });
        // remove this factor so we know not to test for it again
        psychometricTest.incompleteFactors.splice(indexOfFactorIndexToRemove, 1);
    }

    // check if the test is over (all factors have been completed tested for)
    let finishedTest = false;
    if (psychometricTest.incompleteFactors.length === 0) {
        // finish the test
        psychometricTest.endDate = new Date();
        psychometricTest.totalTime = psychometricTest.endDate.getTime() - psychometricTest.startDate.getTime();
        psychometricTest.inProgress = false;
        psychometricTest.currentQuestion = { body: "You finished the psychometric analysis!" };

        finishedTest = true;

        // TODO check if the user is taking a position evaluation and if so
        // whether they're done with it
        const positionInProgress = user.positionInProgress;
        if (positionInProgress) {
            const applicationComplete =
                (!positionInProgress.skillTests ||
                 positionInProgress.testIndex >= positionInProgress.skillTests.length) &&
                (!positionInProgress.freeResponseQuestions ||
                 positionInProgress.freeResponseQuestions.length === 0);
            // if the application is complete, mark it as such
            if (applicationComplete) {
                // user is no longer taking a position evaluation
                user.positionInProgress = undefined;

                let business;
                try {
                    business = await Businesses.findById(positionInProgress.businessId);

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
                    businessPos.usersInProgress++;
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

    }

    // otherwise the test is not over so they need a new question
    else {
        // the index of the factor that will be tested next
        // pick a random index from the index of factors that are not yet finished
        const newFactorIndex = psychometricTest.incompleteFactors[Math.floor(Math.random() * psychometricTest.incompleteFactors.length)];
        let newFactor = psychometricTest.factors[newFactorIndex];
        const newFactorId = newFactor.factorId;
        const newFacetIndex = newFactor.incompleteFacets[Math.floor(Math.random() * newFactor.incompleteFacets.length)]
        let newFacet = newFactor.facets[newFacetIndex];
        const newFacetId = newFacet.facetId;

        // the actual psych test with all its questions
        let psychTest = undefined;
        try {
            psychTest = await Psychtests.findOne({});
        } catch (getPsychTestError) {
            console.log("Error getting the psych test: ", getPsychTestError);
            return res.status(500).send("Server error.");
        }

        // get the factor from the db so we can assign a new question
        let testFactor = undefined;
        // try using the index that we have stored. if the ids match, we have the right factor
        if (psychTest.factors[newFactorIndex]._id.toString() === newFactorId.toString()) {
            testFactor = psychTest.factors[newFactorIndex];
        }
        // otherwise we need to search for the right factor
        else {
            testFactor = psychTest.factors.find(currTestFactor => {
                return currTestFactor._id.toString() === newFactorId.toString();
            })
        }
        // if the real factor wasn't found
        if (!testFactor) {
            console.log("Couldn't find the actual test factor from the factor id in the user object. Factor id: ", newFactorId);
            return res.status(500).send("Server error.");
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
            console.log("Couldn't find the actual test facet from the factor id in the user object. Factor id: ", newFacetId);
            return res.status(500).send("Server error.");
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
            if (questionCounter > testFacet.questions.length) {
                console.log("Ran out of questions! New Facet: ", newFacet);
                res.status(500).send("Ran out of questions!");
            }
        }

        // if responses isn't an array, make it one
        if (!Array.isArray(newFacet.responses)) { newFacet.responses = []; }
        // add the new response that is currently in the making
        newFacet.responses.push({
            startDate: new Date(),
            skips: []
        });

        // we now have a question
        const newQuestion = testFacet.questions[newQuestionIndex];
        psychometricTest.currentQuestion = {
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
        psychometricTest.factors[newFactorIndex] = newFactor;
    }

    user.psychometricTest = psychometricTest;

    let updatedUser = undefined;
    try {
        updatedUser = await user.save();
    } catch(saveUserErr) {
        console.log("Error saving user that was trying to save a psych question answer: ", saveUserErr);
        return res.status(500).send("Server error.");
    }

    res.json({user: removeIrrelevantInfoKeepToken(updatedUser), finishedTest});
}


async function internalStartPsychEval(user) {
    return new Promise(async function(resolve, reject) {
        if (user.psychometricTest.startDate) {
            reject({statusCode: 400, error: "psych test already taken", msg: "You can't take the exam twice! If you need to take the exam again, contact us."});
        }

        let psychTest = undefined;
        try {
            psychTest = await Psychtests.find();
            psychTest = psychTest[0];
        } catch (getTestError) {
            reject({statusCode: 500, error: getTestError, msg: "Server error."});
        }

        // make the incompleteFactors list; will end up as [0, 1, 2, ...] for however many factors there are
        const numFactors = psychTest.factors.length;
        let incompleteFactors = [];
        for (let factorIndex = 0; factorIndex < numFactors; factorIndex++) {
            incompleteFactors.push(factorIndex);
        }

        let factors = psychTest.factors.map(factor => {
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

        // get a random question; since we just assigned the factors from the test,
        // we know the indexes will be the same
        const factorIndex = Math.floor(Math.random() * factors.length);
        const factor = psychTest.factors[factorIndex];
        const facetIndex = Math.floor(Math.random() * factor.facets.length);
        const facet = factor.facets[facetIndex];
        const question = facet.questions[Math.floor(Math.random() * facet.questions.length)];

        const currentQuestion = {
            factorIndex,
            factorId: factor._id,
            facetIndex: facetIndex,
            facetId: facet._id,
            questionId: question._id,
            // since this is the first response to the quiz it must be the first in the facet too
            responseIndex: 0,
            body: question.body,
            leftOption: question.leftOption,
            rightOption: question.rightOption,
            invertScore: question.invertScore
        }

        // tell the facet that we're giving it a response
        factors[factorIndex].facets[facetIndex].responses = [{
            startDate: new Date(),
            skips: []
        }];

        user.psychometricTest = {
            // user has not finished the exam
            inProgress: true,
            startDate: new Date(),
            // currently not allowing any rephrases, change later
            rephrase: false,
            numRephrasesAllowed: 0,
            // around 75 questions
            questionsPerFacet: 1,
            incompleteFactors,
            factors,
            currentQuestion
        }

        resolve(user);
    });
}


async function POST_startPsychEval(req, res) {
    // check for invalid input
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    //const userId = "5af493a242f28d407fefdc41";
    //const verificationToken = "2246696e0517ce1e4d320a2023d7d1fd88e3fa537a17a50059d444aebefabc87f29927881df0eed1658968014aac4462d468b859c430a5fe5d9d84b2f1ecabab";

    // get the user from the db
    let user = undefined;
    try {
        user = await Users.findById(userId);
    } catch (getUserError) {
        console.log("Error getting user from the database: ", getUserError);
        return res.status(500).send("Server error, try again later.");
    }

    if (!user) {
        console.log("Couldn't find user from userId: ", userId);
        res.status(404).send("Couldn't find user.");
    }

    // verify user's identity
    if (!verificationToken && user.verificationToken !== verificationToken) {
        console.log(`Mismatched verification token. Given: ${verificationToken}, should be: ${user.verificationToken}`);
        return res.status(403).send("Invalid user credentials.");
    }

    try {
        user = await internalStartPsychEval(user);
    } catch (startEvalError) {
        console.log("Error starting psych eval: ", startEvalError.error);
        res.status(startEvalError.statusCode).send(startEvalError.msg);
    }

    try {
        await user.save();
        return res.json(removePassword(user));
    } catch (saveUserErr) {
        console.log("Error saving user when trying to start psych exam: ", saveUserErr);
        return res.status(400).send("Server error, try again later.");
    }
}


function GET_session(req, res) {
    if (typeof req.session.userId === 'string') {
        const userId = sanitize(req.session.userId);
        getUserByQuery({_id: userId}, function (err, user) {
            // if no user found, the user was probably deleted. remove the
            // user from the session and don't log in
            if (!user || user == null) {
                req.session.userId = undefined;
                req.session.save(function(err) {
                    res.json(undefined);
                })
                return;
            } else {
                res.json(removePassword(user));
            }
        })
    }
    else {
        res.json(undefined);
    }
}


function POST_session(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);

    // check if option to stay logged in is true
    const saveSession = sanitize(req.session.stayLoggedIn);
    if (!saveSession) {
        return;
    }

    if (!userId || !verificationToken) {
        res.json("either no userId or no verification token");
        return;
    }

    // get the user from the id, check the verification token to ensure they
    // have the right credentials to stay logged in
    getUserByQuery({_id: userId}, function(error, foundUser) {
        if (foundUser.verificationToken == verificationToken) {
            req.session.userId = userId;

            // save user id to session
            req.session.save(function(err) {
                if (err) {
                    console.log("error saving user id to session: ", err2);
                } else {
                    res.json(true);
                    return;
                }
            });
        } else {
            res.json("incorrect user credentials");
            return;
        }
    });
}


// signs the user out by marking their session id as undefined
function POST_signOut(req, res) {
    req.session.userId = undefined;
    req.session.save(function (err) {
        if (err) {
            console.log("error removing user session: ", err);
            res.json("failure removing user session");
        } else {
            res.json("success");
        }
    })
}


// change session to store whether user wants default of "Keep Me Logged In"
// to be checked or unchecked
function POST_keepMeLoggedIn(req, res) {
    if (typeof req.body.stayLoggedIn === "boolean") {
        req.session.stayLoggedIn = req.body.stayLoggedIn;
    } else {
        req.session.stayLoggedIn = false;
    }
    req.session.save(function (err) {
        if (err) {
            console.log("error saving 'keep me logged in' setting: ", err);
            res.json("error saving 'keep me logged in' setting");
        } else {
            res.json("success");
        }
    })
}


// get the setting to stay logged in or out
function GET_keepMeLoggedIn(req, res) {
    let setting = sanitize(req.session.stayLoggedIn);
    if (typeof setting !== "boolean") {
        setting = false;
    }
    res.json(setting);
}


// verify user's email so they can log in
function POST_verifyEmail(req, res) {
    const token = sanitize(req.body.token);
    const userType = sanitize(req.body.userType);

    // query form business user database if the user is a business user
    const DB = (userType === "employer") ? Employers : Users;

    if (!token) {
        res.status(400).send("Url not in the right format");
        return;
    }

    var query = {emailVerificationToken: token};
    DB.findOne(query, function (err, user) {
        if (err) {
            console.log("Error trying to find user from verification token");
            return res.status(500).send("Server error, try again later");
        }

        if (!user) {
            return res.status(404).send("User not found from url");
        }

        user.verified = true;
        user.emailVerificationToken = undefined;

        user.save(function(updateErr, updatedUser) {
            if (updateErr) {
                console.log("Error saving user's verified status to true: ", updateErr);
                return res.status(500).send("Server error, try again later");
            }

            // we don't save the user session if logging in as business user
            // because it is likely the account was created on a different computer
            if (userType === "employer") {
                return res.json(updatedUser.email);
            }

            // if the session has the user's id, can immediately log them in
            sessionUserId = sanitize(req.session.unverifiedUserId);
            req.session.unverifiedUserId = undefined;

            req.session.userId = sessionUserId;

            req.session.save(function (err) {
                if (err) {
                    console.log("Error saving session after verifying user: ", err);
                }
            });

            if (sessionUserId && sessionUserId == updatedUser._id) {
                return res.json(removePassword(updatedUser));
            }
            // otherwise, bring the user to the login page
            else {
                return res.json("go to login");
            }
        });
    });
}


function POST_changePasswordForgot(req, res) {
    let token = sanitize(req.body.token).toString();
    let password = sanitize(req.body.password);

    var query = {passwordToken: token};
    Users.findOne(query, function (err, user) {
        if (err) {
            console.log("Error trying to find user from password token: ", err);
            return res.status(500).send("Server error, try again later");
        }

        if (!user) {
            return res.status(404).send("User not found from link");
        }

        const currentTime = Date.now();
        if (currentTime > user.passwordTokenExpirationTime) {
            return res.status(401).send("Time ran out, try sending email again");
        }

        let query = {_id: user._id};
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                // change the stored password to be the hash
                const newPassword = hash;
                // if the field doesn't exist, $set will set a new field
                // can be verified because the user had to go to their email
                // to get to this page
                var update = {
                    '$set': {
                        password: newPassword,
                        verified: true
                    },
                    '$unset': {
                        passwordToken: "",
                        passwordTokenExpirationTime: "",
                    }
                };

                // When true returns the updated document
                var options = {new: true};

                Users.findOneAndUpdate(query, update, options, function (err, newUser) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error saving new password");
                    }

                    // successfully created new password
                    return res.json(removePassword(newUser));
                });
            })
        })
    });
}


function POST_changePassword(req, res) {
    var user = sanitize(req.body);
    var query = {_id: user._id};

    // if the field doesn't exist, $set will set a new field
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (saltErr, salt) {
        if (saltErr) {
            console.log("Error generating salt for resetting password: ", saltErr);
            return res.status(500).send("Server error. Could not change password.");
        }
        bcrypt.hash(user.password, salt, function (hashErr, hash) {
            // error encrypting the new password
            if (hashErr) {
                console.log("Error hashing user's new password when trying to reset password: ", hashErr);
                return res.status(500).send("Server error. Couldn't change password.");
            }

            Users.findOne(query, function (dbFindErr, userFromDB) {
                if (dbFindErr) {
                    console.log("Error finding the user that is trying to reset their password: ", dbFindErr);
                    return res.status(500).send("Server error. Couldn't change password.");
                }

                // CHECK IF A USER WAS FOUND
                if (!userFromDB) {
                    return res.status(404).send("Server error. Couldn't change password.");
                }

                bcrypt.compare(user.oldpass, userFromDB.password, function (passwordError, passwordsMatch) {
                    // error comparing passwords, not necessarily that the passwords don't match
                    if (passwordError) {
                        console.log("Error comparing passwords when trying to reset password: ", passwordError);
                        return res.status(500).send("Server error. Couldn't change password.");
                    }
                    // user gave the correct old password
                    else if (passwordsMatch) {
                        // update the user's password
                        userFromDB.password = hash;
                        // save the user in the db
                        userFromDB.save(function(saveErr, newUser) {
                            if (saveErr) {
                                console.log("Error saving user's new password when resetting: ", saveErr);
                                return res.status(500).send("Server error. Couldn't change password.");
                            } else {
                                //successfully changed user's password
                                return res.json(removePassword(newUser));
                            }
                        });
                    } else {
                        return res.status(400).send("Old password is incorrect.");
                    }
                });
            });
        });
    });
}


// send email for password reset
function POST_forgotPassword(req, res) {
    let email = sanitize(req.body.email);
    let query = {email: email};

    const user = getUserByQuery(query, function (err, user) {
        if (!user) {
            console.log("Couldn't find user to set their password change token.");
            return res.status(401).send("Cannot find user");
        } else {
            // token that will go in the url
            const newPasswordToken = crypto.randomBytes(64).toString('hex');
            // password token expires in one hour (minutes * seconds * milliseconds)
            const newTime = Date.now() + (60 * 60 * 1000);

            const query2 = {_id: user._id};
            const update = {
                '$set': {
                    passwordToken: newPasswordToken,
                    passwordTokenExpirationTime: newTime,
                }
            };

            const options = {new: true};

            Users.findOneAndUpdate(query2, update, options, function (err, foundUser) {
                if (err) {
                    console.log("Error giving user reset-password token: ", err);
                    return res.status(500).send("Server error, try again later.");
                }

                // if we're in development (on localhost) navigate to localhost
                let moonshotUrl = "https://www.moonshotinsights.io/";
                if (!process.env.NODE_ENV) {
                    moonshotUrl = "http://localhost:8081/";
                }
                const recipient = [user.email];
                const subject = 'Change Password';

                const content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                        + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                            + '<div style="text-align:justify;width:80%;margin-left:10%;">'
                            + "<span style='margin-bottom:20px;display:inline-block;'>Hello! We got a request to change your password. If that wasn't from you, you can ignore this email and your password will stay the same. Otherwise click here:</span><br/>"
                            + '</div>'
                        + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:5px 20px 20px;" href="' + moonshotUrl + 'changePassword?token='
                        + newPasswordToken
                        + '">Change Password</a>'
                        + '<div style="text-align:left;width:80%;margin-left:10%;">'
                            + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                                + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                                + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + user.email + '">Opt-out of future messages.</a></i>'
                            + '</div>'
                        + '</div>'
                    + '</div>';

                const sendFrom = "Moonshot";
                sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                    if (success) {
                        res.json(msg);
                    } else {
                        res.status(500).send(msg);
                    }
                })
            });
        }
    })
}


function GET_userByProfileUrl(req, res) {
    if (typeof req.query !== "object") { return res.status(400).send("Bad url."); }

    const profileUrl = sanitize(req.query.profileUrl);
    const query = { profileUrl };
    getUserByQuery(query, function (err, user) {
        if (err) { return res.status(400).send("Bad url"); }
        return res.json(safeUser(user));
    });
}


function POST_login(req, res) {
    const reqUser = sanitize(req.body.user);
    let saveSession = sanitize(req.body.saveSession);

    if (typeof saveSession !== "boolean") {
        saveSession = false;
    }
    var email = reqUser.email;
    var password = reqUser.password;

    let user = null;

    // searches for user by case-insensitive email
    const emailRegex = new RegExp(email, "i");
    var query = {email: emailRegex};
    Users.findOne(query, function (err, foundUser) {
        if (err) {
            return res.status(500).send("Error performing query to find user in db. ", err);
        }

        // CHECK IF A USER WAS FOUND
        if (!foundUser || foundUser == null) {
            // CHECK IF THE USER IS IN THE BUSINESS USER DB
            Employers.findOne(query, function(err2, foundEmployer) {
                if (err2) {
                    return res.status(500).send("Error performing query to find user in business user db. ", err);
                }

                if (!foundEmployer || foundEmployer == null) {
                    console.log('looked in business db, none found')
                    return res.status(404).send("No user with that email was found.");
                }

                user = foundEmployer;
                tryLoggingIn();
                return;
            });
        }
        // USER FOUND IN USER DB
        else {
            user = foundUser;
            tryLoggingIn();
            return;
        }
    });

    // executed once a user is found
    function tryLoggingIn() {
        bcrypt.compare(password, user.password, function (passwordError, passwordsMatch) {
            // if hashing password fails
            if (passwordError) {
                return res.status(500).send("Error logging in, try again later.");
            }
            // passwords match
            else if (passwordsMatch) {
                // check if user verified email address
                if (user.verified) {
                    user = removePassword(user);
                    if (saveSession) {
                        req.session.userId = user._id;
                        req.session.save(function (err) {
                            if (err) {
                                console.log("error saving user session", err);
                            }
                            return res.json(removePassword(user));
                        });
                    } else {
                        return res.json(removePassword(user));
                    }
                }
                // if user has not yet verified email address, don't log in
                else {
                    return res.status(401).send("Email not yet verified");
                }
            }
            // wrong password
            else {
                return res.status(400).send("Password is incorrect.");
            }
        });
    }
}


function POST_changeSettings(req, res) {
    const user = sanitize(req.body);
    const password = user.password;

    if (!user.password || !user.name || !user.email) {
        console.log("Not all arguments provided for settings change.");
        return res.status(400).send("No fields can be empty.");
    }

    const userQuery = {_id: user._id}

    Users.findOne(userQuery, function(findUserErr, foundUser) {
        // if error while trying to find current user
        if (findUserErr) {
            console.log("Error finding user in db when trying to update settings: ", findUserErr);
            return res.status(500).send("Settings couldn't be updated. Try again later.");
        }

        if (!foundUser) {
            console.log("Didn't find a user with given id when trying to update settings.");
            return res.status(500).send("Settings couldn't be updated. Try again later.");
        }

        bcrypt.compare(password, foundUser.password, function (passwordError, passwordsMatch) {
            // error comparing password to user's password, doesn't necessarily
            // mean that the password is wrong
            if (passwordError) {
                console.log("Error comparing passwords when trying to update settings: ", passwordError);
                return res.status(500).send("Settings couldn't be updated. Try again later.");
            }

            // user entered wrong password
            if (!passwordsMatch) {
                return res.status(400).send("Incorrect password");
            }

            // see if there's another user with the new email
            const emailQuery = {email: user.email};
            Users.findOne(emailQuery, function(emailQueryErr, userWithEmail) {
                // don't want two users with the same email, so in case of db search
                // failure, return unsuccessfully
                if (emailQueryErr) {
                    console.log("Error trying to find a user with the same email address as the one provided by user trying to change settings: ", emailQueryErr);
                    return res.status(500).send("Settings couldn't be updated. Try again later.");
                }

                // someone else already has that email
                if (userWithEmail && userWithEmail._id.toString() != foundUser._id.toString()) {
                    return res.status(400).send("That email address is already taken.");
                }

                // all is good, update the user (as long as email and name are not blank)
                if (user.email) {
                    foundUser.email = user.email;
                }
                if (user.name) {
                    foundUser.name = user.name;
                }
                if (typeof user.hideProfile === "boolean") {
                    foundUser.hideProfile = user.hideProfile;
                }

                foundUser.save(function(saveErr, newUser) {
                    // if there is an error saving the user's info
                    if (saveErr) {
                        console.log("Error when saving user's changed info: ", saveErr);
                        return res.status(500).send("Settings couldn't be updated. Try again later.");
                    }

                    // settings change successful
                    return res.json(newUser);
                })
            });
        });
    })
}


function POST_currentPathwayStep(req, res) {
    const userId = sanitize(req.body.params.userId);
    const pathwayId = sanitize(req.body.params.pathwayId);
    const stepNumber = sanitize(req.body.params.stepNumber);
    const subStepNumber = sanitize(req.body.params.subStepNumber);
    const verificationToken = sanitize(req.body.params.verificationToken);

    Users.findById(userId, function (err, user) {
        if (!verifyUser(user, verificationToken)) {
            return res.status(401).send("User does not have valid credentials to save step.");
        }

        let pathwayIndex = user.pathways.findIndex(function (path) {
            return path.pathwayId == pathwayId;
        });
        user.pathways[pathwayIndex].currentStep = {
            subStep: subStepNumber,
            step: stepNumber
        }
        user.save(function () {
            res.json(true);
        });
    })
    .catch(function (err) {
        console.log("error saving the current step, ", err);
    })
}


module.exports = userApis;
