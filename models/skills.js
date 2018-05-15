"use strict"
var mongoose = require('mongoose');

var positionsSchema = mongoose.Schema({
    // the name of the skill
    name: String,
    // the more granular areas that a candidate has to understand within a skill;
    // for example, front-end developer skill could consist of HTML, CSS, Javascript subskills
    subSkills: [{
        // the name of the sub skill
        name: String,
        // how important this sub skill is in determining overall Skill IQ
        weight: Number,
        // difficulty levels of questions that test knowledge of this subSkill
        levels: [{
            // difficulty level of these questions
            level: Number,
            // the questions that are all around the same level of difficulty
            questions: [{
                // the question that is displayed
                body: {[
                    // the type of this part of the question, e.g. "ul" or "ol" or "text" or "image"
                    partType: String,
                    // className of part
                    className: String,
                    // include the classes that question parts default to having
                    includeDefaultClasses: Boolean,
                    // the content of the part; if content is just text, array will be length 1
                    content: [ String ],
                    // text that will show up if this question part is a link (optional)
                    linkText: String,
                    // if the question part is a link, should the link open a new tab? (optional, defaults to true)
                    newTab: Boolean,
                    // alt text for the image if the part is an image
                    altTag: String,
                    // if you should put a break after the part
                    shouldBreak: Boolean
                ]},
                // the answers that can be chosen
                options: [{
                    // what is displayed on-screen
                    body: {[
                        // the type of this part of the question, e.g. "ul" or "ol" or "text" or "image"
                        partType: String,
                        // className of part
                        className: String,
                        // include the classes that answer parts default to having
                        includeDefaultClasses: Boolean,
                        // the content of the part; if content is just text, array will be length 1
                        content: [ String ],
                        // text that will show up if this question part is a link (optional)
                        linkText: String,
                        // if the question part is a link, should the link open a new tab? (optional, defaults to true)
                        newTab: Boolean,
                        // alt text for the image if the part is an image
                        altTag: String,
                        // if you should put a break after the part
                        shouldBreak: Boolean
                    ]}
                }],
                // if you can select multiple answers (and therefore, multiple
                // answers could potentially be correct)
                multiSelect: Boolean,
                // the answer ids of the answer(s) that must be selected to get the question right
                correctAnswers: [ mongoose.Schema.Types.ObjectId ]
            }]
        }]
    }]
});

var Positions = mongoose.model('Positions', potisionsSchema);
module.exports = Positions;
