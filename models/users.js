"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    // user's full name
    name: String,
    // user's email address, used for sign in
    email: String,
    // email address that companies should use to contact this person
    emailToContact: String,
    // phone number for companies to contact this person with
    phoneNumber: String,
    // should always be "user" (for businessUsers, this will be "businessUser")
    userType: String,
    // has admin rights on the site, able to create business accounts and see all results
    admin: Boolean,
    // agreed to privacy policy and terms of use
    agreedToTerms: Boolean,
    // special url used to access this user's profile
    profileUrl: String,
    // password to log in
    password: String,
    // the exact time the user created their account
    dateSignedUp: Date,
    // code given to a user that was used on sign up, was in the url the user initially got to the site through
    signUpReferralCode: String,
    // if false, should route user to onboarding on login
    hasFinishedOnboarding: Boolean,
    // used to verify identity
    verificationToken: String,
    // sent to user's email address, used to user's account
    emailVerificationToken: String,
    // the code that this user initially got to the site with (will usually be empty)
    referredByCode: String,
    // token used to reset password
    passwordToken: String,
    // when the password token will no longer work
    passwordTokenExpirationTime: Number,
    // if the use has verified their account via email
    verified: Boolean,
    // if the user has uploaded a profile picture
    hasProfilePicture: Boolean,
    // last date the user updated their profile picture
    lastUpdatedProfilePicture: Date,
    // not actually used right now
    images: String,
    // list of skills the user has received from completing pathways
    skills: [ String ],
    // general info about the user, can be edited on onboarding or profile
    info: {
        // title of the job they want
        title: String,
        // where they currently reside
        location: String,
        // places they'd be ok with moving to for work
        willRelocateTo: String,
        // short description of self
        bio: String,
        // jobs the user is interested in
        desiredJobs: String,
        // true if the user has not yet finished school
        inSchool: Boolean,
        // degrees the user has received
        education: [{
            // where the degree comes from
            school: String,
            majors: String,
            minors: String,
            // type of degree (MD, BS, etc...)
            degree: String,
            // when the school was started
            startDate: String,
            // graduation date
            endDate: String
        }],
        // anything the user marked themselves as being interested in
        interests: [ String ],
        // user's date of birth
        birthDate: Date,
        // links to things like linkedIn, github
        links: [{
            // url for the link to get to the site
            url: String,
            // "LinkedIn" or "Github" or "Personal Site"
            displayString: String
        }],
        // things the user wants to accomplish on this site
        goals: [ String ],
        // languages the user speaks (not currently editable)
        languages: [ String ]
    },
    // the pathway that the user will be redirected to after onboarding
    // only exists if the user tries to sign up for a pathway before having
    // an account
    pathwayName: String,
    // location to redirect to after signing up
    redirect: String,
    // pathways the user is signed up for
    pathways: [{
        dateAdded: Date,
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            step: Number,
            subStep: Number
        },
        complete: Boolean
    }],
    // pathways the user has finished
    completedPathways: [{
        dateAdded: Date,
        dateCompleted: Date,
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            step: Number,
            subStep: Number
        },
    }],
    /*
        // --->> IMPORTANT: <<--- //
        // IN ORDER FOR MONGOOSE TO SAVE answers, MUST CALL   //
        // .markModified('answers') ON THE USER, FOR EXAMPLE: //
        //      user.answers["8uijhyuj"] = {...};             //
        //      user.markModified('answers');                 //
        //      user.save();                                  //
        to eliminate the need to search when getting answers, answers are all
        stored outside of the pathways that contain them
        answers object will look like:
        "answers": {
            "67890k3i339ik3i": {
                "answerType": "sliderValue",
                "value": "8"
                "correct": undefined //should be undefined if there is objectively correct answer
            },
            "[another quiz id]": {
                "answerType": "multipleChoice",
                "value": "3" //the answerValue of the chosen answer,
                "correct": true,
                "isCustomAnswer": false
            },
            "[another quiz id]": {
                "answerType": "multiSelect",
                "value": ["3", "5", "6"] //the answerValues of the chosen answers,
                "optionalCustomAnswer": "gymnastics"
            },
            "[another quiz id]": {
                "answerType": "freeResponseAndSliderOnSelect",
                "value": {
                    "4(answerNumber)": {
                        "skill": 6,
                        "answerText": "this is my answer about this thing"
                    }, ...
                }

            },
            "---another quiz id---": {
                "answerType": "datePicker",
                "dateValue": "1996-11-19T06:00:00.000Z"
            }
        }
    */
    answers: mongoose.Schema.Types.Mixed
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
