"use strict"
var mongoose = require('mongoose');

var businessesSchema = mongoose.Schema({
    name: String,
    pathwayIds: [ mongoose.Schema.Types.ObjectId ],
    businessUserIds: [ mongoose.Schema.Types.ObjectId ],
    // the candidates that have completed a pathway from this company
    candidates: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        pathways: [{
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            hiringStage: String
        }]
    }]
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Businesses = mongoose.model('Businesses', businessesSchema);
module.exports = Businesses;
