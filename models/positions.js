"use strict"
var mongoose = require('mongoose');

var positionsSchema = mongoose.Schema({
    // the name of the position
    name: String,
    // the company offering the position
    companyId: mongoose.Schema.Types.ObjectId,
    // the candidates that have applied for the position
    candidateIds: [ mongoose.Schema.Types.ObjectId ],
    // the skills that are required to apply for the position
    skills: [ mongoose.Schema.Types.ObjectId ],
    // questions that are asked for this position specifically
    questions: [{
        
    }]
});

var Positions = mongoose.model('Positions', potisionsSchema);
module.exports = Positions;
