var Referrals = require('../models/referrals.js');
var Emailaddresses = require('../models/emailaddresses.js');
const UnsubscribedEmails = require("../models/unsubscribedEmails.js");

const crypto = require('crypto');
const errors = require("./errors");

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        sendEmail,
        sendEmailPromise,
        devMode,
        devEmail,
        isValidEmail,
        getFirstName,
        frontEndUser,
        getAndVerifyUser
} = require('./helperFunctions.js');


const miscApis = {
    // POST_createReferralCode,
    POST_unsubscribeEmail,
    POST_resetAlan
}


function POST_createReferralCode(req, res) {
    const name = sanitize(req.body.name);
    // make it to lower case so that it's case insensitive
    const email = sanitize(req.body.email).toLowerCase();

    let sendReferralEmail = function(theCode) {
        // if we're in development (on localhost) navigate to localhost
        let moonshotUrl = "https://moonshotinsights.io/";
        if (process.env.NODE_ENV === "development") {
            moonshotUrl = "http://localhost:8081/";
        }
        const recipient = [email];
        const subject = "Moonshot Referral Code";
        const emailContent =
            "<div style='color:black'>"
            +   "<p>Hello " + name + ",</p>"

            +   "<p>Thank you for signing up as a Moonshot referrer! With us, you can shape the future of the workforce and get paid to do it. Moonshot trains and evaluates college students and recent graduates in skills and positions needed by employers. We do this by creating course pathways that evaluate candidates in positions that our employer partners are hiring for. <a href='https://moonshotinsights.io/'>Check out all of our positions</a>.</p>"

            +   "<p>You will earn $300 for everyone you send our way that gets a job through the Moonshot site.</p>"

            +   "<p>For you to receive credit for a Moonshot user, the user must do one of the following:</p>"
            +   "<p>1. Input your referral code (this is your code: " + theCode + ") at the end of the Pathway when asked how he or she heard about Moonshot.</p>"
            +   "<p>2. Sign up by coming through your unique referrer link: <br/><a href='" + moonshotUrl + "?referralCode=" + theCode + "'>" + moonshotUrl + "?referralCode=" + theCode + "</a></p>"

            +   "<p>A lot of people start by sharing with friends in person and on social media. The people really on their game carry around cards to be ready for any situation. (Let me know if you want card designs to print off.)</p>"

            +   "<p>I'm always excited to strategize tactics and techniques to attract candidates. Shoot me a message if you would like to brainstorm. Remember, all of your outreach must be in accordance with the Moonshot Affiliate Agreement you accepted.</p>"

            +   "<p>Happy referring!</p>"
            +   "<p>Kyle</p>"

            +   "<p>-----------------------------</p>"
            +   "<div style='font-size:12px'>Kyle Treige, Co-Founder & CEO<br/>"
            +   "<a href='" + moonshotUrl + "'>Moonshot<br/>"
            +   "kyle@moonshotinsights.io<br/>"
            +   "608-438-4478</div>"

            +   '<div style="font-size:10px; color:#C8C8C8; margin-top:30px; margin-bottom:30px;">'
            +       '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
            +       '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + email + '">Opt-out of future messages.</a></i>'
            +   '</div>'

            + "</div>";

        // send email to user who asked for a referral code with the info about the code
        const sendFrom = "Kyle Treige";
        sendEmailPromise({ recipient, subject, content: emailContent })
        .catch(error => {
            console.log("Error sending email to user about referral code: ", error);
        });
    }

    const query = {email};

    Referrals.findOne(query, function(err, user) {
        // if there was an error somewhere along the way getting the user
        if (err) {
            return res.status(500).send("Server error, try again later.");
        }
        // if this user has not already asked for a referral code
        else if (user == null) {
            // create the referral code randomly
            const referralCode = crypto.randomBytes(4).toString('hex');
            // the amount we said we'd pay the user for their friend using this code
            const incentive = "$300";
            const userBeingCreated = {name, email, referralCode, incentive}

            // TODO: check if the referral code was already created, make a new
            // one if so

            Referrals.create(userBeingCreated, function(error, newUser) {
                // if there was an error creating the user
                if (error) {
                    return res.status(500).send("Server error, try again later.");
                } else {
                    sendReferralEmail(newUser.referralCode);
                    return res.json(newUser.referralCode);
                }
            });
        }
        // if the user has asked for a referral code in the past
        else {
            // if the user already has a referral code, give them that
            sendReferralEmail(user.referralCode);
            res.json(user.referralCode);
        }
    });
}


async function POST_unsubscribeEmail(req, res) {
    const email = sanitize(req.body.email);
    if (!isValidEmail(email)) {
        console.log("Invalid email sent to POST_unsubscribeEmail: ", email);
        return res.status(400).send({ error: "Bad request." });
    }

    // standard email saying a user unsubscribed
    let recipients = ["kyle@moonshotinsights.io"];
    if (devMode) { recipients = devEmail; }
    let subject = 'URGENT ACTION - User Unsubscribe from Moonshot';
    let content = (`
        <div>
            <h3>This email is Unsubscribing from Moonshot Emails:</h3>
            <p>Email: ${sanitize(req.body.email)}</p>
        </div>
    `);

    const query = { email };
    const update = { email, dateUnsubscribed: new Date() };
    const options = { upsert: true, setDefaultsOnInsert: true };
    // add email to list of unsubscribed emails if they don't already exist there
    try { await UnsubscribedEmails.findOneAndUpdate(query, update, options); }
    // if there was an error unsubscribing, send a different email
    catch (unsubscribeError) {
        console.log("ERROR ADDING EMAIL TO OPT OUT LIST: " + email, "Error: ", unsubscribeError);
        subject = "MOONSHOT - URGENT ACTION - User was not unsubscribed"
        if (!devMode) {
            recipients = ["kyle@moonshotinsights.io", "ameyer24@wisc.edu", "stevedorn9@gmail.com"];
        }
        content = (`
            <div>
                <h3>This email could not be unsubscribed:</h3>
                <p>Email: ${email}</p>
                <p>Manually add them to the database of unsubscribed emails.</p>
            </div>
        `);
    }

    // send the email letting us know someone unsubscribed
    sendEmailPromise({ recipients, subject, content })
    .then(result => {
        return res.status(200).send({ message: "You have successfully unsubscribed." });
    }).catch(error => {
        console.log("Error sending email about user unsubscribing: ", error);
        return res.status(500).send({ error: errors.SERVER_ERROR });
    });
}


// reset the Alan demo account
async function POST_resetAlan(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);

    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        console.log("Error getting user: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR)
    }

    if (user.email !== "alan.alanson@email.com") {
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    user.skillTests = [];
    user.psychometricTest = {
        "currentQuestion": {
            "factorIndex": 2,
            "factorId": {
                _id: "5aff0b612689cb00e45ce2d0"
            },
            "facetIndex": 0,
            "facetId": {
                _id: "5aff0b612689cb00e45ce2e5"
            },
            "questionId": {
                _id: "5aff0b612689cb00e45ce2e7"
            },
            "body": "You get pulled over and forgot your license:",
            "leftOption": "You\u2019re so unlucky!",
            "rightOption": "It\u2019s just a bad day!",
            "invertScore": null
        },
        "incompleteFactors": [
            2,
            3,
            5
        ],
        "inProgress": true,
        "startDate": "2018-07-11T19:18:17.085Z",
        "rephrase": false,
        "numRephrasesAllowed": 0,
        "questionsPerFacet": 1,
        "factors": [
            {
                "incompleteFacets": [],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc62b"
                },
                "facets": [
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce313"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc62f"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b46580ad03371a0c17cc7fe"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:34.166Z",
                                "answer": -0.08571428571428541,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce313"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:35.462Z",
                                "totalTime": 1296
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce30f"
                        },
                        "name": "Sincerity"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce30e"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc62e"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465803d03371a0c17cc71d"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:27.820Z",
                                "answer": -3.314285714285714,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce30e"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:29.013Z",
                                "totalTime": 1193
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce30a"
                        },
                        "name": "Fairness"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce307"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc62d"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465800d03371a0c17cc6ca"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:24.980Z",
                                "answer": 5,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce307"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:26.374Z",
                                "totalTime": 1394
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce305"
                        },
                        "name": "Greed-Avoidance"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce302"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc62c"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465818d03371a0c17cca0b"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:48.097Z",
                                "answer": -2.914285714285714,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce302"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:49.797Z",
                                "totalTime": 1700
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce300"
                        },
                        "name": "Modesty"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce2ff"
                },
                "name": "Honesty-Humility"
            },
            {
                "incompleteFacets": [],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc626"
                },
                "facets": [
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2fe"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc62a"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465815d03371a0c17cc99a"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:45.247Z",
                                "answer": 3.142857142857143,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2fe"
                                },
                                "invertScore": true,
                                "endDate": "2018-07-11T19:18:46.558Z",
                                "totalTime": 1311
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2fa"
                        },
                        "name": "Fearfulness"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2f9"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc629"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465813d03371a0c17cc963"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:43.486Z",
                                "answer": -3.314285714285714,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2f9"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:45.165Z",
                                "totalTime": 1679
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2f5"
                        },
                        "name": "Anxiety"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2f3"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc628"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b46580fd03371a0c17cc8c4"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:39.806Z",
                                "answer": 0.3428571428571425,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2f3"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:41.027Z",
                                "totalTime": 1221
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2f0"
                        },
                        "name": "Dependence"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2ec"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc627"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b46580ed03371a0c17cc891"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:38.471Z",
                                "answer": 2.0285714285714285,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2ec"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:39.667Z",
                                "totalTime": 1196
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2eb"
                        },
                        "name": "Sentimentality"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce2ea"
                },
                "name": "Emotionality"
            },
            {
                "incompleteFacets": [
                    0
                ],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc620"
                },
                "facets": [
                    {
                        "usedQuestions": [],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc625"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465819d03371a0c17cca45"
                                },
                                "startDate": "2018-07-11T19:18:49.876Z",
                                "skips": []
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2e5"
                        },
                        "name": "Liveliness"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2e2"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc624"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465806d03371a0c17cc774"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:30.587Z",
                                "answer": -3.8285714285714283,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2e2"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:31.814Z",
                                "totalTime": 1227
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2e0"
                        },
                        "name": "Social Boldness"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2de"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc623"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465816d03371a0c17cc9d2"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:46.673Z",
                                "answer": -2.914285714285714,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2de"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:48.001Z",
                                "totalTime": 1328
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2db"
                        },
                        "name": "Sociability:"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2d7"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc622"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b4657fcd03371a0c17cc655"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:20.742Z",
                                "answer": -5,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2d7"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:21.907Z",
                                "totalTime": 1165
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2d6"
                        },
                        "name": "Social Self Esteem"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2d2"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc621"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b46580bd03371a0c17cc82e"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:35.564Z",
                                "answer": -4.6,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2d2"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:36.899Z",
                                "totalTime": 1335
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2d1"
                        },
                        "name": "Ability Confidence"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce2d0"
                },
                "name": "Extraversion"
            },
            {
                "incompleteFacets": [
                    0,
                    2
                ],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc61b"
                },
                "facets": [
                    {
                        "usedQuestions": [],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc61f"
                        },
                        "responses": [],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2cb"
                        },
                        "name": "Forgiveness"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2c8"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc61e"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465809d03371a0c17cc7cf"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:33.067Z",
                                "answer": -3.742857142857143,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2c8"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:34.092Z",
                                "totalTime": 1025
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2c6"
                        },
                        "name": "Gentleness"
                    },
                    {
                        "usedQuestions": [],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc61d"
                        },
                        "responses": [],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2c1"
                        },
                        "name": "Flexibility"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2bd"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc61c"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b4657fbd03371a0c17cc630"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:19.394Z",
                                "answer": -5,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2bd"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:20.631Z",
                                "totalTime": 1237
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2bc"
                        },
                        "name": "Patience"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce2bb"
                },
                "name": "Agreeableness"
            },
            {
                "incompleteFacets": [],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc615"
                },
                "facets": [
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2b8"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc61a"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465807d03371a0c17cc7a1"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:31.912Z",
                                "answer": -4.0285714285714285,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2b8"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:33.002Z",
                                "totalTime": 1090
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2b6"
                        },
                        "name": "Organization"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2b4"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc619"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465802d03371a0c17cc6f3"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:26.451Z",
                                "answer": 3.057142857142857,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2b4"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:27.742Z",
                                "totalTime": 1291
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2b1"
                        },
                        "name": "Diligence"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2ad"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc617"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b4657f9d03371a0c17cc618"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:17.085Z",
                                "answer": -5,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2ad"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:19.288Z",
                                "totalTime": 2203
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2ac"
                        },
                        "name": "Perfectionism"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2a8"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc616"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b4657fdd03371a0c17cc67b"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:21.989Z",
                                "answer": -5,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2a8"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:23.191Z",
                                "totalTime": 1202
                            }
                        ],
                        "weight": 0.25,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2a7"
                        },
                        "name": "Prudence"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce2a6"
                },
                "name": "Conscientiousness"
            },
            {
                "incompleteFacets": [
                    4
                ],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc60f"
                },
                "facets": [
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2a5"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc614"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465812d03371a0c17cc92d"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:42.358Z",
                                "answer": -1.2857142857142856,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2a5"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:43.383Z",
                                "totalTime": 1025
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce2a1"
                        },
                        "name": "Aesthetic Appreciation"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce2a0"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc613"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b46580dd03371a0c17cc85f"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:37.002Z",
                                "answer": 3.685714285714285,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce2a0"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:38.365Z",
                                "totalTime": 1363
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce29c"
                        },
                        "name": "Inquisitiveness"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce298"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc612"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465811d03371a0c17cc8f8"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:41.140Z",
                                "answer": -0.40000000000000036,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce298"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:42.282Z",
                                "totalTime": 1142
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce296"
                        },
                        "name": "Creativity"
                    },
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce295"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc611"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b465805d03371a0c17cc748"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:29.114Z",
                                "answer": 4.571428571428571,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce295"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:30.502Z",
                                "totalTime": 1388
                            }
                        ],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce291"
                        },
                        "name": "Unconventionality"
                    },
                    {
                        "usedQuestions": [],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc610"
                        },
                        "responses": [],
                        "weight": 0.2,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce28c"
                        },
                        "name": "Exploration"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce28b"
                },
                "name": "Openness to Experience"
            },
            {
                "incompleteFacets": [],
                "_id": {
                    _id: "5b4657f9d03371a0c17cc60d"
                },
                "facets": [
                    {
                        "usedQuestions": [
                            {
                                _id: "5aff0b612689cb00e45ce288"
                            }
                        ],
                        "_id": {
                            _id: "5b4657f9d03371a0c17cc60e"
                        },
                        "responses": [
                            {
                                "_id": {
                                    _id: "5b4657ffd03371a0c17cc6a2"
                                },
                                "skips": [],
                                "startDate": "2018-07-11T19:18:23.344Z",
                                "answer": -5,
                                "answeredId": {
                                    _id: "5aff0b612689cb00e45ce288"
                                },
                                "invertScore": null,
                                "endDate": "2018-07-11T19:18:24.891Z",
                                "totalTime": 1547
                            }
                        ],
                        "weight": 1,
                        "facetId": {
                            _id: "5aff0b612689cb00e45ce285"
                        },
                        "name": "Wholesomeness"
                    }
                ],
                "factorId": {
                    _id: "5aff0b612689cb00e45ce275"
                },
                "name": "Altruism"
            }
        ],
        "numQuestionsAnswered": 23
    };
    user.positions[0].appliedEndDate = undefined;
    user.positions[0].agreedToSkillTestTerms = undefined;
    user.positions[0].testIndex = 0;
    if (Array.isArray(user.positions[0].freeResponseQuestions)) {
        for (let i = 0; i < user.positions[0].freeResponseQuestions.length; i++) {
            user.positions[0].freeResponseQuestions[i].response = "";
        }
    }
    user.positions[0].scores = undefined;
    user.positions[0].hiringStage = "Not Contacted";
    user.positions[0].hiringStageChanges = [{
        hiringStage: "Not Contacted",
        isDismissed: false,
        dateChanged: new Date()
    }];

    try { await user.save(); }
    catch (saveError) {
        console.log("Error saving Alan: ", saveError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    return res.json(true);
}


module.exports = miscApis;
