"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    // user's full name
    name: String,
    // user's email address, used for log in
    email: String,
    // email address that companies should use to contact this person
    emailToContact: String,
    // phone number for companies to contact this person with
    phoneNumber: String,
    // should always be "candidate" (for employers, this will be "employer")
    userType: String,
    // has admin rights on the site, able to create business accounts and see all results
    admin: Boolean,
    // agreed to privacy policy and terms of use
    agreedToTerms: Boolean,
    // the code the user used to sign up with to get to their first evaluation
    employerCode: String,
    // whether the user's profile is hidden from employers
    hideProfile: Boolean,
    // special url used to access this user's profile
    profileUrl: String,
    // password to log in
    password: String,
    // the exact time the user created their account
    dateSignedUp: Date,
    // code given to a user that was used on sign up, was in the url the user initially got to the site through
    signUpReferralCode: String,
    // if false, should route user to onboarding on login
    hasFinishedOnboarding: Boolean,
    // used to verify identity
    verificationToken: String,
    // sent to user's email address, used to user's account
    emailVerificationToken: String,
    // the code that this user initially got to the site with (will usually be empty)
    referredByCode: String,
    // token used to reset password
    passwordToken: String,
    // when the password token will no longer work
    passwordTokenExpirationTime: Number,
    // if the use has verified their account via email
    verified: Boolean,
    // not actually used right now
    images: String,
    // list of skills the user has received from completing pathways
    skills: [ String ],
    // general info about the user, can be edited on onboarding or profile
    info: {
        // title of the job they want
        title: String,
        // where they currently reside
        location: String,
        // places they'd be ok with moving to for work
        willRelocateTo: String,
        // short description of self
        bio: String,
        // jobs the user is interested in
        desiredJobs: String,
        // true if the user has not yet finished school
        inSchool: Boolean,
        // degrees the user has received
        education: [{
            // where the degree comes from
            school: String,
            majors: String,
            minors: String,
            // type of degree (MD, BS, etc...)
            degree: String,
            // when the school was started
            startDate: String,
            // graduation date
            endDate: String
        }],
        // anything the user marked themselves as being interested in
        interests: [ String ],
        // user's date of birth
        birthDate: Date,
        // links to things like linkedIn, github
        links: [{
            // url for the link to get to the site
            url: String,
            // "LinkedIn" or "Github" or "Personal Site"
            displayString: String
        }],
        // things the user wants to accomplish on this site
        goals: [ String ],
        // languages the user speaks (not currently editable)
        languages: [ String ]
    },
    // the pathway that the user will be redirected to after onboarding
    // only exists if the user tries to sign up for a pathway before having
    // an account
    pathwayName: String,
    // location to redirect to after signing up
    redirect: String,
    // pathways the user is signed up for
    pathways: [{
        dateAdded: Date,
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            step: Number,
            subStep: Number
        },
        complete: Boolean
    }],
    // pathways the user has finished
    completedPathways: [{
        dateAdded: Date,
        dateCompleted: Date,
        pathwayId: mongoose.Schema.Types.ObjectId,
        currentStep: {
            step: Number,
            subStep: Number
        },
    }],
    /*
        // --->> IMPORTANT: <<--- //
        // IN ORDER FOR MONGOOSE TO SAVE answers, MUST CALL   //
        // .markModified('answers') ON THE USER, FOR EXAMPLE: //
        //      user.answers["8uijhyuj"] = {...};             //
        //      user.markModified('answers');                 //
        //      user.save();                                  //
        to eliminate the need to search when getting answers, answers are all
        stored outside of the pathways that contain them
        answers object will look like:
        "answers": {
            "67890k3i339ik3i": {
                "answerType": "sliderValue",
                "value": "8"
                "correct": undefined //should be undefined if there is objectively correct answer
            },
            "[another quiz id]": {
                "answerType": "multipleChoice",
                "value": "3" //the answerValue of the chosen answer,
                "correct": true,
                "isCustomAnswer": false
            },
            "[another quiz id]": {
                "answerType": "multiSelect",
                "value": ["3", "5", "6"] //the answerValues of the chosen answers,
                "optionalCustomAnswer": "gymnastics"
            },
            "[another quiz id]": {
                "answerType": "freeResponseAndSliderOnSelect",
                "value": {
                    "4(answerNumber)": {
                        "skill": 6,
                        "answerText": "this is my answer about this thing"
                    }, ...
                }

            },
            "---another quiz id---": {
                "answerType": "datePicker",
                "dateValue": "1996-11-19T06:00:00.000Z"
            }
        }
    */
    answers: mongoose.Schema.Types.Mixed,


    // ---->>> POST-PIVOT <<<---- //

    // skills tests the user has taken
    skillsTests: [{
        // id of the skill
        skillId: mongoose.Schema.Types.ObjectId,
        // the score the user got on their most recent attempt
        mostRecentScore: Number,
        // the list of times the candidate has taken the skill test
        attempts: [{
            // if the user is currently taking the test
            inProgress: Boolean,
            // the date and time the user took the test
            startDate: Date,
            // the date and time the user finished the test
            endDate: Date,
            // how long it took overall in milliseconds to finish the test (difference between endDate and startDate)
            totalTime: Number,
            // the level the user is currently on (only applies if test is in progress);
            // will be something like 3.9, so user will be getting level 3 questions,
            // then if user gets the question right it'll go up, maybe to 4.1 or
            // something, so then the user will then get level 4 questions
            currentLevel: Number,
            // the score the user got on the test; undefined if in progress
            score: Number,
            // the different sub skills involved in the overall skill
            subSkills: [{
                // mongo id to keep track of subSkills
                subSkillId: mongoose.Schema.Types.ObjectId,
                // the score the user got on the sub skill test; undefined if in progress
                score: Number,
                // the levels the user got through with the associated answers to questions
                levels: [{
                    // the level of difficulty of the questions
                    level: Number,
                    // the questions the candidate answered at this level of difficulty
                    questions: [{
                        // id of the question
                        questionId: mongoose.Schema.Types.ObjectId,
                        // if the candidate chose the correct answers
                        isCorrect: Boolean,
                        // the ids of answers that the user chose
                        answerIds: [ mongoose.Schema.Types.ObjectId ],
                        // the date and time the user started the question
                        startDate: Date,
                        // the date and time the user finished the question
                        endDate: Date,
                        // how long it took overall in milliseconds to finish the
                        // question (difference between endDate and startDate)
                        totalTime: Number,
                    }]
                }]
            }]
        }]
    }],

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
        incompleteFactors: [ Number ],
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
        factors: [{
            // id for the factor
            factorId: mongoose.Schema.Types.ObjectId,
            // name of the factor ("Honesty-Humility, Emotionality, Extraversion...")
            // at the time the user took the test
            name: String,
            // the factor score (-5 to 5), calculated from the facet scores
            score: Number,
            // the array positions of facets that have not yet been completed
            // similar to incompleteFactors above
            incompleteFacets: [ Number ],
            // the facets we're testing for
            facets: [{
                // the facet score (-5 to 5), calculated after the test is done
                score: Number,
                // the weight that was used for this facet in calculating the
                // user's factor scores
                weight: Number,
                // unique facet identifier
                facetId: mongoose.Schema.Types.ObjectId,
                // name of the facet at the time the user completed the test
                name: String,
                // questions that have already been used for this facet
                usedQuestions: [ mongoose.Schema.Types.ObjectId ],
                // the responses users had to facet questions
                responses: [{
                    // the question id of the question that was actually answered
                    answeredId: mongoose.Schema.Types.ObjectId,
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
                    skips: [{
                        // the time the skip button was pressed
                        skipDate: Date,
                        // the time the user spent on this version of the question
                        // before asking for a rephrase (in milliseconds)
                        skipTime: Number,
                        // the id of the question that was skipped
                        questionId: mongoose.Schema.Types.ObjectId
                    }]
                }]
            }]
        }]
    },

    // the positions that the candidate has applied to
    positions: [{
        // the company that is offering this position
        companyId: mongoose.Schema.Types.ObjectId,
        // the id of the position within that company
        positionId: mongoose.Schema.Types.ObjectId,
        // the hiring stage of the candidate, which the company has determined
        // e.g. "Not Contacted", "Contacted", "Interviewing", "Hired"
        hiringStage: String,
        // dates/times the hiring stage of the candidate was changed for this position
        hiringStageChanges: [{
            // what the hiring stage was changed to
            hiringStage: String,
            // the date/time the hiring stage was changed
            dateChanged: Date
        }],
        // the date and time the user applied to the position
        appliedTime: Date,
        // the scores the user got for the position
        scores: {
            // combination of all the scores
            overall: Number,
            // how good of a culture fit the candidate has
            culture: Number,
            // how much the candidate could grow in the position
            growth: Number,
            // if the candidate would stay at the company for a long time
            longevity: Number,
            // how well the candidate would do at that specific position
            performance: Number
        }
    }]

    // FOR EMPLOYEES ONLY
    

    // ---->>> END POST-PIVOT <<<---- //
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
