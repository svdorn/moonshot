var Users = require('../models/users.js');
var Referrals = require('../models/referrals.js');
var Pathways = require('../models/pathways.js');
var Businesses = require('../models/businesses.js');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser,
        userForAdmin,
        getFirstName,
        sendBizUpdateCandidateErrorEmail,
        frontEndUser,
        NO_TOKENS
} = require('./helperFunctions.js');

// get function to start position evaluation
const { internalStartPsychEval, addEvaluation } = require('./userApis.js');


const candidateApis = {
    POST_updateAllOnboarding,
    POST_candidate,
    POST_endOnboarding,
    POST_sendVerificationEmail,
    // POST_completePathway,
    // POST_addPathway,
    // POST_comingSoonEmail,
    // POST_updateAnswer
}


function POST_candidate(req, res) {
    const SERVER_ERROR = "Server error, try again later.";
    let user = sanitize(req.body);

    // --->>  THINGS WE NEED BEFORE THE USER CAN BE CREATED <<---   //
    // the db business document for the business offering the position the user signed up for
    let business = undefined;
    // the name of the array of codes within the position within the business
    let userCodeType = undefined;
    // the index of the unique position-related code the user used to sign up
    let oneTimeCodeIndex = -1;
    // id of the position within the business
    let positionId = undefined;
    // the index of the position and actual position within the business
    let positionIndex = undefined;
    // if the position the user applying for was found in the business db
    let positionFound = undefined;
    // if the user has an email address no one else has used before
    let verifiedUniqueEmail = false;
    // if password was set up
    let createdLoginInfo = false;
    // whether we counted the users and created a profile url
    let madeProfileUrl = false;
    // the date the position evaluation was assigned
    let startDate = undefined;
    // <<-------------------------------------------------------->> //

    // --->>> THINGS WE CAN SET FOR USER WITHOUT ASYNC CALLS <<<--- //
    // admin status must be changed in the db directly
    user.admin = false;
    // user has not yet verified email
    user.verified = false;
    // had to select that they agreed to the terms to sign up so must be true
    user.agreedToTerms = true;
    // user has just signed up
    user.dateSignedUp = new Date();
    // hasn't had opportunity to do onboarding yet
    user.hasFinishedOnboarding = false;
    // infinite use, used to verify identify when making calls to backend
    user.verificationToken = crypto.randomBytes(64).toString('hex');
    // one-time use, used to verify email address before initial login
    user.emailVerificationToken = crypto.randomBytes(64).toString('hex');
    // make sure referral code is in right format, otherwise get rid of it
    if (typeof user.signUpReferralCode !== "string") {
        user.signUpReferralCode = undefined;
    }
    // <<-------------------------------------------------------->> //

    // --->>       VERIFY THAT USER HAS UNIQUE EMAIL          <<--- //
    Users.find({email: user.email})
    .then(foundUsers => {
        if (foundUsers.length > 0) {
            return res.status(400).send("An account with that email address already exists.");
        } else {
            // mark that we are good to make this user, then try to do it
            verifiedUniqueEmail = true;
            makeUser();
        }
    })
    .catch(findUserError => {
        console.log("error finding user by email: ", findUserError);
        return res.status(500).send(SERVER_ERROR);
    });
    // <<-------------------------------------------------------->> //

    // --->> VERIFY THAT THE CODE THE USER PROVIDED IS LEGIT  <<--- //
    verifyPositionCode().then(codeVerified => {
        positionFound = true;
        makeUser();
    }).catch(verifyCodeError => {
        if (typeof verifyCodeError === "object" && verifyCodeError.status && verifyCodeError.message) {
            console.log(verifyCodeError.error);
            return res.status(verifyCodeError.status).send(verifyCodeError.message);
        } else {
            console.log("Error verifying position code: ", verifyCodeError);
            return res.status(500).send(SERVER_ERROR);
        }
    });
    // <<-------------------------------------------------------->> //

    // --->> COUNT THE USERS WITH THIS NAME TO ALLOW PROFILE URL CREATION <<--- //
    Users.count({name: user.name})
    .then(count => {
        // create the user's profile url with the count after their name
        const randomNumber = crypto.randomBytes(8).toString('hex');
        user.profileUrl = user.name.split(' ').join('-') + "-" + (count + 1) + "-" + randomNumber;
        madeProfileUrl = true;
        makeUser();
    }).catch (countError => {
        console.log("Couldn't count the number of users: ", countError);
        return res.status(500).send("Server error.");
    })
    // <<-------------------------------------------------------->> //

    // --->>            HASH THE USER'S PASSWORD              <<--- //
    const saltRounds = 10;
    bcrypt.hash(user.password, saltRounds, function(hashError, hash) {
        if (hashError) { console.log("hash error: ", hashError); return res.status(500).send(SERVER_ERROR); }

        // change the stored password to be the hash
        user.password = hash;
        // mark that we have created verification token and password, then make the user
        createdLoginInfo = true;
        makeUser();
    });
    // <<-------------------------------------------------------->> //

    // --->>           CREATE AND UPDATE THE USER             <<--- //
    async function makeUser() {
        // make sure all pre-reqs to creating user are met
        if (!positionFound || !verifiedUniqueEmail || !createdLoginInfo || !madeProfileUrl) { return; }

        // make the user db object
        try {
            user = await Users.create(user);
        } catch (createUserError) {
            console.log("Error creating user: ", createUserError);
            return res.status(500).send("Server error.");
        }

        // if the user used a unique code that has to get deleted now ...
        if (userCodeType) {
            // ... remove it from the position from the correct codes array
            business.positions[positionIndex][userCodeType].splice(oneTimeCodeIndex, 1);
        }

        // save the user's id so that if they click verify email in the same
        // browser they can be logged in right away
        req.session.unverifiedUserId = user._id;
        req.session.save(function (err) {
            if (err) { console.log("error saving unverifiedUserId to session: ", err); }
        })

        try {
            // add the evaluation to the user
            let evalObj = await addEvaluation(user, business, positionId, startDate);
            user = evalObj.user;
            // since the user is just signing up we know that the active
            // position will be the only one available
            user.positionInProgress = user.positions[0].positionId;

            // save the user and the business with the new evaluation information
            let [savedUser, savedBusiness] = await Promise.all([user.save(), business.save()]);

            // no reason to return the user with tokens because they will have to
            // verify themselves before they can do anything anyway
            return res.json(frontEndUser(savedUser, NO_TOKENS));
        }
        catch (addEvalOrSaveError) {
            console.log("Couldn't add evaluation to user: ", addEvalOrSaveError);
            return res.status(500).send(SERVER_ERROR);
        }

        // sign up for the psych test
        // try {
        //     user = await internalStartPsychEval(user);
        //     user = await user.save();
        // } catch (psychEvalSignupError) {
        //     console.log("pyschEvalSignupError: ", psychEvalSignupError);
        // }

        // add the user to the referrer's list of referred users
        creditReferrer().catch(referralError => { console.log(referralError); });

        // send the moonshot admins an email saying that a user signed up
        alertFounders().catch(emailError => { console.log(emailError); });
    }
    // <<-------------------------------------------------------->> //

    function creditReferrer() {
        return new Promise(function(resolve, reject) {
            // if user used a referral sign up code ...
            if (user.signUpReferralCode) {
                // ... find the user that referred them ...
                Referrals.findOne({referralCode: user.signUpReferralCode})
                .then(referrer => {
                    if (!referrer) {
                        return reject("Invalid referral code used: ", user.signUpReferralCode);
                    }
                    // ... add the user to the referrer's list of referrals ...
                    referrer.referredUsers.push({
                        name: user.name,
                        email: user.email,
                        _id: user._id
                    });
                    // ... and save the referrer
                    referrer.save()
                    .then(savedReferrer => { return resolve(); })
                    .catch(saveReferrerError => { return reject(saveReferrerError); })
                })
                .catch(referralError => { return reject(referralError); });
            }

            // no referral code used
            else { return resolve(); }
        });
    }

    function verifyPositionCode() {
        return new Promise(function(resolve, reject) {
            // message shown to users with bad employer code
            const INVALID_CODE = "Invalid employer code."
            // get the position from the employer code
            let code = user.code;
            // if the user did not provide a code, they can't sign up
            if (!code) {
                code = user.employerCode;
                if (!code) {
                    return reject({status: 403, message: "Need an employer referral.", error: "No employer referral."});
                }
            }
            // see if the code is a valid length
            if (code.length < 10 || !user.code && code.length < 11) {
                return reject({status: 400, message: INVALID_CODE, error: `code not long enough, was ${code.length} characters`});
            }
            // business identifier
            const employerCode = code.substring(0, 8);
            // position identifier
            const positionCode = code.substring(8, 10);
            // user identifier
            const uniqueCode = user.userCode ? user.userCode : code.substring(10);

            // find the business corresponding to that employer code
            Businesses.find({code: employerCode})
            .then(foundBusinesses => {
                if (!foundBusinesses || foundBusinesses.length == 0) {
                    return reject({status: 400, message: INVALID_CODE, error: `no business found with employer code: ${employerCode}`})
                }

                business = foundBusinesses[0];

                // find the position the candidate is applying to
                positionIndex = business.positions.findIndex(pos => { return pos.code === positionCode; })
                let position = business.positions[positionIndex];
                positionId = position._id;
                if (!position) {
                    return reject({status: 400, message: INVALID_CODE, error: `no position found with position code: ${positionCode}`});
                }

                // if the position requires a special code because it is closed to the public
                if (position.open === false) {
                    // user needs a unique code; if doesn't have one, reject
                    if (!uniqueCode) {
                        return reject({status: 400, message: INVALID_CODE, error: "no unique code"});
                    }

                    // find the index of the candidate-specific code within the position
                    const candidateIndex = position.candidateCodes.findIndex(candidateCode => {
                        return candidateCode.code == uniqueCode;
                    });
                    const employeeIndex = position.employeeCodes.findIndex(employeeCode => {
                        return employeeCode == uniqueCode;
                    });
                    const managerIndex = position.managerCodes.findIndex(managerCode => {
                        return managerCode == uniqueCode;
                    });
                    const adminIndex = position.adminCodes.findIndex(adminCode => {
                        return adminCode == uniqueCode;
                    });

                    if (candidateIndex !== -1) {
                        user.userType = "candidate";
                        oneTimeCodeIndex = candidateIndex;
                        userCodeType = "candidateCodes";
                        // get the date the evaluation was assigned
                        startDate = position.candidateCodes[candidateIndex].startDate;
                    } else if (employeeIndex !== -1) {
                        user.userType = "employee";
                        oneTimeCodeIndex = employeeIndex;
                        userCodeType = "employeeCodes";
                    } else if (managerIndex !== -1) {
                        user.userType = "manager";
                        oneTimeCodeIndex = managerIndex;
                        userCodeType = "managerCodes";
                    } else {
                        user.userType = "accountAdmin";
                        oneTimeCodeIndex = adminIndex;
                        userCodeType = "accountAdmin";
                    }

                    // if the user does NOT have a valid unique code
                    if (typeof oneTimeCodeIndex !== "number" || oneTimeCodeIndex < 0){
                        return reject({status: 400, message: INVALID_CODE, error: "invalid unique code"});
                    }
                }

                // the code is legit, resolve
                return resolve(true);
            })
            .catch(findBizError => {
                console.log("error finding business by employer code");
                return reject({status: 500, message: SERVER_ERROR, error: findBizError})
            })
        });
    }

    function alertFounders() {
        return new Promise(function(resolve, reject) {
            // send email to everyone if there's a new sign up (if in production mode)
            if (process.env.NODE_ENV !== "development") {
                let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com", "ameyer24@wisc.edu"];

                let subject = 'New Sign Up';
                let content =
                      '<div>'
                    +   '<p>New user signed up.</p>'
                    +   '<p>Name: ' + user.name + '</p>'
                    +   '<p>email: ' + user.email + '</p>'
                    + '</div>';

                const sendFrom = "Moonshot";
                sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
                    if (!success) {
                        return reject("Error sending sign up alert email");
                    } else {
                        return resolve();
                    }
                })
            }
        });
    }
}


// saves all three onboarding steps
function POST_updateAllOnboarding(req, res) {
    const info = sanitize(req.body.params.info);
    const goals = sanitize(req.body.params.goals);
    const interests = sanitize(req.body.params.interests);
    const userId = sanitize(req.body.params.userId);
    const verificationToken = sanitize(req.body.params.verificationToken);

    if (userId && verificationToken) {
        // When true returns the updated document
        Users.findById(userId, function (findErr, user) {
            if (findErr) {
                console.log("Error finding user when updating info during onboarding: ", findErr);
                res.status(500).send("Server error");
                return;
            }

            if (!verifyUser(user, verificationToken)) {
                console.log("Couldn't verify user when trying to update onboarding info.");
                res.status(401).send("User does not have valid credentials to update info.");
                return;
            }

            if (info) {
                // if info exists, try to save it
                const fullInfo = removeEmptyFields(info);

                for (const prop in fullInfo) {
                    // only use properties that are not inherent to all objects
                    if (info.hasOwnProperty(prop)) {
                        console.log("updating " + prop + " to ", fullInfo[prop]);
                        user.info[prop] = fullInfo[prop];
                    }
                }
            }

            // if goals exist, save them
            if (goals) {
                user.info.goals = goals
            }

            // if interests exist, save them
            if (interests) {
                user.info.interests = interests;
            }

            user.save(function (saveErr, updatedUser) {
                if (saveErr) {
                    console.log("Error saving user information when updating info from onboarding: ", saveErr);
                    res.status(500).send("Server error, couldn't save information.");
                    return;
                }
                res.send(removePassword(updatedUser));
            });
        })
    } else {
        console.log("Didn't have info or a user id or both.")
        res.status(403).send("Bad request.");
    }
}


// end candidate's onboarding so they can get on to the rest of the site
function POST_endOnboarding(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const removeRedirectField = sanitize(req.body.removeRedirectField);

    const query = {_id: userId, verificationToken};
    let update = {
        '$set': {
            hasFinishedOnboarding: true
        }
    };

    if (removeRedirectField) {
        update['$unset'] = { redirect: "" }
    }

    // When true returns the updated document
    const options = {new: true};

    Users.findOneAndUpdate(query, update, options, function (err, updatedUser) {
        if (!err && updatedUser) {
            res.json(frontEndUser(updatedUser));
        } else {
            res.status(500).send("Error ending onboarding.");
        }
    });
}


function POST_sendVerificationEmail(req, res) {
    let email = sanitize(req.body.email);
    let query = {email: email};

    let moonshotUrl = 'https://www.moonshotinsights.io/';
    // if we are in development, links are to localhost
    if (!process.env.NODE_ENV) {
        moonshotUrl = 'http://localhost:8081/';
    }

    Users.findOne(query, function (err, user) {
        let recipient = [user.email];
        let subject = 'Verify email';
        let content =
            '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                    + '<div style="text-align:justify;width:80%;margin-left:10%;">'
                    + '<span style="margin-bottom:20px;display:inline-block;">Thank you for joining Moonshot! To get going on your pathways, learning new skills, and building your profile for employers, please <a href="' + moonshotUrl + 'verifyEmail?token=' + user.emailVerificationToken + '">verify your account</a>.</span><br/>'
                    + '<span style="display:inline-block;">If you have any questions or concerns or if you just want to talk about the weather, please feel free to email us at <a href="mailto:Support@moonshotinsights.io">Support@moonshotinsights.io</a>.</span><br/>'
                    + '</div>'
                + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="' + moonshotUrl + 'verifyEmail?token='
                + user.emailVerificationToken
                + '">VERIFY ACCOUNT</a>'
                + '<div style="text-align:left;width:80%;margin-left:10%;">'
                    + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
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


// async function POST_completePathway(req, res) {
//     const successMessage = "Pathway marked complete, our team will be in contact with you shortly!";
//     const errorMessage = "Error marking pathway complete, try again or contact us.";
//
//     const userName = sanitize(req.body.userName);
//     const userId = sanitize(req.body._id);
//     const verificationToken = sanitize(req.body.verificationToken);
//     const pathwayName = sanitize(req.body.pathwayName);
//     const pathwayId = sanitize(req.body.pathwayId);
//     const email = sanitize(req.body.email);
//     const phoneNumber = sanitize(req.body.phoneNumber);
//     let referralCode = sanitize(req.body.referralCode);
//
//     // the referral info that will be included in the email to Moonshot founders
//     let referralInfo = "";
//
//     // the user that will be found in the db
//     let user = undefined;
//     // the pathway that will be found in the db
//     let pathway = undefined;
//
//     // get the user from the db
//     Users.findById(userId)
//     .then(foundUser => {
//         // if we can't find the user
//         if (foundUser == null) {
//             console.log("Could not find the user that was trying to complete a pathway.");
//             return res.status(400).send("You don't have the right credentials to complete the pathway.");
//         }
//
//         // if the user doesn't have the right verification token
//         if (foundUser.verificationToken !== verificationToken) {
//             console.log("User did not have the right verification token when trying to complete a pathway.");
//             return res.status(400).send("You don't have the right credentials to complete the pathway.");
//         }
//
//         // set the api-wide user object
//         user = foundUser;
//
//         // if the pathway has already been found, check if all the questions
//         // have been completed, then mark pathway complete
//         if (pathway) {
//             checkIfAllQuestionsCompleted();
//         }
//     })
//     // if there's an error getting the user
//     .catch(findUserError => {
//         console.log("Error finding user when user tried to complete a pathway: ", findUserError);
//         return res.status(500).send("Server error, try again later.");
//     });
//
//
//     // get the pathway that the user is completing; only need the steps because
//     // those are the only things we verify
//     Pathways.findById(pathwayId)
//     .select("steps.subSteps.order steps.subSteps.name steps.subSteps.contentID steps.subSteps.contentType steps.subSteps.required steps.order steps.name skills")
//     .then(foundPathway => {
//         // no pathway found
//         if (!foundPathway) {
//             console.log("Couldn't find pathway that user tried to complete. Pathway id searched for: ", pathwayId);
//             return res.status(404).send("Couldn't find that pathway, sorry!");
//         }
//
//         // set the api-wide pathway object
//         pathway = foundPathway;
//         // if the user has already been found, check if all the questions
//         // have been completed, then mark pathway complete
//         if (user) {
//             checkIfAllQuestionsCompleted();
//         }
//     })
//     // error finding the pathway
//     .catch(findPathwayError => {
//         console.log("Error finding the pathway that the user says they completed: ", findPathwayError);
//         return res.status(500).send("Server error, try again later.");
//     })
//
//     // function executed after finding the user and the pathway
//     // checks if the user actually completed the pathway, then moves on to
//     // completing the pathway
//     function checkIfAllQuestionsCompleted() {
//         // see if the user has any answers at all
//         let userHasAnswers = false;
//         if (typeof user.answers === "object") {
//             userHasAnswers = true;
//         }
//
//         let incompleteSteps = [];
//
//         // go through each step to see if the user completed all the subSteps
//         pathway.steps.forEach(step => {
//             // go through each subStep to see if the user has completed them
//             step.subSteps.forEach(subStep => {
//                 // only quizzes will have answers, ignore all other subSteps
//                 if (subStep.contentType !== "quiz") {
//                     return;
//                 }
//
//                 // only add this to incomplete steps if it is required
//                 if (subStep.required !== true) {
//                     return;
//                 }
//
//                 // this subStep is a quiz; see if the user has an answer for it
//                 if (!userHasAnswers || !user.answers[subStep.contentID]) {
//                     // add this substep to the list of incomplete steps
//                     incompleteSteps.push({
//                         stepNumber: step.order,
//                         stepName: step.name,
//                         subStepNumber: subStep.order,
//                         subStepName: subStep.name
//                     })
//                 }
//             });
//         });
//
//         // if there are any incomplete steps, don't let the user finish the pathway
//         if (incompleteSteps.length > 0) {
//             console.log("User tried to finish a pathway without finishing all the steps.");
//             console.log("user: ", user);
//             console.log("pathway name: ", pathway.name);
//             console.log("incompleteSteps: ", incompleteSteps);
//
//             return res.status(400).send({incompleteSteps});
//         }
//
//         // deal with referral code, then mark pathway complete and add user to
//         // business accounts
//
//         // remove punctuation and spaces from referral code
//         if (referralCode) {
//             referralCode = referralCode.replace(/&amp;|&quot;|&apos;/g,"").replace(/[.,\/#!$%\^&\*;:{}'"=\-_`~()]/g,"").replace(/\s/g,"").toLowerCase();
//         }
//
//         // this gets executed before the code above, it executes all that when it's ready
//         if (referralCode) {
//             referralInfo = "<p>Referral Code: " + referralCode + "</p>";
//
//             Referrals.findOne({referralCode}, function(error, referrer) {
//                 if (error || referrer == null || (referrer.email == undefined && referrer.name == undefined)) {
//                     referralInfo = referralInfo + "<p>However, no user is associated with that referral code.</p>";
//                 } else {
//                     referralInfo = referralInfo + "<p>Referrer's email: " + referrer.email + "</p><p>Referrer's Name: " + referrer.name + ". Make sure this isn't the same as the user who completed the pathway.</p>";
//                 }
//                 finishPathway();
//             });
//         } else {
//             finishPathway();
//         }
//     }
//
//     // emails moonshot founders telling them someone finished a pathway,
//     // saves user with completed pathway, adds users to business accounts
//     function finishPathway() {
//         let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com", "ameyer24@wisc.edu"];
//         let subject = 'ACTION REQUIRED: Somebody completed pathway';
//         let content = "<div>"
//             + "<h3>A User has just completed this pathway:</h3>"
//             + "<p>User: "
//             + userName
//             + "</p>"
//             + "<p>User id: "
//             + userId
//             + "</p>"
//             + "<p>Pathway: "
//             + pathwayName
//             + "</p>"
//             + "<p>Contact them with this email: "
//             + email
//             + "</p>"
//             + "<p>or this phone number: "
//             + phoneNumber
//             + "</p>"
//             + referralInfo
//             + "</div>";
//
//
//         // mark pathway complete and change emailTo
//         user.emailToContact = sanitize(req.body.email);
//         user.phoneNumber = sanitize(req.body.phoneNumber);
//         // find the user's pathway object corresponding to the pathway that was
//         // marked complete
//         const pathwayIndex = user.pathways.findIndex(function(path) {
//             return path.pathwayId.toString() == pathwayId.toString();
//         });
//         // if the pathway was found in their current pathways, remove it
//         // from current pathways and add it to completed pathways
//         if (typeof pathwayIndex === "number" && pathwayIndex >= 0) {
//             let completedPathway = user.pathways[pathwayIndex];
//             const newPathwayObject = {
//                 pathwayId: completedPathway.pathwayId,
//                 dateAdded: completedPathway.dateAdded,
//                 dateCompleted: new Date()
//             }
//
//             // Put pathway into completed pathways and remove it from current pathways
//             user.completedPathways.push(newPathwayObject);
//             user.pathways.splice(pathwayIndex, 1);
//         }
//         // if the user didn't have that pathway in the first place, don't let them complete it
//         else {
//             console.log("User tried to complete a pathway without having it in their list of current pathways.");
//             console.log("user: ", user);
//             console.log("pathwayId: ", pathwayId);
//             return res.status(403).send("Must have signed up for that pathway to complete it.");
//         }
//
//         // add the user's new skills that they gained from this
//         if (Array.isArray(pathway.skills)) {
//             pathway.skills.forEach(function(skill) {
//                 // only add the skill if the user does not already have it
//                 const notFound = -1;
//                 if (user.skills.findIndex(function(userSkill) {
//                     return userSkill === skill;
//                 }) === notFound) {
//                     user.skills.push(skill);
//                 }
//             });
//         }
//
//         // save the user's new info in the db
//         user.save(function(err, updatedUser) {
//             // safe-guard against us getting a null updatedUser
//             let userToReturn = updatedUser;
//             if (err || updatedUser == null || updatedUser == undefined) {
//                 console.log("Error marking pathway: " + pathway.name + " as complete for user with email: " + user.email + ": ", err);
//                 userToReturn = user;
//                 content = content + "<div>User's new info was not successfully saved in the database. Look into it.</div>"
//             }
//
//             // get the associated businesses (the ones that have
//             // this pathway's id in their associated pathway ids array)
//             // TODO: when refactoring for db speed/minimal data sent,
//             // this would be a good query to work with. try to return
//             // only the right candidate
//             Businesses.find({pathwayIds: pathwayId})
//             .select("pathwayIds candidates")
//             .exec(function (findBizErr, businesses) {
//                 if (findBizErr) {
//                     console.log("Error finding businesses corresponding to the pathway user is trying to complete: ", findBizErr);
//                     sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "completing");
//                     return;
//                 }
//
//                 // iterate through each business that has this pathway
//                 businesses.forEach(function(business) {
//                     let candidates = business.candidates;
//
//                     // find the candidate index within the business' candidate array
//                     const userIdString = user._id.toString();
//                     const userIndex = candidates.findIndex(function(candidate) {
//                         return candidate.userId.toString() == userIdString;
//                     });
//
//                     // the candidate's current location
//                     const location = user.info && user.info.location ? user.info.location : "";
//
//                     // if candidate doesn't exist, add them along with the pathway
//                     if (userIndex == -1) {
//                         let candidateToAdd = {
//                             userId: user._id,
//                             location: location,
//                             profileUrl: user.profileUrl,
//                             name: user.name,
//                             // give the business the email that the candidate wants to be contacted at, not their login email
//                             email: userToReturn.emailToContact ? userToReturn.emailToContact : userToReturn.email,
//                             // will only have this pathway if the candidate didn't exist before
//                             pathways: [{
//                                 _id: pathwayId,
//                                 name: pathwayName,
//                                 hiringStage: "Not Contacted",
//                                 completionStatus: "Complete"
//                             }]
//                         }
//                         business.candidates.push(candidateToAdd);
//                     }
//
//                     // candidate did previously exist
//                     else {
//                         let candidate = candidates[userIndex];
//
//                         // change their email to contact just in case they changed it
//                         business.candidates[userIndex].email = userToReturn.emailToContact ? userToReturn.emailToContact : userToReturn.email;
//
//                         // check if they have the current pathway (will be -1 if they don't)
//                         const pathwayIndex = candidate.pathways.findIndex(function(path) {
//                             return path._id == pathwayId;
//                         });
//
//                         // if the have the current pathway, mark them as having completed it
//                         if (pathwayIndex > -1) {
//                             business.candidates[userIndex].pathways[pathwayIndex].completionStatus = "Complete";
//                         }
//
//                         // if they don't have the current pathway, add the pathway and mark it complete
//                         else {
//                             business.candidates[userIndex].pathways.push({
//                                 _id: pathwayId,
//                                 name: pathwayName,
//                                 hiringStage: "Not Contacted",
//                                 completionStatus: "Complete",
//                                 isDismissed: false
//                             })
//                         }
//                     }
//
//                     // save the businesses in db
//                     business.save(function(updateBizErr, updatedBiz) {
//                         if (updateBizErr || updatedBiz == null) {
//                             sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "completing");
//                         }
//                     });
//                 });
//             });
//
//             // only send email if in production
//             if (process.env.NODE_ENV) {
//                 // send an email to us saying that the user completed a pathway
//                 const sendFrom = "Moonshot";
//                 sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
//                     if (success) {
//                         return res.json({message: successMessage, user: frontEndUser(userToReturn)});
//                     } else {
//                         return res.status(500).send({message: errorMessage, user: userToReturn});
//                     }
//                 });
//             } else {
//                 // if not in production, just send success message to user
//                 return res.json({message: successMessage, user: frontEndUser(userToReturn)});
//             }
//         });
//     }
// }


// async function POST_addPathway(req, res) {
//     const _id = sanitize(req.body._id);
//     const verificationToken = sanitize(req.body.verificationToken);
//     const pathwayId = sanitize(req.body.pathwayId);
//     const pathwayName = sanitize(req.body.pathwayName);
//
//
//     if (_id && pathwayId && verificationToken) {
//         let dbPatway = undefined;
//         try {
//             // find the given pathway
//             dbPathway = await Pathways.findById(pathwayId);
//         } catch (findPathwayErr) {
//             console.log("Error trying to sign up for pathway with pathway id: ", pathwayId, ". Error: ", findPathwayErr);
//             return res.status(404).send("Error signing up for that pathway.");
//         }
//
//         // if the pathway is null, could not find a pathway from the given id
//         if (!dbPathway) { return res.status(404).send("Invalid pathway."); }
//
//         // When true returns the updated document
//         Users.findById(_id, function (err, user) {
//             if (err) {
//                 console.log("Error finding user by id when trying to add a pathway: ", err);
//                 res.status(500).send("Server error, try again later.");
//                 return;
//             }
//
//             if (user.verificationToken !== verificationToken) {
//                 return res.status(403).send("You do not have permission to add a pathway.");
//             }
//
//             for (let i = 0; i < user.pathways.length; i++) {
//                 if (user.pathways[i].pathwayId == req.body.pathwayId) {
//                     return res.status(401).send("You can't sign up for pathway more than once.");
//                 }
//             }
//             for (let i = 0; i < user.completedPathways.length; i++) {
//                 if (user.completedPathways[i].pathwayId == req.body.pathwayId) {
//                     return res.status(401).send("You can't sign up for a completed pathway.");
//                 }
//             }
//             const pathway = {
//                 dateAdded: new Date(),
//                 pathwayId: pathwayId,
//                 currentStep: {
//                     subStep: 1,
//                     step: 1
//                 }
//             };
//             user.pathways.push(pathway);
//
//             user.save(function (saveErr, updatedUser) {
//                 if (saveErr) {
//                     console.log("Error saving user with new pathway: ", saveErr);
//                     return res.status(500).send("Server error, try again later.");
//                 }
//
//                 try {
//                     // send email to everyone to alert them of the added pathway (if in production mode)
//                     if (process.env.NODE_ENV) {
//                         let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "stevedorn9@gmail.com", "ameyer24@wisc.edu"];
//                         let subject = 'New Pathway Sign Up';
//                         let content =
//                             '<div>'
//                             +   '<p>A user signed up for a pathway.</p>'
//                             +   '<p>Name: ' + updatedUser.name + '</p>'
//                             +   '<p>email: ' + updatedUser.email + '</p>'
//                             +   '<p>Pathway: ' + pathwayName + '</p>'
//                             + '</div>';
//
//                         console.log("Sending email to alert us about new user sign up.");
//
//                         const sendFrom = "Moonshot";
//                         sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
//                             if (!success) {
//                                 console.log("Error sending sign up alert email");
//                             }
//                         })
//                     }
//                 } catch (e) {
//                     console.log("ERROR SENDING EMAIL ALERTING US THAT A NEW USER SIGNED UP: ", e);
//                 }
//
//                 // add this user to the candidates list for all businesses associated with this pathway
//                 Businesses.find({pathwayIds: pathwayId})
//                     .select("pathwayIds candidates")
//                     .exec(function (findBizErr, businesses) {
//                         if (findBizErr) {
//                             // error finding business
//                             sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "adding");
//                         } else {
//                             // iterate through each business that has this pathway
//                             businesses.forEach(function(business) {
//                                 let candidates = business.candidates;
//
//                                 // find the candidate index within the business' candidate array
//                                 const userIdString = user._id.toString();
//                                 const userIndex = candidates.findIndex(function(candidate) {
//                                     if (!candidate.userId) {
//                                         return false;
//                                     }
//                                     return candidate.userId.toString() == userIdString;
//                                 });
//
//                                 // the candidate's current location
//                                 const location = user.info && user.info.location ? user.info.location : "";
//
//                                 // if candidate doesn't exist, add them along with the pathway
//                                 if (userIndex == -1) {
//                                     let candidateToAdd = {
//                                         userId: user._id,
//                                         name: user.name,
//                                         profileUrl: user.profileUrl,
//                                         location: location,
//                                         // give the business the email that the candidate wants to be contacted at, not their login email
//                                         email: user.emailToContact ? user.emailToContact : user.email,
//                                         // will only have this pathway if the candidate didn't exist before
//                                         pathways: [{
//                                             _id: pathwayId,
//                                             name: pathwayName,
//                                             hiringStage: "Not Contacted",
//                                             completionStatus: "In Progress"
//                                         }]
//                                     }
//                                     business.candidates.push(candidateToAdd);
//                                 }
//
//                                 // candidate did previously exist
//                                 else {
//                                     let candidate = candidates[userIndex];
//
//                                     // check if they have the current pathway (will be -1 if they don't)
//                                     const pathwayIndex = candidate.pathways.findIndex(function(path) {
//                                         return path._id == pathwayId;
//                                     });
//
//                                     // if the have the current pathway, mark them as having it in progress
//                                     if (pathwayIndex > -1) {
//                                         business.candidates[userIndex].pathways[pathwayIndex].completionStatus = "In Progress";
//                                     }
//
//                                     // if they don't have the current pathway, add the pathway and mark it in progress
//                                     else {
//                                         business.candidates[userIndex].pathways.push({
//                                             _id: pathwayId,
//                                             name: pathwayName,
//                                             hiringStage: "Not Contacted",
//                                             completionStatus: "In Progress"
//                                         })
//                                     }
//                                 }
//                                 // save the businesses in db
//                                 business.save(function(updateBizErr, updatedBiz) {
//                                     if (updateBizErr || updatedBiz == null) {
//                                         sendBizUpdateCandidateErrorEmail(user.email, pathwayId, "adding");
//                                     }
//                                 });
//                             });
//                         }
//                     });
//
//                 return res.send(removePassword(updatedUser));
//             });
//         })
//     } else {
//         return res.status(400).send("Bad request.");
//     }
// }


// send email to admins saying a user signed up to be in a pathway that is coming soon
// function POST_comingSoonEmail(req, res) {
//     let recipient = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io", "ameyer24@wisc.edu"];
//     let subject = 'Moonshot Coming Soon Pathway';
//     let content = "<div>"
//         + "<h3>Pathway:</h3>"
//         + "<p>Name: "
//         + sanitize(req.body.name)
//         + "<p>Email: "
//         + sanitize(req.body.email)
//         + "</p>"
//         + "<p>Pathway: "
//         + sanitize(req.body.pathway)
//         + "</p>"
//         + "</div>";
//
//     const sendFrom = "Moonshot";
//     sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
//         if (success) {
//             res.json("Email sent successfully, our team will be in contact with you shortly!");
//         } else {
//             res.status(500).send(msg);
//         }
//     })
// }
//
//
// function POST_updateAnswer(req, res) {
//     let params, userId, verificationToken, quizId, answer;
//     try {
//         // get all the parameters
//         params = sanitize(req.body.params);
//         userId = params.userId;
//         verificationToken = params.verificationToken;
//         quizId = params.quizId;
//         answer = params.answer;
//     } catch (e) {
//         console.log("Error updating answer: ", e);
//         return res.status(400).send("Wrong request format.");
//     }
//
//     Users.findById(userId, function (findErr, user) {
//         if (findErr) {
//             console.log("Error finding user by id when trying to update answer: ", findErr);
//             return res.status(404).send("Current user not found.");
//         }
//
//         if (!verifyUser(user, verificationToken)) {
//             console.log("can't verify user");
//             return res.status(401).send("User does not have valid credentials to update answers.");
//         }
//
//         // create answers object for user if it doesn't exist or is the wrong format
//         if (!user.answers || typeof user.answers !== "object" || Array.isArray(user.answers)) {
//             user.answers = {};
//         }
//
//         // update the user's answer to the given question
//         user.answers[quizId.toString()] = answer;
//         // so that Mongoose knows to update the answers object in the db
//         user.markModified('answers');
//
//         user.save(function (saveErr, updatedUser) {
//             if (saveErr) {
//                 console.log("Error updating answer to a question: ", saveErr)
//                 return res.status(500).send("Server error, try again later.");
//             }
//             return res.send(removePassword(updatedUser));
//         });
//     })
// }


module.exports = candidateApis;
