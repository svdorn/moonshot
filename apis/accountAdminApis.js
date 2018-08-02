const Businesses = require('../models/businesses.js');
const Users = require('../models/users.js');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const errors = require('./errors');

// get helper functions
const { sanitize,
        verifyUser,
        sendEmail,
        frontEndUser,
        getAndVerifyUser
} = require('./helperFunctions.js');

// import random functions from other apis


const adminApis = {
    POST_sendVerificationEmail
}


// --------------------------->> API DEFINITIONS <<--------------------------- //


async function POST_sendVerificationEmail(req, res) {
    // get and verify arguments
    const { userId, verificationToken } = sanitize(req.body);

    res.status(200).send({success: true});
}


// <<----------------------------------------------------------------------->> //


module.exports = adminApis;
