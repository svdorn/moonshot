"use strict"
var mongoose = require('mongoose');

var psychtestsSchema = mongoose.Schema({
    // the overarching factors we are testing for
    factors: [{
        // the name of the factor ("Honesty-Humility, Emotionality, Extraversion...")
        name: String,
        // statistics about results for this factor
        stats: {
            // the median score for this factor
            median: Number,
            // the scores that the middle 80% of people get
            middle80: {
                // what the person farthest negative in the 80% got
                miminum: Number,
                // what the person farthest positive in the 80% got
                maximum: Number
            },
        },
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
                // the response on the left that the user can drag to
                leftOption: String,
                // the response on the right
                rightOption: String,
                // optional; indicates that sliding left means 5 and sliding right means -5
                invertScore: Boolean
            }]
        }]
    }]
});

var Psychtests = mongoose.model('Psychtests', psychtestsSchema);
module.exports = Psychtests;
