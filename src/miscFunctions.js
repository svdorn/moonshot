// get the qualifier (e.g. "above average", "expert", etc) based on a score
function qualifierFromScore(score, type) {
    let qualifiers = undefined;
    // for predicted performance
    if (type === "predicted") {
        qualifiers = ["Below Average", "Average", "Above Average"];
    }
    // for skill level
    else if (type === "skill") {
        qualifiers = ["Novice", "Intermediate", "Expert"];
    }
    // if invalid type provided, return N/A
    else { return "N/A"; }

    // between 90 (inclusive) and 110 (exclusive) is intermediate/average
    if (score < 90) {
        return qualifiers[0];
    } else if (score < 110) {
        return qualifiers[1];
    } else {
        return qualifiers[2];
    }
}

const miscFunctions = {
    qualifierFromScore
}

module.exports = miscFunctions;
