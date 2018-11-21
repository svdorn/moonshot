const Users = require("../models/users.js");
const Psychtests = require("../models/psychtests.js");
const Psychquestions = require("../models/psychquestions.js");
const GCA = require("../models/cognitivequestions.js");
const Skills = require("../models/skills.js");
const Businesses = require("../models/businesses.js");
const Adminqs = require("../models/adminqs");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const errors = require("./errors.js");

// get helper functions
const {
    sanitize,
    verifyUser,
    sendEmail,
    getAndVerifyUser,
    getFirstName,
    getUserFromReq,
    frontEndUser,
    validArgs,
    logArgs,
    logError,
    randomInt,
    shuffle
} = require("./helperFunctions");

const { gradeEval, getCognitiveScore } = require("./evaluationApis");

// give all businesses fullAccess and the right candidateCount
async function billingUpdate() {
    try {
        var businesses = await Businesses.find({});
    } catch (e) {
        console.log("Error getting all the businesses: ", e);
        return;
    }

    for (let bizIdx = 0; bizIdx < businesses.length; bizIdx++) {
        let business = businesses[bizIdx];
        // give the business full access
        business.fullAccess = true;
        // get the correct candidate count for the business
        try {
            var count = await Users.countDocuments({
                userType: "candidate",
                positions: {
                    $elemMatch: { businessId: business._id, appliedEndDate: { $exists: true } }
                }
            }).select("name _id");
        } catch (e) {
            console.log(`Candidate count error for ${business.name} with id ${business._id}: `, e);
            return;
        }
        business.candidateCount = count;

        console.log("business name: ", business.name, " count: ", count);

        try {
            await business.save();
        } catch (e) {
            console.log(`Error saving business ${business.name} with id ${business._id}: `, e);
            return;
        }
    }
}

// give all account admins the business id and unique name of their business
async function accountAdminBusinessInfo() {
    try {
        let users = await Users.find({ userType: "accountAdmin" });

        for (let userIdx = 0; userIdx < users.length; userIdx++) {
            let user = users[userIdx];

            console.log("user email: ", user.email);

            const businessId = user.businessInfo.businessId;
            console.log("businessId: ", businessId);

            if (businessId) {
                const bizPromise = Businesses.findById(businessId);
                const business = await bizPromise;

                if (business) {
                    console.log("business name: ", business.name);

                    user.businessInfo.businessName = business.name;
                    user.businessInfo.uniqueName = business.uniqueName;

                    await user.save();
                } else {
                    console.log("no business found");
                }
            }
        }
        console.log("done!");
    } catch (e) {
        console.log("Error, ", e);
    }
}

// give all businesses unique names for their application pages
async function giveUniqueNames() {
    try {
        let businesses = await Businesses.find({});
        businesses.forEach(business => {
            if (!business.uniqueName || business.uniqueName.includes(" ")) {
                business.uniqueName = business.name.replace(/ /g, "-");
            }
            if (!business.uniqueNameLowerCase) {
                business.uniqueNameLowerCase = business.uniqueName.toLowerCase();
            }
            business.save().then(() => {
                console.log(business);
            });
        });
    } catch (e) {
        console.log(e);
    }
}

// update all users scores to reflect newest grading schemes (new gca difficulties, new psych weights, etc)
async function updatePredictions() {
    try {
        // get every business
        let businesses = await Businesses.find({});
        // make a pseudo hash table
        let businessObj = {};
        businesses.forEach(biz => {
            // makes it so businessObj[business id] = { full business object }
            businessObj[biz._id.toString()] = biz;
        });

        // get every candidate
        let users = await Users.find({ userType: "candidate" });
        // go through each candidate
        for (let userIdx = 0; userIdx < users.length; userIdx++) {
            // get the candidate
            let user = users[userIdx];

            // if the user has never done the psych test, they're either an old
            // user or have never taken an eval
            if (!user.psychometricTest) {
                console.log("user doesn't have psych - continuing");
                continue;
            }
            // go through each of his or her positions
            if (Array.isArray(user.positions) && user.positions.length > 0) {
                for (userPosIdx = 0; userPosIdx < user.positions.length; userPosIdx++) {
                    // get the user position
                    let userPos = user.positions[userPosIdx];
                    // don't grade the eval unless the user has finished it
                    if (!userPos.appliedEndDate) {
                        console.log("user didn't finish - continuing");
                        continue;
                    }
                    // get the actual position from the business object
                    console.log("user name: ", user.name);
                    console.log("userPos.businessId: ", userPos.businessId);
                    try {
                        var realPos = businessObj[userPos.businessId.toString()].positions.find(
                            bizPos => userPos.positionId.toString() === bizPos._id.toString()
                        );
                    } catch (e) {
                        console.log(
                            "Business with id: ",
                            userPos.businessId,
                            " doesn't exist anymore."
                        );
                        console.log(e);
                        continue;
                    }

                    // if position not found, skip this iteration
                    if (!realPos) {
                        console.log("position not found - continuing");
                        continue;
                    }
                    // grade gca
                    if (user.cognitiveTest) {
                        try {
                            user.cognitiveTest.score = await getCognitiveScore(user.cognitiveTest);
                            console.log("user.cognitiveTest.score: ", user.cognitiveTest.score);
                        } catch (gradeGCAerror) {
                            console.log(
                                "Continuing due to error grading gca for user with id: ",
                                user._id,
                                gradeGCAerror
                            );
                            continue;
                        }
                    }
                    // grade psycho + skills + overall
                    user.positions[userPosIdx] = gradeEval(user, userPos, realPos);
                    console.log("graded");
                }
            }
            // save the user
            user.save();
        }
    } catch (e) {
        console.log(e);
    }

    console.log("done");
}

// update all old businesses to have new position information
async function updateBusinesses() {
    try {
        let businesses = await Businesses.find({});
        businesses.forEach(business => {
            let positions = business.positions;

            for (let posIdx = 0; posIdx < positions.length; posIdx++) {
                let position = positions[posIdx];

                if (typeof position.positionType !== "string") {
                    position.positionType = "General";
                }
                if (!position.length) {
                    position.length = 25;
                }
                if (!position.timeAllotted) {
                    position.timeAllotted = 14;
                }

                if (position.positionType === "Development") {
                    position.positionType = "Developer";
                }
                const positionType = position.positionType ? position.positionType : "General";

                const generalFactorWeights = {
                    emotionality: 1,
                    extraversion: 0,
                    agreeableness: 0,
                    conscientiousness: 1.4375,
                    opennessToExperience: 0,
                    honestyHumility: 1.125,
                    altruism: 0
                };

                switch (positionType) {
                    case "General":
                    case "Marketing":
                    case "Product":
                        factorWeights = generalFactorWeights;
                        position.weights = {
                            performance: 0.23,
                            growth: 0,
                            longevity: 0,
                            culture: 0,
                            gca: 0.51
                        };
                        break;
                    case "Developer":
                        factorWeights = generalFactorWeights;
                        position.weights = {
                            performance: 0.23,
                            growth: 0,
                            longevity: 0,
                            culture: 0,
                            gca: 0.73
                        };
                        break;
                    case "Sales":
                        factorWeights = {
                            emotionality: 1,
                            extraversion: 1.5,
                            agreeableness: 0,
                            conscientiousness: 2.4,
                            opennessToExperience: 0,
                            honestyHumility: 1.714,
                            altruism: 0
                        };
                        position.weights = {
                            performance: 0.252,
                            growth: 0,
                            longevity: 0,
                            culture: 0,
                            gca: 0.51
                        };
                        break;
                    case "Support":
                        factorWeights = {
                            emotionality: 1.18,
                            extraversion: 1,
                            agreeableness: 1.723,
                            conscientiousness: 2.455,
                            opennessToExperience: 1.545,
                            honestyHumility: 1.636,
                            altruism: 0
                        };
                        position.weights = {
                            performance: 0.27,
                            growth: 0,
                            longevity: 0,
                            culture: 0,
                            gca: 0.51
                        };
                        break;
                    default:
                        factorWeights = generalFactorWeights;
                        break;
                }

                const factors = {
                    idealFactors: [
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2ff"),
                            weight: factorWeights.honestyHumility,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce30f"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce30a"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce305"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce300"),
                                    score: 5,
                                    weight: 1
                                }
                            ]
                        },
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2ea"),
                            weight: factorWeights.emotionality,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2fa"),
                                    score: -5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2f5"),
                                    score: -5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2f0"),
                                    score: -5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2eb"),
                                    score: -5,
                                    weight: 1
                                }
                            ]
                        },
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2d0"),
                            weight: factorWeights.extraversion,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2e5"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2e0"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2db"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2d6"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2d1"),
                                    score: 5,
                                    weight: 1
                                }
                            ]
                        },
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2bb"),
                            weight: factorWeights.agreeableness,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2cb"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2c6"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2c1"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2bc"),
                                    score: 5,
                                    weight: 1
                                }
                            ]
                        },
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2a6"),
                            weight: factorWeights.conscientiousness,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2b6"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2b1"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2ac"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2a7"),
                                    score: 5,
                                    weight: 1
                                }
                            ]
                        },
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce28b"),
                            weight: factorWeights.opennessToExperience,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce2a1"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce29c"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce296"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce291"),
                                    score: 5,
                                    weight: 1
                                },
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce28c"),
                                    score: 5,
                                    weight: 1
                                }
                            ]
                        },
                        {
                            factorId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce275"),
                            weight: factorWeights.altruism,
                            idealFacets: [
                                {
                                    facetId: mongoose.Types.ObjectId("5aff0b612689cb00e45ce285"),
                                    score: 5,
                                    weight: 1
                                }
                            ]
                        }
                    ]
                };

                // set correct ideal and growth factors
                position.idealFactors = factors.idealFactors;
                position.growthFactors = factors.idealFactors;

                positions[posIdx] = position;
            }

            business.positions = positions;
            business.save();
        });
    } catch (e) {
        console.log(e);
    }
}
