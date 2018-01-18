"use strict"
var mongoose = require('mongoose');

var linksSchema = mongoose.Schema({
    url: String,
    company: String,
    logo: String,
    instructions: String,
    name: String
});

var Links = mongoose.model('Links', linksSchema);
module.exports = Links;
