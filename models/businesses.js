"use strict"
var mongoose = require('mongoose');

var businessesSchema = mongoose.Schema({
    name: String,
    pathwayIds: [ mongoose.Schema.Types.ObjectId ],
    employerIds: [ mongoose.Schema.Types.ObjectId ],


    // ---->>> POST-PIVOT <<<---- //

    // the positions that the company has availabilities for
    positionIds: [ mongoose.Schema.Types.ObjectId ],

    // ---->>> END POST-PIVOT <<<---- //


    // the candidates that have completed a pathway from this company
    candidates: [{
        userId: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        pathways: [{
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            hiringStage: String,
            isDismissed: Boolean,
            completionStatus: String,
            hiringStageEdited: Date
        }]
    }]
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Businesses = mongoose.model('Businesses', businessesSchema);
module.exports = Businesses;
