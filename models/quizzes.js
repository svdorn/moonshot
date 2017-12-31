"use strict"
var mongoose = require('mongoose');

var quizzesSchema = mongoose.Schema({
    name: String,
    // if true, order of questions is ignored and all are randomized
    random: Boolean,
    numQuestions: Number,
    questions: [{
        order: Number,
        // quiz should be different each time, so there are multiple
        // questions at each question number
        options: [{
          body: String,
          answers: [{
              body: String,
              correct: Boolean
          }],
          multipleCorrect: Boolean,
          needAllCorrect: Boolean
        }]
    }]
});

var Quizzes = mongoose.model('Quizzes', quizzesSchema);
module.exports = Quizzes;
