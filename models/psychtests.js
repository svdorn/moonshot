"use strict"
var mongoose = require('mongoose');

var psychtestsSchema = mongoose.Schema({
    // the overarching factors we are testing for
    factors: [{
        // the name of the factor ("Honesty-Humility, Emotionality, Extraversion...")
        name: String,
        // the facets make up the factors
        facets: [{
            // how important the facet is in calculating factor scores
            weight: Number,
            // name of the facet
            name: String,
            // questions that can be asked for this facet
            questions: [{
                // the text of the question
                body: String,
                // optional; indicates that sliding left means 5 and sliding right means -5
                invertScore: Boolean
            }]
        }]
    }]
});

var Psychtests = mongoose.model('Psychtests', psychtestsSchema);
module.exports = Psychtests;
