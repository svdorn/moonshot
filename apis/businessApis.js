const Businesses = require("../models/businesses.js");
const Users = require("../models/users.js");
const Psychtests = require("../models/psychtests.js");
const Signupcodes = require("../models/signupcodes.js");
const Mockusers = require("../models/mockusers.js");
const mongoose = require("mongoose");
const credentials = require("../credentials");
const Intercom = require("intercom-client");

const client = new Intercom.Client({ token: credentials.intercomToken });

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// get helper functions
const {
    sanitize,
    getFirstName,
    sendEmail,
    getAndVerifyUser,
    getUserAndBusiness,
    frontEndUser,
    speedTest,
    lastPossibleSecond,
    isValidFileType,
    isValidEmail,
    isValidPassword,
    validArgs,
    randomInt,
    founderEmails,
    emailFooter,
    devMode,
    devEmail,

    moonshotUrl
} = require("./helperFunctions.js");
// get error strings that can be sent back to the user
const errors = require("./errors.js");

const businessApis = {
    POST_addEvaluation,
    POST_contactUsEmail,
    POST_answerQuestion,
    POST_googleJobsLinks,
    POST_emailInvites,
    POST_inviteAdmins,
    POST_createLink,
    POST_rateInterest,
    POST_changeHiringStage,
    POST_moveCandidates,
    POST_resetApiKey,
    POST_uploadCandidateCSV,
    POST_createBusinessAndUser,
    POST_interests,
    GET_candidateSearch,
    GET_business,
    GET_employeeSearch,
    GET_employeeQuestions,
    GET_positions,
    GET_positionsForApply,
    GET_evaluationResults,
    GET_apiKey,
    GET_employeesAwaitingReview,
    GET_candidatesAwaitingReview,
    GET_candidatesTotal,
    GET_newCandidateGraphData,
    GET_evaluationsGraphData,
    GET_billingIsSetUp,
    GET_billingInfo,
    GET_adminList,
    GET_candidateCount,
    GET_colors,

    generateApiKey,
    createEmailInfo,
    sendEmailInvite
};

const { sendIntercomPlanUpdate } = require("./evaluationApis");

// ----->> START APIS <<----- //

async function GET_adminList(req, res) {
    const { userId, verificationToken, businessId, excludeSelf } = sanitize(req.query);

    try {
        var [adminList, { business, user }] = await Promise.all([
            Users.find({ "businessInfo.businessId": businessId }).select("name _id"),
            verifyAccountAdminAndReturnBusinessAndUser(userId, verificationToken, businessId)
        ]);
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // remove the user if they don't want to see themselves in the list of admins
    if (excludeSelf) {
        adminList = adminList.filter(u => u._id.toString() !== userId.toString());
    }

    // return just the names of the users
    return res.status(200).send({ adminList: adminList.map(u => u.name) });
}

// find out if billing has been set up for the company
async function GET_billingIsSetUp(req, res) {
    const { userId, verificationToken, businessId } = sanitize(req.query);

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    const billingIsSetUp = !!(
        business &&
        (typeof business.billingCustomerId === "string" || typeof business.billing === "object")
    );

    return res.status(200).send({ billingIsSetUp });
}

// find out if billing has been set up for the company
async function GET_billingInfo(req, res) {
    const { userId, verificationToken, businessId } = sanitize(req.query);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !verificationToken || !businessId) {
        return res.status(400).send("Bad request.");
    }

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.json(business.billing);
}

// find the candidate count of the company
async function GET_candidateCount(req, res) {
    const { userId, verificationToken, businessId } = sanitize(req.query);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !verificationToken || !businessId) {
        return res.status(400).send("Bad request.");
    }

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.json(business.candidateCount);
}

// create a business and the first account admin for that business
async function POST_createBusinessAndUser(req, res) {
    // get necessary arguments
    let {
        name,
        company,
        email,
        password,
        positions,
        onboard,
        welcomeToMoonshot,
        selectedJobsToBeDone,
        showVerifyEmailBanner
    } = sanitize(req.body);

    // validate arguments
    const stringArgs = [name, company, email, password];
    if (!validArgs({ stringArgs })) {
        console.log(
            "name: ",
            name,
            "company: ",
            company,
            "email: ",
            email,
            "password is a string: ",
            typeof password === "string"
        );
        return res.status(400).send("Bad Request.");
    }

    // validate email
    if (!isValidEmail(email)) {
        console.log("Invalid email format. Email: ", email);
        return res.status(400).send("Invalid email format.");
    }

    // make sure the email is a work email, not a gmail or hotmail or whatever
    if (!devMode) {
        const popularProviders = [
            "gmail.com",
            "hotmail.com",
            "yahoo.com",
            "outlook.com",
            "inbox.com",
            "icloud.com",
            "mail.com",
            "aol.com",
            "zoho.com",
            "yandex.com"
        ];
        const provider = email
            .split("@")
            .pop()
            .toLowerCase();
        if (popularProviders.includes(provider)) {
            console.log("Given email not a work email. Email: ", email);
            return res.status(400).send("Please use your work email address.");
        }
    }

    // validate password
    if (!isValidPassword(password)) {
        console.log("Password not 8 characters long. Password length: ", password.length);
        return res.status(400).send("Password needs to be at least 8 characters long.");
    }

    let dashboardPopup = true;
    businessInterestsPopup = true;
    if (welcomeToMoonshot) {
        dashboardPopup = false;
    }
    // check if positions should be added
    if (Array.isArray(selectedJobsToBeDone)) {
        businessInterestsPopup = false;
    }

    // create the user
    const userInfo = {
        name,
        email,
        password,
        onboard,
        dashboardPopup,
        businessInterestsPopup,
        showVerifyEmailBanner
    };
    try {
        var user = await createAccountAdmin(userInfo);
    } catch (createUserError) {
        console.log("Error creating user from business signup: ", createUserError);
        // tell the user they need a different email if this address is taken already
        if (createUserError === errors.EMAIL_TAKEN) {
            console.log("Email already taken: ", email);
            return res.status(400).send(errors.EMAIL_TAKEN);
        }
        // otherwise return a standard server error message
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // create business
    const newBusinessInfo = {
        name: company,
        positions,
        selectedJobsToBeDone
    };

    try {
        var business = await createBusiness(newBusinessInfo);
    } catch (createBizError) {
        console.log("Error creating business from business signup: ", createBizError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // add the business to the user
    user.businessInfo = {
        businessId: business._id,
        businessName: business.name,
        uniqueName: business.uniqueName,
        title: "Account Admin"
    };
    // user is the first at their company (so they have to do onboarding)
    user.firstBusinessUser = true;

    // add the company to the user on intercom
    try {
        var companies = [];
        companies.push({ id: business.intercomId });
        var intercom = await client.users.update({
            id: user.intercom.id,
            companies,
            custom_attributes: {
                first_business_user: true
            }
        });
    } catch (updateIntercomError) {
        console.log("error updating an intercom user: ", updateIntercomError);
        return res.status(500).send("Server error.");
    }

    // generate an hmac for the user so intercom can verify identity
    if (user.intercom && user.intercom.id) {
        const hash = crypto
            .createHmac("sha256", credentials.hmacKey)
            .update(user.intercom.id)
            .digest("hex");
        user.hmac = hash;
    }

    // save the user
    try {
        user = await user.save();
    } catch (saveUserError) {
        console.log("Error saving new account admin: ", saveUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // save the user's session - assume they want to stay logged in
    try {
        saveSession(req.session, user);
    } catch (e) {
        console.log("Error saving new account admin's session: ", e);
    }

    console.log("req.session: ", req.session);

    // return successfully to user
    res.status(200).send({ user: frontEndUser(user), fullAccess: true });

    // send email to everyone if there's a new sign up
    // do this after sending success message to user just in case this fails
    let recipients = [
        "kyle@moonshotinsights.io",
        "justin@moonshotinsights.io",
        "stevedorn9@gmail.com",
        "ameyer24@wisc.edu"
    ];
    if (process.env.NODE_ENV === "development") {
        if (process.env.DEV_EMAIL) {
            recipients = [process.env.DEV_EMAIL];
        } else {
            recipients = ["stevedorn9@gmail.com"];
        }
    }
    const positionName = business.positions ? business.positions[0].name : undefined;
    const positionType = business.positoins ? business.positons[0].positionType : undefined;
    let subject = "New Account Admin Sign Up";
    let content =
        "<div>" +
        "<p>New account admin signed up and created a business.</p>" +
        `<p>Name: ${user.name}</p>` +
        `<p>Email: ${user.email}</p>` +
        `<p>Business name: ${business.name}</p>` +
        `<p>Position name: ${positionName}</p>` +
        `<p>Position type: ${positionType}</p>` +
        "</div>";
    try {
        await sendEmail({ recipients, subject, content });
    } catch (alertEmailError) {
        console.log("Error sending alert email about new user: ", alertEmailError);
    }
}

// save the user's id and verification token in the session to keep them logged in
async function saveSession(session, user, token) {
    return new Promise(function(resolve, reject) {
        if (!session) {
            return reject(new Error("No session object provided to saveSession."));
        }

        // get userId and verificationToken
        if (typeof user === "object") {
            var { _id: userId, verificationToken } = user;
        } else {
            var userId = user;
            var verificationToken = token;
        }

        if (!userId || !verificationToken) {
            return reject(
                new Error(`Invalid userId: ${userId} or verificationToken: ${verificationToken}`)
            );
        }

        // save the session so that the user stays logged in
        session.userId = userId;
        session.verificationToken = verificationToken;
        session.save(function(err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

// creates a new ACCOUNT ADMIN user
async function createAccountAdmin(info) {
    return new Promise(function(resolve, reject) {
        // get needed args
        const {
            name,
            password,
            email,
            onboard,
            dashboardPopup,
            businessInterestsPopup,
            showVerifyEmailBanner
        } = info;

        let user = {
            name,
            email: email.toLowerCase()
        };

        // --->>  THINGS WE NEED BEFORE THE USER CAN BE CREATED <<---   //
        // if the user has an email address no one else has used before
        let verifiedUniqueEmail = false;
        // if password was set up
        let createdLoginInfo = false;
        // whether we counted the users and created a profile url
        let madeProfileUrl = false;
        // <<-------------------------------------------------------->> //

        // --->>> THINGS WE CAN SET FOR USER WITHOUT ASYNC CALLS <<<--- //
        const NOW = new Date();
        // moonshot admin status must be changed in the db directly
        user.admin = false;
        // user is an account admin
        user.userType = "accountAdmin";
        // user has not yet verified email
        user.verified = false;
        // user needs to see popups
        user.popups = {
            candidates: true,
            candidateModal: true,
            employees: true,
            evaluations: true,
            dashboard: dashboardPopup,
            businessInterests: businessInterestsPopup
        };
        user.confirmEmbedLink = false;
        // had to select that they agreed to the terms to sign up so must be true
        user.termsAndConditions = [
            {
                name: "Privacy Policy",
                date: NOW,
                agreed: true
            },
            {
                name: "Terms and Conditions",
                date: NOW,
                agreed: true
            },
            {
                name: "Terms of Service",
                date: NOW,
                agreed: true
            }
        ];
        // user has just signed up
        user.dateSignedUp = NOW;
        // user notification preferences set to default
        user.notifications = {};
        user.notifications.lastSent = new Date(0);
        user.notifications.time = "Daily";
        user.notifications.waiting = false;
        user.notifications.firstTime = true;
        // user will have to do business onboarding
        user.hasFinishedOnboarding = false;
        if (onboard) {
            user.onboard = onboard;
        } else {
            user.onboard = {
                step: 1,
                highestStep: 1,
                actions: []
            };
        }
        if (showVerifyEmailBanner) {
            user.showVerifyEmailBanner = true;
        }
        // user.onboarding = {
        //     step: 0,
        //     complete: false,
        //     furthestStep: 0
        // }
        // infinite use, used to verify identify when making calls to backend
        user.verificationToken = crypto.randomBytes(64).toString("hex");
        // one-time use, used to verify email address before initial login
        user.emailVerificationToken = crypto.randomBytes(64).toString("hex");
        // <<-------------------------------------------------------->> //

        // --->>       VERIFY THAT USER HAS UNIQUE EMAIL          <<--- //
        Users.find({ email })
            .then(foundUsers => {
                if (foundUsers.length > 0) {
                    return reject(errors.EMAIL_TAKEN);
                } else {
                    // mark that we are good to make this user, then try to do it
                    verifiedUniqueEmail = true;
                    makeUser();
                }
            })
            .catch(findUserError => {
                return reject(findUserError);
            });
        // <<-------------------------------------------------------->> //

        // --->> COUNT THE USERS WITH THIS NAME TO ALLOW PROFILE URL CREATION <<--- //
        Users.countDocuments({ name: user.name })
            .then(count => {
                // create the user's profile url with the count after their name
                const randomNumber = crypto.randomBytes(8).toString("hex");
                user.profileUrl =
                    user.name.split(" ").join("-") + "-" + (count + 1) + "-" + randomNumber;
                madeProfileUrl = true;
                makeUser();
            })
            .catch(countError => {
                console.log("Couldn't count the number of users: ", countError);
                return reject(errors.SERVER_ERROR);
            });
        // <<-------------------------------------------------------->> //

        // --->>            HASH THE USER'S PASSWORD              <<--- //
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function(hashError, hash) {
            if (hashError) {
                console.log("hash error: ", hashError);
                return reject(errors.SERVER_ERROR);
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
            if (!verifiedUniqueEmail || !createdLoginInfo || !madeProfileUrl) {
                return;
            }

            // create a user on intercom and add intercom information to the user
            try {
                var intercom = await client.users.create({
                    email: email,
                    name: name,
                    custom_attributes: {
                        user_type: user.userType
                    }
                });
            } catch (createIntercomError) {
                console.log("error creating an intercom user: ", createIntercomError);
                return res.status(500).send("Server error.");
            }

            // Add the intercom info to the user
            if (intercom.body) {
                user.intercom = {};
                user.intercom.email = intercom.body.email;
                user.intercom.id = intercom.body.id;
            } else {
                console.log("error creating an intercom user: ", createIntercomError);
                return res.status(500).send("Server error.");
            }

            // make the user db object
            try {
                user = await Users.create(user);
            } catch (createUserError) {
                console.log("Error creating user: ", createUserError);
                return reject(error.SERVER_ERROR);
            }

            resolve(user);
        }
        // <<-------------------------------------------------------->> //
    });
}

// create a new business
async function createBusiness(info) {
    return new Promise(async function(resolve, reject) {
        // get needed args
        const { name, positions, selectedJobsToBeDone } = info;
        // make sure the minimum necessary args are there
        if (!name) {
            return reject("No business name provided.");
        }
        // create NOW variable for easy reference
        const NOW = new Date();

        // create an id for the business
        try {
            var _id = await createBusinessId();
        } catch (createIdError) {
            return reject(createIdError);
        }

        // get a unique name to identify business on their application page
        try {
            var uniqueName = await createUniqueName(name);
        } catch (getUniqueNameError) {
            return reject(getUniqueNameError);
        }

        // initialize mostly empty business
        let business = {
            _id,
            name,
            uniqueName,
            uniqueNameLowerCase: uniqueName.toLowerCase(),
            positions: [],
            logo: "hr.png",
            dateCreated: NOW,
            candidateCount: 0,
            fullAccess: true
        };

        // check if positions should be added
        if (Array.isArray(positions)) {
            // go through each position that should be created
            for (let i = 0; i < positions.length; i++) {
                bizPos = await createPosition(
                    positions[i].name,
                    positions[i].positionType,
                    _id,
                    positions[i].isManager
                );
                // add the position
                business.positions.push(bizPos);
            }
        }

        // check if interests should be added
        if (Array.isArray(selectedJobsToBeDone)) {
            business.interests = selectedJobsToBeDone;
        }

        // create an API_Key for the business
        try {
            business.API_Key = await generateApiKey();
        } catch (getKeyError) {
            return reject(getKeyError);
        }

        // add admin questions
        business.employeeQuestions = [
            {
                questionBody: "How long have they been at the company? (in years)",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 7
                }
            },
            {
                questionBody:
                    "How much longer do you expect them to remain at the company? (in years)",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 7
                }
            },
            {
                questionBody: "How often are they late for work per week? (in days)",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 5
                }
            },
            {
                questionBody: "How would you rate their job performance?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody: "How efficient are they at getting tasks done?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody:
                    "How often do they take employee leave days for illness or holiday, per year?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody: "How would you rate their quality of work?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody: "How much have they improved or grown since your first day together?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody:
                    "How much more responsibility have they been given since your first day together?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody:
                    "How likely are you to recommend them for a promotion in the next year?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            },
            {
                questionBody: "How would you rate their potential for improvement and growth?",
                questionType: "range",
                range: {
                    lowRange: 0,
                    highRange: 10
                }
            }
        ];

        // Create a business intercomId
        business.intercomId = crypto.randomBytes(16).toString("hex");

        // create a user on intercom and add intercom information to the user
        try {
            var intercom = await client.companies.create({
                name: name,
                company_id: business.intercomId,
                custom_attributes: {
                    first_position: business.positions[0] ? business.positions[0].name : null,
                    unique_name: uniqueName,
                    candidates: 0
                }
            });
        } catch (createIntercomError) {
            console.log("error creating an intercom company: ", createIntercomError);
            return res.status(500).send("Server error.");
        }

        // create the business in the db
        try {
            business = await Businesses.create(business);
        } catch (createBizError) {
            return reject(createBizError);
        }

        // return the new business
        return resolve(business);
    });
}

// create a uniqued id for a business
async function createBusinessId() {
    return new Promise(async function(resolve, reject) {
        try {
            // initialize id string, then check if the id already exists
            let _id;
            // will contain any code that has the same random characters
            let foundId;
            // if this gets up to 8 something is super weird
            let counter = 0;
            // loop until _id is unique
            do {
                if (counter >= 8) {
                    throw "Too many ids found that had already been used.";
                }
                counter++;
                // make _id a new mongoose id
                _id = mongoose.Types.ObjectId();
                // try to find another business with the same id
                foundId = await Businesses.findOne({ _id });
            } while (foundId);
            // return the unique _id
            return resolve(_id);
        } catch (findIdError) {
            console.log("Error looking for business with same _id.");
            return reject(findIdError);
        }
    });
}

// creates a unique identifier for a business to use on their application page
async function createUniqueName(name) {
    return new Promise(async function(resolve, reject) {
        // check if the name is a string
        if (typeof name !== "string") {
            reject(new Error("Business name not a string"));
        }
        try {
            // count the number of businesses who have this name
            const count = await Businesses.countDocuments({ name });
            // how many times the loop has run
            let loops = 0;
            // will contain the unique name for the company
            let uniqueName;
            // loop until a unique name that is actually unique has been created
            while (!uniqueName) {
                // make a random number and make sure it doesn't include 420, 69, or 666
                let randomNumber;
                do {
                    randomNumber = randomInt(0, 9999).toString();
                } while (["420", "69", "666"].some(badNumber => randomNumber.includes(badNumber)));
                // make sure there are 4 digits in the number
                while (randomNumber.length < 4) {
                    randomNumber = "0" + randomNumber;
                }

                // create the unique name, replacing spaces with dashes
                uniqueName = `${name.replace(/ /g, "-")}-${count + 1}-${randomNumber}`;

                // find out if there are any businesses that already have this unique name
                const business = await Businesses.findOne({
                    uniqueNameLowerCase: uniqueName.toLowerCase()
                });
                // if so, make the unique name undefined so the loop starts over
                if (business) {
                    uniqueName = undefined;
                }

                // loop ran
                loops++;
                // if the loop ran too many times, someone is probably messing with the system
                if (loops > 10) {
                    throw new Error("Tried too many times to create a unique name.");
                }
            }

            // combine the count with the random number to get the unique name
            return resolve(uniqueName);
        } catch (e) {
            // move any error up the chain
            return reject(e);
        }
    });
}

async function createPosition(name, type, businessId, isManager) {
    return new Promise(async function(resolve, reject) {
        // defaults for all position values
        const bizPos = {
            businessId,
            name: name,
            positionType: type,
            isManager,
            length: type === "Developer" ? 40 : 22,
            dateCreated: Date.now(),
            timeAllotted: 60
        };

        let factorWeights;
        // if the position is a manager, use different factor weights
        if (isManager) {
            factorWeights = {
                emotionality: 1.025,
                extraversion: 1.7,
                agreeableness: 1,
                conscientiousness: 2,
                opennessToExperience: 0,
                honestyHumility: 1.756,
                altruism: 0
            };
            bizPos.weights = {
                performance: 0.2,
                growth: 0,
                longevity: 0,
                culture: 0,
                gca: 0.58
            };
        }
        // otherwise use Function-specific weights
        else {
            const generalFactorWeights = {
                emotionality: 1,
                extraversion: 0,
                agreeableness: 0,
                conscientiousness: 1.4375,
                opennessToExperience: 0,
                honestyHumility: 1.125,
                altruism: 0
            };

            switch (type) {
                case "General":
                case "Marketing":
                case "Product":
                    factorWeights = generalFactorWeights;
                    bizPos.weights = {
                        performance: 0.23,
                        growth: 0,
                        longevity: 0,
                        culture: 0,
                        gca: 0.51
                    };
                    break;
                case "Developer":
                    factorWeights = generalFactorWeights;
                    bizPos.weights = {
                        performance: 0.23,
                        growth: 0,
                        longevity: 0,
                        culture: 0,
                        gca: 0.73
                    };
                    break;
                case "Sales":
                    factorWeights = {
                        emotionality: 1,
                        extraversion: 1.5,
                        agreeableness: 0,
                        conscientiousness: 2.4,
                        opennessToExperience: 0,
                        honestyHumility: 1.714,
                        altruism: 0
                    };
                    bizPos.weights = {
                        performance: 0.252,
                        growth: 0,
                        longevity: 0,
                        culture: 0,
                        gca: 0.51
                    };
                    break;
                case "Support":
                    factorWeights = {
                        emotionality: 1.18,
                        extraversion: 1,
                        agreeableness: 1.723,
                        conscientiousness: 2.455,
                        opennessToExperience: 1.545,
                        honestyHumility: 1.636,
                        altruism: 0
                    };
                    bizPos.weights = {
                        performance: 0.27,
                        growth: 0,
                        longevity: 0,
                        culture: 0,
                        gca: 0.51
                    };
                    break;
                default:
                    factorWeights = generalFactorWeights;
                    break;
            }
        }

        const factors = {
            idealFactors: [
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2ff"),
                    weight: factorWeights.honestyHumility,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce30f"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce30a"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce305"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce300"),
                            score: 5,
                            weight: 1
                        }
                    ]
                },
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2ea"),
                    weight: factorWeights.emotionality,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2fa"),
                            score: -5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2f5"),
                            score: -5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2f0"),
                            score: -5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2eb"),
                            score: -5,
                            weight: 1
                        }
                    ]
                },
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2d0"),
                    weight: factorWeights.extraversion,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2e5"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2e0"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2db"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2d6"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2d1"),
                            score: 5,
                            weight: 1
                        }
                    ]
                },
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2bb"),
                    weight: factorWeights.agreeableness,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2cb"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2c6"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2c1"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2bc"),
                            score: 5,
                            weight: 1
                        }
                    ]
                },
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2a6"),
                    weight: factorWeights.conscientiousness,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2b6"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2b1"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2ac"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2a7"),
                            score: 5,
                            weight: 1
                        }
                    ]
                },
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce28b"),
                    weight: factorWeights.opennessToExperience,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2a1"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce29c"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce296"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce291"),
                            score: 5,
                            weight: 1
                        },
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce28c"),
                            score: 5,
                            weight: 1
                        }
                    ]
                },
                {
                    factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce275"),
                    weight: factorWeights.altruism,
                    idealFacets: [
                        {
                            facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce285"),
                            score: 5,
                            weight: 1
                        }
                    ]
                }
            ]
        };

        // set correct ideal and growth factors
        bizPos.growthFactors = factors.idealFactors;
        bizPos.idealFactors = factors.idealFactors;

        // include Data Structures and Algorithms skill tests if Dev position
        if (type === "Developer") {
            bizPos.skills = ["5b4d7497fb6fc07d5ad278df", "5b4d7468fb6fc07d5ad278cc"];
            bizPos.skillNames = ["Data Structures", "Algorithms"];
        }

        // initialize position id string
        let _id = mongoose.Types.ObjectId();

        bizPos._id = _id;

        let code;
        try {
            code = await createLink(businessId, _id, "candidate");
        } catch (createLinkError) {
            console.log("error creating link: ", createLinkError);
            return res.status(500).send(errors.SERVER_ERROR);
        }

        bizPos.code = code.code;

        return resolve(bizPos);
    });
}

// create a signup code for a user
function createCode(businessId, positionId, userType, email, open) {
    return new Promise(async function(resolve, reject) {
        // initialize random characters string
        let randomChars;
        // see if this code already exists
        try {
            // will contain any code that has the same random characters
            let foundCode;
            // if this gets up to 8 something is super weird
            let counter = 0;
            do {
                if (counter >= 8) {
                    throw "Too many codes found that had already been used.";
                }
                counter++;
                // assign randomChars 10 random hex characters
                randomChars = crypto.randomBytes(5).toString("hex");
                // try to find another code with the same random characters
                foundCode = await Signupcodes.findOne({ code: randomChars });
            } while (foundCode);
        } catch (findCodeError) {
            console.log("Error looking for code with same characters.");
            return reject(findCodeError);
        }
        // we are now guaranteed to have a unique code
        const NOW = new Date();
        // create the code
        let code = {
            code: randomChars,
            created: NOW,
            email,
            businessId,
            positionId,
            userType,
            open
        };
        // make the code in the db
        try {
            code = await Signupcodes.create(code);
        } catch (createCodeError) {
            return reject(createCodeError);
        }
        // return the code
        return resolve(code);
    });
}

function createLink(businessId, positionId, userType) {
    return new Promise(async function(resolve, reject) {
        try {
            const codeObj = await createCode(businessId, positionId, userType, null, true);
            resolve({ code: codeObj.code, userType });
        } catch (error) {
            // catch whatever random error comes up
            reject(error);
        }
    });
}

// returns an object with the email, userType, and new code for a user
function createEmailInfo(businessId, positionId, userType, email) {
    return new Promise(async function(resolve, reject) {
        try {
            const codeObj = await createCode(businessId, positionId, userType, email, false);
            resolve({ code: codeObj.code, email, userType });
        } catch (error) {
            // catch whatever random error comes up
            reject(error);
        }
    });
}

// sends email to the user with email info provided
async function sendEmailInvite(emailInfo, positionName, businessName, userName) {
    return new Promise(async function(resolve, reject) {
        const code = emailInfo.code;
        const email = emailInfo.email;
        const userType = emailInfo.userType;

        // recipient of the email
        const recipient = [email];
        // the content of the email
        let content = "";
        // subject of the email
        let subject = "";

        // the button linking to the signup page with the signup code in the url
        const createAccountButton =
            '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:3px 5px 1px;text-decoration:none;margin:20px;background:#494b4d;" href="' +
            moonshotUrl +
            "signup?code=" +
            code +
            '">Create Account</a>';

        // at the end of every user's email
        const emailFooter =
            '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>' +
            '<div style="background:#7d7d7d;height:2px;width:40%;margin:25px auto 25px;"></div>' +
            '<a href="' +
            moonshotUrl +
            '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;"src="https://image.ibb.co/kXQHso/Moonshot_Insights.png"/></a><br/>' +
            '<div style="text-align:left;width:95%;display:inline-block;">' +
            '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">' +
            '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>' +
            '<a style="color:#C8C8C8; margin-top:20px;" href="' +
            moonshotUrl +
            "unsubscribe?email=" +
            email +
            '">Opt-out of future messages.</a></i>' +
            "</div>" +
            "</div>";

        switch (userType) {
            case "candidate":
                subject = businessName + " invited you to the next round";
                content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">' +
                    '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>' +
                    '<p style="width:95%; display:inline-block; text-align:left;">&#09;Congratulations, ' +
                    businessName +
                    " advanced you to the next step for the " +
                    positionName +
                    " position. The next step is completing " +
                    businessName +
                    "&#39;s evaluation on Moonshot." +
                    " Please click the button below to create your account. Once you&#39;ve created your account, you can begin your evaluation." +
                    "</p>" +
                    '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot and congrats on advancing to the next step for the ' +
                    positionName +
                    " position!</p><br/>" +
                    createAccountButton +
                    emailFooter +
                    "</div>";
                break;
            case "employee":
                subject = businessName + " invited you to take the " + positionName + " evaluation";
                content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">' +
                    '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>' +
                    '<p style="width:95%; display:inline-block; text-align:left;">' +
                    userName +
                    " invited you to complete an evaluation for " +
                    businessName +
                    "&#39;s " +
                    positionName +
                    " position." +
                    " Your participation will help create a baseline for " +
                    businessName +
                    "&#39;s predictive candidate evaluations for incoming applicants." +
                    " Please click the button below to create an account. Once you&#39;ve created your account you can begin your evaluation.</p>" +
                    '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>' +
                    createAccountButton +
                    emailFooter +
                    "</div>";
                break;
            case "accountAdmin":
                subject = businessName + " invited you to be an admin on Moonshot";
                content =
                    '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">' +
                    '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>' +
                    '<p style="width:95%; display:inline-block; text-align:left;">' +
                    userName +
                    " invited you to be an admin for " +
                    businessName +
                    "&#39;s predictive candidate evaluations." +
                    " Please click the button below to create your account." +
                    " Once you&#39;ve created your account you can begin adding other admins, employees, and candidates, as well as grading employees and reviewing evaluation results.</p>" +
                    '<br/><p style="width:95%; display:inline-block; text-align:left;">Welcome to Moonshot Insights and candidate predictions!</p><br/>' +
                    createAccountButton +
                    emailFooter +
                    "</div>";
                break;
            default:
                return reject("Invalid user type");
        }

        // send the email
        sendEmail({ recipient, subject, content })
            .then(response => resolve())
            .catch(error => reject(error));
    });
}

// send email invites to account admins
async function POST_inviteAdmins(req, res) {
    const { userId, verificationToken, businessId, adminEmails } = sanitize(req.body);

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    if (!user.verified) {
        return res.status(403).send({ message: "Email not yet verified!" });
    }

    // will contain all the promises for sending emails
    let emailPromises = [];

    // add a promise to create a code and send an email for each given address
    adminEmails.forEach(email => {
        emailPromises.push(
            makeCodeAndSendAdminInvite(business._id, business.name, email, user.name)
        );
    });

    // wait for all the emails to send
    try {
        await Promise.all(emailPromises);
    } catch (sendEmailsError) {
        console.log("Error sending admin invites: ", sendEmailsError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // return successfully
    return res.status(200).send({});
}

// returns an object with the email, userType, and new code for a user
async function makeCodeAndSendAdminInvite(businessId, businessName, email, userName) {
    return new Promise(async function(resolve, reject) {
        try {
            const emailInfoObject = await createEmailInfo(
                businessId,
                undefined,
                "accountAdmin",
                email
            );
            await sendEmailInvite(emailInfoObject, "", businessName, userName);
            return resolve();
        } catch (error) {
            // catch whatever random error comes up
            reject(error);
        }
    });
}

// send email invites to multiple email addresses with varying user types
async function POST_emailInvites(req, res) {
    const {
        candidateEmails,
        employeeEmails,
        userId,
        userName,
        verificationToken,
        businessId,
        positionId,
        positionName
    } = sanitize(req.body);

    // if one of the arguments doesn't exist, return with error code
    if (
        !Array.isArray(candidateEmails) ||
        !Array.isArray(employeeEmails) ||
        !userId ||
        !userName ||
        !businessId ||
        !verificationToken ||
        !positionId ||
        !positionName
    ) {
        console.log(
            candidateEmails,
            employeeEmails,
            userId,
            userName,
            verificationToken,
            businessId,
            positionId,
            positionName
        );
        return res.status(400).send("Bad request.");
    }

    // get the business and ensure the user has access to send invite emails
    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyUserError) {
        console.log(
            "error verifying user or getting business when sending invite emails: ",
            verifyUserError
        );
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // check if the user has verified their email
    if (!user.verified) {
        return res.status(500).send("Email not yet verified. Do that first!");
    }

    // check if the business has a paid plan (or free trial)
    if (!business.fullAccess) {
        return res.status(401).send("Select a payment plan before sending invites!");
    }

    // find the position within the business
    const positionIndex = business.positions.findIndex(currPosition => {
        return currPosition._id.toString() === positionId.toString();
    });
    if (typeof positionIndex !== "number" || positionIndex < 0) {
        return res.status(403).send("Not a valid position.");
    }
    const position = business.positions[positionIndex];
    if (!position) {
        return res.status(403).send("Not a valid position.");
    }
    const businessName = business.name;

    // a list of promises that will resolve to objects containing new codes
    // as well as all user-specific info needed to send the invite email
    let emailPromises = [];
    candidateEmails.forEach(email => {
        emailPromises.push(createEmailInfo(businessId, positionId, "candidate", email));
    });
    employeeEmails.forEach(email => {
        emailPromises.push(createEmailInfo(businessId, positionId, "employee", email));
    });

    // wait for all the email object promises to resolve
    let emailInfoObjects;
    try {
        emailInfoObjects = await Promise.all(emailPromises);
    } catch (emailInfoObjectsError) {
        console.log("error creating email info objects: ", emailInfoObjectsError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // send all the emails
    let sendEmailPromises = [];
    emailInfoObjects.forEach(emailInfoObject => {
        sendEmailPromises.push(
            sendEmailInvite(emailInfoObject, positionName, businessName, userName)
        );
    });

    // wait for all the emails to be sent
    try {
        await Promise.all(sendEmailPromises);
    } catch (sendEmailsError) {
        console.log("error sending invite emails: ", sendEmailsError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    res.status(200).send({ success: true });
}

// create link that people can sign up as
async function POST_createLink(req, res) {
    const body = req.body;
    const userId = sanitize(body.currentUserInfo.userId);
    const userName = sanitize(body.currentUserInfo.userName);
    const verificationToken = sanitize(body.currentUserInfo.verificationToken);
    const businessId = sanitize(body.currentUserInfo.businessId);
    const positionId = sanitize(body.currentUserInfo.positionId);
    const positionName = sanitize(body.currentUserInfo.positionName);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !userName || !businessId || !verificationToken || !positionId || !positionName) {
        return res.status(400).send("Bad request.");
    }

    // get the business and ensure the user has access to send invite emails
    let business;
    try {
        business = await verifyAccountAdminAndReturnBusiness(userId, verificationToken, businessId);
    } catch (verifyUserError) {
        console.log(
            "error verifying user or getting business when sending invite emails: ",
            verifyUserError
        );
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // find the position within the business
    const positionIndex = business.positions.findIndex(currPosition => {
        return currPosition._id.toString() === positionId.toString();
    });
    if (typeof positionIndex !== "number" || positionIndex < 0) {
        return res.status(403).send("Not a valid position.");
    }
    const position = business.positions[positionIndex];
    if (!position) {
        return res.status(403).send("Not a valid position.");
    }
    const businessName = business.name;

    // a list of promises that will resolve to objects containing new codes
    // as well as all user-specific info needed to send the invite email
    let promise = [];
    promise.push(createLink(businessId, positionId, "candidate"));

    // wait for all the email object promises to resolve
    let obj;
    try {
        obj = await Promise.all(promise);
    } catch (error) {
        console.log("error creating links: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    console.log("return: ", obj);
    // successfully created the link
    return res.json(obj);
}

// rates how interested the business is in the candidate (number of stars 1-5)
async function POST_rateInterest(req, res) {
    const bizUserId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateId = sanitize(req.body.candidateId);
    const interest = sanitize(req.body.interest);
    const positionId = sanitize(req.body.positionId);

    // make sure the interest value is valid
    if (typeof interest !== "number" || interest < 1 || interest > 5) {
        return res.status(400).send("Invalid interest level.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, candidate, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(
            bizUserId,
            verificationToken,
            positionId,
            candidateId
        );
        bizUser = results.bizUser;
        candidate = results.user;
        candidatePositionIndex = results.userPositionIndex;
    } catch (error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // get the business so we can check if they have full access
    try {
        var business = await Businesses.findById(bizUser.businessInfo.businessId);
    } catch (findBizError) {
        return res.status(500).send(errors.SERVER_ERROR);
    }
    // if they don't have full access, don't return any report data
    if (!business.fullAccess) {
        return res.status(401).send("Choose a payment plan to change interest level.");
    }

    // update the business' interest in the candidate, making sure it is an integer
    candidate.positions[candidatePositionIndex].interest = Math.round(interest);
    // mark the candidate as reviewed, in case they weren't already
    candidate.positions[candidatePositionIndex].reviewed = true;

    // save the user with the new info
    try {
        await candidate.save();
    } catch (saveCandidateError) {
        console.log("Error saving candidate with new interest level: ", saveCandidateError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // return successfully
    return res.json(true);
}

// changes hiring stage of a candidate
async function POST_changeHiringStage(req, res) {
    const bizUserId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateId = sanitize(req.body.candidateId);
    const hiringStage = sanitize(req.body.hiringStage);
    const positionId = sanitize(req.body.positionId);

    // make sure the interest value is valid
    if (
        !["Dismissed", "Not Contacted", "Contacted", "Interviewing", "Offered", "Hired"].includes(
            hiringStage
        )
    ) {
        return res.status(400).send("Invalid hiring stage.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, candidate, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(
            bizUserId,
            verificationToken,
            positionId,
            candidateId
        );
        bizUser = results.bizUser;
        candidate = results.user;
        candidatePositionIndex = results.userPositionIndex;
    } catch (error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // get the business so we can check if they have full access
    try {
        var business = await Businesses.findById(bizUser.businessInfo.businessId);
    } catch (findBizError) {
        return res.status(500).send(errors.SERVER_ERROR);
    }
    // if they don't have full access, don't return any report data
    if (!business.fullAccess) {
        return res.status(401).send("Upgrade to a paid plan to change hiring stages.");
    }

    // if dismissing a candidate
    let hiringStageChanges = candidate.positions[candidatePositionIndex].hiringStageChanges;
    // the hiring stage before it was changed
    let mostRecentHiringStage;
    // if there isn't a history of hiring stage changes, make one
    if (!Array.isArray(hiringStageChanges) || hiringStageChanges.length === 0) {
        hiringStageChanges = [];
        mostRecentHiringStage = "Not Contacted";
    }
    // otherwise we can know what the most recent stage was
    else {
        mostRecentHiringStage = hiringStageChanges[hiringStageChanges.length - 1].hiringStage;
    }
    // process is a bit different for dismissing candidates
    if (hiringStage === "Dismissed") {
        candidate.positions[candidatePositionIndex].isDismissed = true;
        hiringStageChanges.push({
            isDismissed: true,
            hiringStage: hiringStageChanges[hiringStageChanges.length - 1].hiringStage,
            dateChanged: new Date()
        });
    }
    // not dismissing the candidate
    else {
        candidate.positions[candidatePositionIndex].hiringStage = hiringStage;
        candidate.positions[candidatePositionIndex].isDismissed = false;
        hiringStageChanges.push({
            isDismissed: false,
            hiringStage,
            dateChanged: new Date()
        });
    }
    // update the business' interest in the candidate, making sure it is an integer
    candidate.positions[candidatePositionIndex].hiringStageChanges = hiringStageChanges;
    // mark the candidate as reviewed, in case they weren't already
    candidate.positions[candidatePositionIndex].reviewed = true;

    // save the user with the new info
    try {
        console.log(await candidate.save());
    } catch (saveCandidateError) {
        console.log("Error saving candidate with new interest level: ", saveCandidateError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if they set somebody to hired, lock them out of the account if they're done
    if (hiringStage === "Hired") {
        try {
            var business = await Businesses.findById(bizUser.businessInfo.businessId);
        } catch (getBusinessError) {
            console.log(
                "Error getting business when trying to update hiring stuff: ",
                getBusinessError
            );
        }

        // check if need to lock them out of their account if free trial ends because they hired their first person
        if (
            business &&
            business.fullAccess &&
            (!business.billing ||
                (business.billing &&
                    !business.billing.subscription &&
                    !business.billing.customPlan)) &&
            (business.candidateCount && business.candidateCount < 20)
        ) {
            business.fullAccess = false;

            // get all account admins for this business
            try {
                var admins = await Users.find({
                    userType: "accountAdmin",
                    "businessInfo.businessId": mongoose.Types.ObjectId(business._id)
                }).select("intercom");
            } catch (getUsersError) {
                console.log(
                    "error getting admins when trying to send them free trial ending message"
                );
            }
            // will contain all the promises for sending emails
            let intercomPromises = [];

            // add a promise to create a code and send an email for each given address
            admins.forEach(admin => {
                intercomPromises.push(sendIntercomPlanUpdate(admin.intercom, "ended"));
            });

            // wait for all the emails to send
            try {
                await Promise.all(intercomPromises);
            } catch (sendEmailsError) {
                console.log(
                    "error getting admins when trying to send them free trial ending message"
                );
            }
        }

        try {
            await business.save();
        } catch (updateBusinessError) {
            console.log("error updating a business to have full access: ", updateBusinessError);
        }
    }

    // return successfully
    return res.json(true);
}

async function POST_moveCandidates(req, res) {
    const bizUserId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateIds = sanitize(req.body.candidateIds);
    const moveTo = sanitize(req.body.moveTo);
    const positionId = sanitize(req.body.positionId);

    // make sure input is valid
    if (!["Reviewed", "Not Reviewed", "Favorites", "Non-Favorites", "Dismissed"].includes(moveTo)) {
        console.log("moveTo invalid, was: ", moveTo);
        return res.status(400).send("Bad request.");
    }

    // verify the business user
    let bizUser;
    try {
        bizUser = await getAndVerifyUser(bizUserId, verificationToken);
    } catch (getBizUserError) {
        console.log("Error getting/verifying biz user: ", getBizUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // get the business id that the biz user works for
    let businessId;
    try {
        businessId = bizUser.businessInfo.businessId;
    } catch (noBizIdError) {
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }
    if (!businessId) {
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    // get the business so we can check if they have full access
    try {
        var business = await Businesses.findById(businessId);
    } catch (findBizError) {
        return res.status(500).send(errors.SERVER_ERROR);
    }
    // if they don't have full access, don't return any report data
    if (!business.fullAccess) {
        return res.status(401).send("Upgrade to a paid plan to change hiring stages.");
    }

    // find all candidates that should be altered
    const findQuery = {
        _id: {
            $in: candidateIds
        }
    };

    // TODO: SWITCH TO THIS AS SOON AS SANDBOX DB IS SWITCHED TO 3.6 (JULY 20th)
    // // find which property is being modified and what to set it to
    // // default to reviewed = true
    // let property = "positions.$[elem].reviewed";
    // let value = true;
    // if (moveTo === "Not Reviewed") {
    //     value = false;
    // } else if (moveTo === "Favorites") {
    //     property = "positions.$[elem].favorite";
    // }
    //
    // // mark their reviewed or favorited status
    // let updateQuery = {
    //     "$set": {}
    // };
    // updateQuery["$set"][property] = value;
    //
    //
    // // update only the correct position within the user
    // const options = {
    //     // can match multiple candidates
    //     "multi": true,
    //     // business and position id must match
    //     "arrayFilters": [
    //         { "_id": mongoose.Types.ObjectId(positionId) },
    //         { "businessId": mongoose.Types.ObjectId(businessId) }
    //     ],
    //     // do NOT create a new position if no position matches
    //     "upsert": false
    // }
    //
    //
    // try { await Users.update(findQuery, updateQuery, options); }
    // catch (findAndUpdateError) {
    //     console.log("Error finding/updating users with favorite/reviewed status: ", findAndUpdateError);
    //     return res.status(500).send(errors.SERVER_ERROR);
    // }

    let users = [];
    try {
        users = await Users.find(findQuery);
    } catch (findUsersError) {
        console.log(
            "Error finding matching users when trying to update reviewed/favorited status: ",
            findUsersError
        );
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // find which property is being modified and what to set it to
    // default to reviewed = true
    let property = "reviewed";
    let value = true;
    if (moveTo === "Not Reviewed") {
        value = false;
    } else if (moveTo === "Favorites") {
        property = "favorite";
    } else if (moveTo === "Non-Favorites") {
        property = "favorite";
        value = false;
    }

    // the current date
    const NOW = new Date();

    // a list of promises, when it's done all users have been saved
    let saveUserPromises = [];
    // go through each affected user
    users.forEach(user => {
        // find the index of the position
        const positionIndex = user.positions.findIndex(position => {
            return (
                position.positionId.toString() === positionId.toString() &&
                position.businessId.toString() === businessId.toString()
            );
        });
        // if the position is valid ...
        if (positionIndex >= 0) {
            // ... copy the poisition ...
            let userPosition = user.positions[positionIndex];
            // ... and if dismissing the candidates ...
            if (moveTo === "Dismissed") {
                // ... dismiss the candidate ...
                userPosition.isDismissed = true;
                // ... and add this to the history of changes
                let mostRecentStage = "Not Contacted";
                if (
                    !Array.isArray(userPosition.hiringStageChanges) ||
                    userPosition.hiringStageChanges.length === 0
                ) {
                    userPosition.hiringStageChanges = [];
                } else {
                    mostRecentStage =
                        userPosition.hiringStageChanges[userPosition.hiringStageChanges.length - 1]
                            .hiringStage;
                }
                user.positions[positionIndex].hiringStageChanges.push({
                    hiringStage: mostRecentStage,
                    isDismissed: true,
                    dateChanged: NOW
                });
            } else {
                // ... or alter the value
                userPosition[property] = value;
            }

            // save the position
            user.positions[positionIndex] = userPosition;
            // save the user
            saveUserPromises.push(user.save());
        }
    });

    // wait for all users to get saved
    await Promise.all(saveUserPromises);

    res.json(true);
}

function POST_googleJobsLinks(req, res) {
    let recipients = [
        "kyle@moonshotinsights.io",
        "justin@moonshotinsights.io",
        "stevedorn9@gmail.com"
    ];
    if (process.env.NODE_ENV === "development") {
        recipients = [process.env.DEV_EMAIL];
    }
    let subject = "Moonshot - Google Jobs Form";

    let content = `<div>
            <h3>Someone filled out google jobs links:</h3>
            <p>Business Id: ${sanitize(req.body.params.businessId)}</p>
            <p>Jobs: ${sanitize(req.body.params.jobs)}</p>
        </div>`;

    sendEmail({ recipients, subject, content })
        .then(response => {
            return res.status(200).send({});
        })
        .catch(error => {
            console.log("Error sending email for google jobs post: ", error);
            return res.status(500).send({ message: errors.SERVER_ERROR });
        });
}

// add an evaluation to the business on request
async function POST_addEvaluation(req, res) {
    const {
        userId,
        verificationToken,
        businessId,
        positionName,
        positionType,
        isManager
    } = sanitize(req.body);

    try {
        var business = await verifyAccountAdminAndReturnBusiness(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyAccountAdminError) {
        console.log("Error verifying business account admin: ", verifyAccountAdminError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    try {
        business.positions.push(
            await createPosition(positionName, positionType, businessId, isManager)
        );
    } catch (addPosError) {
        console.log("Error adding position ", addPosError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    try {
        await business.save();
    } catch (saveBizError) {
        console.log("Error saving business when adding new eval: ", saveBizError);
        return res.status(500).send("Error adding position. Contact support or try again.");
    }

    return res.json(business.positions);
}

// add an evaluation to the business on request
async function POST_interests(req, res) {
    const { userId, verificationToken, businessId, interests } = sanitize(req.body);

    try {
        var business = await verifyAccountAdminAndReturnBusiness(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyAccountAdminError) {
        console.log("Error verifying business account admin: ", verifyAccountAdminError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    business.interests = interests;

    try {
        await business.save();
    } catch (saveBizError) {
        console.log("Error saving business when trying to add interests: ", saveBizError);
        return res.status(500).send("Error adding users. Contact support or try again.");
    }

    return res.json(business.interests);
}

async function POST_contactUsEmail(req, res) {
    const { message, name, email } = sanitize(req.body);

    // email to moonshot with the message the user entered
    let toMoonshotContent = `<div>
            <h2>Contact Us Form Filled Out:</h2>
            <h3>Name</h3>
            <p>${name}</p>
            <h3>Email</h3>
            <p>${email}</p>
            <h3>Message</h3>
            <p>${message}</p>
        </div>`;

    // tells the user that we got their message
    const messageReceivedContent = `<div>
            <p>Hi${name ? " " + getFirstName(name) : ""}!</p>
            <p>Just wanted to let you know that we got your message. We'll get back to you as soon as we can!</p>
            ${emailFooter(email)}
        </div>`;

    try {
        // sending email to moonshot with the message from the user
        await sendEmail({
            recipients: devMode ? devEmail : founderEmails,
            subject: "ACTION REQUIRED - Contact Us Form Filled Out",
            content: toMoonshotContent
        });
    } catch (sendEmailError) {
        console.log("Error sending contact us email: ", sendEmailError);
        return res.status(500).send({ success: false });
    }

    try {
        // sending the "email received" message
        await sendEmail({
            recipients: [email],
            subject: "We Got Your Message!",
            content: messageReceivedContent
        });
    } catch (sendReplyError) {
        // if there is an error sending the reply email we can return successfully
        // since moonshot got the email, which is the important part
        console.log(
            "Error sending email to user telling them we got their email: ",
            sendReplyError
        );
    }

    return res.status(200).send({ success: true });
}

// returns the business user object, the candidate/employee, and the index of
// the position within the positions array of the candidate/employee
async function verifyBizUserAndFindUserPosition(
    bizUserId,
    verificationToken,
    positionId,
    userId,
    profileUrl
) {
    return new Promise(async function(resolve, reject) {
        if (!bizUserId) {
            return reject("No bizUserId.");
        } else if (!verificationToken) {
            return reject("No business user verificationToken.");
        } else if (!positionId) {
            return reject("No positionId.");
        } else if (!userId) {
            return reject("No userId");
        }

        // find the user and the candidate
        let bizUser, user;
        // search by id if possible, profile url otherwise
        try {
            const [foundBizUser, foundUser] = await Promise.all([
                getAndVerifyUser(bizUserId, verificationToken),
                Users.findById(userId)
            ]);
            bizUser = foundBizUser;
            user = foundUser;
            if (!user) {
                return reject("Invalid user id.");
            }
        } catch (findUserError) {
            return reject(findUserError);
        }

        // make sure the user has an associated business
        if (!bizUser.businessInfo || !bizUser.businessInfo.businessId) {
            return reject("Business user does not have associated business.");
        }

        // if the user is not an admin or manager, they can't edit other users' info
        if (!["accountAdmin", "manager"].includes(bizUser.userType)) {
            reject("User does not have permission. User is type: ", bizUser.userType);
        }

        if (!Array.isArray(user.positions)) {
            return reject("That user did not apply for this position.");
        }

        // get the candidate's position with this position id
        const userPositionIndex = user.positions.findIndex(position => {
            // index is correct if it has the right position id and the business id
            // for the business that the user works for
            return (
                position.positionId.toString() === positionId.toString() &&
                bizUser.businessInfo.businessId.toString() === position.businessId.toString()
            );
        });
        if (typeof userPositionIndex !== "number" || userPositionIndex < 0) {
            return reject("User did not apply for this position.");
        }

        resolve({ bizUser, user, userPositionIndex });
    });
}

// have a manager or account admin answer a question about an employee
async function POST_answerQuestion(req, res) {
    const body = req.body;
    const bizUserId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const userId = sanitize(body.employeeId);
    const positionId = sanitize(body.positionId);
    const questionIndex = sanitize(body.questionIndex);
    const score = sanitize(body.score);
    const gradingComplete = sanitize(body.gradingComplete);

    // make sure all necessary params are here
    if (
        !bizUserId ||
        !verificationToken ||
        !(typeof questionIndex === "number") ||
        !(typeof score === "number") ||
        !userId ||
        !positionId
    ) {
        return res.status(400).send("Bad request.");
    }

    // verify biz user, get candidate, find and verify candidate's position
    let bizUser, user, userPositionIndex;
    try {
        let results = await verifyBizUserAndFindUserPosition(
            bizUserId,
            verificationToken,
            positionId,
            userId
        );
        bizUser = results.bizUser;
        user = results.user;
        userPositionIndex = results.userPositionIndex;
    } catch (error) {
        console.log("Error verifying business user or getting user position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if the answers array doesn't exist, make it
    if (!Array.isArray(user.positions[userPositionIndex].answers)) {
        user.positions[userPositionIndex].answers = [];
    }

    // get the index of the answer in the user's answers array
    const answerIndex = user.positions[userPositionIndex].answers.findIndex(answer => {
        return answer.questionIndex === questionIndex;
    });

    if (answerIndex === -1) {
        const newAnswer = {
            complete: true,
            score: score,
            questionIndex: questionIndex
        };
        user.positions[userPositionIndex].answers.push(newAnswer);
    } else {
        user.positions[userPositionIndex].answers[answerIndex].score = score;
    }

    // mark whether the manager is finished grading the user
    user.positions[userPositionIndex].gradingComplete = gradingComplete;

    // if no manager is marked as being the grader, add the current user
    if (!user.positions[userPositionIndex].managerId) {
        user.positions[userPositionIndex].managerId = user._id;
    }

    // save the user
    try {
        user = await user.save();
    } catch (updateUserError) {
        console.log("Error saving user during grading: ", updateUserError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // return successfully
    res.json(user.positions[userPositionIndex].answers);
}

async function GET_business(req, res) {
    console.log(req.query);
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const businessId = sanitize(req.query.businessId);

    let business;
    try {
        business = await verifyAccountAdminAndReturnBusiness(userId, verificationToken, businessId);
    } catch (err) {
        console.log("error getting business: ", err);
        return res.status(500).send("Server error.");
    }

    console.log("business, ", business);

    return res.json(business);
}

// VERIFY THAT THE GIVEN USER IS LEGIT AND PART OF THE GIVEN BUSINESS
// RETURNS THE BUSINESS THAT THE EMPLOYER WORKS FOR ON SUCCESS, UNDEFINED ON FAIL
async function verifyAccountAdminAndReturnBusiness(userId, verificationToken, businessId) {
    return new Promise(async (resolve, reject) => {
        try {
            const { business } = await verifyAccountAdminAndReturnBusinessAndUser(
                userId,
                verificationToken,
                businessId
            );
            return resolve(business);
        } catch (error) {
            reject(error);
        }
    });
}

// does the same but returns both user and business
async function verifyAccountAdminAndReturnBusinessAndUser(userId, verificationToken, businessId) {
    return new Promise(async (resolve, reject) => {
        try {
            // find the user and business
            let [user, business] = await Promise.all([
                Users.findById(userId),
                Businesses.findById(businessId)
            ]);

            // check that user and business were found
            if (!user || !business) {
                throw "User or business not found.";
            }

            // check if the user has the right verification token
            if (user.verificationToken !== verificationToken) {
                throw "Wrong verification token.";
            }

            if (user.userType !== "accountAdmin") {
                throw `User was supposed to be an account admin, but was: ${user.userType}`;
            }

            // check that the user is part of the business
            if (user.businessInfo.businessId.toString() !== businessId.toString()) {
                throw "User not part of that company.";
            }

            // successful verification
            resolve({ business, user });
        } catch (error) {
            reject(error);
        }
    });
}

// get a count of how many candidates need to be reviewed
async function GET_employeesAwaitingReview(req, res) {
    const { userId, verificationToken, businessId } = sanitize(req.query);

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // count all the users with this position
    const positionIds = business.positions.map(p => p._id);
    try {
        var newEmployees = await unReviewedEmployeeCount(business._id, positionIds);
    } catch (countError) {
        console.log(
            `Error counting all the new employees for ${business.name} (id ${business._id}): `,
            countError
        );
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.status(200).send({ newEmployees });
}

// return a count of all unreviewed employees in all positions for a specific business
async function unReviewedEmployeeCount(businessId, positionIds) {
    return new Promise(async function(resolve, reject) {
        const query = {
            userType: "employee",
            positions: {
                $elemMatch: {
                    businessId: businessId,
                    gradingComplete: { $ne: true },
                    positionId: { $in: positionIds }
                }
            }
        };
        // count the users in the position that haven't been reviewed
        try {
            var count = await Users.countDocuments(query);
        } catch (countError) {
            return reject(countError);
        }

        return resolve(count);
    });
}

// get a count of how many candidates need to be reviewed
async function GET_candidatesTotal(req, res) {
    const { userId, verificationToken, businessId } = sanitize(req.query);

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // count all the users with this position
    const positionIds = business.positions.map(p => p._id);
    try {
        var totalCandidates = await totalCandidateCount(business._id, positionIds);
    } catch (countError) {
        console.log(
            `Error counting the total candidates for ${business.name} (id ${business._id}): `,
            countError
        );
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.status(200).send({ totalCandidates });
}

// get a count of how many candidates need to be reviewed
async function GET_candidatesAwaitingReview(req, res) {
    const { userId, verificationToken, businessId } = sanitize(req.query);

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // count all the users with this position
    const positionIds = business.positions.map(p => p._id);
    try {
        var newCandidates = await unReviewedCandidateCount(business._id, positionIds);
    } catch (countError) {
        console.log(
            `Error counting all the new candidates for ${business.name} (id ${business._id}): `,
            countError
        );
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.status(200).send({ newCandidates });
}

// return a count of all unreviewed users in all positions for a specific business
async function totalCandidateCount(businessId, positionIds) {
    return new Promise(async function(resolve, reject) {
        const query = {
            userType: "candidate",
            positions: {
                $elemMatch: {
                    businessId: businessId,
                    positionId: { $in: positionIds }
                }
            }
        };
        // count the users in the position that haven't been reviewed
        try {
            var count = await Users.countDocuments(query);
        } catch (countError) {
            return reject(countError);
        }

        return resolve(count);
    });
}

// return a count of all unreviewed users in all positions for a specific business
async function unReviewedCandidateCount(businessId, positionIds) {
    return new Promise(async function(resolve, reject) {
        const query = {
            userType: "candidate",
            positions: {
                $elemMatch: {
                    businessId: businessId,
                    reviewed: { $ne: true },
                    positionId: { $in: positionIds }
                }
            }
        };
        // count the users in the position that haven't been reviewed
        try {
            var count = await Users.countDocuments(query);
        } catch (countError) {
            return reject(countError);
        }

        return resolve(count);
    });
}

// returns a date formatted to have only the month and day (so 10-6, for example)
function monthAndDayOnly(date) {
    return `${date.getMonth() + 1}-${date.getDate()}`;
}

async function newCandidateCountByDate(businessId, positionIds, groupBy, numDataPoints) {
    return new Promise(async function(resolve, reject) {
        try {
            // the difference between the dates in each data point
            let monthDifference = 0;
            let dayDifference = 0;
            if (groupBy === "months") {
                monthDifference = 1;
            } else if (groupBy === "weeks") {
                dayDifference = 7;
            } else {
                dayDifference = 1;
            }

            // the date that starts each time interval
            let dates = [];

            // get the date to end data collection at
            const now = new Date();
            let mostRecentDay = now.getDate();
            let additionalMonth = 0;
            // if grouping by months, make sure to get data for the entire month
            if (groupBy === "months") {
                mostRecentDay = 1;
                additionalMonth = 1;
            }
            // if grouping by weeks, get all data from before next Sunday (first day of the week)
            else if (groupBy === "weeks") {
                mostRecentDay += 7 - now.getDay();
            }
            // otherwise we're grouping by day, so get all data for today
            else {
                mostRecentDay++;
            }
            let before = new Date(
                now.getFullYear(),
                now.getMonth() + additionalMonth, // add a month if grouping by months
                mostRecentDay
            );
            // the start date for the last data point
            let after = new Date(
                before.getFullYear(),
                before.getMonth() - monthDifference,
                before.getDate() - dayDifference
            );

            // holds the promises for getting each data point
            let dataPromises = [];
            for (let i = 0; i < numDataPoints; i++) {
                dates.push(after);

                const query = {
                    userType: "candidate",
                    positions: {
                        $elemMatch: {
                            positionId: { $in: positionIds },
                            businessId: mongoose.Types.ObjectId(businessId),
                            appliedEndDate: { $lt: before, $gte: after }
                        }
                    }
                };
                dataPromises.push(Users.countDocuments(query));
                // move back the dates we're getting data for
                before = after;
                after = new Date(
                    after.getFullYear(),
                    after.getMonth() - monthDifference,
                    after.getDate() - dayDifference
                );
            }

            // get all the data points, then flip them around so they're in chronological order
            const dataPoints = (await Promise.all(dataPromises))
                .map((count, index) => {
                    return {
                        users: count,
                        date: monthAndDayOnly(dates[index])
                    };
                })
                .reverse();

            return resolve(dataPoints);
        } catch (e) {
            // just reject any error that is thrown
            return reject(e);
        }
    });
}

// gets the count of new candidates within 5 of the last {interval}, which could
// be days, weeks, or months
async function GET_newCandidateGraphData(req, res) {
    let { userId, verificationToken, businessId, interval } = sanitize(req.query);
    if (typeof interval === "string") {
        interval = interval.toLowerCase();
    }

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    const numDataPoints = 5;

    console.log("interval: ", interval);

    // count all the users with this position
    const positionIds = business.positions.map(p => mongoose.Types.ObjectId(p._id));
    try {
        var counts = await newCandidateCountByDate(
            business._id,
            positionIds,
            interval,
            numDataPoints
        );
    } catch (countError) {
        console.log(
            `Error counting all the new candidates for ${business.name} (id ${business._id}): `,
            countError
        );
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.status(200).send({ counts });
}

// gets the count of new candidates within 5 of the last {interval}, which could
// be days, weeks, or months
async function GET_evaluationsGraphData(req, res) {
    let { userId, verificationToken, businessId, interval } = sanitize(req.query);
    if (typeof interval === "string") {
        interval = interval.toLowerCase();
    }

    try {
        var { business, user } = await verifyAccountAdminAndReturnBusinessAndUser(
            userId,
            verificationToken,
            businessId
        );
    } catch (verifyError) {
        console.log("Error verifying user's identity and getting business: ", verifyError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // count all the users with this position
    const positionIds = business.positions.map(p => mongoose.Types.ObjectId(p._id));
    // get only completions within wanted time range
    const now = new Date();
    let month = now.getMonth();
    let date = now.getDate();
    if (interval === "last 6 months") {
        month -= 6;
    } else if (interval === "last month") {
        month--;
    } else {
        date -= 7;
    }
    const earliestDate = new Date(now.getFullYear(), month, date);
    // make sure we get all the data from today too
    const latestDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // get counts of evaluation completions
    try {
        var counts = await countEvaluationCompletions(
            business._id,
            positionIds,
            earliestDate,
            latestDate
        );
    } catch (countError) {
        console.log(
            `Error getting evaluation counts data for ${business.name} (id ${business._id}): `,
            countError
        );
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    const formattedData = counts.map(c => {
        return { name: c._id.name, candidates: c.count };
    });

    return res.status(200).send({ counts: formattedData });
}

async function countEvaluationCompletions(businessId, positionIds, earliestDate, latestDate) {
    return new Promise(async function(resolve, reject) {
        try {
            const counts = await Users.aggregate([
                // put each position application into its own object
                { $unwind: "$positions" },
                // // filter out every position that was applied to before the earliest date wanted
                {
                    $match: {
                        $and: [
                            { "positions.appliedEndDate": { $gte: earliestDate, $lt: latestDate } },
                            { "positions.positionId": { $in: positionIds } },
                            { "positions.businessId": mongoose.Types.ObjectId(businessId) }
                        ]
                    }
                },
                // group these objects by position name and count them
                {
                    $group: {
                        //_id: { positionId: "$positions._id", name: "$positions.name" },
                        _id: { name: "$positions.name" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            // // TODO: REMOVE THIS AND DO IT A BETTER WAY, FIX THE EASE QUERY
            // // create an object to keep track of used id/name combos
            // let countsObj = {};
            // // for every count we got ...
            // counts.forEach(c => {
            //     // create an id for it within the countsObj
            //     const idString = c._id.positionId.toString() + c._id.name;
            //     // see if that id already exists, and if so update the count for that
            //     if (countsObj[idString]) {
            //         countsObj[idString].count += c.count;
            //     }
            //     // otherwise set the count for it
            //     else {
            //         countsObj[idString] = {
            //             count: c.count,
            //             _id: c._id
            //         };
            //     }
            // });
            // // make the object into an array
            // let countsArray = [];
            // for (let countObj in countsObj) {
            //     if (countsObj.hasOwnProperty(countObj)) {
            //         countsArray.push(countsObj[countObj]);
            //     }
            // }

            //return resolve(countsArray);
            return resolve(counts);
        } catch (e) {
            // just reject any error
            return reject(e);
        }
    });
}

function GET_employeeQuestions(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    Users.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log(
                "Error finding business user who was trying to see their employees: ",
                findBUserErr
            );
            return res.status(500).send("Server error, try again later.");
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            return res.status(403).send("You do not have permission to access employee info.");
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            return res.status(403).send("You do not have permission to access employee info.");
        }

        const businessId = user.businessInfo.businessId;
        let businessQuery = { _id: businessId };

        Businesses.find(businessQuery)
            .select("employeeQuestions")
            .exec(function(findEmployeesErr, employees) {
                if (findEmployeesErr) {
                    return res.status(500).send("Server error, couldn't get employees.");
                } else {
                    return res.json(employees[0]);
                }
            });
    });
}

// get all positions for a business
async function GET_positions(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    // get the user
    let user;
    try {
        user = await getAndVerifyUser(userId, verificationToken);
    } catch (findUserError) {
        console.log(
            "Error finding business user who was trying to see their positions: ",
            findUserError
        );
        return res.status(500).send("Server error, try again later.");
    }

    // get the business the user works for
    const businessId = user.businessInfo.businessId;
    try {
        var business = await Businesses.findById(businessId).select(
            "logo positions._id positions.name positions.skillNames positions.timeAllotted positions.length positions.dateCreated"
        );
    } catch (findBizError) {
        console.log("Error finding business when getting positions: ", findBizError);
        return res.status(500).send("Server error, couldn't get positions.");
    }

    if (!business) {
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    let positions = [];
    if (Array.isArray(business.positions)) {
        let positionPromises = business.positions.map(position => {
            return addCompletionsAndInProgress(position, businessId);
        });

        try {
            positions = await Promise.all(positionPromises);
        } catch (awaitPositionError) {
            console.log("Error getting completions and inProgress: ", awaitPositionError);
            res.status(500).send(errors.SERVER_ERROR);
        }
    }

    return res.status(200).send({ logo: business.logo, positions });
}

// get all positions for a business
async function GET_positionsForApply(req, res) {
    const { name, businessId } = req.query;

    if (!name) {
        return res.status(400).send({ message: "Bad request." });
    }

    // get the business the user works for
    try {
        const query = {
            $or: [
                { uniqueNameLowerCase: name.toLowerCase() },
                {
                    $and: [
                        // if searching by name, company has to have been made
                        // before searching by unique name was possible
                        { name: name },
                        {
                            $or: [
                                { dateCreated: { $lte: new Date("2018-09-27") } },
                                { dateCreated: { $exists: false } }
                            ]
                        }
                    ]
                }
            ]
        };
        var business = await Businesses.findOne(query).select(
            "logo name positions positions.name positions.code"
        );
    } catch (findBizError) {
        console.log("Error finding business when getting positions: ", findBizError);
        return res.status(500).send({ message: "Server error, couldn't get positions." });
    }

    if (!business) {
        return res.status(404).send({ message: "Invalid url" });
    }

    let admin = false;
    if (businessId && business._id.toString() === businessId.toString()) {
        admin = true;
    }

    // find out if any admins have verified their info
    try {
        const verifiedAdminsQuery = {
            userType: "accountAdmin",
            verified: true,
            "businessInfo.businessId": mongoose.Types.ObjectId(business._id)
        };
        const verifiedUser = await Users.findOne(verifiedAdminsQuery);
        var verified = verifiedUser != null;
    } catch (findVerifiedError) {
        console.log("Error finding verified admin from /apply page: ", findVerifiedError);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    return res.json({
        logo: business.logo,
        businessName: business.name,
        positions: business.positions,
        admin,
        pageSetUp: verified
    });
}

// get the number of users who have completed and are in progress for a certain position
// return the position object but with two additional properties - completions and usersInProgress
async function addCompletionsAndInProgress(position, businessId) {
    return new Promise(async function(resolve, reject) {
        try {
            const positionId = position._id;
            // all users with this position id in their positions array who have an end date
            completionsQuery = {
                userType: "candidate",
                positions: {
                    $elemMatch: {
                        positionId: mongoose.Types.ObjectId(positionId),
                        businessId: mongoose.Types.ObjectId(businessId),
                        appliedEndDate: { $exists: true }
                    }
                }
            };
            // all users with this position id in their positions array who have a start
            // date but NOT an end date
            inProgressQuery = {
                userType: "candidate",
                positions: {
                    $elemMatch: {
                        positionId: mongoose.Types.ObjectId(positionId),
                        businessId: mongoose.Types.ObjectId(businessId),
                        appliedStartDate: { $exists: true },
                        appliedEndDate: { $exists: false }
                    }
                }
            };

            const [completions, usersInProgress] = await Promise.all([
                Users.countDocuments(completionsQuery),
                Users.countDocuments(inProgressQuery)
            ]);

            if (typeof position.toObject === "function") {
                position = position.toObject();
            }

            resolve({ ...position, completions, usersInProgress });
        } catch (error) {
            reject(error);
        }
    });
}

async function GET_evaluationResults(req, res) {
    const bizUserId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);
    const userId = sanitize(req.query.candidateId);
    const positionId = sanitize(req.query.positionId);
    const positionIdString = positionId.toString();

    // verify biz user, get candidate/employee, find and verify candidate's/employee's position
    let bizUser, user, userPositionIndex, psychTest;
    try {
        let [results, foundPsychTest] = await Promise.all([
            verifyBizUserAndFindUserPosition(bizUserId, verificationToken, positionId, userId),
            Psychtests.findOne({}).select("factors._id factors.stats")
        ]);
        bizUser = results.bizUser;
        user = results.user;
        psychTest = foundPsychTest;
        userPositionIndex = results.userPositionIndex;
    } catch (error) {
        console.log("Error verifying business user or getting candidate position index: ", error);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // get the business so we can check if they have full access
    try {
        var business = await Businesses.findById(bizUser.businessInfo.businessId);
    } catch (findBizError) {
        return res.status(500).send(errors.SERVER_ERROR);
    }
    // if they don't have full access, don't return any report data
    if (!business.fullAccess) {
        return res.status(401).send("Upgrade to a paid plan to see this report.");
    }

    let userPosition = user.positions[userPositionIndex];

    // --->>              FORMAT THE DATA FOR THE FRONT END             <<--- //
    // get position-specific free response questions
    const frqs = userPosition.freeResponseQuestions.map(frq => {
        return {
            question: frq.body,
            answer: frq.response
        };
    });
    // get skill test scores for relevant skills
    const skillScores = Array.isArray(user.skillTests)
        ? user.skillTests.filter(skill => {
              return userPosition.skillTestIds.some(posSkillId => {
                  return posSkillId.toString() === skill.skillId.toString();
              });
          })
        : [];
    // have to convert the factor names to what they will be displayed as
    const psychNameConversions = {
        Extraversion: "Dimension",
        Emotionality: "Temperament",
        "Honesty-Humility": "Viewpoint",
        Conscientiousness: "Methodology",
        "Openness to Experience": "Perception",
        Agreeableness: "Ethos",
        Altruism: "Belief"
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
        };
    });
    const gcaTest = user.cognitiveTest;
    const results = {
        title: user.title,
        name: user.name,
        email: user.emailToContact ? user.emailToContact : user.email,
        interest: userPosition.interest,
        hiringStage: userPosition.hiringStage,
        isDismissed: userPosition.isDismissed,
        endDate: userPosition.appliedEndDate,
        performanceScores: userPosition.scores,
        gca: gcaTest && typeof gcaTest.score === "number" ? gcaTest.score : undefined,
        frqs,
        skillScores,
        psychScores
    };
    // <<------------------------------------------------------------------>> //

    // return the information to the front end
    res.json(results);
}

async function GET_candidateSearch(req, res) {
    const { userId, verificationToken, getMockData, positionName } = sanitize(req.query);

    // get the user and business who are trying to search for candidates
    try {
        var { user, business } = await getUserAndBusiness(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the business isn't on a plan, don't show them their candidates
    if (!business.fullAccess) {
        return res.status(200).send({ candidates: [] });
    }

    // if mock users are wanted, just get those
    if (getMockData) {
        try {
            const mockusers = await Mockusers.find({});
            return res.status(200).send({ mockusers });
        } catch (getMockusersError) {
            console.log("Error getting mock users: ", getMockusersError);
            // just pretend on front end like nothing went wrong
            return res.status(200).send({ candidates: [] });
        }
    }

    // the id of the business that the user works for
    const businessId = user.businessInfo.businessId;

    let positionRequirements = [
        { businessId: mongoose.Types.ObjectId(businessId) },
        { name: positionName }
    ];

    let query = {
        userType: "candidate",
        // only get users who have verified their email address
        verified: true,
        // only get the position that was asked for
        positions: {
            $elemMatch: {
                $and: positionRequirements
            }
        }
    };

    // the user attributes that we want to keep
    const attributes =
        "_id name profileUrl positions.reviewed positions.favorite positions.interest positions.isDismissed positions.hiringStage positions.isDismissed positions.hiringStageChanges positions.scores";

    // perform the search
    try {
        var candidates = await Users.find(query).select(attributes);
    } catch (candidateSearchError) {
        console.log("Error searching for candidates: ", candidateSearchError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // if there are no candidates for this position, check if there are any at all
    if (candidates.length === 0) {
        // query to find all candidates
        const allCandidatesQuery = {
            userType: "candidate",
            verified: true,
            positions: { $elemMatch: { businessId: mongoose.Types.ObjectId(businessId) } }
        };

        try {
            // count all candidates for the business
            var candidateCount = await Users.countDocuments(allCandidatesQuery);
            // if there aren't any, send out the mock users
            var shouldSendMockUsers = candidateCount === 0;
        } catch (countUsersError) {
            console.log(
                "Error counting if there are any candidates for company: ",
                countUsersError
            );
            return res.status(200).send({ candidates: [] });
        }

        // if there are other candidates at the company
        if (!shouldSendMockUsers) {
            return res.status(200).send({ candidates: [] });
        }

        // if there are no other candidates at the company, get all mock
        // candidates and send them to the front end
        try {
            const mockusers = await Mockusers.find({});
            return res.status(200).send({ mockusers });
        } catch (getMockusersError) {
            console.log("Error getting mock users: ", getMockusersError);
            // just pretend on front end like nothing went wrong
            return res.status(200).send({ candidates: [] });
        }
    }
    // if there are candidates to return for the position, format them and send em out
    else {
        // format the candidates for the front end
        const formattedCandidates = candidates.map(candidate => {
            const candidateObj = candidate.toObject();
            return {
                name: candidateObj.name,
                profileUrl: candidateObj.profileUrl,
                _id: candidateObj._id,
                ...candidateObj.positions[0]
            };
        });

        // successfully return the candidates
        return res.json({ candidates: formattedCandidates });
    }
}

async function GET_employeeSearch(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    // get the user who is trying to search for employees
    try {
        var { user, business } = await getUserAndBusiness(userId, verificationToken);
    } catch (getUserError) {
        console.log("error getting business user while searching for candidates: ", getUserError);
        return res.status(401).send(errors.PERMISSIONS_ERROR);
    }

    // if the business isn't on a plan, don't show them their employees
    if (!business.fullAccess) {
        return res.status(200).send([]);
    }

    // the id of the business that the user works for
    const businessId = user.businessInfo.businessId;
    // the restrictions on the search
    const searchTerm = sanitize(req.query.searchTerm);
    // if a specific hiring stage is wanted
    const status = sanitize(req.query.status);
    // position name is the only required input to the search
    const positionName = sanitize(req.query.positionName);
    // the thing we should sort by - default is alphabetical
    const sortBy = sanitize(req.query.sortBy);

    let positionRequirements = [
        { businessId: mongoose.Types.ObjectId(businessId) },
        { name: positionName }
    ];
    // filter by hiring stage if requested
    if (status) {
        const gradingComplete = status === "Complete";
        positionRequirements.push({ gradingComplete: gradingComplete });
    }

    // only get the position that was asked for
    let query = {
        userType: "employee",
        positions: {
            $elemMatch: {
                $and: positionRequirements
            }
        }
    };

    // search by name too if search term exists
    if (searchTerm) {
        const nameRegex = new RegExp(searchTerm, "i");
        query["name"] = nameRegex;
    }

    // the user attributes that we want to keep
    const attributes =
        "_id name profileUrl positions.answers positions.gradingComplete positions.scores";

    // perform the search
    let employees = [];
    try {
        employees = await Users.find(query).select(attributes);
    } catch (employeeSearchError) {
        console.log("Error searching for employees: ", employeeSearchError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // format the employees for the front end
    const formattedEmployees = employees.map(employee => {
        const employeeObj = employee.toObject();
        return {
            name: employeeObj.name,
            _id: employeeObj._id,
            profileUrl: employeeObj.profileUrl,
            ...employeeObj.positions[0]
        };
    });

    // successfully return the employees
    return res.json(formattedEmployees);
}

// get the api key for the api key settings page
async function GET_apiKey(req, res) {
    // get user credentials
    const { userId, verificationToken } = sanitize(req.query);

    // get the user and business
    try {
        var { user, business } = await getUserAndBusiness(userId, verificationToken);
    } catch (error) {
        console.log("Error finding user/business trying to see their api key: ", error);
        return res
            .status(error.status ? error.status : 500)
            .send(error.message ? error.message : errors.SERVER_ERROR);
    }

    // user has to be an account admin to see the api key
    if (user.userType !== "accountAdmin") {
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    return res.status(200).json(business.API_Key);
}

// reset a company's api key
async function POST_resetApiKey(req, res) {
    // get user credentials
    const userId = sanitize(req.body.userId);
    const password = sanitize(req.body.password);
    const verificationToken = sanitize(req.body.verificationToken);

    // get the user and business
    try {
        var [user, newApiKey] = await Promise.all([
            getAndVerifyUser(userId, verificationToken),
            generateApiKey()
        ]);
    } catch (error) {
        console.log(
            "Error finding user who was trying to change their api key OR error generating new api key: ",
            error
        );
        return res
            .status(error.status ? error.status : 500)
            .send(error.message ? error.message : errors.SERVER_ERROR);
    }

    // make sure the user has the right password
    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(403).send("Wrong password.");
    }

    // make sure the generated api key is relevant
    if (typeof newApiKey !== "string" || newApiKey.length !== 24) {
        console.log("New Api Key was either not a string or had the wrong length.");
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // user has to be an account admin to change the api key
    if (user.userType !== "accountAdmin") {
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }

    // get the id of the business the user works for
    try {
        var businessId = user.businessInfo.businessId;
    } catch (getBizIdError) {
        console.log("User trying to update api key did not have an associated business.");
        return res.status(403).send(errors.PERMISSIONS_ERROR);
    }
    // query to get the business the user works for
    const find = { _id: user.businessInfo.businessId };
    // query to update the business api key
    const update = { API_Key: newApiKey };

    try {
        await Businesses.findOneAndUpdate(find, update);
    } catch (updateBizError) {
        console.log("Error updating business to have a new api key: ", updateBizError);
        return res.status(500).send(errors.SERVER_ERROR);
    }

    return res.status(200).send(newApiKey);
}

// upload a csv containing candidate emails during business onboarding
async function POST_uploadCandidateCSV(req, res) {
    const userId = sanitize(req.body.userId);
    const verificationToken = sanitize(req.body.verificationToken);
    const candidateFile = sanitize(req.body.candidateFile);
    const candidateFileName = sanitize(req.body.candidateFileName);

    // make sure the candidates file exists
    if (!candidateFile) {
        return res.status(400).send("No candidates file provided!");
    }

    // ensure file is correct type
    if (!isValidFileType(candidateFileName, ["csv", "xls", "xlsx"])) {
        return res.status(400).send("Invalid file type!");
    }

    // get the user and the business from the given credentials
    try {
        var { user, business } = await getUserAndBusiness(userId, verificationToken);
    } catch (getUserAndBizError) {
        console.log(
            "Error getting user and/or business while trying to upload candidate file: ",
            getUserAndBizError
        );
        return res.status(500).send(errors.SERVER_ERROR);
    }

    // set up the email to send
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io"];
    if (process.env.NODE_ENV === "development") {
        recipients = [process.env.DEV_EMAIL];
    }
    let subject = `ACTION NEEDED: Candidates File Uploaded By ${business.name}`;
    let content = "<div><p>File is attached.</p></div>";
    // attach the candidates file to the email
    const fileString = candidateFile.substring(candidateFile.indexOf(",") + 1);
    let attachments = [
        {
            filename: candidateFileName,
            data: new Buffer(fileString, "base64")
        }
    ];

    // send the email with the attachment
    sendEmail({ recipients, subject, content, attachments })
        .then(response => {
            return res.status(200).send({});
        })
        .catch(error => {
            console.log("Error sending email with candidates file: ", error);
            return res.status(500).send({ message: "Error uploading candidates file." });
        });
}

// get the colors of a business
async function GET_colors(req, res) {
    const { name } = req.query;

    if (!name) {
        return res.status(400).send({ message: "Bad request." });
    }

    // get the business the user works for
    try {
        const query = {
            $or: [
                { uniqueNameLowerCase: name.toLowerCase() },
                {
                    $and: [
                        // if searching by name, company has to have been made
                        // before searching by unique name was possible
                        { name: name },
                        {
                            $or: [
                                { dateCreated: { $lte: new Date("2018-09-27") } },
                                { dateCreated: { $exists: false } }
                            ]
                        }
                    ]
                }
            ]
        };
        var business = await Businesses.findOne(query).select(
            "headerLogo name backgroundColor primaryColor"
        );
    } catch (findBizError) {
        console.log("Error finding business when getting colors: ", findBizError);
        return res.status(500).send({ message: "Server error, couldn't get business colors." });
    }

    if (!business) {
        return res.status(404).send({ message: "Invalid url" });
    }

    return res.json(business);
}

// creates a unique api key for a business
async function generateApiKey() {
    return new Promise(async function(resolve, reject) {
        // get a list of all current API_Keys
        try {
            // find all other businesses
            const otherBusinesses = await Businesses.find({}).select("API_Key");
            // an array of the api keys of every other business
            var existingKeys = otherBusinesses.map(biz => {
                return biz.API_Key;
            });
        } catch (getKeysError) {
            console.log("Error getting all keys of other businesses.");
            return reject({ status: 500, message: errors.SERVER_ERROR, error: getKeysError });
        }

        // placeholder for api key
        let API_Key = "";
        // continue to generate random api keys ...
        do {
            API_Key = crypto.randomBytes(12).toString("hex");
        } while (
            // ... until the key does not exist in the array of every other key
            existingKeys.includes(API_Key)
        );

        // return the new api key
        return resolve(API_Key);
    });
}

module.exports = businessApis;
