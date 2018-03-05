"use strict"
var mongoose = require('mongoose');

var videosSchema = mongoose.Schema({
    link: String,
    name: String,
    start: String,
    end: String,
    showAnnotations: Boolean
});

var Videos = mongoose.model('Videos', videosSchema);
module.exports = Videos;
