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
    pathways: [{
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            order: Number,
            superStepOrder: Number,
            name: String,
            contentType: String,
            contentID: mongoose.Schema.Types.ObjectId,
            comments: [{ username: String, body: String, date: Date }]
        },
    }],
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
