"use strict"
const mongoose = require('mongoose');

const positionSchema = mongoose.Schema({
    // name of the position (such as "Machine Learning Developer")
    name: String,
    // if the position evaluation is ready to be taken
    finalized: Boolean,
    // a list of emails of candidates who need to be sent an invite email once
    // position is finalized
    preFinalizedCandidates: [ String ],
    // same deal for employees
    preFinalizedEmployees: [ String ],
    // the date the position was created (but not necessarily finalized)
    dateCreated: Date,
    // the date the position was finalized and opened up to be taken
    dateFinalized: Date,
    // whether the position can be applied to by anyone or if they need a unique
    // one time code
    open: Boolean,
    // if the position should be listed as one that candidates can apply for
    currentlyHiring: Boolean,
    // which of the 5 functions the position falls under
    positionType: String,
    // the skill tests a candidate must complete in order to apply
    skills: [ mongoose.Schema.Types.ObjectId ],
    // the names of the skills the candidates must complete in order to apply
    skillNames: [ String ],
    // company- and position-specific questions, shown on responses page
    freeResponseQuestions: [{
        // the text of the question (e.g. "Why do you want to work here?")
        body: String,
        // if you have to answer this question to finish applying
        required: Boolean
    }],
    // whether employees should be asked the above free response questions
    employeesGetFrqs: Boolean,
    // how long the position test is projected to take
    length: Number,
    // the number of days that the position is designated to be open
    timeAllotted: Number,
    // the ideal scores for each facet within each factor to get the maximum pq
    idealFactors: [{
        // the id of the factor
        factorId: mongoose.Schema.Types.ObjectId,
        // the weight of the factors
        weight: Number,
        // all ideal facet scores
        idealFacets: [{
            // id of the facet
            facetId: mongoose.Schema.Types.ObjectId,
            // the optimal facet score for this position
            score: Number
        }]
    }],
    // maximum growth score allowed (default is 190)
    maxGrowth: Number,
    // the factors and facets that contribute to the growth prediction
    growthFactors: [{
        // id of the factor involved in growth
        factorId: mongoose.Schema.Types.ObjectId,
        // the weight of the factors
        weight: Number,
        // ideal facet scores for growth
        idealFacets: [{
            // id of the facet to score
            facetId: mongoose.Schema.Types.ObjectId,
            // best score for growth for this facet in this position
            score: Number
        }]
    }],
    // if the position is calculating for longevity
    longevityActive: Boolean,
    // the factors and facets that contribute to the longevity prediction
    longevityFactors: [{
        // id of the factor involved in longevity
        factorId: mongoose.Schema.Types.ObjectId,
        // ideal facet scores for longevity
        idealFacets: [{
            // id of the facet to score
            facetId: mongoose.Schema.Types.ObjectId,
            // best score for longevity for this facet in this position
            score: Number
        }]
    }]
})


const businessesSchema = mongoose.Schema({
    // company name
    name: String,
    // logo image name within /images/logos/
    logo: String,
    // the exact time the business object was created
    dateCreated: Date,
    // if they've set up their billing
    billingCustomerId: String,

    emailNotifications: {
        time: String,
        numCandidates: Number,
        lastSent: Date
    },
    // the key the business will use to post to moonshot webhooks - must be kept
    // a secret by the business
    API_Key: String,
    // the id on Intercom
    intercomId: String,
    // the positions that the company is (or was) hiring for
    positions: [ positionSchema ],

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
            highRange: Number
        },
        multipleChoice: {
            options: [{
                // the text of the option
                body: String
            }]
        }
    }]
});

var Businesses = mongoose.model('Businesses', businessesSchema);
module.exports = Businesses;
