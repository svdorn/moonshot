const Users = require('../models/users.js');

const { sanitize,
        frontEndUser
} = require('./helperFunctions.js');


const psychApis = {
    calculatePsychScores
}


// doesn't save the user
function calculatePsychScores(user) {
    // get the user's psych answers
    const psychTest = user.psychometricTest;

    // go through each factor to calculate its score
    const numFactors = psychTest.factors.length;
    for (let factorIndex = 0; factorIndex < numFactors; factorIndex++) {
        let factor = psychTest.factors[factorIndex];
        let factorTotal = 0;
        // go through each facet to calculate its score
        const numFacets = factor.facets.length;
        for (let facetIndex = 0; facetIndex < numFacets; facetIndex++) {
            let facet = factor.facets[facetIndex];
            let facetTotal = 0;

            // go through each response to get facet score
            const numResponses = facet.responses.length;
            for (let responseIndex = 0; responseIndex < numResponses; responseIndex++) {
                let answer = facet.responses[responseIndex].answer;
                // multiply the score by -1 if it's supposed to be inverted
                if (facet.responses[responseIndex].invertScore) {
                    answer = answer * -1;
                }
                facetTotal += answer;
            }

            facet.score = facetTotal / numResponses;
            factor.facets[facetIndex] = facet;
            factorTotal += facet.score;
        }

        factor.score = factorTotal / numFacets;
        psychTest.factors[factorIndex] = factor;
    }

    // give the graded psych test back to the user
    user.psychometricTest = psychTest;

    // return the user to be saved
    return user;
}


module.exports = psychApis;
