const app = require("../../apiServer");
const Users = require("../../models/users");
const PsychUsers = require("../../models/psychUsers");
const { getAndVerifyUser, sanitize } = require("../helperFunctions");
const errors = require("../errors");

const factorsAggregation = [
    // only want the users who have completed the psych test
    {
        $match: {
            "psychometricTest.endDate": { $exists: true }
        }
    },
    // make every user object into { factors: [factor] }
    {
        $project: {
            _id: 0,
            factors: "$psychometricTest.factors"
        }
    },
    // make every factor its own object with its name and score
    {
        $unwind: "$factors"
    },
    // only need the name and score of each factor
    {
        $project: {
            name: "$factors.name",
            score: "$factors.score"
        }
    }
];

async function GET_factors(req, res, next) {
    const { site, userId, verificationToken } = sanitize(req.query);

    // get the user requesting the info
    try {
        var user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }
    if (!user.admin) {
        return res.status(403).send({ message: errors.PERMISSIONS_ERROR });
    }

    console.log("site: ", site);

    // get all the factors
    try {
        let insightsFactors = ["All", "Insights"].includes(site)
            ? await Users.aggregate(factorsAggregation)
            : [];

        let learningFactors = ["All", "Learning"].includes(site)
            ? await PsychUsers.aggregate(factorsAggregation)
            : [];

        var allFactors = insightsFactors.concat(learningFactors);
    } catch (e) {
        console.log("Error getting factor data: ", e);
        return res.status(500).send({ message: "Error getting data :(" });
    }

    // go through each factor, group factors by factor name
    let factorArraysObj = makeFactorArraysObj(allFactors);

    // an array that will contain the factors that will be returned to the front end
    let newFactorObjs = [];

    // go through each factor
    Object.keys(factorArraysObj).forEach(factorName => {
        // get the number of candidates who have this factor
        const n = factorArraysObj[factorName].length;
        // calculate the average score for the factor
        const average = mean(factorArraysObj[factorName]);
        // calculate the standard deviation for the factor
        const stdDev = standardDeviation(factorArraysObj[factorName], average);

        // make the data points of the ranges - [ { name: "-4.75", quantity: 80 }, ... ]
        const dataPoints = makeRanges(factorArraysObj[factorName], -5, 5, 0.5);

        // the object that the front end will receive
        let newFactorObj = { name: factorName, n, average, stdDev, dataPoints };
        // add the object to the list of objects to return
        newFactorObjs.push(newFactorObj);
    });

    return res.status(200).send({ factors: newFactorObjs });
}

// make the data points of the ranges - [ { name: "-4.75", quantity: 80 }, ... ]
function makeRanges(values, low, high, step) {
    // create the groups - { name: "-3", quantity: 20 }
    const groups = groupCountsBy(values, rangeGroupFunction, low, high - step, step);
    // sort the groups so that -5 is last and 4 is first
    let dataPoints = groups.sort((a, b) => a.name - b.name);
    // make sure every value range is represented, even if there are no data points there
    dataPoints = addMissingRanges(dataPoints, low, high - step, step);
    // add the step/2 so the groupValues are the average of the two end points
    return dataPoints.map(p => ({
        name: (parseFloat(p.name, 10) + step / 2).toString(),
        quantity: p.quantity
    }));
}

// function to round value down to its nearest group
function rangeGroupFunction(value, low, high, step) {
    // divide the value by the step before rounding so we can get a bigger range
    // (step will usually be < 1 and > 0)
    let groupValue = Math.floor(value / step);
    // get the actual group value
    groupValue *= step;
    // if the groupValue is bigger than the high or lower than the low, make it the high or low
    if (groupValue > high) {
        groupValue = high;
    } else if (groupValue < low) {
        groupValue = low;
    }

    return groupValue;
}

// return the average of a list of numbers
function mean(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// return the standard distribution from the average and a list of numbers
function standardDeviation(values, average) {
    // if the average was not given, calculate it
    if (typeof average !== "number") {
        average = mean(values);
    }
    // add up all the squared deviations from the average
    const total = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0);
    // return the square root of (that sum divided by the number of values)
    return Math.sqrt(total / values.length);
}

// returns an object like this:
// { "Honesty-Humility": { values: [1.2, -.9, ...] } }
function makeFactorArraysObj(factors) {
    let factorObjs = {};
    factors.forEach(factor => {
        // if the array for this factor doesn't exist already, initialize it
        if (!factorObjs[factor.name]) {
            factorObjs[factor.name] = [];
        }
        // add the factor score to the list of scores
        factorObjs[factor.name].push(factor.score);
    });

    return factorObjs;
}

// given an array with ranges of data, add in any that are missing
// e.g. array: [{name: -1, quantity: 3}, {name: 1, quantity: 2}]
// addMissingRanges(array, -1, 1) =>
//      [{name: "-1", quantity: 3}, {name: "0", quantity: 0}, {name: "1", quantity: 2}]
function addMissingRanges(array, low, high, step) {
    let rangeIdx = 0;
    for (let rangeStart = low; rangeStart <= high; rangeStart += step) {
        if (array[rangeIdx] === undefined || array[rangeIdx].name != rangeStart) {
            array = array
                .slice(0, rangeIdx)
                .concat([{ name: rangeStart.toString(), quantity: 0 }])
                .concat(array.slice(rangeIdx));
        }
        rangeIdx++;
    }

    return array;
}

// group array into subarrays based on a grouping function
function groupBy(arr, groupFunc, ...groupFuncArgs) {
    let groups = {};
    arr.forEach(x => {
        const groupValue = groupFunc(x, ...groupFuncArgs);
        groups[groupValue] = (groups[groupValue] || []).concat(x);
    });
    return Object.keys(groups).map(groupValue => ({ name: groupValue, value: groups[groupValue] }));
}

// group array into subarrays based on a grouping function and get the count of each group
function groupCountsBy(arr, groupFunc, ...groupFuncArgs) {
    let groups = {};
    arr.forEach(x => {
        const groupValue = groupFunc(x, ...groupFuncArgs);
        groups[groupValue] = (groups[groupValue] || []).concat(x);
    });
    return Object.keys(groups).map(groupValue => ({
        name: groupValue,
        quantity: groups[groupValue].length
    }));
}

app.get("/admin/dataDisplay/factors", GET_factors);

module.exports = {
    GET_factors
};
