const Users = require('../models/users.js');
const Businesses = require('../models/businesses.js');

const mongoose = require("mongoose");

// get helper functions
const { sendEmail,
        emailFooter,
        getFirstName,
        devEmail,
        devMode
} = require('./helperFunctions');


// global time constants
const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const minimumTimes = {
    "Weekly": ONE_DAY * 7,
    "Every 5 Days": ONE_DAY * 5,
    "Every 2 Days": ONE_DAY * 2,
    "Daily": ONE_DAY,
    "never": 0
};

// function that runs once a day and updates every account admin with the number
// of users that have gone through their evaluations
async function sendUpdateEmails() {
    // go through every business and find out how many new candidates have
    // completed their evaluations in
    try {
        var businesses = await Businesses
            .find({})
            .select("_id positions._id positions.name");
    }
    catch (getBusinessesError) { return handleError(getBusinessesError) }

    // create hash table for businesses/positions
    // positions can be accessed via positions[businessId][positionId]
    let positions = {};
    businesses.forEach(business => {
        // hash table for the positions
        positions[business._id] = {};
        // positions[businessId]["all"] = list of all positions
        positions[business._id]["all"] = business.positions;
        business.positions.forEach(position => {
            positions[business._id][position._id] = position.name;
        });
    })

    // get every account admin
    try { var admins = await Users.find({ "userType": "accountAdmin" }); }
    catch(getUsersError) { return handleError(getUsersError) }

    // millis for current time
    const now = (new Date()).getTime();

    // contains one promise for every email being sent
    let emailPromises = [];

    // go through every account admin and find out how many candidates completed
    // evaluations for their company in the timeframe they want notifications about
    for (let adminIdx = 0; adminIdx < admins.length; adminIdx++) {
        emailPromises.push(emailIfEnoughTimeElapsed(admins[adminIdx]));
    }

    // wait for all the emails to finish sending
    try { await Promise.all(emailPromises); }
    catch (emailPromisesError) { return handleError(emailPromisesError); }

    // end the function
    return;

    /* INTERNAL FUNCTIONS */

    // figure out if an email should be sent, and if so, do it
    async function emailIfEnoughTimeElapsed(admin) {
        return new Promise(async function(resolve, reject) {
            // if the admin does not have notification preferences, create the preferences object
            if (!admin.notifications) { admin.notifications = {}; }
            // if the admin has not marked their preference on time delays between
            // email updates, assume the delay should be 1 day
            if (!admin.notifications.time) { admin.notifications.time = "1 Day"; }
            // if it is unknown if the admin has been sent an update email in the
            // past, assume they haven't been
            if (typeof admin.notifications.firstTime !== "boolean") { admin.notifications.firstTime = true; }

            // IF THIS ADMIN RECEIVED AN EMAIL UPDATE WITHIN THEIR TIMEFRAME FOR
            // SENDING NEW UPDATES, DON'T SEND AN UPDATE
            let notificationInfo = admin.notifications;
            // if user never wants notifications, skip them
            if (notificationInfo.time === "never") { continue; }
            // millis for approximate time last date email was sent
            const lastSent = new Date(notificationInfo.lastSent);
            const lastSentMillis = lastSent.getTime();
            // millis since last email was sent
            const timeSinceLastSent = now - lastSentMillis;
            // minimum time wanted between emails
            let minimumTime = minimumTimes[notificationInfo.time];
            // if invalid setting for sending emails, assume should send them daily
            if (!minimumTime) { minimumTime = ONE_DAY; }
            // check for minimum time minus an hour to account for email send delays
            if (timeSinceLastSent < minimumTime - ONE_HOUR) { continue; }

            // id of the business the user works for
            const businessId = admin.businessInfo.businessId;
            const businessMongoId = mongoose.Types.ObjectId(businessId);
            // list of all the positions the business offers
            const allPositions = positions[businessId]["all"];

            // contains all the promises that are counting numbers of users
            let countUserPromises = [];

            // find how many users completed each position since the last email was sent
            for (let positionIdx = 0; positionIdx < allPositions.length; positionIdx++) {
                const completionsQuery = {
                   "userType": "candidate",
                   "positions": {
                       "$elemMatch": {
                           "businessId": businessMongoId,
                           "positionId": mongoose.Types.ObjectId(allPositions[positionIdx]._id),
                           "appliedEndDate": { "$gte" : lastSent }
                       }
                   }
                }
                countUserPromises.push(Users.countDocuments(completionsQuery));
            }

            // wait for all the counts to complete
            try { var userCounts = await Promise.all(countUserPromises); }
            catch (countUsersError) { console.log(`Error counting users for email update for user with id ${admin._id}:`, countUsersError); }

            // send email to the user with the counts
            try { await sendUpdateEmail(admin.email, allPositions.map(p => p.name), userCounts); }
        });
    }

    // creates content then sends the update email
    async function sendUpdateEmail(recipient, positionNames, counts, timeInterval) {
        return new Promise(async function(resolve, reject) {
            try {
                let totalCompletions = 0;
                const countsSection = (`
                    <div style="margin-top: 20px">
                        ${positionNames.map((positionName, positionIdx) => {
                            // number of users who completed this position
                            const count = counts[positionIdx];
                            // add the number of completions for this position to the total
                            totalCompletions += count;
                            return (`
                                <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d; width:95%; display:inline-block; text-align:left;">
                                    <b style="color:#0c0c0c; display:inline-block">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${positionName}:&nbsp;</b>
                                    <div style="display:inline-block">${count} candidate completion${count === 1 ? "" : "s"} in the past ${timeInterval}</div>
                                </div>
                            `);
                        })}
                    </div>
                `)

                // Section that introduces purpose of email, is different if it is first time sending notification email
                const introSection = (`
                    <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">
                        ${firstTime ?
                            "My name is Justin and I'm the Chief Product Officer at Moonshot Insights. I'll be sending you emails updating you when candidates complete your evaluations so that you can view their results and move the hiring process along quickly. Here's your first update:"
                            :
                            "It's Justin again with a quick update on your evaluations:"
                        }
                    </div>
                `);

                let content = (`
                    <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">
                        <div style="width:95%; display:inline-block; text-align:left;">Hi ${getFirstName(recipient.name)},</div>
                        ${introSection}
                        ${countsSection}<br/>
                        <a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="${moonshotUrl}myCandidates'">See Results</a>
                        <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">If you have any questions, please feel free to shoot me a message at <b style="color:#0c0c0c">Justin@MoonshotInsights.io</b>. To add your next evaluation, you can go <b style="color:#C8C8C8;" ><a href="' + moonshotUrl + 'myEvaluations?open=true">here</a></b>.</div>
                        <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">Sincerely,<br/><br/>Justin Ye<br/><i>Chief Product Officer</i><br/><b style="color:#0c0c0c">Justin@MoonshotInsights.io</b></div>
                        <div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>
                        <a href="${moonshotUrl}" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>
                        <div style="text-align:left;width:95%;display:inline-block;">
                            <div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">
                            <i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>
                            <a style="color:#C8C8C8; margin-top:20px;" href="${moonshotUrl}settings">Change the frequency of your notifications.</a></i><br/>
                            <a style="color:#C8C8C8; margin-top:20px;" href="${moonshotUrl}unsubscribe">Opt-out of future messages.</a></i></div>
                        </div>
                    </div>
                `);

                const subject = `${totalCompletions} Candidate${totalCompletions === 1 ? "" : "s"} Completed Your Evaluation`;

                // send the email and then return successfully
                await sendEmail({
                    recipient, subject, content,
                    senderName: "Justin Ye",
                    senderAddress: "justin"
                });
                return resolve();
            }
            // simply reject any error that comes up
            catch (emailError) { return reject(emailError); }
        });
    }

    // handles generic errors
    function handleError(error) {
        console.log("Error sending update emails: ", error);
        const failSubject = "MOONSHOT - IMPORTANT - Error sending email updates to Account Admins";
        const failContent = "Check logs for specific error.";
        const failRecipients = devMode ? devEmail :["ameyer24@wisc.edu", "stevedorn9@gmail.com"];
        try { await sendEmail({ subject: failSubject, recipients: failRecipients, content: failContent}) }
        catch (sendFailEmailFail) { console.log("Also failed sending the email telling us the email failed :("); }
    }
}




























async function sendNotificationEmails(businessId, user) {
    return new Promise(async function(resolve, reject) {
        const businessUserQuery = {
            "$and": [
                { "businessInfo.businessId": businessId },
                { "userType": "accountAdmin" }
            ]
        }
        try {
            let users  = await Users.find(businessUserQuery).select("name email notifications")
            if (!users) { return resolve("No users found."); }
            let recipient = {};
            let promises = [];
            for (let i = 0; i < users.length; i++) {
                recipient = users[i];
                const notifications = users[i].notifications;
                let interval = "day";
                if (notifications) {
                    // If a delayed email has already been sent, don't send another
                    if (notifications.waiting) { continue; }

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
            try { await Users.findOneAndUpdate(idQuery, updateQuery); }
            catch(err) {
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
            let recipients = [];
            recipients.push(recipient.email);

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

            let content = (`
                <div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">
                    <div style="width:95%; display:inline-block; text-align:left;">Hi ${getFirstName(recipient.name)},</div>
                    ${introSection}
                    ${countsSection}<br/>
                    <a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="${moonshotUrl}myCandidates'">See Results</a>
                    <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">If you have any questions, please feel free to shoot me a message at <b style="color:#0c0c0c">Justin@MoonshotInsights.io</b>. To add your next evaluation, you can go <b style="color:#C8C8C8;" ><a href="' + moonshotUrl + 'myEvaluations?open=true">here</a></b>.</div>
                    <div style="width:95%; display:inline-block; text-align:left; margin-top:20px;">Sincerely,<br/><br/>Justin Ye<br/><i>Chief Product Officer</i><br/><b style="color:#0c0c0c">Justin@MoonshotInsights.io</b></div>
                    <div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>
                    <a href="${moonshotUrl}" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>
                    <div style="text-align:left;width:95%;display:inline-block;">
                        <div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">
                        <i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>
                        <a style="color:#C8C8C8; margin-top:20px;" href="${moonshotUrl}settings">Change the frequency of your notifications.</a></i><br/>
                        <a style="color:#C8C8C8; margin-top:20px;" href="${moonshotUrl}unsubscribe">Opt-out of future messages.</a></i></div>
                    </div>
                </div>
            `);

            const senderName = "Justin Ye";
            const senderAddress = "justin";
            sendEmail({ recipients, subject, content, senderName, senderAddress })
            .catch(error => { console.log("Error sending delayed email: ", error); });

            // Update the lastSent day of the user and the waiting to be false
            const idQuery = {
                "_id" : recipient._id
            }
            const updateQuery = {
                "notifications.lastSent" : new Date(),
                "notifications.waiting" : false,
                "notifications.firstTime" : false
            }
            try { await Users.findOneAndUpdate(idQuery, updateQuery); }
            catch(err) {
                console.log("error updating lastSent date for user email notifications: ", err);
                return reject("Error updating lastSent date for user email notifications.")
            }
            return resolve(true);
        }, time);
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
    console.log("weights: ", weights);
    let totalValue = 0;
    let totalWeight = 0;
    // go through every score type (gca, performance, etc) and add its weighted value
    for (let scoreType in subscores) {
        if (!subscores.hasOwnProperty(scoreType)) continue;
        console.log("scoreType: ", scoreType);
        console.log("subscores[scoreType]: ", subscores[scoreType]);
        // only use the score if it exists as a number
        if (typeof subscores[scoreType] === "number") {
            // get the weight of the type
            let weight = weights ? weights[scoreType] : undefined;
            console.log("weights[scoreType]: ", weights[scoreType]);
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
            "Developer": 3.174,
            "Marketing": 2.217,
            "Product": 2.217,
            "General": 2.217
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
                            evaluationState.stepProgress = (userSkill.attempts.levels[0].questions.length / questions) * 100;
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
