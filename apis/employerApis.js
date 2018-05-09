var Businesses = require('../models/businesses.js');
var Employers = require('../models/employers.js');
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
        getFirstName
} = require('./helperFunctions.js');


const employerApis = {

}


module.exports = employerApis;
