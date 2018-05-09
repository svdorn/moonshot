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


const businessApis = {
    POST_forBusinessEmail
}


function POST_forBusinessEmail(req, res) {
    let message = "None";
    if (req.body.message) {
        message = sanitize(req.body.message);
    }
    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Moonshot Sales Lead - From For Business Page';
    let content = "<div>"
        + "<h3>Sales Lead from For Business Page:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "</p>"
        + "<p>Company: "
        + sanitize(req.body.company)
        + "</p>"
        + "<p>Title: "
        + sanitize(req.body.title)
        + "</p>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Phone Number: "
        + sanitize(req.body.phone)
        + "</p>"
        + "<p>Positions they're hiring for: "
        + sanitize(req.body.positions)
        + "</p>"
        + "<p>Message: "
        + message
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Email sent successfully, our team will notify you of your results shortly.");
        } else {
            res.status(500).send(msg);
        }
    })
}


module.exports = businessApis;
