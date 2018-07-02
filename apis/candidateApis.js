const Users = require('../models/users.js');
const Referrals = require('../models/referrals.js');
const Businesses = require('../models/businesses.js');
const Signupcodes = require('../models/signupcodes.js');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const errors = require('./errors.js');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        sendEmail,
        getFirstName,
        frontEndUser
} = require('./helperFunctions.js');

// get function to start position evaluation
const { internalStartPsychEval, addEvaluation } = require('./userApis.js');


const candidateApis = {
    POST_updateAllOnboarding,
    POST_candidate,
    POST_endOnboarding,
    POST_sendVerificationEmail
}


function POST_candidate(req, res) {
    const SERVER_ERROR = "Server error, try again later.";
    const code = sanitize(req.body.code);
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    let user = { name, email };

    // --->>  THINGS WE NEED BEFORE THE USER CAN BE CREATED <<---   //
    // the db business document for the business offering the position the user signed up for
    //let business = undefined;
    // id of the business offering the position
    let businessId = undefined;
    // id of the position within the business
    let positionId = undefined;
    // the index of the position and actual position within the business
    //let positionIndex = undefined;
    // if the position the user applying for was found in the business db
    let positionFound = undefined;
    // the id of the code the user used to sign up
    let codeId = undefined;
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
    const NOW = new Date();
    // admin status must be changed in the db directly
    user.admin = false;
    // user has not yet verified email
    user.verified = false;
    // had to select that they agreed to the terms to sign up so must be true
    user.termsAndConditions = [
        {
            name: "Privacy Policy",
            date: NOW,
            agreed: true
        },
        {
            name: "Terms of Use",
            date: NOW,
            agreed: true
        }
    ];
    // user has just signed up
    user.dateSignedUp = NOW;
    // hasn't had opportunity to do onboarding yet, but we set it to true cuz people don't have to do onboarding yet
    user.hasFinishedOnboarding = true;
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
    Users.find({ email })
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
    bcrypt.hash(password, saltRounds, function(hashError, hash) {
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

        // delete the used sign up code
        try { await Signupcodes.deleteOne({ _id: codeId }); }
        catch (deleteCodeError) {
            console.log("error deleting sign up code: ", deleteCodeError);
            // don't stop execution since the user has already been created
        }

        // save the user's id so that if they click verify email in the same
        // browser they can be logged in right away
        req.session.unverifiedUserId = user._id;
        req.session.save(function (err) {
            if (err) { console.log("error saving unverifiedUserId to session: ", err); }
        })

        try {
            if (user.userType == "candidate" || user.userType == "employee") {
                // add the evaluation to the user
                user = (await addEvaluation(user, businessId, positionId, startDate)).user;
                // since the user is just signing up we know that the active
                // position will be the only one available
                user.positionInProgress = user.positions[0].positionId;
            }

            // save the user and the business with the new evaluation information
            //let [savedUser, savedBusiness] = await Promise.all([user.save(), business.save()]);
            // save the user with the new evaluation information
            await user.save();

            // user was successfully created
            return res.json(true);
        }
        catch (addEvalOrSaveError) {
            console.log("Couldn't add evaluation to user: ", addEvalOrSaveError);
            return res.status(500).send(SERVER_ERROR);
        }

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
        return new Promise(async function(resolve, reject) {
            // message shown to users with bad employer code
            const INVALID_CODE = "Invalid sign-up code."
            // if the user did not provide a signup code, they can't sign up
            if (!code) {
                return reject({status: 403, message: "Need an employer referral.", error: "No employer referral."});
            }
            // see if the code is a valid length
            if (code.length !== 10) {
                return reject({status: 400, message: INVALID_CODE, error: `invalid code length, was ${code.length} characters`});
            }

            // find the code in the db
            let dbCode;
            try { dbCode = await Signupcodes.findOne({ code }); }
            catch (findCodeError) {
                return reject({status: 500, message: "Error signing up. Try again later or ask employer for a new code.", error: findCodeError});
            }

            if (!dbCode) {
                return reject({status: 400, message: INVALID_CODE, error: "Signup code not found in the database"});
            }

            // check if the code has expired
            if ((new Date()).getTime() > dbCode.expirationDate.getTime()) {
                // if it has expired, delete the code
                await Signupcodes.deleteOne({ _id: dbCode._id });
                // and tell the user that their code expired
                return reject({status: 400, message: "That code has expired. Ask the employer to send a new one.", error: "code expired"});
            }

            // set the code's id so it can be deleted after user creation
            codeId = dbCode._id;

            // get the ids for business and position so the user can be immediately
            // signed up for the position
            businessId = dbCode.businessId;
            positionId = dbCode.positionId;
            // the user's type is the type of code they got
            user.userType = dbCode.userType;
            // if the user is an account admin, add business info
            if (user.userType === "accountAdmin") {
                user.businessInfo = { businessId, title: "Account Admin" };
            }
            // otherwise the user is a candidate or employee and will have a
            // start date for their position eval, same as when code was created
            else { startDate = dbCode.created; }

            // code is legit and all properties using it are set; resolve
            resolve(true);
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
                res.send(frontEndUser(updatedUser));
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
    if (process.env.NODE_ENV === "development") {
        moonshotUrl = 'http://localhost:8081/';
    }

    Users.findOne(query, function (err, user) {
        let recipient = [user.email];
        let subject = 'Verify email';
        let content =
            '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                + '<div style="font-size:28px;color:#0c0c0c;">Verify Your Moonshot Account!</div>'
                + '<p style="width:95%; display:inline-block; text-align:left;">You&#39;re almost there! The last step is to click the button below to verify your account!'
                + '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights.</p><br/>'
                + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'verifyEmail?token='
                + user.emailVerificationToken
                + '">Verify Account</a>'
                + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
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
            if (success) { return res.json(msg); }
            else { return res.status(500).send(msg); }
        })
    });
}


module.exports = candidateApis;
