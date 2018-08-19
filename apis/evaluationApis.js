const Users = require('../models/users.js');
const Psychtests = require('../models/psychtests.js');
const Skills = require('../models/skills.js');
const Businesses = require('../models/businesses.js');
const Adminquestions = require("../models/adminquestions");

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require("mongoose");

const errors = require('./errors.js');

// get helper functions
const { sanitize,
        verifyUser,
        sendEmail,
        getAndVerifyUser,
        getUserFromReq,
        frontEndUser,
        validArgs
} = require('./helperFunctions');


const evaluationApis = {
    GET_currentState
}


// gets results for a user and influencers
async function GET_initialState(req, res) {
    // get everything needed from request
    const { userId, verificationToken, businessId, positionId } = sanitize(req.query);
    // if the ids are not strings, return bad request error
    if (!validArgs({ stringArgs: [businessId, positionId] })) {
        return res.status(400).send({ badRequest: true });
    }

    // get the current user
    try { var user = getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user when trying to get current eval state: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : errors.SERVER_ERROR);
    }

    // find the index of the position within the user's positions array
    const positionIndex = user.positions.indexOf(existingPosition => {
        return
            existingPosition.businessId === businessId &&
            existingPosition.positionId === positionId;
    });
    // if the index is invalid, the user never signed up for this position
    if (positionIndex < 0) { return res.status(403).send({notSignedUp: true}); }

    // get the position from the database
    try { var position = await getPosition(businessId, positionId); }
    catch (getPositionError) {
        console.log("Error getting position when trying to get current state: ", getPositionError);
        return res.status(500).send({ serverError: true });
    }

    // if user is in-progress on any position
    if (user.evalInProgress) {
        // check if it is the position they are currently on
        if (user.evalInProgress.businessId === businessId && user.evalInProgress.positionId === positionId) {
            // get the progress on the position and return it
            return getAndReturnStage(user, position, positionIndex);
        }
        // TODO: if not, ask if they want to continue the eval they were on before
        // or if they want to work on this new one
    }
    else {
        // if not in progress, return that they have not started this position and are ready to

    }

    function getAndReturnStage(user, position, positionIndex) {
        // get their progress on the position and return it
        const progress = getStage(user, position, positionIndex);
        // if there was no error getting the user's progress, send back the progress
        if (!progress.error) { return res.status(200).send(progress); }
        // if there was an error, send the error info
        else { return res.status(progress.error.status).send(progress.error.data); }
    }
}


// get a user's current eval component in an evaluation
function getStage(user, position, positionIndex) {
    // TODO
}


// get a const position from a business
async function getPosition(businessId, positionId) {
    return new Promise(function(resolve, reject) {
        // get the business with that id and only the matching position
        const query = {
            "_id": businessId,
            "$elemMatch": {
                "positions": {
                    "_id": positionId
                }
            }
        }

        // get the one business that satisfies the query
        try { var business = await Businesses.findOne(query); }
        catch (getBizError) { return reject(`Error getting business from businessId: ${businessId}, positionId: ${positionId}`); }

        // if no business was found with that position id and business id
        if (!business) { return reject(`No business with id ${businessId} and a position with id: ${positionId}`); }

        // only one position can have that id, so must be the one and only position
        return business.positions[0];
    });
}



module.exports = evaluationApis;
