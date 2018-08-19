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
    GET_initialState
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
    try { var user = await getAndVerifyUser(userId, verificationToken); }
    catch (getUserError) {
        console.log("Error getting user when trying to get current eval state: ", getUserError);
        return res.status(getUserError.status ? getUserError.status : 500).send(getUserError.message ? getUserError.message : errors.SERVER_ERROR);
    }

    // find the index of the position within the user's positions array
    const positionIndex = user.positions.findIndex(existingPosition => {
        return (
            existingPosition.businessId.toString() === businessId.toString() &&
            existingPosition.positionId.toString() === positionId.toString()
        );
    });
    // if the index is invalid, the user never signed up for this position
    if (positionIndex < 0) { return res.status(403).send({notSignedUp: true}); }

    // get the position from the database
    try { var position = await getPosition(businessId, positionId); }
    catch (getPositionError) {
        console.log("Error getting position when trying to get current state: ", getPositionError);
        return res.status(500).send({ serverError: true });
    }

    // TODO: check if they have finished the eval already

    // if user is in-progress on any position
    if (user.evalInProgress) {
        // check if it is the position they are currently on
        if (user.evalInProgress.businessId === businessId && user.evalInProgress.positionId === positionId) {
            // tell the user that this position has already been started, then
            // ask if they are ready to continue
            return res.status(200).send({ alreadyInProgress: true });
        }
        // if not, ask if they want to continue the eval they were on before
        // or if they want to work on this new one - send them the businessId
        // and positionId so they have a link to the in-progress eval
        else { return res.status(200).send({ evalInProgress: user.evalInProgress }); }
    }
    // no eval is in progress, return that they have not started this position
    // and are ready to
    else { return res.status(200).send({ readyToStart: true }); }
}


// get a user's current eval component in an evaluation
function getStage(user, position, positionIndex) {
    // TODO
}


// get a const position from a business
async function getPosition(businessId, positionId) {
    return new Promise(async function(resolve, reject) {
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
