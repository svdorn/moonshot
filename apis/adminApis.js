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
    POST_alertLinkClicked
}


function POST_alertLinkClicked(req, res) {
    const name = sanitize(req.body.params.name);
    const id = sanitize(req.body.params.userId);
    const link = sanitize(req.body.params.link);

    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Someone just clicked the NWM Culture Index Link';
    let content = "<div>"
        + "<h3>Send an email to Northwestern Mutual (Preston) telling him NOT to interview this person until we give him the go-ahead. Make sure this is the right link, it's possible that this email hasn't been updated in the codebase yet but there are other links that you'll need to be notified of.</h3>"
        + "<p>User's Name: "
        + name
        + "</p>"
        + "<p>User's id: "
        + id
        + "</p>"
        + "<p>Link that was clicked: "
        + link
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            return res.json(true);
        } else {
            console.log("ERROR SENDING EMAIL SAYING THAT THE NWM LINK WAS CLICKED");
            return res.json(false);
        }
    });
}


module.exports = employerApis;
