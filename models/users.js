"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    name: String,
    email: String,
    username: String,
    userType: String,
    password: String,
    verificationToken: String,
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
        links: {
            linkedIn: String,
            gitHub: String,
            personal: String
        },
        education: [{
            school: String,
            degree: String,
            startDate: Date,
            endDate: Date
        }],
        interests: [ String ],
        birthDate: Date,
        links: [{
            url: String,
            displayString: String
        }],
        goals: [String],
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
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
