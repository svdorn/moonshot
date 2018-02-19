"use strict"
var mongoose = require('mongoose');

var emailaddressesSchema = mongoose.Schema({
    // an array of emails of this type
    emails: [String],
    // the name of this category of emails, e.g. "optedOut"
    name: String
});

var Emailaddresses = mongoose.model('Emailaddresses', emailaddressesSchema);
module.exports = Emailaddresses;
