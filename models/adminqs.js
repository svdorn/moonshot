"use strict"
var mongoose = require('mongoose');

var adminqsSchema = mongoose.Schema({
    // can be multipleChoice or slider or multipleChoiceAndCustom or originCountry
    questionType: String,
    // what the question is asking
    text: String,
    // only applies to slider questions - the minimum value of the slider
    sliderMin: Number,
    // maximum value displayed on the slider
    sliderMax: Number,
    // only applies to multiple choice questions - answer value options
    // needs to be an object array so the objects will have ids
    options: [{
        // the text of the option
        body: String,
        // whether a text box should be included that can be typed into
        includeInputArea: Boolean,
        // the id of the question - the user stores this when they answer a question
        _id: mongoose.Schema.ObjectId
    }],
    // which candidate types have to answer this question
    requiredFor: [ String ]
});

const Adminqs = mongoose.model('Adminqs', adminqsSchema);
module.exports = Adminqs;
