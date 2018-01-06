"use strict"
var mongoose = require('mongoose');

var pathwaysSchema = mongoose.Schema({
  name: String,
  previewImage: String,
  sponsor: {
      name: String,
      logo: String,
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
  estimatedCompletionTime: String,
  deadline: Date,
  price: String,
  comments: [{ username: String, body: String, date: Date }],
  ratings: [{ username: String, rating: Number }],
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
          comments: [{ username: String, body: String, date: Date }]
      }]
  }]
});

var Pathways = mongoose.model('Pathways', pathwaysSchema);
module.exports = Pathways;
