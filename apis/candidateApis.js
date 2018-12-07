const Users = require('../models/users.js');
const Referrals = require('../models/referrals.js');
const Businesses = require('../models/businesses.js');
const Signupcodes = require('../models/signupcodes.js');
const Intercom = require('intercom-client');
const credentials = require("../credentials");
const mongoose = require("mongoose");

const client = new Intercom.Client({ token: credentials.intercomToken });

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
        getUserFromReq,
        moonshotUrl
} = require('./helperFunctions.js');

// get function to start position evaluation
const { addEvaluation } = require('./evaluationApis.js');
const { sendVerificationEmail } = require("./userApis");


const candidateApis = {
    POST_user,
    POST_candidate
}


function POST_user(req, res) {
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

        // get the business that is offering the position
        try { var business = await Businesses.findById(businessId).select("intercomId name uniqueName fullAccess"); }
        catch (findBusinessError) {
            console.log(findBusinessError);
            return res.status(500).send({ message: errors.SERVER_ERROR });
        }

        // if the user is an account admin, add the name and unique name (for
        // application url) to the user
        if (user.userType === "accountAdmin") {
            user.businessInfo.businessName = business.name;
            user.businessInfo.uniqueName = business.uniqueName;
            user.confirmEmbedLink = true;
            var fullAccess = business.fullAccess;
        }

        if (process.env.NODE_ENV === "production") {
            // Add companies to user list for intercom
            let companies = [];
            if (user.userType === "accountAdmin") {
                if (business && business.intercomId) {
                    companies.push({ id: business.intercomId });
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
            return res.status(500).send({ message: errors.SERVER_ERROR });
        }

        try { await sendVerificationEmail(user); }
        catch (sendEmailError) {
            console.log("Error sending verification email: ", sendEmailError);
            // continue execution, user will have to resend verification email
        }

        // user was successfully created
        return res.status(200).send({ user: frontEndUser(user), fullAccess });

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
                return reject({status: 500, message: "Error signing up. Try again later or contact support.", error: findCodeError});
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
                user.popups = {
                    candidates: true,
                    employees: true,
                    evaluations: true
                };
            }
            // otherwise the user is a candidate or employee and will have a
            // start date for their position eval, same as when code was created
            else {
                const NOW = new Date();
                startDate = NOW;
            }

            // make sure the business can be signed up for - business has to
            // have at least one admin who has verified their email
            try {
                const verifiedAdminsQuery = {
                    "userType": "accountAdmin",
                    "verified": true,
                    "businessInfo.businessId": mongoose.Types.ObjectId(businessId)
                }
                const verifiedUser = await Users.findOne(verifiedAdminsQuery);
                if (verifiedUser == null) {
                    return reject({
                        status: 401,
                        message: "This company hasn't finished setting up their account yet",
                        error: new Error(`No verified admin for business with id ${businessId}`)
                    });
                }
            } catch (findVerifiedError) {
                return reject({
                    status: 500,
                    message: "Error signing up. Try again later or contact support.",
                    error: findVerifiedError
                });
            }

            // code is legit and all properties using it are set; resolve
            resolve(true);
        });
    }
}

function POST_candidate(req, res) {
    const { code, name } = sanitize(req.body);

    let user = { name };

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
    // whether we counted the users and created a profile url
    let madeProfileUrl = false;
    // the date the position evaluation was assigned
    let startDate = undefined;
    // <<-------------------------------------------------------->> //

    // --->>> THINGS WE CAN SET FOR USER WITHOUT ASYNC CALLS <<<--- //
    const NOW = new Date();
    // admin status must be changed in the db directly
    user.admin = false;
    // atomatically to set candidate verification to true
    user.verified = true;
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
    // <<-------------------------------------------------------->> //

    // whether an error already happened so shouldn't return another
    let errored = false;

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

    // --->>           CREATE AND UPDATE THE USER             <<--- //
    async function makeUser() {
        // make sure all pre-reqs to creating user are met
        if (!positionFound || !madeProfileUrl || errored) { return; }

        // get the business that is offering the position
        try { var business = await Businesses.findById(businessId).select("name uniqueName primaryColor backgroundColor headerLogo"); }
        catch (findBusinessError) {
            console.log(findBusinessError);
            return res.status(500).send({ message: errors.SERVER_ERROR });
        }
        if (!business) {
            console.log("Error finding business.");
            return res.status(500).send({message: errors.SERVER_ERROR});
        }
        // add color styles to user
        if (business.backgroundColor) {
            user.backgroundColor = business.backgroundColor;
        }
        if (business.primaryColor) {
            user.primaryColor = business.primaryColor;
        }
        if (business.headerLogo) {
            user.logo = business.headerLogo;
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

        // keep the user saved in the session if they want to stay logged in
        req.session.userId = user._id;
        req.session.verificationToken = user.verificationToken;
        req.session.save(function (err) {
            if (err) { console.log("error saving new user to session: ", err );}
        });

        try {
            // add the evaluation to the user
            user = (await addEvaluation(user, businessId, positionId, startDate)).user;
            // since the user is just signing up we know that the active
            // position will be the only one available
            user.positionInProgress = user.positions[0].positionId;

            // save the user with the new evaluation information
            await user.save();
        }
        catch (addEvalOrSaveError) {
            console.log("Couldn't add evaluation to user: ", addEvalOrSaveError);
            return res.status(500).send({ message: errors.SERVER_ERROR });
        }

        // user was successfully created
        return res.status(200).send({ user: frontEndUser(user) });

        // THESE TWO WILL NOT RUN - there are guaranteed return statements beforehand
        // add the user to the referrer's list of referred users
        //creditReferrer().catch(referralError => { console.log(referralError); });
    }
    // <<-------------------------------------------------------->> //

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
                return reject({status: 500, message: "Error signing up. Try again later or contact support.", error: findCodeError});
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
            // start date for their position eval, same as when code was created
            const NOW = new Date();
            startDate = NOW;


            // make sure the business can be signed up for - business has to
            // have at least one admin who has verified their email
            try {
                const verifiedAdminsQuery = {
                    "userType": "accountAdmin",
                    "verified": true,
                    "businessInfo.businessId": mongoose.Types.ObjectId(businessId)
                }
                const verifiedUser = await Users.findOne(verifiedAdminsQuery);
                if (verifiedUser == null) {
                    return reject({
                        status: 401,
                        message: "This company hasn't finished setting up their account yet",
                        error: new Error(`No verified admin for business with id ${businessId}`)
                    });
                }
            } catch (findVerifiedError) {
                return reject({
                    status: 500,
                    message: "Error signing up. Try again later or contact support.",
                    error: findVerifiedError
                });
            }

            console.log("user: ", user)

            // code is legit and all properties using it are set; resolve
            resolve(true);
        });
    }
}


module.exports = candidateApis;
