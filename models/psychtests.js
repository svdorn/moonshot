"use strict"
var mongoose = require('mongoose');

var psychtestsSchema = mongoose.Schema({
    // the overarching factors we are testing for
    factors: [{
        // the name of the factor ("Honesty-Humility, Emotionality, Extraversion...")
        name: String,
        // moonshot-generated id
        factorId: Number,
        // the facets make up the factors
        facets: [{
            // how important the facet is in calculating factor scores
            weight: Number,
            // moonshot-generated facet identifier
            facetId: String,
            // name of the facet
            name: String,
            // questions that can be asked for this facet
            questions: [{
                // the text of the question
                body: String,
                // moonshot-generated unique identifier
                questionId: String
            }]
        }]
    }]
});

var Psychtests = mongoose.model('Psychtests', pyschtestsSchema);
module.exports = Psychtests;
