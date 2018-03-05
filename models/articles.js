"use strict"
var mongoose = require('mongoose');

var articlesSchema = mongoose.Schema({
    link: String,
    name: String,
    defaultDescription: Boolean,
    description: [{
        // the type of this part of the description, e.g. "ul" or "ol" or "text" or "image"
        partType: String,
        // className of part
        className: String,
        // include the classes that desciption parts default to having
        includeDefaultClasses: Boolean,
        // the content of the part; if content is just text, array will be length 1
        content: [String],
        // if you should put a break after the part
        shouldBreak: Boolean
    }],
    linkText: String,
    linkFunction: String
});

var Articles = mongoose.model('Articles', articlesSchema);
module.exports = Articles;
