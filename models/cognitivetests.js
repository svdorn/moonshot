"use strict"
var mongoose = require('mongoose');

var cognitiveSchema = mongoose.Schema({
    // difficulty levels of questions that test knowledge of this skill
    levels: [{
        // difficulty level of these questions
        levelNumber: Number,
        // the questions that are all around the same level of difficulty
        questions: [{
            // the img that is displayed
            rpm: String,
            // the answers that can be chosen
            options: [{
                // the text of the image link. for now only doing multiple choice questions
                // with text-only answers
                body: String,
                // whether this answer is the correct one
                isCorrect: Boolean,
            }]
        }]
    }]
});

var Cognitivetests = mongoose.model('Cognitivetests', cognitiveSchema);
module.exports = Cognitivetests;
