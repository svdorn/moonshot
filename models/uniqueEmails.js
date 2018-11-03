"use strict"
var mongoose = require('mongoose');

var uniqueEmailsSchema = mongoose.Schema({
    // the email address that was created uniquely
    email: String,
    // the date the email was created
    created: Date
});

var UniqueEmails = mongoose.model('Uniqueemails', uniqueEmailsSchema);
module.exports = UniqueEmails;
