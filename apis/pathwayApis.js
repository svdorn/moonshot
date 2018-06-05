var Pathways = require('../models/pathways.js');
var Links = require('../models/links.js');
var Articles = require('../models/articles.js');
var Info = require('../models/info.js');
var Quizzes = require('../models/quizzes.js');
var Users = require('../models/users.js');

// get helper functions
const { sanitize,
        removeEmptyFields,
        verifyUser,
        removePassword,
        getUserByQuery,
        sendEmail,
        safeUser,
        userForAdmin,
        getFirstName,
        removeDuplicates,
        frontEndUser
} = require('./helperFunctions.js');


const pathwayApis = {
    GET_topPathways,
    GET_link,
    GET_article,
    GET_info,
    GET_video,
    GET_quiz,
    GET_pathwayByIdNoContent,
    GET_pathwayByPathwayUrl,
    GET_pathwayByPathwayUrlNoContent,
    GET_search,
    GET_allCompaniesAndCategories
}


// ----->> START APIS <<----- //


function GET_topPathways(req, res) {
    const numPathways = parseInt(sanitize(req.query.numPathways), 10);

    // gets the most popular pathways, the number of pathways is numPathways;
    // only show the ones that are ready for users to see
    Pathways.find({showToUsers: true})
    .sort({avgRating: 1})
    .limit(numPathways)
    .select("name previewImage sponsor estimatedCompletionTime deadline price comingSoon showComingSoonBanner url")
    .exec(function (err, pathways) {
        if (err) {
            return res.status(500).send("Not able to get top pathways");
        } else if (pathways.length == 0) {
            return res.status(500).send("No pathways found");
        } else {
            return res.json(pathways);
        }
    });
}


function GET_link(req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Links.findOne(query, function (err, link) {
        if (err) {
            console.log("error in get link by id: ", err)
            return res.status(404).send("Couldn't find that link.");
        } else {
            return res.json(link);
        }
    })
}


function GET_article(req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Articles.findOne(query, function (err, article) {
        if (err) {
            console.log("error in get article by id: ", err)
            return res.status(404).send("Couldn't find that article.");
        } else {
            return res.json(article);
        }
    })
}


function GET_info(req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Info.findOne(query, function (err, info) {
        if (err) {
            console.log("error in get info by id: ", err)
            return res.status(404).send("Couldn't find that info piece.");
        } else {
            return res.json(info);
        }
    })
}


function GET_quiz(req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Quizzes.findOne(query, function (err, quiz) {
        if (err) {
            console.log("error in get quiz by id: ", err)
            return res.status(404).send("Quiz not found");
        } else {
            if (quiz != null) {
                quiz.correctAnswerNumber = undefined;
            }
            return res.json(quiz);
        }
    })
}


function GET_video(req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Videos.findOne(query, function (err, video) {
        if (err) {
            console.log("error in get video by id: ", err);
            return res.status(404).send("Couldn't find that video.");
        } else {
            res.json(video);
        }
    })
}


function GET_pathwayByIdNoContent(req, res) {
    const _id = sanitize(req.query._id);
    const query = {_id: _id};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by id: ", err);
        } else {
            if (pathway) {
                return res.json(removeContentFromPathway(pathway));
            } else {
                return res.json(undefined);
            }
        }
    })
}


function GET_pathwayByPathwayUrlNoContent(req, res) {
    const pathwayUrl = sanitize(req.query.pathwayUrl);
    const query = {url: pathwayUrl};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by url: ", err);
            return res.status(404).send("No pathway found.");
        } else if (pathway) {
            return res.json(removeContentFromPathway(pathway));
        } else {
            return res.status(404).send("No pathway found.");
        }
    })
}


function GET_pathwayByPathwayUrl(req, res) {
    const pathwayUrl = sanitize(req.query.pathwayUrl);
    const userId = sanitize(req.query.userId);

    const verificationToken = sanitize(req.query.verificationToken);
    const query = {url: pathwayUrl};

    Pathways.findOne(query, function (err, pathway) {
        if (err) {
            console.log("error in get pathway by url");
            return res.status(404).send("Error getting pathway by url");
        } else if (pathway) {
            // get the user from the database, can't trust user from frontend
            // because they can change their info there
            Users.findOne({_id: userId}, function (err, user) {
                if (err) {
                    console.log("error getting user: ", err);
                    return res.status(500).send("Error getting pathway");
                } else {
                    // check that user is who they say they are
                    if (verifyUser(user, verificationToken)) {
                        // check that user has access to that pathway
                        const hasAccessToPathway = user.pathways.some(function (path) {
                            return pathway._id.toString() == path.pathwayId.toString();
                        })
                        if (hasAccessToPathway) {
                            return res.json(pathway);
                        } else {
                            return res.status(403).send("User does not have access to this pathway.");
                        }
                    } else {
                        console.log("verification token does not match")
                        return res.status(403).send("Incorrect user credentials");
                    }
                }
            })
        } else {
            return res.status(404).send("No pathway found");
        }
    })
}


function GET_search(req, res) {
    const MAX_PATHWAYS_TO_RETURN = 1000;
    let query = {showToUsers: true};

    let term = sanitize(req.query.searchTerm);
    if (term && term !== "") {
        // if there is a search term, add it to the query
        const termRegex = new RegExp(term, "i");
        query["name"] = termRegex;
    }

    let limit = parseInt(sanitize(req.query.limit), 10);
    if (limit === NaN) {
        limit = MAX_PATHWAYS_TO_RETURN;
    }
    const sortNOTYET = sanitize(req.body.sort);

    // add category to query if it exists
    const category = sanitize(req.query.category);
    if (category && category !== "") {
        query["tags"] = category;
    }

    // add company to query if it exists
    const company = sanitize(req.query.company);
    if (company && company !== "") {
        query["sponsor.name"] = company;
    }

    //const limit = 4;
    const sort = {avgRating: 1};
    // only get these properties of the pathways
    const select = "name previewImage sponsor estimatedCompletionTime deadline price tags comingSoon showComingSoonBanner url";

    Pathways.find(query)
        .limit(limit)
        .sort(sort)
        .select(select)
        .exec(function (err, pathways) {
            console.log("pathways: ", pathways);
            if (err) {
                res.status(500).send("Error getting searched-for pathways");
            } else {
                res.json(pathways);
            }
        });
}


function GET_allCompaniesAndCategories(req, res) {
    Pathways.find()
    .select("sponsor.name tags")
    .exec(function(err, pathways) {
        if (err) {
            console.log("Error finding pathways when getting all companies and categories.");
            return res.json({companies: [], categories: []});
        } else if (!pathways) {
            return res.json({companies: [], categories: []});
        }

        let companies = [];
        let categories = [];

        // go through each pathway, add the sponsor name and tags to the lists
        pathways.forEach(function(pathway) {
            // only add tags and company names if they exist
            if (pathway && pathway.sponsor && pathway.sponsor.name) {
                companies.push(pathway.sponsor.name);
            }
            if (pathway && pathway.tags) {
                categories = categories.concat(pathway.tags);
            }
        })

        companies = removeDuplicates(companies);
        categories = removeDuplicates(categories);
        res.json({companies, categories})
    });
}


// ----->> END APIS <<----- //


function removeContentFromPathway(pathway) {
    if (pathway) {
        steps = pathway.steps;
        if (steps) {
            for (let i = 0; i < steps.length; i++) {
                steps[i].substeps = undefined;
            }
            pathway.steps = steps;
        }
    }

    return pathway;
}


module.exports = pathwayApis;
