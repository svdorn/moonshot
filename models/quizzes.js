"use strict"
var mongoose = require('mongoose');

var quizzesSchema = mongoose.Schema({
    // if it can be marked right or wrong
    hasCorrectAnswers: Boolean,
    // an array because there could be multiple correct answers
    correctAnswerNumber: [ Number ],
    // if you need to have given all the correct answers or just one
    needAllCorrect: Boolean,
    // if you want to allow a custom, user-inputted answer or not
    allowCustomAnswer: Boolean,
    // "slider", "multipleChoice", "freeResponse", "twoOptions", "multiSelect"
    questionType: String,
    // an array of parts of the question, e.g. first part is blue text, second part is a list, etc...
    question: [{
        // the type of this part of the question, e.g. "ul" or "ol" or "text" or "image"
        partType: String,
        // className of part
        className: String,
        // include the classes that question parts default to having
        includeDefaultClasses: Boolean,
        // the content of the part; if content is just text, array will be length 1
        content: [String],
        // text that will show up if this question part is a link (optional)
        linkText: String,
        // if the question part is a link, should the link open a new tab? (optional, defaults to true)
        newTab: Boolean,
        // if you should put a break after the part
        shouldBreak: Boolean
    }],
    // options for slider questions only
    sliderOptions: {
        // min and max values the slider can be at
        minValue: Number,
        maxValue: Number,
        // smallest amount the slider can advance by; if undefined, no limit to step smallness
        step: Number
    },
    multipleChoiceAnswers: [{
        // the content of the answer, e.g. "Rainbow Dash"
        body: String,
        // the number of the answer, not necessarily the order
        answerNumber: Number,
    }],
    multiSelectAnswers: [{
        // the content of the answer, e.g. "Rainbow Dash"
        body: String,
        // the number of the answer, not necessarily the order
        answerNumber: Number,
    }],
    // the value for a date question
    dateValue: Date
});

var Quizzes = mongoose.model('Quizzes', quizzesSchema);
module.exports = Quizzes;
