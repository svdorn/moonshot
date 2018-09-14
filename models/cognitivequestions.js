"use strict"
var mongoose = require('mongoose');

var cognitiveQuestionsSchema = mongoose.Schema({
    // the matrix image that is displayed
    rpm: String,
    // the answers that can be chosen
    options: [{
        // the image link for the option
        src: String,
        // whether this answer is the correct one
        isCorrect: Boolean
    }],
    // how difficult the question is - if a person had this score, they would
    // have a 50% chance of getting the question right
    difficulty: Number,
    // how good this rpm is at estimating someone's gca; higher is better, at
    // infinity it means everyone with a gca above the difficulty will get the
    // question right and everyone below will get it wrong, at 0 it meanas
    // everyone has the same chance of getting the question right
    discrimination: Number,
    // the chance that a user will get the question right just by guessing;
    // if our questions and incorrect options are good, this should be .125
    guessChance: Number
});

var Cognitivequestions = mongoose.model('Cognitivequestions', cognitiveQuestionsSchema);
module.exports = Cognitivequestions;
