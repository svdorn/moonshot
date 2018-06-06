const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const credentials = require('./credentials');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');

var app = express();

if (process.env.NODE_ENV !== "test") {
    app.use(logger('dev'));
}
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// trust the first proxy encountered because we run through a proxy
app.set('trust proxy', 1);

// connect to mLab
const dbConnectLink = 'mongodb://' + credentials.dbUsername + ':' + credentials.dbPassword + '@ds141159-a0.mlab.com:41159,ds141159-a1.mlab.com:41159/moonshot?replicaSet=rs-ds141159';
mongoose.connect(dbConnectLink);

var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));


// import all the api functions
const userApis = require('./apis/userApis');
const candidateApis = require('./apis/candidateApis');
const businessApis = require('./apis/businessApis');
const employerApis = require('./apis/employerApis');
const adminApis = require('./apis/adminApis');
const miscApis = require('./apis/miscApis');
const pathwayApis = require('./apis/pathwayApis');
const skillApis = require('./apis/skillApis');
const mlFunctions = require('./apis/mlFunctions');


// set up the session
app.use(session({
    secret: credentials.secretString,
    saveUninitialized: false, // doesn't save a session if it is new but not modified
    rolling: true, // resets maxAge on session when user uses site again
    proxy: true, // must be true since we are using a reverse proxy
    resave: false, // session only saved back to the session store if session was modified,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
        // evaluates to true if in production, false if in development (i.e. NODE_ENV not set)
        secure: process.env.NODE_ENV !== "development" // only make the cookie if accessing via https
    },
    store: new MongoStore({mongooseConnection: db, ttl: 7 * 24 * 60 * 60})
    // ttl: 7 days * 24 hours * 60 minutes * 60 seconds
}));


// ----->> START APIS <<----- //

app.post("/user/resetFrizz", userApis.POST_resetFrizz);

app.post('/user/submitFreeResponse', userApis.POST_submitFreeResponse);
app.post('/user/startPositionEval', userApis.POST_startPositionEval);
app.post('/user/startPsychEval', userApis.POST_startPsychEval);
app.post('/user/answerPsychQuestion', userApis.POST_answerPsychQuestion);
app.post('/user/signOut', userApis.POST_signOut);
app.post("/user/keepMeLoggedIn", userApis.POST_keepMeLoggedIn);
app.get("/user/keepMeLoggedIn", userApis.GET_keepMeLoggedIn);
app.get('/user/session', userApis.GET_session);
app.post('/user/session', userApis.POST_session);
app.post('/user/verifyEmail', userApis.POST_verifyEmail);
app.post('/user/changePasswordForgot', userApis.POST_changePasswordForgot);
app.post('/user/login', userApis.POST_login);
app.get('/user/userByProfileUrl', userApis.GET_userByProfileUrl);
app.post('/user/changePassword', userApis.POST_changePassword);
app.post('/user/forgotPassword', userApis.POST_forgotPassword);
app.post('/user/changeSettings', userApis.POST_changeSettings);
app.post('/user/unsubscribeEmail', miscApis.POST_unsubscribeEmail);

app.post('/candidate/candidate', candidateApis.POST_candidate);
app.post("/candidate/endOnboarding", candidateApis.POST_endOnboarding);
app.post('/candidate/sendVerificationEmail', candidateApis.POST_sendVerificationEmail);
app.post("/candidate/updateAllOnboarding", candidateApis.POST_updateAllOnboarding);
app.post('/candidate/comingSoonEmail', candidateApis.POST_comingSoonEmail);
app.post("/candidate/addPathway", candidateApis.POST_addPathway);
app.post('/candidate/completePathway', candidateApis.POST_completePathway);
app.post("/candidate/updateAnswer", candidateApis.POST_updateAnswer);
app.post("/candidate/currentPathwayStep", userApis.POST_currentPathwayStep);

app.post('/business/forBusinessEmail', businessApis.POST_forBusinessEmail);
app.post('/business/demoEmail', businessApis.POST_demoEmail);
app.post('/business/contactUsEmail', businessApis.POST_contactUsEmail);
app.post("/business/updateHiringStage", businessApis.POST_updateHiringStage);
app.post("/business/answerQuestion", businessApis.POST_answerQuestion);
app.get("/business/pathways", businessApis.GET_pathways);
app.get("/business/candidateSearch", businessApis.GET_candidateSearch);
app.get("/business/employees", businessApis.GET_employees);
app.get("/business/positions", businessApis.GET_positions);

app.post("/admin/alertLinkClicked", adminApis.POST_alertLinkClicked);
app.post("/admin/business", adminApis.POST_business);
app.get("/admin/info", adminApis.GET_info);
app.get("/admin/candidateResponses", adminApis.GET_candidateResponses);

app.get('/pathway/link', pathwayApis.GET_link);
app.get('/pathway/article', pathwayApis.GET_article);
app.get('/pathway/info', pathwayApis.GET_info);
app.get('/pathway/quiz', pathwayApis.GET_quiz);
app.get('/pathway/video', pathwayApis.GET_video);
app.get('/pathway/pathwayByIdNoContent', pathwayApis.GET_pathwayByIdNoContent);
app.get('/pathway/pathwayByPathwayUrlNoContent', pathwayApis.GET_pathwayByPathwayUrlNoContent);
app.get('/pathway/pathwayByPathwayUrl', pathwayApis.GET_pathwayByPathwayUrl);
app.get('/pathway/search', pathwayApis.GET_search);
app.get("/pathway/allCompaniesAndCategories", pathwayApis.GET_allCompaniesAndCategories);
app.get('/pathway/topPathways', pathwayApis.GET_topPathways);

app.post('/employer/newEmployer', employerApis.POST_newEmployer);
app.post('/employer/sendVerificationEmail', employerApis.POST_sendVerificationEmail);
app.post('/employer/changeTempPassword', employerApis.POST_changeTempPassword);

//app.get('/skill/skillByUrl', skillApis.GET_skillByUrl);
app.post('/skill/answerSkillQuestion', skillApis.POST_answerSkillQuestion);
app.post('/skill/startOrContinueTest', skillApis.POST_startOrContinueTest);

app.post('/misc/createReferralCode', miscApis.POST_createReferralCode);
app.post("/misc/resumeScorer/uploadResume", miscApis.POST_resumeScorer_uploadResume);


// ----->> END APIs <<----- //


// print all users from a specific pathway
// nwm: "5a80b3cf734d1d0d42e9fcad"
// sw: "5a88b4b8734d1d041bb6b386"

// printUsersFromPathway("5a88b4b8734d1d041bb6b386");

app.listen(3001, function (err) {
    if (err) {
        return console.log(err);
    }
})
