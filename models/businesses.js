"use strict"
var mongoose = require('mongoose');

var businessesSchema = mongoose.Schema({
    name: String,
    pathwayIds: [ mongoose.Schema.Types.ObjectId ],
    employerIds: [ mongoose.Schema.Types.ObjectId ],
    employeeIds: [ mongoose.Schema.Types.ObjectId ],

    // ---->>> POST-PIVOT <<<---- //

    employees: [{
        employeeId: mongoose.Schema.Types.ObjectId,
        // id of the manager that rated this employee
        managerId: mongoose.Schema.Types.ObjectId,
        // employee's name
        name: String,
        // position that the employee is associated with
        position: mongoose.Schema.Types.ObjectId,
        // whether someone has graded this employee
        gradingComplete: Boolean,
        // the questions that will be asked of the
        answers: [{
            // question has been answered
            complete: Boolean,
            // what the mangager rated the employee (if this was a range question)
            score: Number,
            // the index within the option array of the option that was chosen
            // (if this was a multiple choice question)
            selectedIndex: Number,
            // index of the question within employeeQuestions
            questionIndex: Number
        }],
        // the employee's url to see their results
        employeeUrl: String
    }],

    // the questions that managers have to answer about each employee
    employeeQuestions: [{
        // the text of the question
        questionBody: String,
        // could be 'multipleChoice' OR 'range'
        questionType: String,
        range: {
            // low end of the scale
            lowRange: Number,
            // high end of the scale
            highRange: Number,
        },
        multipleChoice: {
            options: [{
                // the text of the option
                body: String
            }],
        }
    }],

    // the positions that the company is (or was) hiring for
    positions: [{
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
