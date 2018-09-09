"use strict"
var mongoose = require('mongoose');

// option that only applies to drop down questions
let DropDownOption = mongoose.Schema({
    // id of the option (in case we change the name of the option)
    _id: mongoose.Schema.ObjectId,
    // the option that can be selected (e.g. "Canada")
    body: String
});

// how to record drop down questions
let DropDown = mongoose.Schema({
    // the thing we're asking the user to pick a dropdown for (e.g. "Country")
    title: String,
    // the options to pick from
    options: [ DropDownOption ]
});

// make options recursive
DropDownOption.add({
    // if more specific info is needed (e.g. "State/Province")
    subDropDown: DropDown
})

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
    // the drop down options to include - only applies to dropdown questions
    dropDown: DropDown,
    // which candidate types have to answer this question
    requiredFor: [ String ]
});

const Adminqs = mongoose.model('Adminqs', adminqsSchema);
module.exports = Adminqs;
