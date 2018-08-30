"use strict"
var mongoose = require('mongoose');

var cognitiveSchema = mongoose.Schema({
    // difficulty levels of questions that test knowledge of this skill
    levels: [{
        // difficulty level of these questions
        levelNumber: Number,
        // the questions that are all around the same level of difficulty
        questions: [{
            // the question that is displayed
            body: [{
                // the type of this part of the question, e.g. "ul" or "ol" or "text" or "image"
                partType: String,
                // className of part
                className: String,
                // include the classes that question parts default to having
                includeDefaultClasses: Boolean,
                // the content of the part; if content is just text, array will be length 1
                content: [ String ],
                // text that will show up if this question part is a link (optional)
                linkText: String,
                // if the question part is a link, should the link open a new tab? (optional, defaults to true)
                newTab: Boolean,
                // alt text for the image if the part is an image
                altTag: String,
                // if you should put a break after the part
                shouldBreak: Boolean
            }],
            // the answers that can be chosen
            options: [{
                // the text of the image link. for now only doing multiple choice questions
                // with text-only answers
                img: String,
                // whether this answer is the correct one
                isCorrect: Boolean,
            }]
        }]
    }]
});

var Cognitive = mongoose.model('Cognitive', cognitiveSchema);
module.exports = Cognitive;
