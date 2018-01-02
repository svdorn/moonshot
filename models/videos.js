"use strict"
var mongoose = require('mongoose');

var videosSchema = mongoose.Schema({
    link: String,
});

var Videos = mongoose.model('Videos', videosSchema);
module.exports = Videos;
