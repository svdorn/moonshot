"use strict"
var mongoose = require('mongoose');

var unsubscribedEmailsSchema = mongoose.Schema({
    // the email address that was unsubscribed
    email: String,
    // the date the user unsubscribed
    dateUnsubscribed: Date
});

var UnsubscribedEmails = mongoose.model('Unsubscribedemails', unsubscribedEmailsSchema);
module.exports = UnsubscribedEmails;
