"use strict"
const mongoose = require('mongoose');

const signupcodesSchema = new Schema({
    // the actual code that is used in the url. should be 16 hex characters long
    code: String,
    // the business this code is for
    businessId: mongoose.Schema.Types.ObjectId,
    // the position this code is for
    positionId: mongoose.Schema.Types.ObjectId,
    // the time this code was created
    created: Date,
    // when this code expires and is no longer valid and should be deleted
    expires: Date
})

var Signupcodes = mongoose.model('Signupcodes', signupcodesSchema);
module.exports = Signupcodes;
