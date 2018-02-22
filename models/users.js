"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    name: String,
    email: String,
    emailToContact: String,
    phoneNumber: String,
    userType: String,
    profileUrl: String,
    password: String,
    hasFinishedOnboarding: Boolean,
    verificationToken: String,
    emailVerificationToken: String,
    passwordToken: String,
    time: Number,
    verified: Boolean,
    images: String,
    skills: [ String ],
    info: {
        title: String,
        location: String,
        willRelocateTo: String,
        bio: String,
        desiredJobs: String,
        inSchool: Boolean,
        education: [{
            school: String,
            majors: String,
            minors: String,
            degree: String,
            startDate: String,
            endDate: String
        }],
        interests: [ String ],
        birthDate: Date,
        links: [{
            url: String,
            displayString: String
        }],
        goals: [ String ],
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
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            step: Number,
            subStep: Number
        },
        complete: Boolean
    }],
    // pathways the user has finished
    completedPathways: [{
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
