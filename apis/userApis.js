const Users = require('../models/users.js');
const Psychtests = require('../models/psychtests.js');
const Skills = require('../models/skills.js');
const Businesses = require('../models/businesses.js');
const Adminquestions = require("../models/adminquestions");

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require("mongoose");


// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        sendEmail,
        getFirstName,
        getAndVerifyUser,
        getUserFromReq,
        frontEndUser,
        getSkillNamesByIds,
        lastPossibleSecond,
        findNestedValue
} = require('./helperFunctions');

const { calculatePsychScores } = require('./psychApis');
const errors = require('./errors.js');


const userApis = {
    POST_signOut,
    POST_keepMeLoggedIn,
    GET_keepMeLoggedIn,
    GET_session,
    POST_session,
    POST_updateOnboarding,
    POST_verifyEmail,
    POST_changePasswordForgot,
    POST_forgotPassword,
    POST_changePassword,
    POST_changeSettings,
    POST_login,
    POST_startPositionEval,
    POST_addPositionEval,
    POST_startPsychEval,
    GET_influencerResults,
    GET_checkUserVerified,
    POST_answerPsychQuestion,
    POST_submitFreeResponse,
    GET_positions,
    GET_adminQuestions,
    GET_notificationPreferences,
    POST_notificationPreferences,
    POST_sawEvaluationIntro,
    POST_agreeToTerms,
    POST_verifyFromApiKey,

    internalStartPsychEval,
    addEvaluation,
    finishPositionEvaluation
}


// gets results for a user and influencers
async function GET_influencerResults(req, res) {
    const userId = sanitize(req.query.userId);
    const positionId = sanitize(req.query.positionId);
    const businessId = sanitize(req.query.businessId);

    let positionRequirements = [
        { "businessId": mongoose.Types.ObjectId(businessId) },
        { "positionId": mongoose.Types.ObjectId(positionId) }
    ];

    const candidateQuery = {
        "_id": mongoose.Types.ObjectId(userId),
        "positions": {
            "$elemMatch": {
                "$and": positionRequirements
            }
        }
    }

    let infulencerPositionReqs = [
        { "businessId": mongoose.Types.ObjectId(businessId) },
        { "positionId": mongoose.Types.ObjectId(positionId) },
        { "influencer": true }
    ];

    const influencersQuery = {
        "positions": {
            "$elemMatch": {
                "$and": infulencerPositionReqs
            }
        }
    }

    try {
        var [user, influencers, psychTest] = await Promise.all([
            Users.findOne(candidateQuery).select("name email skillTests psychometricTest positions"),
            Users.find(influencersQuery).select("name email skillTests psychometricTest positions"),
            Psychtests.findOne({}).select("factors._id factors.stats")
        ]);
    } catch(findError) {
        console.log("Error finding user or influencers: ", findError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    const returnUser = getResults(user, psychTest);

    let returnInfluencers = [];
    for (let i = 0; i < influencers.length; i++) {
        returnInfluencers.push(getResults(influencers[i], psychTest));
    }

    return res.json({returnUser, returnInfluencers});
}

function getResults(user, psychTest) {
    // get the position
    const position = user.positions[0];
    // Make newUser that we will return
    const newUser = {
        name: user.name,
        email: user.email,
        scores: position.scores
    }
    // get skill test scores for relevant skills
    const skillScores = Array.isArray(user.skillTests) ? user.skillTests.filter(skill => {
        return position.skillTestIds.some(posSkillId => {
            return posSkillId.toString() === skill.skillId.toString();
        });
    }) : [];
    // have to convert the factor names to what they will be displayed as
    const psychNameConversions = {
        "Extraversion": "Dimension",
        "Emotionality": "Temperament",
        "Honesty-Humility": "Viewpoint",
        "Conscientiousness": "Methodology",
        "Openness to Experience": "Perception",
        "Agreeableness": "Ethos",
        "Altruism": "Belief"
    };
    const psychScores = user.psychometricTest.factors.map(area => {
        // find the factor within the psych test so we can get the middle 80 scores
        const factorIndex = psychTest.factors.findIndex(fac => {
            return fac._id.toString() === area.factorId.toString();
        });
        const foundFactor = typeof factorIndex === "number" && factorIndex >= 0;
        stats = foundFactor ? psychTest.factors[factorIndex].stats : undefined;

        return {
            name: psychNameConversions[area.name],
            score: area.score,
            stats
        }
    });

    newUser.skillScores = skillScores;
    newUser.psychScores = psychScores;

    return newUser;
}


// get the questions that are shown on the administrative questions portion of an evaluation
async function GET_adminQuestions(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    let user, adminQuestions;
    try {
        let [foundUser, foundQuestions] = await Promise.all([
            getAndVerifyUser(userId, verificationToken),
            // there is only one object in this db
            Adminquestions.findOne({})
        ]);
        if (!foundQuestions) {
            throw "foundQuestions was null";
        }

        user = foundUser; adminQuestions = foundQuestions;
    } catch (getUserError) {
        console.log("error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    return res.json(adminQuestions);
}


async function GET_notificationPreferences(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    return res.json(user.notifications);
}

async function POST_notificationPreferences(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const preference = sanitize(req.body.preference);

    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting user while trying to get admin questions: ", getUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    user.notifications.time = preference;

    try {
        user = await user.save();
        return res.json({updatedUser: frontEndUser(user)})
    } catch (saveError) {
        console.log("error saving user or business after submitting frq: ", saveError);
        return res.status(500).send("Server error.");
    }
}


async function POST_submitFreeResponse(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const frqs = sanitize(req.body.frqs);

    let user;
    let business;

    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch(getUserError) {
        console.log("Error getting user when trying to start position eval: ", getUserError.error);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : "Server error.");
    }

    // make sure the user is in the middle of an eval
    if (!user.positionInProgress) {
        return res.status(400).send("You are not currently in the middle of a position evaluation.");
    }

    // get the id and actual position for the position in progress
    const positionId = user.positionInProgress.toString();
    const userPositionIndex = user.positions.findIndex(pos => {
        return pos.positionId.toString() === positionId;
    });
    if (typeof userPositionIndex !== "number" || userPositionIndex < 0) {
        console.log("Position not found in user from position id.");
        return res.status(500).send("Server error.");
    }
    let userPosition = user.positions[userPositionIndex];

    const now = new Date();

    // update the position with the answered frqs
    userPosition.freeResponseQuestions = frqs;

    // make sure the updated position is saved to the user
    user.positions[userPositionIndex] = userPosition;

    // mark the position as complete, as answering frqs is always the last step
    try {
        user = await finishPositionEvaluation(user, userPosition.positionId, userPosition.businessId);
    } catch (finishEvalError) {
        console.log("error finish position evaluation: ", finishEvalError);
        return res.status(500).send("Server error.");
    }

    try {
        user = await user.save();
        return res.json({updatedUser: frontEndUser(user), positionId: userPosition.positionId, businessId: userPosition.businessId})
    } catch (saveError) {
        console.log("error saving user or business after submitting frq: ", saveError);
        return res.status(500).send("Server error.");
    }
}


// add a position without starting it
async function POST_addPositionEval(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const businessId = sanitize(req.body.businessId);
    const positionId = sanitize(req.body.positionId);

    // get the user
    let user;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("error getting user while adding position eval: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : "Server error.");
    }

    // add the evaluation to the user
    try {
        const startDate = new Date();
        let { newUser, finished, positionIndex } = await addEvaluation(user, businessId, positionId, startDate);
        user = newUser;
    } catch (addEvaluationError) {
        console.log(addEvaluationError);
        return res.status(500).send("Couldn't add position.");
    }

    // save the user and return on success
    try {
        await user.save();
        return res.json(true);
    } catch (saveError) {
        console.log("error saving user with new eval: ", saveError);
        return res.status(500).send(errors.SERVER_ERROR);
    }
}


async function getPosition(businessId, positionId) {
    return new Promise(async function(resolve, reject) {
        try {
            // find business by business id
            const findById = { _id: businessId };
            // only return the position we want
            const correctPositionOnly = {
                "positions": {
                    "$elemMatch": {
                        "_id": positionId
                    }
                }
            }
            const business = await Businesses.findOne(findById, correctPositionOnly);
            // make sure the position exists
            if (!Array.isArray(business.positions) || business.positions.length === 0) {
                return reject("Business found but position didn't exist.");
            }
            // get the object version of the mongoose position object
            //const position = business.positions[0].toObject();
            const position = business.positions[0];
            return resolve(position);
        }
        catch (findBusinessError) { return reject(findBusinessError); }
    });
}


async function addEvaluation(user, businessId, positionId, startDate) {
    return new Promise(async function(resolve, reject) {
        // check if the user already has the position
        const alreadyHasPosition = user.positions.some(userPosition => {
            return userPosition.businessId.toString() === businessId.toString && userPosition.positionId.toString() === positionId.toString();
        });
        if (alreadyHasPosition) {
            return reject(`user already had position with id ${positionId} in their positions array`);
        }

        // get the position object
        let position;
        try { position = await getPosition(businessId, positionId); }
        catch (getPositionError) { return reject(getPositionError); }

        // create the free response objects that will be stored for the user;
        // employees only get frqs if the position specifies that they should
        let frqsForUser = [];
        if (user.userType == "candidate" || position.employeesGetFrqs) {
            const numFRQs = position.freeResponseQuestions.length;
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
        }

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

        // see if there are no frqs in this evaluation
        let noFrqs = frqsForUser.length === 0;

        // if the user has finished the psych test and all skill tests
        // and there are no frqs, the user has finished already
        const finished = hasTakenPsychTest && doneWithSkillTests && noFrqs;
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
            testIndex,
            freeResponseQuestions: frqsForUser
        }

        const newPosition = Object.assign(userTypeSpecificInfo, typeAgnosticInfo);

        // add the starting info to the user
        user.positions.push(newPosition);
        // position must be last in the array
        userPositionIndex = user.positions.length - 1;

        // return successfully
        return resolve({ user, finished, userPositionIndex });
    });
}


// doesn't save the user object, caller has to do that
async function finishPositionEvaluation(user, positionId, businessId) {
    return new Promise(async function(resolve, reject) {
        console.log("Finishing position evaluation");
        let idType = "";
        let userArray = "";
        if (user.userType === "candidate") {
            idType = "candidateId";
            userArray = "candidates";
        } else if (user.userType === "employee") {
            idType = "employeeId";
            userArray = "employees";
        } else {
            reject("Non-candidate or employee tried to finish position evaluation.");
        }

        // every position evaluation has a psychometric portion, so it must be done
        if (!user.psychometricTest || !user.psychometricTest.endDate) {
            return reject("user has not yet completed the psychometric test");
        }

        // find the position within the business
        let businessPos;
        try { businessPos = await getPosition(businessId, positionId); }
        catch (getPositionError) { reject(getPositionError); }

        // user is no longer taking a position evaluation
        user.positionInProgress = undefined;

        // find the index of the position within the user's positions array
        const positionIndex = user.positions.findIndex(pos => {
            return pos.positionId.toString() === positionId.toString();
        });
        if (typeof positionIndex !== "number" || positionIndex < 0) {
            return reject("Couldn't find position that user tried to complete within user's positions array.")
        }

        // user finished the evaluation, give it an end date
        user.positions[positionIndex].appliedEndDate = new Date();
        // make sure the user has a hiring stage
        user.hiringStage = "Not Contacted";
        // user can't be dismissed yet because they just finished the eval to determine scores
        user.isDismissed = false;
        // if the user didn't have a hiring stages array, add it
        if (!Array.isArray(user.hiringStageChanges)) {
            user.hiringStageChanges = [];
        }
        // add this most recent change to hiring stage changes
        user.hiringStageChanges.push({
            hiringStage: "Not Contacted",
            isDismissed: false,
            dateChanged: new Date()
        })

        let userPosition = user.positions[positionIndex];

        // --->> SCORE THE USER <<--- //
        // GET THE TOTAL SKILL SCORE BY AVERAGING ALL SKILL SCORES FOR THIS POSITION
        // get all skills that were tested for in this eval
        const skillScores = user.skillTests ? user.skillTests.filter(skill => {
            return userPosition.skillTestIds.some(posSkill => {
                return posSkill.toString() === skill.skillId.toString();
            });
        }) : [];
        let overallSkill = 0;
        const numScores = skillScores.length;
        // add every skill score divided by how many skills there are - same result as averaging
        skillScores.forEach(skillScore => {
            overallSkill += (skillScore.mostRecentScore / numScores);
        });

        // IDEAL GROWTH CALCULATION IS SIMILAR TO PERFORMANCE CALCULATION
        // BUT ONLY FOR CERTAIN FACETS
        const userPsych = user.psychometricTest;

        // start at a score of 0, 100 will be added after scaling
        let growth = 0;

        // how many facets are involved in the growth calculation
        let numGrowthFacets = 0;

        // go through each factor to get to each facet
        const userFactors = userPsych.factors;
        // make sure there are factors used in growth - otherwise growth will be 100
        if (Array.isArray(businessPos.growthFactors)) {
            // go through each factor that affects growth
            businessPos.growthFactors.forEach(growthFactor => {
                // find the factor within the user's psych test
                const userFactor = userFactors.find(factor => { return factor.factorId.toString() === growthFactor.factorId.toString(); });

                // add the number of facets in this factor to the total number of growth facets
                numGrowthFacets += growthFactor.idealFacets.length;

                // go through each facet to find the score compared to the ideal output
                growthFactor.idealFacets.forEach(idealFacet => {
                    // find the facet within the user's psych test
                    const userFacet = userFactor.facets.find(facet => { return facet.facetId.toString() === idealFacet.facetId.toString(); });

                    // the score that the user needs for the max pq
                    const idealScore = idealFacet.score;

                    // how far off of the ideal score the user got
                    const difference = Math.abs(idealScore - userFacet.score);

                    // subtract the difference from the predictive score
                    growth -= difference;

                    // add the absolute value of the facet score, making the
                    // potential predictive score higher
                    growth += Math.abs(idealScore);
                })
            });
        }

        // the max pq for growth in this position
        const maxGrowth = businessPos.maxGrowth ? businessPos.maxGrowth : 190;

        // growth multiplier is highest growth score divided by number of growth
        // facets divided by 5 (since each growth facet has a max score in either direction of 5)
        // can only have a growth multiplier if there are growth facets, so if
        // there are no growth facets, set multiplier to 1
        const growthMultiplier = numGrowthFacets > 0 ? ((maxGrowth - 100) / numGrowthFacets) / 5 : 1;

        // to get to the potential max score, multiply by the multiplier
        growth *= growthMultiplier;

        // add the starting growth pq
        growth += 100;

        // holding off on these, only calculating growth for now
        // // PERFORMANCE IS BASED ON IDEAL OUTPUTS
        // // add to the score when a non-zero facet score is ideal
        // // subtract from the score whatever the differences are between the
        // // ideal facets and the actual facets
        // // start at 100 as the baseline
        // let psychPerformance = 100;
        //
        // // go through each factor to get to each facet
        // businessPos.idealFactors.forEach(idealFactor => {
        //     // find the factor within the user's psych test
        //     const userFactor = userFactors.find(factor => { return factor.factorId.toString() === idealFactor.factorId.toString(); });
        //
        //     // go through each facet to find the score compared to the ideal output
        //     idealFactor.idealFacets.forEach(idealFacet => {
        //         // find the facet within the user's psych test
        //         const userFacet = userFactor.facets.find(facet => { return facet.facetId.toString() === idealFacet.facetId.toString(); });
        //
        //         // the score that the user needs for the max pq
        //         const idealScore = idealFacet.score;
        //
        //         // how far off of the ideal score the user got
        //         const difference = Math.abs(idealScore - userFacet.score);
        //
        //         // subtract the difference from the predictive score
        //         psychPerformance -= difference;
        //
        //         // add the absolute value of the facet score, making the
        //         // potential predictive score higher
        //         psychPerformance += Math.abs(idealScore);
        //     })
        // });

        // to get the actual performance score, it is an average between skills and psychPerformance
        //const performance = (psychPerformance + overallSkill) / 2;

        // LONGEVITY IS PREDICTED AS 190 - (2 * DIFFERENCE BETWEEN SCORES AND IDEAL OUTPUTS)
        let longevity = undefined;

        // how many facets are involved in the longevity calculation
        let numLongevityFacets = 0;

        // make sure there are factors used in longevity - otherwise longevity will be undefined
        if (Array.isArray(businessPos.longevityFactors) && businessPos.longevityActive) {
            longevity = 190;
            // go through each factor that affects longevity
            businessPos.longevityFactors.forEach(longevityFactor => {
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

        // performance is being calculated only using growth and skill for now
        const performance = (growth + overallSkill) / 2;

        // PREDICTED SCORE IS AN AVERAGE BETWEEN GROWTH AND PERFORMANCE
        const predicted = (performance + growth) / 2;

        // OVERALL SCORE IS AN AVERAGE BETWEEN OVERALL SKILL AND PREDICTED
        const overall = (predicted + overallSkill) / 2;

        user.positions[positionIndex].scores = {
            skill: overallSkill,
            growth,
            longevity,
            performance,
            predicted,
            overall
        }

        if (user.userType === "candidate") {
            sendNotificationEmails(businessId, user);
        }

        resolve(user);
    });
}

async function sendNotificationEmails(businessId, user) {
    return new Promise(async function(resolve, reject) {
        const ONE_DAY = 1000 * 60 * 60 * 24;
        let time = ONE_DAY;
        console.log("Sending emails rn");

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

            // Section that introduces purpose of email, is different if it is first time sending notification email
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
            if (numCandidates === 1) {
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


async function POST_sawEvaluationIntro(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);

    // // TODO: do all this with one query
    // const findAndUpdateQuery = {
    //
    // }
    // Users.findOneAndUpdate(findAndUpdateQuery);




    let user;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("error getting user when agreeing to skill test terms: ", getUserError);
        return res.status(500).send("Error getting user.");
    }

    if (!user.positionInProgress) {
        return res.status(400).send("User is not currently taking a position evaluation.");
    }

    // get the index of the position for which the user agreed to skill test terms
    const positionIndex = user.positions.findIndex(pos => {
        return pos.positionId.toString() === user.positionInProgress.toString();
    });
    if (typeof positionIndex !== "number" || positionIndex < 0) {
        return res.status(500).send("User is not taking a position evaluation.");
    }

    user.positions[positionIndex].hasSeenIntro = true;
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("error saving user when trying to mark intro as seen: ", saveUserError);
        return res.status(500).send("Server error.");
    }

    res.json(frontEndUser(user));
}


async function POST_startPositionEval(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const businessId = sanitize(req.body.businessId);
    const positionId = sanitize(req.body.positionId);
    const positionIdString = positionId.toString();

    let user;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("error getting user when starting eval: ", user);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : "Couldn't start position evaluation.");
    }

    // add the evaluation to the user
    let userPositionIndex = undefined;
    let finished = false;
    try {
        let addEvalObj = await addEvaluation(user, business, positionId);
        user = addEvalObj.user;
        userPositionIndex = addEvalObj.userPositionIndex;
        finished = addEvalObj.finished;
    } catch (addEvaluationError) {
        console.log(addEvaluationError);
        return res.status(500).send("Server error.");
    }

    // where the user should be redirected
    let nextUrl;

    // if the user has finished the evaluation just by hitting apply
    if (finished) {
        // go home if the evaluation is done
        nextUrl = "/";
        console.log("Evaluation already finished!");
    }

    // if the user has to do some steps in the evaluation still
    else {
        // start the evaluation by setting the position in progress to this one
        user.positionInProgress = positionId;

        // the position that was just added to the user object
        let userPosition = user.positions[userPositionIndex];

        // see if the user ahs already taken the psych analysis
        const hasTakenPsychTest = user.psychometricTest && user.psychometricTest.endDate === false;

        // if we're trying to take a test that is past the number of tests we
        // have, we must be done with all the skill tests
        const doneWithSkillTests = userPosition.testIndex === userPosition.skillTestIds.length;

        // if the user has to answer the admin questions
        if (!user.adminQuestions || !user.adminQuestions.finished) {
            nextUrl = "/adminQuestions";
        }

        // if the user hasn't taken the psychometric exam before, have them do that
        else if (!hasTakenPsychTest) {
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
                const skillTest = await Skills.findById(userPosition.skillTestIds[userPosition.testIndex]).select("url");
                nextUrl = `/skillTest/${skillTest.url}`;
            } catch (getSkillTestError) {
                console.log("Error getting skill test: ", getSkillTestError);
                return res.status(500).send("Server error.");
            }
        }
        // if the user has finished all skill and psych tests, give them the
        // free response questions they have to answer
        else {
            // uses the user's positionInProgress object to get the questions
            nextUrl = "/freeResponse";
        }
    }

    // save the user
    try { user = user.save(); }
    catch (saveUserError) {
        console.log("error saving user with new evaluation: ", saveUserError);
        return res.status(500).send("Error starting position evaluation.");
    }

    // TODO: this removes the old nextUrl stuff, assuming the user should
    // always go to the intro part when starting an eval
    nextUrl = "/evaluationIntro"
    res.json({updatedUser: frontEndUser(user), finished, nextUrl});
}


async function POST_answerPsychQuestion(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    let user = undefined;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserErrorObj) {
        console.log("error getting user: ", getUserErrorObj);
        return res.status(getUserErrorObj.status).send(getUserErrorObj.message);
    }

    const answer = sanitize(req.body.answer);

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
    if (typeof psychometricTest.numQuestionsAnswered !== "number") {
        psychometricTest.numQuestionsAnswered = 0;
    }
    // let the test know that another questions has been answered
    psychometricTest.numQuestionsAnswered++;

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
    // if the entire evaluation is over
    let finishedEval = false;
    if (psychometricTest.incompleteFactors.length === 0) {
        // finish the test
        psychometricTest.endDate = new Date();
        psychometricTest.totalTime = psychometricTest.endDate.getTime() - psychometricTest.startDate.getTime();
        psychometricTest.inProgress = false;
        psychometricTest.currentQuestion = { body: "You finished the psychometric analysis!" };

        finishedTest = true;

        console.log("positionInProgress: ", user.positionInProgress)
        if (user.positionInProgress) {
            // check if the user is taking a position evaluation and if so
            // whether they're now done with it
            var positionId = user.positionInProgress.toString();

            // get the actual position for the position in progress
            const userPositionIndex = user.positions.findIndex(pos => {
                return pos.positionId.toString() === positionId;
            });
            if (typeof userPositionIndex !== "number" || userPositionIndex < 0) {
                console.log("Position not found in user from position id.");
                return res.status(500).send("Server error.");
            }
            var userPosition = user.positions[userPositionIndex];

            // whether the user has finished all the required skill tests
            const doneWithSkillTests = (
                !Array.isArray(userPosition.skillTestIds) ||
                 userPosition.skillTestIds.length === 0 ||
                 userPosition.testIndex >= userPosition.skillTestIds.length
            );
            // whether the user has finished all required FRQs
            const doneWithFRQs = (
                !Array.isArray(userPosition.freeResponseQuestions) ||
                userPosition.freeResponseQuestions.length === 0
            );
            finishedEval = doneWithSkillTests && doneWithFRQs;

            console.log("finishedEval: ", finishedEval);
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
        try { psychTest = await Psychtests.findOne({}); }
        catch (getPsychTestError) {
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

    console.log("finishedTest: ", finishedTest);
    console.log("finishedEval: ", finishedEval);

    // grade the test if it's finished
    if (finishedTest) { user = calculatePsychScores(user); }

    try { user = await user.save(); }
    catch(saveUserErr) {
        console.log("Error saving user that was trying to save a psych question answer: ", saveUserErr);
        return res.status(500).send("Server error.");
    }

    // if the application is complete, mark it as such
    if (finishedEval) {
        console.log("calculating position info");
        try { user = await finishPositionEvaluation(user, positionId, userPosition.businessId); }
        catch (finishPositionError) {
            console.log("error finishing position: ", finishPositionError);
            return res.status(500).send("Server error.");
        }
    }

    res.json({user: frontEndUser(user), finishedTest, finishedEval});
}


async function internalStartPsychEval(user) {
    return new Promise(async function(resolve, reject) {
        if (user.psychometricTest.startDate) {
            resolve(user);
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
            // 1 question per facet in development mode, 3 in production
            questionsPerFacet: process.env.NODE_ENV === "development" ? 1 : 3,
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

    // get the user from the db
    let user = undefined;
    try { user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user from the database: ", getUserError);
        return res.status(500).send("Server error, try again later.");
    }

    try { user = await internalStartPsychEval(user); }
    catch (startEvalError) {
        console.log("Error starting psych eval: ", startEvalError.error);
        res.status(startEvalError.statusCode).send(startEvalError.msg);
    }

    try {
        await user.save();
        return res.json(frontEndUser(user));
    } catch (saveUserErr) {
        console.log("Error saving user when trying to start psych exam: ", saveUserErr);
        return res.status(400).send("Server error, try again later.");
    }
}


async function GET_session(req, res) {
    const userId = sanitize(req.session.userId);

    // if there was no previous user logged in, don't return a user
    if (typeof userId !== 'string') { return res.json(undefined); }

    try {
        // get the user from db
        const user = await Users.findById(userId);

        // if no user found, the user was probably deleted. remove the
        // user from the session and don't log in; do the same if the session
        // has the wrong verification token
        if (!user || user.verificationToken !== sanitize(req.session.verificationToken)) {
            req.session.userId = null;
            req.session.verificationToken = null;
            req.session.save(function(saveSessionError) {
                if (saveSessionError) { console.log("error saving session: ", saveSessionError); }
                return res.json(undefined);
            });
        }

        // otherwise return the user that is logged in
        else { res.json(frontEndUser(user)); }
    }

    // on error, print the error and return as if there was no user in the session
    catch (getUserError) {
        console.log("error getting user: ", getUserError);
        return res.json(undefined);
    }
}


async function POST_session(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);

    // check if option to stay logged in is true
    const saveSession = sanitize(req.session.stayLoggedIn);
    if (!saveSession) { return; }

    if (!userId || !verificationToken) {
        return res.json("either no userId or no verification token");
    }

    // get the user from the id, check the verification token to ensure they
    // have the right credentials to stay logged in
    let foundUser;
    try { foundUser = await getAndVerifyUser(userId, verificationToken) }
    catch (findUserError) {
        console.log("Error getting user when trying to save session: ", findUserError);
        return res.status(500).send(errors.PERMISSIONS_ERROR);
    }

    // put user id and verification token in session
    req.session.userId = userId;
    req.session.verificationToken = verificationToken;

    // save updated session
    req.session.save(function(sessionSaveError) {
        if (sessionSaveError) {
            console.log("error saving user id to session: ", sessionSaveError);
            return res.status(500).send("Error saving session.");
        } else {
            return res.json(true);
        }
    });
}

async function POST_updateOnboarding(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const onboarding = sanitize(req.body.onboarding);

    // get the user who is asking for their evaluations page
    try {
        var user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting user when trying update onboarding info: ", getUserError);
        const status = getUserError.status ? getUserError.status : 500;
        const message = getUserError.message ? getUserError.message : "Server error.";
        return res.status(status).send(message);
    }

    // if no user found from token, can't verify
    if (!user) { return res.status(404).send("User not found"); }

    // if a user was found from the token, verify them and get rid of the token
    user.onboarding = onboarding;

    // save the verified user
    try { var returnedUser = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user when updating onboarding info: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    res.json(frontEndUser(returnedUser));
}


// signs the user out by destroying the user session
function POST_signOut(req, res) {
    // remove the user id and verification token from the session
    req.session.userId = null;
    req.session.verificationToken = null;
    // save the updated session
    req.session.save(function (err) {
        if (err) {
            console.log("error removing user session: ", err);
            return res.status(500).send("Error logging out.");
        } else {
            return res.json({ success: true });
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
    req.session.save(function (saveSessionError) {
        if (saveSessionError) {
            console.log("error saving 'keep me logged in' setting: ", saveSessionError);
            return res.status(500).send("Error saving 'keep me logged in' setting.");
        } else {
            return res.json("success");
        }
    })
}


// get the setting to stay logged in or out
function GET_keepMeLoggedIn(req, res) {
    // get the setting
    let setting = sanitize(req.session.stayLoggedIn);
    // if it's not of the right form, assume you shouldn't stay logged in
    if (typeof setting !== "boolean") { setting = false; }
    // return the found setting
    return res.json(setting);
}


// verify user's email so they can log in
async function POST_verifyEmail(req, res) {
    const { token, userType } = sanitize(req.body);

    // if url doesn't provide token, can't verify
    if (!token || typeof token !== "string") { return res.status(400).send("Url not in the right format"); }

    let query = { emailVerificationToken: token };
    try { var user = await Users.findOne(query); }
    catch (findUserError) {
        console.log("Error trying to find user from verification token: ", findUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if no user found from token, can't verify
    if (!user) { return res.status(404).send("Invalid url."); }

    // if a user was found from the token, verify them and get rid of the token
    user.verified = true;
    user.emailVerificationToken = undefined;

    // save the verified user
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user when verifying email: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // where the user should be redirected after verification
    const redirect = user.userType === "accountAdmin" ? "onboarding" : "myEvaluations";

    // if the session has the user's id, can immediately log them in
    sessionUserId = sanitize(req.session.unverifiedUserId);
    // get rid of the unverified id as it won't be needed anymore
    req.session.unverifiedUserId = undefined;
    // if the session had the correct user id, log the user in
    const sessionHadUnverifiedId = sessionUserId && sessionUserId.toString() === user._id.toString();
    const loggedIn = req.session.userId && req.session.userId.toString() === user._id.toString();
    if (sessionHadUnverifiedId || loggedIn) {
        req.session.userId = user._id.toString();
        req.session.verificationToken = user.verificationToken;
        req.session.save(function(saveSessionError) {
            if (saveSessionError) {
                console.log("Error saving user session: ", saveSessionError);
            }
            // return the user object even if session saving didn't work
            return res.status(200).send({user: frontEndUser(user), redirect});
        });
    }

    // otherwise bring the user to the default page (which could be preceeded by login page)
    else { return res.json({ redirect }); }
}


async function POST_changePasswordForgot(req, res) {
    let token = sanitize(req.body.token).toString();
    let password = sanitize(req.body.password);

    const query = {passwordToken: token};

    // get the user from the password token
    let user;
    try { user = await Users.findOne(query); }
    catch (findUserError) {
        console.log("Error finding user from password token: ", findUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if user was not found from the url
    if (!user) { return res.status(404).send("User not found from link"); }

    // if the token is expired, tell the user to try again with a new token
    const currentTime = Date.now();
    if (currentTime > user.passwordTokenExpirationTime) {
        return res.status(401).send("Time ran out, try sending reset password email again.");
    }

    // hash the new password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async function(hashError, hash) {
        // set the new password
        user.password = hash;
        // save the user
        try { user = await user.save(); }
        catch (saveUserError) {
            console.log("Error saving user with new updated password: ", saveUserError);
            return res.status(500).send(errors.SERVER_ERROR);
        }

        // successfully created new password, log the user in
        return res.json(frontEndUser(newUser));
    });
}


async function POST_changePassword(req, res) {
    const userId = sanitize(req.body._id);
    const oldPassword = sanitize(req.body.oldpass);
    const newPassword = sanitize(req.body.password);
    const COULD_NOT_CHANGE = "Server error. Couldn't change password.";

    // get the user from db
    let user;
    try { user = await Users.findById(userId); }
    catch (findUserError) {
        console.log("");
        return res.status(500).send(COULD_NOT_CHANGE);
    }

    // if no user was found, can't change password
    if (!user) { return res.status(400).send("Invalid credentials."); }

    // see if the old password is correct
    bcrypt.compare(oldPassword, user.password, function (passwordError, passwordsMatch) {
        // if there was an error comparing the passwords
        if (passwordError) {
            console.log("error comparing passwords when trying to create new password: ", passwordError);
            return res.status(500).send(COULD_NOT_CHANGE);
        }

        // if the wrong old password was given
        if (passwordsMatch !== true) {
            return res.status(400).send("Old password is incorrect.");
        }

        // user gave correct old password, hash the new one
        const saltRounds = 10;
        bcrypt.hash(newPassword, saltRounds, async function (hashError, hash) {
            // if there was an error hashing the new password
            if (hashError) {
                console.log("error hashing new password: ", hashError);
                return res.status(500).send(COULD_NOT_CHANGE);
            }

            // all is good, set the new password and save the user
            user.password = hash;
            try { user = await user.save() }
            catch (saveUserError) {
                console.log("error saving user with new password: ", saveUserError);
                return res.status(500).send(COULD_NOT_CHANGE);
            }

            // return the new user
            return res.json(frontEndUser(user));
        });
    });
}


// send email for password reset
async function POST_forgotPassword(req, res) {
    let email = sanitize(req.body.email);
    let query = { email: email };

    let user;
    try { user = await Users.findOne(query); }
    catch (getUserError) {
        console.log("Error getting user by email for sending forgot password reset email: ", getUserError);
        return res.status(500).send("Cannot find user.");
    }

    // token that will go in the url
    const newPasswordToken = crypto.randomBytes(64).toString('hex');
    // password token expires in one hour (minutes * seconds * milliseconds)
    const expirationDate = Date.now() + (60 * 60 * 1000);

    // give the user the password token and expiration time
    user.passwordToken = newPasswordToken;
    user.passwordTokenExpirationTime = expirationDate;

    // save the user
    try { user = await user.save(); }
    catch (saveUserError) {
        console.log("Error saving user when giving them a token for resetting password: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if we're in development (on localhost), links go to localhost
    let moonshotUrl = "https://moonshotinsights.io/";
    if ( process.env.NODE_ENV === "development") {
        moonshotUrl = "http://localhost:8081/";
    }
    const recipient = [ email ];
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
        if (success) { return res.json(msg); }
        else {
            console.log("Error sending reset password email: ", msg);
            return res.status(500).send(errors.SERVER_ERROR);
        }
    });
}


// get positions for evaluations page
async function GET_positions(req, res) {
    try {
        const userId = sanitize(req.query.userId);
        const verificationToken = sanitize(req.query.verificationToken);

        // get the user who is asking for their evaluations page
        try { var user = await getAndVerifyUser(userId, verificationToken); }
        catch (getUserError) {
            console.log("error getting user when trying to get positions for evaluations page: ", getUserError);
            const status = getUserError.status ? getUserError.status : 500;
            const message = getUserError.message ? getUserError.message : errors.SERVER_ERROR;
            return res.status(status).send(message);
        }

        // get the user's positions they have applied to
        const positions = user.positions;
        const positionIds = positions.map(p => p.positionId);
        // gets the businesses that have the wanted positions with ONLY the wanted positions
        const query = { "positions._id": { "$in": positionIds } };
        try { var businesses = await Businesses.find(query); }
        catch (getBusinessesError) {
            console.log("Error getting businesses when getting positions: ", getBusinessesError);
            return res.status(500).send(errors.SERVER_ERROR);
        }

        // create array to host all the positions
        let positionsToReturn = [];

        // go through each business
        businesses.forEach(business => {
            // get the id of the business
            const businessIdString = business._id.toString();
            // go through each position for the business
            business.positions.forEach(bizPosition => {
                // get the corresponding user position
                const userPosition = positions.find(p => {
                    return (
                        p.positionId.toString() === bizPosition._id.toString() &&
                        p.businessId.toString() === businessIdString
                    );
                });
                // only add the position if the user is enrolled in it
                if (userPosition) {
                    // add the formatted position
                    positionsToReturn.push({
                        businessName: business.name,
                        businessLogo: business.logo,
                        businessId: business._id,
                        positionName: bizPosition.name,
                        length: bizPosition.length,
                        positionId: bizPosition._id,
                        skills: bizPosition.skillNames,
                        assignedDate: userPosition.assignedDate,
                        deadline: userPosition.deadline,
                        startDate: userPosition.startDate,
                        completedDate: userPosition.appliedEndDate
                    });
                }
            });
        });

        res.json({positions: positionsToReturn});
    }

    catch (miscError) {
        console.log("error getting position for evaluations page: ", miscError);
        return res.status(500).send("Server error while getting evaluations.");
    }
}


async function POST_agreeToTerms(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const termsAndConditions = sanitize(req.body.termsAndConditions);
    if (!Array.isArray(termsAndConditions)) {
        console.log("user tried to agree to terms and conditions with termsAndConditions value that was not an array");
        return res.status(400).send("Bad request.");
    }

    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);

        // make sure the terms and conditions being agreed to are valid
        const validAgreements = ["Privacy Policy", "Terms of Use", "Affiliate Agreement", "Service Level Agreement", "Terms and Conditions", "Terms of Service"];
        const agreeingTo = termsAndConditions.filter(agreement => {
            return validAgreements.includes(agreement.name);
        });

        // agree to those terms
        const NOW = new Date();
        // go through each of these agreements that are being agreed to
        agreeingTo.forEach(agreement => {
            // find the index of the agreement in the user object
            const agreementIndex = user.termsAndConditions.findIndex(agr => {
                return agr.name === agreement.name;
            })
            // if the user didn't already have the agreement, create it
            if (typeof agreementIndex !== "number" || agreementIndex < 0) {
                user.termsAndConditions.push({
                    name: agreement.name,
                    date: NOW,
                    agreed: true
                });
            }
            // otherwise, mark its date as right now and mark it agreed
            else {
                user.termsAndConditions[agreementIndex].date = NOW;
                user.termsAndConditions[agreementIndex].agreed = true;
            }
        })

        // save and return the user
        user = await user.save();
        return res.json(frontEndUser(user));
    } catch (getUserError) {
        console.log("error agreeing to terms and conditions: ", getUserError);
        return res.status(500).send("Error agreeing to terms and conditions.");
    }
}


// check that a user has verified their email address
async function GET_checkUserVerified(req, res) {
    // get user that made this call
    try { var user = await getUserFromReq(req, "GET"); }
    catch (getUserError) {
        console.log("Error getting user while trying to check verified status: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : errors.SERVER_ERROR);
    }

    // if not verified, return unsuccessfully
    if (!user.verified) { return res.status(403).send({verified: false}); }

    // return user object if verified
    return res.status(200).send(frontEndUser(user));
}


async function POST_login(req, res) {
    const email = sanitize(req.body.user.email);
    const password = sanitize(req.body.user.password);
    // the setting for whether the user wants to stay logged in
    let saveSession = sanitize(req.body.saveSession);

    // if the stay logged in session is not the right type, assume we shouldn't
    // stay logged in
    if (typeof saveSession !== "boolean") {
        saveSession = false;
    }

    const INVALID_EMAIL = "No user with that email was found.";

    // searches for user by lower-case email
    var query = { "$or": [ { "email": email }, { "email": email.toLowerCase() } ] };
    // find the user by email
    try { var user = await Users.findOne(query); }
    catch (findUserError) {
        console.log("Couldn't find user: ", findUserError);
        return res.status(404).send(INVALID_EMAIL);
    }

    // if no user with that email is found
    if (!user) { return res.status(401).send(INVALID_EMAIL); }

    // see if the given password is correct
    bcrypt.compare(password, user.password, async function (passwordError, passwordsMatch) {
        // if comparing passwords fails, don't log in
        if (passwordError) {
            return res.status(500).send("Error logging in, try again later.");
        }
        // wrong password, don't log in
        if (passwordsMatch !== true) {
            return res.status(400).send("Password is incorrect.");
        }
        // user has not yet verified email and is not an account admin, don't log in
        if (user.verified !== true && user.userType !== "accountAdmin") {
            return res.status(401).send("Email not yet verified");
        }
        // all login info is correct
        // if user wants to stay logged in, save the session
        if (saveSession) {
            req.session.userId = user._id;
            req.session.verificationToken = user.verificationToken;
            req.session.save(function (err) {
                // if there is an error saving session, print it, but still log in
                if (err) { console.log("error saving user session", err); }
                return res.json(frontEndUser(user));
            });
        } else {
            return res.json(frontEndUser(user));
        }
    });
}


// change name or email
async function POST_changeSettings(req, res) {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);
    const userId = sanitize(req.body._id);
    const hideProfile = sanitize(req.body.hideProfile);

    // error if proper arguments not provided
    if (!password || !name || !email || !userId) {
        console.log("Not all arguments provided for settings change.");
        return res.status(400).send("No fields can be empty.");
    }

    // general error message to show
    const CANNOT_UPDATE = "Settings couldn't be updated. Try again later.";

    // find the user by id
    let user;
    try { user = await Users.findById(userId); }
    catch (findUserError) {
        console.log("Error finding user by id when trying to update settings: ", findUserError);
        return res.status(500).send(CANNOT_UPDATE);
    }

    // make sure a user was found with this id
    if (!user) {
        console.log("Didn't find a user with given id when trying to update settings.");
        return res.status(500).send(CANNOT_UPDATE);
    }

    bcrypt.compare(password, user.password, async function (passwordError, passwordsMatch) {
        // error comparing password to user's password, doesn't necessarily
        // mean that the password is wrong
        if (passwordError) {
            console.log("Error comparing passwords when trying to update settings: ", passwordError);
            return res.status(500).send(CANNOT_UPDATE);
        }

        // user entered wrong password
        if (!passwordsMatch) { return res.status(400).send("Incorrect password."); }

        // see if there's another user with the new email
        const emailQuery = {email: email};
        try {
            const userWithSameEmail = await Users.findOne(emailQuery);
            // if there is a user who already used that email, can't let this user have it too
            if (userWithSameEmail && userWithSameEmail._id.toString() != user._id.toString()) {
                return res.status(400).send("That email address is already taken.");
            }
        } catch (findUserWithSameEmailError) {
            console.log("Error trying to find users with the same email when trying to update settings: ", findUserWithSameEmailError);
            return res.status(500).send(CANNOT_UPDATE)
        }

        // all is good, update the user (as long as email and name are not blank)
        user.email = email;
        user.name = name;
        if (typeof hideProfile === "boolean") { user.hideProfile = hideProfile; }

        // save the user
        try { user = await user.save(); }
        catch (saveUserError) {
            console.log("Error saving user when trying to update settings: ", saveUserError);
            return res.status(500).send(CANNOT_UPDATE);
        }

        // settings change successful
        return res.json(frontEndUser(user));
    });
}


// verify that a user has a legitimate api key
async function POST_verifyFromApiKey(req, res) {
    console.log("req.body:", req.body);

    // get the api key from the input values
    const API_Key = sanitize(findNestedValue(req.body, "API_Key", 5, true));
    if (!API_Key) { return res.status(401).send({error: "No API_Key provided. Make sure the attribute name is API_Key with that exact capitalization."});}
    if (typeof API_Key !== "string" || API_Key.length !== 24) {
        return res.status(401).send({error: "Invalid API_Key. Must be 24-character string."});
    }

    // get the business that has this api key
    try { var business = await Businesses.find({"API_Key": API_Key})}
    catch (findBizError) {
        console.log("Error finding business from API_Key: ", findBizError);
        return res.status(401).send({error: "Server error. This may be Moonshot's fault. Contact support@moonshotinsights.io for help."});
    }

    // if there is no business associated with that api key, return unsuccessfully
    if (!business) { return res.status(401).send({error: "Invalid API_Key."}); }

    // successfully verified that user has correct api key
    return res.json({ success: true });
}


module.exports = userApis;
