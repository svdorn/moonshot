"use strict"
var mongoose = require('mongoose');

var businessesSchema = mongoose.Schema({
    name: String,
    pathwayIds: [ mongoose.Schema.Types.ObjectId ],
    employerIds: [ mongoose.Schema.Types.ObjectId ],
    // the candidates that have completed a pathway from this company
    candidates: [{
        userId: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        location: String,
        // the psychometric personality type
        archetype: String,
        pathways: [{
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            hiringStage: String,
            isDismissed: Boolean,
            completionStatus: String,
            hiringStageEdited: Date,
            // overall recommendation for hire
            overallScore: Number,
            // how well the candidate will probably do in the position
            predicted: Number,
            // how good the candidate is at the skills required for the position
            skill: Number
        }]
    }]
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Businesses = mongoose.model('Businesses', businessesSchema);
module.exports = Businesses;
