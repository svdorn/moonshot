"use strict"
var mongoose = require('mongoose');

var pathwayCategoriesSchema = mongoose.Schema({
    name: String,
    pathwayIDs: [{ $oid: String }]
    image: String
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var PathwayCategories = mongoose.model('PathwayCategories', pathwayCategoriesSchema);
module.exports = PathwayCategories;
