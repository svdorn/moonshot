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
    // "candidate" for candidates, "accountAdmin" for an admin for an employer,
    // "manager" for a manager of a business, "employee" for an employee of a business
    userType: String,
    // has admin rights on the site, able to create business accounts and see all results
    admin: Boolean,
    // agreed to privacy policy and terms of use
    agreedToTerms: Boolean,
    // there are various terms that can be agreed to, depending on the user type
    termsAndConditions: [{
        // the name of the terms [e.g. Privacy Policy, Terms of Use, etc...]
        name: String,
        // whether the user agreed to the terms
        agreed: Boolean,
        // the most recent date the terms were agreed to
        date: Date
    }],
    // if the user is an account admin and was the first at the company
    firstBusinessUser: Boolean,
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
    // sent to user's email address, used to verify user's account
    emailVerificationToken: String,
    // the code that this user initially got to the site with (will usually be empty)
    referredByCode: String,
    // token used to reset password
    passwordToken: String,
    // when the password token will no longer work
    passwordTokenExpirationTime: Number,
    // if the use has verified their account via email
    verified: Boolean,
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

    // skills tests the user has taken
    skillTests: [{
        // id of the skill
        skillId: mongoose.Schema.Types.ObjectId,
        // name of the skill
        name: String,
        // the score the user got on their most recent attempt
        mostRecentScore: Number,
        // the question the user is currently answering, undefined if test not
        // in progress; will always be for most recent (in progress) test
        currentQuestion: {
            // level of difficulty of the question
            levelNumber: Number,
            // index of the level within the skill database kept for time optimization
            levelIndex: Number,
            // id of the question currently being answered
            questionId: mongoose.Schema.Types.ObjectId,
            // index of the qustion in the skill database for time optimization
            questionIndex: Number,
            // the time the question was assigned to the user
            startDate: Date,
            // the correct answers so that we don't have to re-find the question
            // when getting the next question and grading this one
            //correctAnswers: [ mongoose.Schema.Types.ObjectId ],
            // similar premise but with the new way skills are done
            correctAnswer: mongoose.Schema.Types.ObjectId
        },
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
            // the levels the user got through with the associated answers to questions
            levels: [{
                // the level of difficulty of the questions
                levelNumber: Number,
                // the questions the candidate answered at this level of difficulty
                questions: [{
                    // id of the question
                    questionId: mongoose.Schema.Types.ObjectId,
                    // if the candidate chose the correct answers
                    isCorrect: Boolean,
                    // the ids of answers that the user chose
                    //answerIds: [ mongoose.Schema.Types.ObjectId ],
                    // the id of the answer that the user chose
                    answerId: mongoose.Schema.Types.ObjectId,
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
    }],

    // if the user is any type of employer, here is info about the business they work for
    // and their role at that business
    businessInfo: {
        company: {
            name: String,
            companyId: mongoose.Schema.Types.ObjectId
        },
        title: String
    },

    // the archetype the user was found to be from the psychometricTest
    archetype: String,

    // questions the user has to answer - only once - before doing a position eval
    adminQuestions: {
        // whether the user has finished all the admin questions and no longer needs to do them
        finished: Boolean,
        // questions user answered about demographics
        demographics: [{
            // of the question the user answered
            questionId: mongoose.Schema.Types.ObjectId,
            // only applies to slider questions
            sliderAnswer: Number,
            // only apply to multiple choice questions - the id of the answer chosen
            selectedId: mongoose.Schema.Types.ObjectId,
            // the text of the answer chosen
            selectedText: String
        }],
        // questions user answered about aspects of job performance
        selfRating: [{
            // of the question the user answered
            questionId: mongoose.Schema.Types.ObjectId,
            // only applies to slider questions
            sliderAnswer: Number,
            // only apply to multiple choice questions - the id of the answer chosen
            selectedId: mongoose.Schema.Types.ObjectId,
            // the text of the answer chosen
            selectedText: String
        }]
    },

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
        businessId: mongoose.Schema.Types.ObjectId,
        // the id of the position within that company
        positionId: mongoose.Schema.Types.ObjectId,
        // name of the position
        name: String,
        // the date the company has assigned the evaluation to the user
        assignedDate: Date,
        // the date the company has set as a deadline to finish
        deadline: Date,
        // the date the user started application
        appliedStartDate: Date,
        // when the user ended and submitted the application
        appliedEndDate: Date,
        // if the user agreed to not cheat on the skill tests
        agreedToSkillTestTerms: Boolean,
        // if the user has seen the page introducing the skill test
        hasSeenIntro: Boolean,
        // list of ids for the necessary skill tests
        skillTestIds: [ mongoose.Schema.Types.ObjectId ],
        // the index of the current test that the user is taking within
        // skillTests array; the tests below the index have alreday been taken
        testIndex: Number,
        // the free response questions specific to this position
        freeResponseQuestions: [{
            // the id of the free response question
            questionId: mongoose.Schema.Types.ObjectId,
            // the index of the question in the business' position object
            questionIndex: Number,
            // what the user responded with
            response: String,
            // text of the question
            body: String,
            // if the question is required in order to finish the evaluation
            required: Boolean
        }]
    }],

    positionInProgress: mongoose.Schema.Types.ObjectId,
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
