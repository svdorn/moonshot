const Users = require('../models/users.js');
const Referrals = require('../models/referrals.js');
const Businesses = require('../models/businesses.js');
const Signupcodes = require('../models/signupcodes.js');
const Intercom = require('intercom-client');

const client = new Intercom.Client({ token: 'dG9rOjRhYTE3ZjgzX2IyYmRfNDQyY184YjUwX2JjMjk4OWU3MDhmYjoxOjA=' });

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const errors = require('./errors.js');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        getAndVerifyUser,
        isValidEmail,
        sendEmail,
        getFirstName,
        frontEndUser,
        emailFooter,
        getUserFromReq
} = require('./helperFunctions.js');

// get function to start position evaluation
const { addEvaluation } = require('./evaluationApis.js');


const candidateApis = {
    POST_updateAllOnboarding,
    POST_candidate,
    POST_endOnboarding,
    POST_sendVerificationEmail,
    POST_reSendVerificationEmail
}


function POST_candidate(req, res) {
    const { code, name, email, password, keepMeLoggedIn } = sanitize(req.body);

    // if invalid password is given, don't let the user create an account
    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).send({message: "Password must be at least 8 characters long."});
    }
    // if invalid email is given, don't let the user create an account
    if (!isValidEmail(email)) {
        return res.status(400).send({message: "Invalid email."});
    }

    let user = { name, email: email.toLowerCase() };

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

    // whether an error already happened so shouldn't return another
    let errored = false;

    // --->>       VERIFY THAT USER HAS UNIQUE EMAIL          <<--- //
    Users.find({ email })
    .then(foundUsers => {
        if (foundUsers.length > 0) {
            if (!errored) {
                errored = true;
                return res.status(400).send({message: "An account with that email address already exists."});
            }
        } else {
            // mark that we are good to make this user, then try to do it
            verifiedUniqueEmail = true;
            makeUser();
        }
    })
    .catch(findUserError => {
        console.log("error finding user by email: ", findUserError);
        if (!errored) {
            errored = true;
            return res.status(500).send({message: errors.SERVER_ERROR});
        }
    });
    // <<-------------------------------------------------------->> //

    // --->> VERIFY THAT THE CODE THE USER PROVIDED IS LEGIT  <<--- //
    verifyPositionCode().then(codeVerified => {
        positionFound = true;
        makeUser();
    }).catch(verifyCodeError => {
        if (typeof verifyCodeError === "object" && verifyCodeError.status && verifyCodeError.message) {
            console.log(verifyCodeError.error);
            if (!errored) {
                errored = true;
                return res.status(verifyCodeError.status).send({message: verifyCodeError.message});
            }
        } else {
            console.log("Error verifying position code: ", verifyCodeError);
            if (!errored) {
                errored = true;
                return res.status(500).send({message: errors.SERVER_ERROR});
            }
        }
    });
    // <<-------------------------------------------------------->> //

    // --->> COUNT THE USERS WITH THIS NAME TO ALLOW PROFILE URL CREATION <<--- //
    Users.countDocuments({name: user.name})
    .then(count => {
        // create the user's profile url with the count after their name
        const randomNumber = crypto.randomBytes(8).toString('hex');
        user.profileUrl = user.name.split(' ').join('-') + "-" + (count + 1) + "-" + randomNumber;
        madeProfileUrl = true;
        makeUser();
    }).catch (countError => {
        console.log("Couldn't count the number of users: ", countError);
        if (!errored) {
            errored = true;
            return res.status(500).send({message: errors.SERVER_ERROR});
        }
    })
    // <<-------------------------------------------------------->> //

    // --->>            HASH THE USER'S PASSWORD              <<--- //
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(hashError, hash) {
        if (hashError) {
            console.log("hash error: ", hashError);
            if (!errored) {
                errored = true;
                return res.status(500).send({ message: errors.SERVER_ERROR });
            }
        }

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
        if (!positionFound || !verifiedUniqueEmail || !createdLoginInfo || !madeProfileUrl || errored) { return; }

        if (process.env.NODE_ENV === "production") {
            // Add companies to user list for intercom
            let companies = [];
            if (user.userType === "accountAdmin") {
                try {
                    var intercomId = await Businesses.findById(businessId).select("intercomId");
                } catch (findBusinessError) {
                    console.log(findBusinessError);
                    return res.status(500).send({ message: errors.SERVER_ERROR });
                }
                if (intercomId && intercomId.intercomId) {
                    companies.push({id: intercomId.intercomId});
                }
            }

            // create a user on intercom and add intercom information to the user
            try {
                var intercom = await client.users.create({
                    email: email,
                     name: name,
                     companies,
                     custom_attributes: {
                         user_type: user.userType
                     }
                 });
            }
            catch (createIntercomError) {
                console.log("error creating an intercom user: ", createIntercomError);
                return res.status(500).send({message: errors.SERVER_ERROR});
            }

            // Add the intercom info to the user
            if (intercom.body) {
                user.intercom = {};
                user.intercom.email = intercom.body.email;
                user.intercom.id = intercom.body.id;
            } else {
                console.log("error creating an intercom user: ", createIntercomError);
                return res.status(500).send({message: errors.SERVER_ERROR});
            }
        }
        // make the user db object
        try {
            user = await Users.create(user);
        } catch (createUserError) {
            console.log("Error creating user: ", createUserError);
            return res.status(500).send({message: errors.SERVER_ERROR});
        }

        // delete the used sign up code
        try { await Signupcodes.deleteOne({ _id: codeId, open: false }); }
        catch (deleteCodeError) {
            console.log("error deleting sign up code: ", deleteCodeError);
            // don't stop execution since the user has already been created
        }

        // generate an hmac for the user so intercom can verify identity
        if (user.intercom && user.intercom.id) {
            const hash = crypto.createHmac('sha256', credentials.hmacKey)
                       .update(user.intercom.id)
                       .digest('hex');
            user.hmac = hash;
        }

        // keep the user saved in the session if they want to stay logged in
        if (keepMeLoggedIn) {
            req.session.userId = user._id;
            req.session.verificationToken = user.verificationToken;
            req.session.save(function (err) {
                if (err) { console.log("error saving new user to session: ", err );}
            });
        }

        try {
            if (user.userType == "candidate" || user.userType == "employee") {
                // add the evaluation to the user
                user = (await addEvaluation(user, businessId, positionId, startDate)).user;
                // since the user is just signing up we know that the active
                // position will be the only one available
                user.positionInProgress = user.positions[0].positionId;
            }

            // save the user with the new evaluation information
            await user.save();
        }
        catch (addEvalOrSaveError) {
            console.log("Couldn't add evaluation to user: ", addEvalOrSaveError);
            return res.status(500).send({message: errors.SERVER_ERROR});
        }

        try { await sendVerificationEmail(user); }
        catch (sendEmailError) {
            console.log("Error sending verification email: ", sendEmailError);
            return res.status(500).send({ userCreated: true });
        }

        // user was successfully created
        return res.status(200).send({ user: frontEndUser(user) });

        // THESE TWO WILL NOT RUN - there are guaranteed return statements beforehand
        // add the user to the referrer's list of referred users
        //creditReferrer().catch(referralError => { console.log(referralError); });
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
                user.notifications = {};
                user.notifications.lastSent = new Date(0);
                user.notifications.time = "Daily";
                user.notifications.waiting = false;
                user.notifications.firstTime = true;
            }
            // otherwise the user is a candidate or employee and will have a
            // start date for their position eval, same as when code was created
            else {
                const NOW = new Date();
                startDate = NOW;
            }

            // code is legit and all properties using it are set; resolve
            resolve(true);
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
                // if info exists, try toad save it
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
                if (saveErr) {ad
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


async function sendVerificationEmail(user) {
    return new Promise(async function(resolve, reject) {
        let moonshotUrl = 'https://moonshotinsights.io/';
        // if we are in development, links are to localhost
        if (process.env.NODE_ENV === "development") {
            moonshotUrl = 'http://localhost:8081/';
        }

        let recipients = [ user.email ];
        let subject = 'Verify Email';
        let content =
            `<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">
                <div style="font-size:28px;color:#0c0c0c;">Verify Your Moonshot Account</div>
                <p style="width:95%; display:inline-block; text-align:left;">You&#39;re almost there! The last step is to click the button below to verify your account.
                <br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights!</p><br/>
                <a  style="display:inline-block;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:6px 30px;text-decoration:none;margin:20px;background:#494b4d;"
                    href="${moonshotUrl}verifyEmail?token=${user.emailVerificationToken}"
                >
                    Verify Account
                </a>
                <p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>
                ${emailFooter(user.email)}
            </div>`;

        try {
            await sendEmail({recipients, subject, content});
            return resolve();
        }
        // send email error
        catch (sendEmailError) { return reject(sendEmailError); }
    });
}


async function POST_sendVerificationEmail(req, res) {
    const { email } = sanitize(req.body);

    try { var user =  await Users.findOne({ email }); }
    catch (getUserError) {
        console.log("Error getting user when re-sending verification email: ", getUserError);
        return res.status(500).send({message: errors.SERVER_ERROR});
    }

    try { await sendVerificationEmail(user); }
    catch (sendEmailError) {
        console.log("Error sending verification email: ", sendEmailError);
        return res.status(500).send({message: errors.SERVER_ERROR});
    }

    return res.status(200).send({success: true});
}


async function POST_reSendVerificationEmail(req, res) {
    const { userId, verificationToken } = sanitize(req.body);

    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user when sending verification email: ", getUserError);
        return res.status(500).send({message: errors.SERVER_ERROR});
    }

    // if user is already verified, don't need to re-send verification email
    if (user.verified) { return res.status(200).send({ alreadyVerified: true, user: frontEndUser(user) }); }

    try { await sendVerificationEmail(user); }
    catch (sendEmailError) {
        console.log("Error sending verification email: ", sendEmailError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.status(200).send({ emailSent: true });
}


module.exports = candidateApis;
