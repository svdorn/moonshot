"use strict"
var mongoose = require('mongoose');

var employersSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userType: String,
    company: {
        name: String,
        companyId: mongoose.Schema.Types.ObjectId
    },
    verificationToken: String,
    emailVerificationToken: String,
    passwordToken: String,
    time: Number,
    verified: Boolean,
    title: String
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Employers = mongoose.model('Employers', employersSchema);
module.exports = Employers;
