"use strict"
var mongoose = require('mongoose');

var businessesSchema = mongoose.Schema({
    name: String,
    pathwayIds: [ mongoose.Schema.Types.ObjectId ]
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Businesses = mongoose.model('Businesses', businessesSchema);
module.exports = Businesses;
