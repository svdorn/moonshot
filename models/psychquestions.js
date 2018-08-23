"use strict"
var mongoose = require('mongoose');

var psychquestionsSchema = mongoose.Schema({
    // the factor this question belongs in
    factorId: mongoose.Schema.Types.ObjectId,
    // the name of the factor this question is in
    factorName: String,
    // the facet this question belongs in
    facetId: mongoose.Schema.Types.ObjectId,
    // the name of the facet this question is in
    facetName: String,
    // the text of the question
    body: String,
    // the response on the left that the user can drag to
    leftOption: String,
    // the response on the right
    rightOption: String,
    // optional; indicates that sliding left means 5 and sliding right means -5
    invertScore: Boolean
});

var Psychquestions = mongoose.model('Psychquestions', psychquestionsSchema);
module.exports = Psychquestions;
