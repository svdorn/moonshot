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
    // "slider", "multipleChoice", "freeResponse", "twoOptions"
    questionType: String,
    // the body of the question, e.g. "Which pony has a cutie mark with a cloud and lightning bolt?"
    question: String,
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
        answerNumber: Number
    }],

    // IF WE WANT MULTIPLE QUESTIONS PER QUIZ
    // numQuestions: Number,
    // questions: [{
    //     order: Number,
    //     body: String,
    //     answers: [{
    //         // the number of the answer, not necessarily the order
    //         answerNumber: Number,
    //         body: String
    //     }]
    // }]

    // IF WE WANT QUIZZES WITH CORRECT ANSWERS
    // questions: [{
    //     order: Number,
    //     // quiz should be different each time, so there are multiple
    //     // questions at each question number
    //     options: [{
    //       body: String,
    //       answers: [{
    //           body: String,
    //           correct: Boolean
    //       }],
    //       multipleCorrect: Boolean,
    //       needAllCorrect: Boolean
    //     }]
    // }]
});

var Quizzes = mongoose.model('Quizzes', quizzesSchema);
module.exports = Quizzes;
