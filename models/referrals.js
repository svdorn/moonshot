"use strict"
var mongoose = require('mongoose');

var referralsSchema = mongoose.Schema({
    name: String,
    email: String,
    referralCode: String
});

var Referrals = mongoose.model('Referrals', referralsSchema);
module.exports = Referrals;
