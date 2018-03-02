"use strict"
var mongoose = require('mongoose');

var pathwaysSchema = mongoose.Schema({
  name: String,
  pathwayContentDisplayName: String,
  previewImage: String,
  comingSoon: Boolean,
  showToUsers: Boolean,
  url: String,
  sponsor: {
      name: String,
      logo: String,
      logoForLightBackground: String,
      description: String,
      hiring: String,
      homepage: String,
      blog: String,
      demo: String,
      quote: {
          body: String,
          speakerImage: String,
          speakerName: String,
          speakerTitle: String
      }
  },
  // how long we estimate it will take for the student to complete the pathway
  estimatedCompletionTime: String,
  // when the student must complete the pathway by
  deadline: Date,
  // price to the student, will probably always be free
  price: String,
  // whether we should show the box that has overview, comments, and exercise files
  showOverviewAndCommentBox: Boolean,
  // comments on the pathway
  comments: [{ email: String, body: String, date: Date }],
  // ratings on the pathway from one to five
  ratings: [{ email: String, rating: Number }],
  // average of all the ratings, should be a number 1-5
  avgRating: Number,
  tags: [ String ],
  industry: { averageSalary: String, title: String },
  extraInfo: String,
  projects: [{
      name: String,
      description: String,
      difficulty: String,
      estimatedTime: String
  }],
  steps: [{
      name: String,
      order: Number,
      subSteps: [{
          order: Number,
          superStepOrder: Number,
          name: String,
          contentType: String,
          contentID: mongoose.Schema.Types.ObjectId,
          comments: [{ email: String, body: String, date: Date }]
      }]
  }]
});

var Pathways = mongoose.model('Pathways', pathwaysSchema);
module.exports = Pathways;
