"use strict"
const mongoose = require('mongoose');

const mockusersSchema = mongoose.Schema({
    // mock user's full name
    name: String,
    // mock user's email address, used for log in
    email: String,
    // the day the mock user finished the eval
    endDate: Date,
    // the hiring stage of the candidate, which the company has determined
    // e.g. "Not Contacted", "Contacted", "Interviewing", "Hired"
    hiringStage: String,
    // if the candidate is no longer being considered for the role
    isDismissed: Boolean,
    // the gca score
    gca: Number,
    // the predictive scores the user got for the position
    scores: {
        // weighted combination of all the scores
        overall: Number,
        // average of skill iqs for all relevant skills
        skill: Number,
        // a summary of the four predictive scores
        predicted: Number,
        // how good of a culture fit the candidate has
        culture: Number,
        // how much the candidate could grow in the position
        growth: Number,
        // if the candidate would stay at the company for a long time
        longevity: Number,
        // how well the candidate would do at that specific position
        performance: Number
    },
    // the scores on the psych test
    psychScores: [{
        // the name of the facet
        name: String,
        // the score of the facet
        score: Number,
        // the stats of the facet
        stats: {
            // the median number people get right in the facet
            median: Number,
            // the range that 80% of people score in the facet
            middle80: {
                // the max number in the 80% range
                maximum: Number,
                // the min number in the 80% range
                minimum: Number
            }
        }
    }]
});

var Mockusers = mongoose.model('Mockusers', mockusersSchema);
module.exports = Mockusers;
