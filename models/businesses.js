"use strict"
var mongoose = require('mongoose');

var businessesSchema = mongoose.Schema({
    name: String,
    pathwayIds: [ mongoose.Schema.Types.ObjectId ],
    employerIds: [ mongoose.Schema.Types.ObjectId ],


    // ---->>> POST-PIVOT <<<---- //

    // the positions that the company is (or was) hiring for
    positions: [{
        // NOT MONGO ID, just an id we make to identify the positions WITHIN companies
        positionId: Number,
        // name of the position (such as "Machine Learning Developer")
        name: String,
        // if the position should be listed as one that candidates can apply for
        currentlyHiring: Boolean,
        // the skill tests a candidate must complete in order to apply
        skills: [ mongoose.Schema.Types.ObjectId ],
        // company- and position-specific questions, shown on responses page
        freeResponseQuestions: [{
            // the text of the question (e.g. "Why do you want to work here?")
            body: String,
            // the id of the question (not a mongo id, just made by a counter)
            questionId: Number,
            // if you have to answer this question to finish applying
            required: Boolean
        }],
        // candidates who have applied for this position
        candidateIds: [ mongoose.Schema.Types.ObjectId ]
    }],

    // ---->>> END POST-PIVOT <<<---- //


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
