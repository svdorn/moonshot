"use strict"
var mongoose = require('mongoose');

var adminquestionsSchema = mongoose.Schema({
    // questions about the demographics of the user
    demographics: [{
        // can be multipleChoice or slider
        questionType: String,
        // what the question is asking
        questionText: String,
        // only applies to slider questions - the minimum value of the slider
        sliderMin: Number,
        // maximum value displayed on the slider
        sliderMax: Number,
        // only applies to multiple choice questions - answer value options
        // needs to be an object array so the objects will have ids
        options: [{
            // the text of the option
            body: String,
        }],
        // which candidate types have to answer this question
        requiredFor: [ String ]
    }],
    // questions asking user to self-rate aspects of job performance
    selfRating: [{
        // can be multiple choice or slider
        questionType: String,
        // what the question is asking
        questionText: String,
        // only applies to slider questions - the minimum value of the slider
        sliderMin: Number,
        // maximum value displayed on the slider
        sliderMax: Number,
        // only applies to multiple choice questions - answer value options
        options: [{
            // the text of the option
            body: String,
            // the id of the question - the user stores this when they answer a question
            _id: mongoose.Schema.Types.ObjectId
        }],
        // which candidate types have to answer this question
        requiredFor: [ String ]
    }]
});

const Adminquestions = mongoose.model('Adminquestions', adminquestionsSchema);
module.exports = Adminquestions;
