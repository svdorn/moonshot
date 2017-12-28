"use strict"
var mongoose = require('mongoose');

var pathwaysSchema = mongoose.Schema({
  name: String,
  previewImage: String,
  sponsor: { name: String, logo: String },
  estimatedCompletionTime: String,
  deadline: Date,
  price: String,
  comments: [{ username: String, body: String, date: Date }],
  ratings: [{ username: String, rating: Number }],
  avgRating: Number,
  tags: [ String ],
  steps: [{
      order: Number,
      name: String,
      type: String,
      video: {
          name: String,
          link: String
      },
      article: {
          name: String,
          link: String
      },
      quiz: {
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
      },
      comments: [{ username: String, body: String, date: Date }],
      projects: [{
          name: String,
          description: String,
          difficulty: String,
          estimatedTime: String
      }]
  }]
});

var Pathways = mongoose.model('Pathways', pathwaysSchema);
module.exports = Pathways;
