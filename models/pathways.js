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
  projects: [{
      name: String,
      description: String,
      difficulty: String,
      estimatedTime: String
  }],
  steps: [{
      order: Number,
      name: String,
      contentType: String,
      contentID: mongoose.Schema.Types.ObjectId,
      comments: [{ username: String, body: String, date: Date }]
  }]
});

var Pathways = mongoose.model('Pathways', pathwaysSchema);
module.exports = Pathways;
