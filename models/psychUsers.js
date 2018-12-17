"use strict";
const mongoose = require("mongoose");
const psychUsersSchema = mongoose.Schema({
    verificationToken: String,
    // there are various terms that can be agreed to, depending on the user type
    termsAndConditions: [
        {
            // the name of the terms [e.g. Privacy Policy, Terms of Use, etc...]
            name: String,
            // whether the user agreed to the terms
            agreed: Boolean,
            // the most recent date the terms were agreed to
            date: Date
        }
    ],
    // the user's psychometric test answers and results
    psychometricTest: {
        // whether the user is currently taking the test
        inProgress: Boolean,
        // the date and time the user took the test
        startDate: Date,
        // the date and time the user finished the test
        endDate: Date,
        // how long it took overall in milliseconds to finish the test (difference between endDate and startDate)
        totalTime: Number,
        // whether the user is allowed to get rephrases for questions
        rephrase: Boolean,
        // how many times the user can rephrase a question
        numRephrasesAllowed: Number,
        // determines how long the test will be
        questionsPerFacet: Number,
        // array positions of factors that have not yet been completed
        // for example, if factors in array positions 0 and 4 were complete,
        // the array would look like [ 1, 2, 3, 5, 6 ]
        incompleteFactors: [Number],
        // how many questions in total in the test the user has answered
        numQuestionsAnswered: Number,
        // current question that the user is on
        currentQuestion: {
            // the index of the factor within the user's factors array
            factorIndex: Number,
            // the id of the factor in the test db
            factorId: mongoose.Schema.Types.ObjectId,
            // the index of the facet within the user's factors array
            facetIndex: Number,
            // the id of the factor in the test db
            facetId: mongoose.Schema.Types.ObjectId,
            // the id of the question being asked
            questionId: mongoose.Schema.Types.ObjectId,
            // if this is the third question from this facet, responseIndex will be 2
            responseIndex: Number,
            // the text of the question
            body: String,
            // the left option as a response to the question
            leftOption: String,
            // the right response
            rightOption: String,
            // if the score should be inverted after answering
            invertScore: Boolean
        },
        // the overall factors the questions test for
        factors: [
            {
                // id for the factor
                factorId: mongoose.Schema.Types.ObjectId,
                // name of the factor ("Honesty-Humility, Emotionality, Extraversion...")
                // at the time the user took the test
                name: String,
                // the factor score (-5 to 5), calculated from the facet scores
                score: Number,
                // the array positions of facets that have not yet been completed
                // similar to incompleteFactors above
                incompleteFacets: [Number],
                // the facets we're testing for
                facets: [
                    {
                        // the facet score (-5 to 5), calculated after the test is done
                        score: Number,
                        // the psych users answer as to whether the description describes them
                        describesMe: String,
                        // the weight that was used for this facet in calculating the
                        // user's factor scores
                        weight: Number,
                        // unique facet identifier
                        facetId: mongoose.Schema.Types.ObjectId,
                        // name of the facet at the time the user completed the test
                        name: String,
                        // questions that have already been used for this facet
                        usedQuestions: [mongoose.Schema.Types.ObjectId],
                        // the responses users had to facet questions
                        responses: [
                            {
                                // the question id of the question that was actually answered
                                answeredId: mongoose.Schema.Types.ObjectId,
                                // whether the answer for this question should be flipped (e.g. 3 => -3)
                                invertScore: Boolean,
                                // the answer (-5 to 5) that the user chose
                                answer: Number,
                                // exact date/time the user started the first phrasing of this question
                                startDate: Date,
                                // exact date/time the user answered the question
                                endDate: Date,
                                // total time in milliseconds it took to answer the question
                                totalTime: Number,
                                // the moonshot-generated ids of questions that were skipped
                                // when this question was being asked
                                skips: [
                                    {
                                        // the time the skip button was pressed
                                        skipDate: Date,
                                        // the time the user spent on this version of the question
                                        // before asking for a rephrase (in milliseconds)
                                        skipTime: Number,
                                        // the id of the question that was skipped
                                        questionId: mongoose.Schema.Types.ObjectId
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
});
var PsychUsers = mongoose.model("PsychUsers", psychUsersSchema);
module.exports = PsychUsers;
