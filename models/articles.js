"use strict"
var mongoose = require('mongoose');

var articlesSchema = mongoose.Schema({
    link: String
});

var Articles = mongoose.model('Articles', articlesSchema);
module.exports = Articles;
