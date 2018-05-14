var Businesses = require('../models/businesses.js');
var Employers = require('../models/employers.js');
var Users = require('../models/users.js');
var Pathways = require('../models/pathways.js');
var Quizzes = require('../models/quizzes.js');

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
        getFirstName
} = require('./helperFunctions.js');


const employerApis = {
    POST_alertLinkClicked,
    POST_business,
    GET_info,
    GET_candidateResponses
}


function POST_alertLinkClicked(req, res) {
    const name = sanitize(req.body.params.name);
    const id = sanitize(req.body.params.userId);
    const link = sanitize(req.body.params.link);

    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Someone just clicked the NWM Culture Index Link';
    let content = "<div>"
        + "<h3>Send an email to Northwestern Mutual (Preston) telling him NOT to interview this person until we give him the go-ahead. Make sure this is the right link, it's possible that this email hasn't been updated in the codebase yet but there are other links that you'll need to be notified of.</h3>"
        + "<p>User's Name: "
        + name
        + "</p>"
        + "<p>User's id: "
        + id
        + "</p>"
        + "<p>Link that was clicked: "
        + link
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            return res.json(true);
        } else {
            console.log("ERROR SENDING EMAIL SAYING THAT THE NWM LINK WAS CLICKED");
            return res.json(false);
        }
    });
}


async function POST_business(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const businessName = sanitize(body.businessName);
    const initialUserName = sanitize(body.initialUserName);
    const initialUserPassword = sanitize(body.initialUserPassword);
    const initialUserEmail = sanitize(body.initialUserEmail);

    // validate admin is admin user
    const isAdmin = await verifyAdmin(userId, verificationToken);
    if (!isAdmin) {
        return res.status(403).send("You do not have permission to add businesses.");
    }

    try {
        // check if another business with that name already exists
        const businessNameQuery = {name: businessName};
        const foundBiz = await Businesses.findOne(businessNameQuery);

        // business already exists with that name
        if (foundBiz) {
            return res.status(400).send("A business already exists with that name. Try a different name.");
        }

        // no business exists with that name, can go ahead and make new business
        const newBusiness = {
            name: businessName
        };

        // make the business in the db
        let createdBusiness = await Businesses.create(newBusiness);

        // check if a user (business- or non-business-) with the email provided
        // already exists
        const userEmailQuery = {email: initialUserEmail};
        getUserByQuery(userEmailQuery, function(findUserErr, foundUser) {
            // error looking for user by email
            if (findUserErr) {
                console.log("Error looking for a user by email: ", findUserErr);
                res.json("Successful business creation, but couldn't create initial user.");
                return;
            }
            // user found with that email so can't create it
            else if (foundUser) {
                return res.json("Successful business creation, but user with that email already exists.");
            }

            // can create the initial user

            // function that will create employer and save them to the business
            // once the business has been created
            // executes right after creation once hash as been made
            const createEmployerWithPassword = async (createHashErr, hash) => {
                const newEmployer = {
                    name: initialUserName,
                    email: initialUserEmail,
                    password: hash,
                    userType: "employer",
                    verificationToken: crypto.randomBytes(64).toString('hex'),
                    verified: true,
                    company: {
                        name: createdBusiness.name,
                        companyId: createdBusiness._id
                    }
                };
                // create the employer
                try {
                    let createdEmployer = await Employers.create(newEmployer);

                    // ensure the business has a list of business user ids
                    if (!Array.isArray(createdBusiness.businessUserIds)) {
                        createdBusiness.employerIds = [];
                    }
                    // add the employer to the business' list of recruiters
                    createdBusiness.employerIds.push(createdEmployer._id);

                    try {
                        // save the business with the new user in it
                        await createdBusiness.save();
                        // everything succeeded
                        return res.json("Success!");
                    }
                    // error saving employer to business' array of business user ids
                    catch (saveBizUserIdsErr) {
                        console.log("error saving employer to business' array of business user ids: ", saveBizUserIdsErr);
                        return res.json("Successful business creation but error associating new business user with business.");
                    }
                }
                // error creating the new user
                catch (createEmployerErr) {
                    console.log("Error creating new employer: ", createEmployerErr);
                    return res.json("Successful business creation, but could not create initial user.");
                }
            }

            // hash password and create the employer
            const SALT_ROUNDS = 10;
            bcrypt.hash(initialUserPassword, SALT_ROUNDS, createEmployerWithPassword);
        });
    }
    // error at some point in business creation
    catch (dbError) {
        console.log("Database error during creation: ", dbError);
        return res.status(500).send("Server error, try again later.");
    }
}


function GET_info(req, res) {
    const query = sanitize(req.query);
    const _id = query.userId;
    const verificationToken = query.verificationToken;

    if (!_id || !verificationToken) {
        console.log("No user id or verification token for user trying to get admin info.");
        return res.status(403).send("User does not have valid credentials.");
    }

    const adminQuery = { _id, verificationToken };

    Users.findOne(adminQuery, function(err, user) {
        if (err) {
            console.log("Error finding admin user: ", err);
            return res.status(500).send("Error finding current user in db.");
        } else if (!user || !user.admin || !(user.admin === "true" || user.admin === true) ) {
            return res.status(403).send("User does not have valid credentials.");
        } else {
            Users.find()
            .sort({name: 1})
            .select("name email profileUrl")
            .exec(function (err2, users) {
                if (err2) {
                    return res.status(500).send("Not able to get users for admin.");
                } else if (users.length == 0) {
                    return res.status(500).send("No users found for admin.");
                } else {
                    return res.json(users);
                }
            });
        }
    });
}


function GET_candidateResponses(req, res) {
    const query = sanitize(req.query);
    const _id = query.adminUserId;
    const verificationToken = query.verificationToken;
    const profileUrl = query.profileUrl;

    if (!_id || !verificationToken) {
        console.log("No user id or verification token for user trying to get admin info.");
        return res.status(403).send("User does not have valid credentials.");
    }

    if (!profileUrl) {
        console.log("No user info requested.");
        return res.status(400).send("No user info requested.");
    }

    const adminQuery = { _id, verificationToken };

    Users.findOne(adminQuery, function(err, adminUser) {
        if (err) {
            console.log("Error finding admin user: ", err);
            return res.status(500).send("Error finding current user in db.");
        } else if (!adminUser || !adminUser.admin || !(adminUser.admin === "true" || adminUser.admin === true) ) {
            return res.status(403).send("User does not have valid credentials.");
        } else {
            Users.findOne({profileUrl}, function(error, user) {
                if (error) {
                    console.log("Error getting user for admin: ", error);
                    return res.status(500).send("Error getting user for admin.");
                } else if (!user) {
                    console.log("User not found when trying to find user for admin.");
                    return res.status(404).send("User not found.");
                } else {
                    // have the user, now have to get their pathways to return

                    let pathways = [];
                    let completedPathways = [];
                    let foundPathways = 0;
                    let foundCompletedPathways = 0;

                    // quizzes will look like
                    // { <subStepId>: quizObject, ... }
                    let quizzes = {};
                    let requiredNumQuizzes = 0;
                    let foundQuizzes = 0;

                    // scores will be an object with every question with an objective answer
                    // scores[questionId] will be true if the answer is correct
                    // false if the answer is incorrect
                    let scores = {}

                    let returnIfFoundEverything = function() {
                        // if we have found all of the pathways, return all the info to the front end
                        if (foundPathways === user.pathways.length && foundCompletedPathways === user.completedPathways.length && foundQuizzes === requiredNumQuizzes) {
                            // grade the user's answers
                            // console.log("quizzes: ", quizzes);
                            // console.log("user.answers: ", user.answers);
                            for (let questionId in quizzes) {
                                let quiz = quizzes[questionId];
                                // skip anything that is not a quiz
                                if (!quizzes.hasOwnProperty(questionId)) { continue; }

                                // if the user answered the question and the question has a correct answer, grade it
                                if (quiz.hasCorrectAnswers && user.answers[questionId]) {
                                    // if it's a multiple choice question
                                    if (quiz.questionType === "multipleChoice" || quiz.questionType === "twoOptions") {
                                        // get the answer value the user put in
                                        let userAnswerValue = user.answers[questionId].value;
                                        let isCorrect = false;
                                        // if there is an array of correct answers
                                        if (Array.isArray(quiz.correctAnswerNumber)) {
                                            // see if the answer value the user put in is one of the right answers
                                            isCorrect = quiz.correctAnswerNumber.some(function(answerNumber) {
                                                // return true if the answer value is a correct one
                                                return answerNumber === userAnswerValue;
                                            })
                                        }
                                        // if there is a single correct answer
                                        else {
                                            isCorrect = quiz.correctAnswerNumber == userAnswerValue;
                                        }

                                        scores[questionId] = isCorrect;
                                    }
                                }
                            }

                            res.json({
                                user: userForAdmin(user),
                                pathways,
                                completedPathways,
                                quizzes,
                                scores
                            });
                            return;
                        }
                    }

                    let getQuizzesFromPathway = function(path) {
                        if (path && path.steps) {
                            // find quizzes that go with this pathway
                            for (let stepIndex = 0; stepIndex < path.steps.length; stepIndex++) {
                                let step = path.steps[stepIndex];
                                for (let subStepIndex = 0; subStepIndex < step.subSteps.length; subStepIndex++) {
                                    let subStep = step.subSteps[subStepIndex];
                                    if (subStep.contentType === "quiz") {
                                        // new quiz found, have to retrieve it before returning
                                        requiredNumQuizzes++;

                                        Quizzes.findOne({_id: subStep.contentID}, function(quizErr, quiz) {
                                            foundQuizzes++;
                                            if (quizErr) {
                                                console.log("Error getting question: ", quizErr);
                                            } else {
                                                quizzes[subStep.contentID] = quiz;
                                            }

                                            returnIfFoundEverything();
                                        })
                                    }
                                }
                            }
                        }
                    }

                    // if the user has no pathways or completed pathways, return simply their info
                    if (user.pathways.length === 0 && user.completedPathways.lengh === 0) {
                        res.json({
                            user: userForAdmin(user),
                            pathways,
                            completedPathways
                        });
                        return;
                    }

                    for (let pathwaysIndex = 0; pathwaysIndex < user.pathways.length; pathwaysIndex++) {
                        Pathways.findOne({_id: user.pathways[pathwaysIndex].pathwayId}, function(pathErr, path) {
                            if (pathErr) {
                                console.log(pathErr);
                            }
                            pathways.push(path);
                            // mark that we have found another pathway
                            foundPathways++;

                            getQuizzesFromPathway(path);

                            // if we have found all of the pathways, return all the info to the front end
                            // if (foundPathways === user.pathways.length && foundCompletedPathways === user.completedPathways.length && foundQuizzes === requiredNumQuizzes) {
                            //     res.json({
                            //         user: userForAdmin(user),
                            //         pathways,
                            //         completedPathways
                            //     });
                            //     return;
                            // }
                            returnIfFoundEverything();
                        })
                    }

                    for (let completedPathwaysIndex = 0; completedPathwaysIndex < user.completedPathways.length; completedPathwaysIndex++) {
                        Pathways.findOne({_id: user.completedPathways[completedPathwaysIndex].pathwayId}, function(pathErr, path) {
                            if (pathErr) {
                                console.log(pathErr);
                            }
                            completedPathways.push(path);
                            // mark that we have found another pathway
                            foundCompletedPathways++;

                            getQuizzesFromPathway(path);

                            returnIfFoundEverything();
                            // if we have found all of the pathways, return all the info to the front end
                            // if (foundPathways === user.pathways.length && foundCompletedPathways === user.completedPathways.length && foundQuizzes === requiredNumQuizzes) {
                            //     res.json({
                            //         user: userForAdmin(user),
                            //         pathways,
                            //         completedPathways
                            //     });
                            //     return;
                            // }
                        })
                    }
                }
            });
        }
    });
}


// ----->> END APIS <<----- //


// VERIFY THAT THE GIVEN USER IS AN ADMIN FROM USER ID AND VERIFICATION TOKEN
function verifyAdmin(userId, verificationToken) {
    // async call, lets us use await
    return new Promise((resolve, reject) => {
        Users.findById(userId, function(findUserErr, foundUser) {
            // db error finding the user
            if (findUserErr) {
                console.log("Error finding admin user by id: ", findUserErr);
                resolve(false);
            }
            // no user found with that id, so can't be an admin user
            else if (!foundUser) {
                resolve(false);
            }
            // user found
            else {
                // wrong verification token, user does not have valid credentials
                if (foundUser.verificationToken != verificationToken) {
                    console.log("Someone tried to get verify an admin user with the wrong verification token. User is: ", foundUser);
                    resolve(false);
                }
                // return whether the user is an admin
                else {
                    resolve(foundUser.admin);
                }
            }
        });
    });
}


module.exports = employerApis;
