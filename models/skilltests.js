"use strict"
var mongoose = require('mongoose');

var skilltestsSchema = mongoose.Schema({
    // skill name
    name: String,
    // questions that can be asked in the skill test
    questions: [{
        // specific area within the skill that the question tests
        subSkills: [String],
        // how hard this question is compared to the others, can be altered by ML
        difficulty: Number,
        // the actual question
        body: String,
        // the potential answers of the question
        answers: [{
            body: String
            // will be changed a lot to accomodate different types of answers ad questions
        }]
    }]
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Skilltests = mongoose.model('Skilltests', skilltestsSchema);
module.exports = Skilltests;
