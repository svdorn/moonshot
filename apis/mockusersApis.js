const Mockusers = require('../models/mockusers.js');
const Users = require('../models/users.js');

const mongoose = require("mongoose");

// get helper functions
const {
    sanitize,
    getAndVerifyUser
 } = require('./helperFunctions');

const errors = require('./errors.js');

const mockusersApis = {
    GET_allMockusers
}

// get positions for evaluations page
async function GET_allMockusers(req, res) {
    try {
        const userId = sanitize(req.query.userId);
        const verificationToken = sanitize(req.query.verificationToken);
        const businessId = sanitize(req.query.businessId);

        // get the user who is asking for their evaluations page
        try { var user = await getAndVerifyUser(userId, verificationToken); }
        catch (getUserError) {
            console.log("error getting user when trying to get positions for evaluations page: ", getUserError);
            const status = getUserError.status ? getUserError.status : 500;
            const message = getUserError.message ? getUserError.message : errors.SERVER_ERROR;
            return res.status(status).send(message);
        }

        // make sure the user is verified to be able to get the info
        if (user && user.userType === "accountAdmin" && user.businessInfo && user.businessInfo.businessId.toString() === businessId.toString()) {
            // get all the mockusers
            try { var mockusers = await Mockusers.find({}) } catch(getMockusersError) {
                console.log("error getting mock user: ", getMockusersError);
                return res.status(500).send("Server error while getting users.");
            }
        } else {
            console.log("error getting mock user, invalid credentials");
            return res.status(500).send("Server error while getting users, invalid credentials.");
        }

        res.json({mockusers});
    }

    catch (miscError) {
        console.log("error getting mock users: ", miscError);
        return res.status(500).send("Server error while getting users.");
    }
}

module.exports = mockusersApis;
