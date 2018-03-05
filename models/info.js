"use strict"
var mongoose = require('mongoose');

var infoSchema = mongoose.Schema({
    // an array of parts of the info, e.g. first part is blue text, second part is a list, etc...
    contentParts: [{
        // the type of this part of the info, e.g. "ul" or "ol" or "text" or "image"
        partType: String,
        // className of part
        className: String,
        // include the classes that info parts default to having
        includeDefaultClasses: Boolean,
        // the content of the part; if content is just text, array will be length 1
        content: [String],
        // if you should put a break after the part
        shouldBreak: Boolean
    }]
});

var Info = mongoose.model('Info', infoSchema);
module.exports = Info;
