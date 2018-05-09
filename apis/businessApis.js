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
    POST_forBusinessEmail,
    POST_contactUsEmail,
    POST_updateHiringStage
}


// ----->> START APIS <<----- //


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


function POST_contactUsEmail(req, res) {
    let message = "None";
    if (req.body.message) {
        message = sanitize(req.body.message);
    }
    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org"];
    let subject = 'Moonshot Pathway Question -- Contact Us Form';
    let content = "<div>"
        + "<h3>Questions from pathway:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "</p>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Message: "
        + message
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Email sent successfully, our team will be in contact with you shortly!");
        } else {
            res.status(500).send(msg);
        }
    })
}


async function POST_updateHiringStage(req, res) {
    const body = req.body;
    const userId = sanitize(body.userId);
    const verificationToken = sanitize(body.verificationToken);
    const companyId = sanitize(body.companyId);
    const candidateId = sanitize(body.candidateId);
    const hiringStage = sanitize(body.hiringStage);
    const isDismissed = sanitize(body.isDismissed);
    const pathwayId = sanitize(body.pathwayId);

    // if one of the arguments doesn't exist, return with error code
    if (!userId || !verificationToken || !companyId || !candidateId || !hiringStage || typeof isDismissed !== "boolean" || !pathwayId) {
        console.log("Not all arguments provided to /business/updateHiringStage");
        console.log("userId: ", userId);
        console.log("verificationToken: ", verificationToken);
        console.log("companyId: ", companyId);
        console.log("candidateId: ", candidateId);
        console.log("hiringStage: ", hiringStage);
        console.log("isDismissed: ", isDismissed);
        console.log("pathwayId: ", pathwayId);
        return res.status(400).send("Bad request.");
    }

    // ensure the hiring stage provided is valid
    const validHiringStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
    if (!validHiringStages.includes(hiringStage)) {
        console.log("Invalid hiring stage provided.");
        return res.status(400).send("Invalid hiring stage provided.");
    }

    // verify the employer is actually a part of this organization
    verifyEmployerAndReturnBusiness(userId, verificationToken, companyId)
    .then(business => {
        // if employer does not have valid credentials
        if (!business) {
            console.log("Employer tried to change candidate's hiring status but could not be verified.");
            return res.status(403).send("You do not have permission to change a candidate's hiring stage.");
        }

        // the index of the candidate in the business' candidate array
        const candidateIndex = business.candidates.findIndex(currCandidate => {
            return currCandidate.userId.toString() === candidateId.toString();
        });

        let candidate = business.candidates[candidateIndex];
        // get the index of the pathway in the user's pathways array
        const pathwayIndex = candidate.pathways.findIndex(currPathway => {
            return currPathway._id.toString() === pathwayId;
        })

        // change the candidate's hiring stage and dismissal status to match
        // the arguments that were passed in
        candidate.pathways[pathwayIndex].isDismissed = isDismissed;
        candidate.pathways[pathwayIndex].hiringStage = hiringStage;
        candidate.pathways[pathwayIndex].hiringStageEdited = new Date();

        // update the candidate in the business object
        business.candidates[candidateIndex] = candidate;

        // save the business
        business.save()
        .then(updatedBusiness => {
            return res.json("success");
        })
        .catch(updateBusinessErr => {
            return res.status(500).send("failure!");
        });
    })
    .catch(verifyEmployerErr => {
        console.log("Error when trying to verify employer when they were trying to edit a candidate's hiring stage: ", verifyEmployerErr);
        return res.status(500).send("Server error, try again later.");
    })

    // TODO make sure the timestamp of the last change is before the timestamp given
    // if it isn't, don't change the user
}


// ----->> END APIS <<----- //


// VERIFY THAT THE GIVEN USER IS LEGIT AND PART OF THE GIVEN BUSINESS
// RETURNS THE BUSINESS THAT THE EMPLOYER WORKS FOR ON SUCCESS, UNDEFINED ON FAIL
async function verifyEmployerAndReturnBusiness(userId, verificationToken, businessId) {
    return new Promise(async (resolve, reject) => {
        try {
            // function to print the info that was given; for when errors occur
            const printInfo = () => {
                console.log("Given userId: ", userId);
                console.log("Given verificationToken: ", verificationToken);
                console.log("Given businessId: ", businessId);
            }

            // if the arguments provided are invalid, cannot validate user
            if (typeof userId !== "string" || typeof verificationToken !== "string" || typeof businessId !== "string") {
                console.log("Employer could not be verified.");
                printInfo();
                return resolve(undefined);
            }

            // set to true once we've verified the user is real and has the right
            // verification token
            let verifiedUser = false;
            // set to true once we've verified the user is employed by the
            // business they say they are
            let verifiedPosition = false;
            // the business found in the db, returned on success
            let business = undefined;

            // find the employer by the given id
            Employers.findById(userId)
            .then(foundEmployer => {
                // if employer couldn't be found from the given id
                if (!foundEmployer) {
                    console.log("Couldn't find employer in the database when trying to verify them.");
                    printInfo();
                    return resolve(undefined);
                }
                // make sure the employer has the right verification token
                if (foundEmployer.verificationToken !== verificationToken) {
                    console.log("Employer gave wrong verification token when trying to be verified.");
                    printInfo();
                    return resolve(undefined);
                }
                // employer is real, return successfully if position in company verified
                verifiedUser = true;
                if (verifiedPosition) {
                    console.log("returning true");
                    return resolve(business);
                }
            })
            .catch(findEmployerErr => {
                console.log("Error finding employer in db when trying to verify employer: ", findEmployerErr);
                printInfo();
                return resolve(undefined);
            })


            // make sure the employer is in the business' employer id array
            Businesses.findById(businessId)
            .then(foundBusiness => {
                if (!foundBusiness) {
                    console.log("Did not find business when trying to verify employer.");
                    printInfo();
                    return resolve(undefined);
                }

                // try to find employer in business' employer id array
                const employerWorksForBusiness = foundBusiness.employerIds.some(employerId => {
                    // userId is that of the user we are trying to verify
                    return employerId.toString() === userId;
                });

                // employer did not exist within the business' employers array
                if (!employerWorksForBusiness) {
                    console.log("Employer did not exist within the business' employers array (they don't work for that company).");
                    printInfo();
                    return resolve(undefined);
                }

                // employer does work for this company, return successfully if they are verified
                verifiedPosition = true;
                business = foundBusiness
                if (verifiedUser) {
                    console.log("returning true");
                    return resolve(business);
                }
            })
            .catch(findBusinessErr => {
                console.log("Error finding business in db when trying to verify employer: ", findBusinessErr);
                printInfo();
                return resolve(undefined);
            });
        }
        // some error, probably in the database, so employer can't be verified
        catch (error) {
            console.log("Error verifying employer: ", error);
            return resolve(undefined);
        }
    });
}


module.exports = businessApis;
