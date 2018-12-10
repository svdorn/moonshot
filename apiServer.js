const express = require("express");
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const credentials = require("./credentials");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const prerenderNode = require("prerender-node");
const helmet = require("helmet");
const chalk = require("chalk");
const success = chalk.cyan;
const error = chalk.red;

var app = express();

// make sure headers are set securely
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: "NotYoBeeswax" }));

if (process.env.NODE_ENV !== "test") {
    app.use(logger("dev"));
}

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
var prerender = prerenderNode.set("prerenderToken", "LYjJ7i8UHyhooHVMA3bB");
prerender.crawlerUserAgents.push("googlebot");
prerender.crawlerUserAgents.push("bingbot");
prerender.crawlerUserAgents.push("yandex");
app.use(prerender);

// trust the first proxy encountered because we run through a proxy
app.set("trust proxy", 1);

// this is the testing database
let dbConnectLink =
    "mongodb://" +
    credentials.dbDevUsername +
    ":" +
    credentials.dbDevPassword +
    "@ds125146.mlab.com:25146/testmoonshot";
// this is the real database
if (process.env.NODE_ENV === "production") {
    dbConnectLink =
        "mongodb://" +
        credentials.dbUsername +
        ":" +
        credentials.dbPassword +
        "@ds141159-a0.mlab.com:41159,ds141159-a1.mlab.com:41159/moonshot?replicaSet=rs-ds141159";
}
// options for db connection
const dbOptions = { useNewUrlParser: true };
// connect to mLab
mongoose.connect(
    dbConnectLink,
    dbOptions
);

var db = mongoose.connection;
db.on("connected", () => console.log(success("Connected to MongoDB.")));
db.on("error", e => console.log(error("MongoDB connection error: "), e));

// import all the api functions
const userApis = require("./apis/userApis");
const miscApis = require("./apis/miscApis");
const adminApis = require("./apis/adminApis");
const psychApis = require("./apis/psychApis");
const billingApis = require("./apis/billingApis");
const businessApis = require("./apis/businessApis");
const candidateApis = require("./apis/candidateApis");
const evaluationApis = require("./apis/evaluationApis");
const accountAdminApis = require("./apis/accountAdminApis");
const mockusersApis = require("./apis/mockusersApis");
const updates = require("./apis/updates");

const webhooks = require("./apis/webhooks");
const mlFunctions = require("./apis/mlFunctions");
const helperFunctions = require("./apis/helperFunctions");

// make self activating functions run
require("./apis/selfActivatingFunctions");

// set up the session
const sevenDaysInSeconds = 7 * 24 * 60 * 60;
app.use(
    session({
        secret: credentials.secretString,
        resave: true, // saves session even if un-modified
        saveUninitialized: false, // doesn't save a session if it is new but not modified
        unset: "destroy", // delete the session when set to null or req.session.destroy() used
        rolling: true, // resets maxAge on session when user uses site again
        proxy: true, // must be true since we are using a reverse proxy
        cookie: {
            maxAge: 1000 * sevenDaysInSeconds, // 7 days in milliseconds
            secure: !helperFunctions.devMode, // only make the cookie if accessing via https
            httpOnly: true, // cookie can only be sent over http(s), not client js
            domain: process.env.SITE_NAME, // moonshotinsights.io or frizzkitten.com or localhost:8081
            path: "/" // only allow access to cookie if it's on the right domain and path
        },
        store: new MongoStore({ mongooseConnection: db, ttl: sevenDaysInSeconds })
    })
);

// --->> TEST WEBHOOKS <<--- //

// const WebHooks = require("node-webhooks");
// // add the place that stores webhooks
// webHooks = new WebHooks({
//     db: {
//         "testHookStorage": [ "http://localhost:8081/testHooks" ]
//     }
// });
// add a new webhook
// webHooks.add("testHook1", "https://hooks.zapier.com/hooks/catch/3540048/wju5zh/")
// .then(function() {
//     console.log("did the hook!");
// })
// .catch(function(error) {
//     console.log("error doing test hook:");
//     console.log(error);
// });

// webHooks.remove('testHook2').catch(function(err){console.error(err);});
// webHooks.add("addCandidate", "http://5218a471.ngrok.io/api/webhooks/addCandidate")
// .then(function() {
//     console.log("set up the local hook");
// })
// .catch(function(error) {
//     console.log("error setting up test hook:");
//     console.log(error);
// });
// trigger the webhook
// webHooks.trigger("addCandidate", {data: {
//     API_Key: "a9bbc72aaeae4ecd5fafb113",
//     Position_Key: "5b36c49f2a899062a029f59f",
//     email: "frizzkitten@gmail.com"
// }});

// <<--------------------->> //

// ----->> START APIS <<----- //

// function jangus(req, res, next) {
//     console.log("jangus");
//     next()
// }
// async function krangle(req, res, next) {
//     console.log("krangle");
//     next();
// }
// async function dimble(req, res) {
//     console.log("dimble");
//     throw "PIJ";
//     return res.status(200).send({});
// }
//
//
//
//
// app.post("/printSession", (req, res) => {
//     console.log("session: ", req.session);
// });

app.post("/user/addPositionEval", userApis.POST_addPositionEval);
app.post("/user/signOut", userApis.POST_signOut);
app.post("/user/stayLoggedIn", userApis.POST_stayLoggedIn);
app.get("/user/stayLoggedIn", userApis.GET_stayLoggedIn);
app.get("/user/session", userApis.GET_session);
app.post("/user/session", userApis.POST_session);
//app.post('/user/updateOnboarding', userApis.POST_updateOnboarding);
app.post("/user/verifyEmail", userApis.POST_verifyEmail);
app.post("/user/changePasswordForgot", userApis.POST_changePasswordForgot);
app.post("/user/login", userApis.POST_login);
app.post("/user/changePassword", userApis.POST_changePassword);
app.post("/user/forgotPassword", userApis.POST_forgotPassword);
app.post("/user/changeSettings", userApis.POST_changeSettings);
app.get("/user/positions", userApis.GET_positions);
app.get("/user/adminQuestions", userApis.GET_adminQuestions);
app.get("/user/influencerResults", userApis.GET_influencerResults);
app.get("/user/checkEmailVerified", userApis.GET_checkUserVerified);
app.get("/user/notificationPreferences", userApis.GET_notificationPreferences);
app.post("/user/postNotificationPreferences", userApis.POST_notificationPreferences);
app.post("/user/agreeToTerms", userApis.POST_agreeToTerms);
app.post("/user/verifyFromApiKey", userApis.POST_verifyFromApiKey);
app.post("/user/updateOnboardingStep", userApis.POST_updateOnboardingStep);
app.post("/user/popups", userApis.POST_popups);
app.post("/user/intercomEvent", userApis.POST_intercomEvent);
app.post("/user/reSendVerificationEmail", userApis.POST_reSendVerificationEmail);
app.post("/user/confirmEmbedLink", userApis.POST_confirmEmbedLink);
app.post("/user/addEmailToUser", userApis.POST_addEmailToUser);

app.post("/candidate/user", candidateApis.POST_user);
app.post("/candidate/candidate", candidateApis.POST_candidate);

app.post("/accountAdmin/sendVerificationEmail", accountAdminApis.POST_sendVerificationEmail);
app.post("/accountAdmin/showVerifyEmailBanner", accountAdminApis.POST_showVerifyEmailBanner);

app.post("/business/googleJobsLinks", businessApis.POST_googleJobsLinks);
app.post("/business/contactUsEmail", businessApis.POST_contactUsEmail);
app.post("/business/addEvaluation", businessApis.POST_addEvaluation);
app.post("/business/answerQuestion", businessApis.POST_answerQuestion);
app.post("/business/postEmailInvites", businessApis.POST_emailInvites);
app.post("/business/inviteAdmins", businessApis.POST_inviteAdmins);
app.post("/business/rateInterest", businessApis.POST_rateInterest);
app.post("/business/changeHiringStage", businessApis.POST_changeHiringStage);
app.post("/business/moveCandidates", businessApis.POST_moveCandidates);
app.post("/business/resetApiKey", businessApis.POST_resetApiKey);
app.post("/business/uploadCandidateCSV", businessApis.POST_uploadCandidateCSV);
app.post("/business/createBusinessAndUser", businessApis.POST_createBusinessAndUser);
app.post("/business/interests", businessApis.POST_interests);
app.post("/business/deleteEvaluation", businessApis.POST_deleteEvaluation);
app.post("/business/updateEvaluationActive", businessApis.POST_updateEvaluationActive);
app.get("/business/candidateSearch", businessApis.GET_candidateSearch);
app.get("/business/employeeSearch", businessApis.GET_employeeSearch);
app.get("/business/business", businessApis.GET_business);
app.get("/business/employeeQuestions", businessApis.GET_employeeQuestions);
app.get("/business/positions", businessApis.GET_positions);
app.get("/business/positionsForApply", businessApis.GET_positionsForApply);
app.get("/business/evaluationResults", businessApis.GET_evaluationResults);
app.get("/business/apiKey", businessApis.GET_apiKey);
app.get("/business/employeesAwaitingReview", businessApis.GET_employeesAwaitingReview);
app.get("/business/candidatesAwaitingReview", businessApis.GET_candidatesAwaitingReview);
app.get("/business/candidatesTotal", businessApis.GET_candidatesTotal);
app.get("/business/newCandidateGraphData", businessApis.GET_newCandidateGraphData);
app.get("/business/evaluationsGraphData", businessApis.GET_evaluationsGraphData);
app.get("/business/billingIsSetUp", businessApis.GET_billingIsSetUp);
app.get("/business/billingInfo", businessApis.GET_billingInfo);
app.get("/business/adminList", businessApis.GET_adminList);
app.get("/business/candidateCount", businessApis.GET_candidateCount);
app.get("/business/colors", businessApis.GET_colors);

app.get("/admin/allSkills", adminApis.GET_allSkills);
app.get("/admin/skill", adminApis.GET_skill);
app.post("/admin/saveSkill", adminApis.POST_saveSkill);
app.get("/admin/allBusinesses", adminApis.GET_allBusinesses);
app.get("/admin/business", adminApis.GET_business);
app.post("/admin/saveBusiness", adminApis.POST_saveBusiness);
app.get("/admin/blankPosition", adminApis.GET_blankPosition);

app.post("/billing/customer", billingApis.POST_customer);
app.post("/billing/updateSource", billingApis.POST_updateSource);
app.post("/billing/cancelPlan", billingApis.POST_cancelPlan);
app.post("/billing/pausePlan", billingApis.POST_pausePlan);
app.post("/billing/updatePlan", billingApis.POST_updatePlan);
app.post("/billing/newPlan", billingApis.POST_newPlan);

app.get("/evaluation/currentState", evaluationApis.GET_currentState);
app.post("/evaluation/getInitialState", evaluationApis.POST_getInitialState);
app.post("/evaluation/start", evaluationApis.POST_start);
app.post("/evaluation/answerAdminQuestion", evaluationApis.POST_answerAdminQuestion);
app.post("/evaluation/answerPsychQuestion", evaluationApis.POST_answerPsychQuestion);
app.post("/evaluation/answerSkillQuestion", evaluationApis.POST_answerSkillQuestion);
app.post("/evaluation/answerCognitiveQuestion", evaluationApis.POST_answerCognitiveQuestion);
app.post("/evaluation/answerOutOfTimeCognitive", evaluationApis.POST_answerOutOfTimeCognitive);
app.post("/evaluation/skipAdminQuestions", evaluationApis.POST_skipAdminQuestions);

app.get("/mockusers/all", mockusersApis.GET_allMockusers);

//app.post('/misc/createReferralCode', miscApis.POST_createReferralCode);
app.post("/misc/unsubscribeEmail", miscApis.POST_unsubscribeEmail);
app.post("/misc/resetAlan", miscApis.POST_resetAlan);

app.post("/webhooks/addCandidate", webhooks.POST_addCandidate);
app.post("/webhooks/cancelBillingSubscription", webhooks.POST_cancelBillingSubscription);

// ----->> END APIs <<----- //

// // use this to wrap around any async function, then if an error is thrown it
// // will be passed along to the standard error handler
// function wrapAsync(fn) {
//     return function(req, res, next) {
//         fn(req, res, next) // run the function
//         .catch(next); // if any error is caught, give it to the next error handler
//     }
// }
// // handles all uncaught errors by printing and returning a generic error message
// function standardErrorHandler(error, req, res, next) {
//     console.log("STANDARD ERROR CAUGHT: ", error);
//     res.status(500).send({ message: "Something went wrong - try refreshing" });
// }
// // use the standard error handler as default, could include other ones too at some point
// app.use(standardErrorHandler);

app.listen(3001, function(err) {
    if (err) {
        return console.log(err);
    }
});

module.exports = app;

require("./apis/admin/dataDisplayApis");
