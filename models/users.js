"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    name: String,
    email: String,
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
    pathways: [{
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            step: Number,
            subStep: Number
        },
    }],
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
                "correct": true
            }
        }
    */
    answers: mongoose.Schema.Types.Mixed
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
