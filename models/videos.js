"use strict"
var mongoose = require('mongoose');

var videosSchema = mongoose.Schema({
    link: String,
    name: String,
});

var Videos = mongoose.model('Videos', videosSchema);
module.exports = Videos;
