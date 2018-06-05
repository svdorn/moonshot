var Businesses = require('../models/businesses.js');
var Users = require('../models/users.js');
var Pathways = require('../models/pathways.js');

const crypto = require('crypto');

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
        frontEndUser
} = require('./helperFunctions.js');


const businessApis = {
    POST_forBusinessEmail,
    POST_contactUsEmail,
    POST_updateHiringStage,
    POST_answerQuestion,
    POST_emailInvites,
    GET_pathways,
    GET_candidateSearch,
    GET_employees,
    GET_positions
}


// ----->> START APIS <<----- //

function POST_emailInvites(req, res) {
    const body = req.body;
    const candidateEmails = sanitize(body.candidateEmails);
    const employeeEmails = sanitize(body.employeeEmails);
    const managerEmails = sanitize(body.managerEmails);
    const adminEmails = sanitize(body.adminEmails);
    const userId = sanitize(body.currentUserInfo.userId);
    const verificationToken = sanitize(body.currentUserInfo.verificationToken);
    const companyId = sanitize(body.currentUserInfo.companyId);
    const positionId = sanitize(body.currentUserInfo.positionId);

    // if one of the arguments doesn't exist, return with error code
    if (!candidateEmails || !employeeEmails || !managerEmails || !adminEmails || !userId || !companyId || !verificationToken || !positionId) {
        return res.status(400).send("Bad request.");
    }

    let moonshotUrl = 'https://www.moonshotinsights.io/';

    // verify the employer is actually a part of this organization
    verifyEmployerAndReturnBusiness(userId, verificationToken, companyId)
    .then(business => {
        // if employer does not have valid credentials
        if (!business) {
            console.log("Employer tried to send verification links");
            return res.status(403).send("You do not have permission to send verification links.");
        }

        let code = business.code;

        const positionIndex = business.positions.findIndex(currPosition => {
            return currPosition._id.toString() === positionId.toString();
        });

        let position = business.positions[positionIndex];

        // Add the position code onto the end of the code
        code = code.toString().concat(position.code);

        // Send candidate emails
        for (let i = 0; i < candidateEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            if (position.candidateCodes) {
                position.candidateCodes.push(userCode);
            } else {
                position.candidateCodes = [];
                position.candidateCodes.push(userCode);
            }
            // send email
            let recipient = [candidateEmails[i]];
            let subject = 'You&#39;ve Been Invited!';
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#7d7d7d">'
                    + '<div style="font-size:28px;color:#0c0c0c;">You&#39;ve Been Invited to Moonshot!</div>'
                    + '<p style="width:600px; display:inline-block; text-align:left;">&#09;You&#39;ve been invited by (name) from (company) as a candidate!'
                    + ' Please click the button below to create your account.'
                    + ' Once you&#39;ve created your account you can begin your evaluation!</p>'
                    + '<br/><p style="width:600px; display:inline-block; text-align:left;">Welcome to the Moonshot process!</p><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border-radius:14px 14px 14px 14px;color:white;padding:10px 5px 0px;text-decoration:none;margin:20px;background:#494b4d;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<p><b style="color:#0c0c0c">Questions?</b> Shoot an email to <b style="color:#0c0c0c">support@moonshotinsights.io</b></p>'
                    + '<div style="text-align:left;width:80%;margin-left:10%;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + candidateEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Send employee emails
        for (let i = 0; i < employeeEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            if (position.employeeCodes) {
                position.employeeCodes.push(userCode);
            } else {
                position.employeeCodes = [];
                position.employeeCodes.push(userCode);
            }
            // send email
            let recipient = [employeeEmails[i]];
            let subject = 'You&#39;ve Been Invited!';
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<div style="text-align:left;width:80%;margin-left:10%;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + employeeEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Send manager emails
        for (let i = 0; i < managerEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            if (position.managerCodes) {
                position.managerCodes.push(userCode);
            } else {
                position.managerCodes = [];
                position.managerCodes.push(userCode);
            }
            // send email
            let recipient = [managerEmails[i]];
            let subject = 'You&#39;ve Been Invited!';
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<div style="text-align:left;width:80%;margin-left:10%;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + managerEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Send admin emails
        for (let i = 0; i < adminEmails.length; i++) {
            // add code to the position
            const userCode = crypto.randomBytes(64).toString('hex');
            if (position.adminCodes) {
                position.adminCodes.push(userCode);
            } else {
                position.adminCodes = [];
                position.adminCodes.push(userCode);
            }
            // send email
            let recipient = [adminEmails[i]];
            let subject = 'You&#39;ve Been Invited!';
            let content =
                '<div style="font-size:15px;text-align:center;font-family: Arial, sans-serif;color:#686868">'
                    + '<a href="' + moonshotUrl + '" style="color:#00c3ff"><img alt="Moonshot Logo" style="height:100px;margin-bottom:20px"src="https://image.ibb.co/iAchLn/Official_Logo_Blue.png"/></a><br/>'
                    + '<a style="display:inline-block;height:28px;width:170px;font-size:18px;border:2px solid #00d2ff;color:#00d2ff;padding:10px 5px 0px;text-decoration:none;margin:20px;" href="' + moonshotUrl + 'signup?code='
                    + code + "&userCode=" + userCode
                    + '">Create Account</a>'
                    + '<div style="text-align:left;width:80%;margin-left:10%;">'
                        + '<span style="margin-bottom:20px;display:inline-block;">On behalf of the Moonshot Team, we welcome you to our family and look forward to helping you pave your future and shoot for the stars.</span><br/>'
                        + '<div style="font-size:10px; text-align:center; color:#C8C8C8; margin-bottom:30px;">'
                        + '<i>Moonshot Learning, Inc.<br/><a href="" style="text-decoration:none;color:#D8D8D8;">1261 Meadow Sweet Dr<br/>Madison, WI 53719</a>.<br/>'
                        + '<a style="color:#C8C8C8; margin-top:20px;" href="' + moonshotUrl + 'unsubscribe?email=' + adminEmails[i] + '">Opt-out of future messages.</a></i>'
                        + '</div>'
                    + '</div>'
                + '</div>';

            const sendFrom = "Moonshot";
            sendEmail(recipient, subject, content, sendFrom, undefined, function (success, msg) {
                if (!success) {
                    res.status(500).send(msg);
                }
            })
        }
        // Save the new business object with updated positions array
        // update the employee in the business object
        business.positions[positionIndex] = position;

        // save the business
        business.save()
        .then(updatedBusiness => {
            return res.json(position);
        })
        .catch(updateBusinessErr => {
            return res.status(500).send("failure!");
        });




    })
    .catch(verifyEmployerErr => {
        console.log("Error when trying to verify employer when they were trying to send verification links: ", verifyEmployerErr);
        return res.status(500).send("Server error, try again later.");
    })


}

function POST_forBusinessEmail(req, res) {
    let phone = "None given";
    if (req.body.phone) {
        phone = sanitize(req.body.phone);
    }
    let company = "None given";
    if (req.body.company) {
        company = sanitize(req.body.company);
    }
    let recipients = ["kyle@moonshotlearning.org", "justin@moonshotlearning.org", "stevedorn9@gmail.com"];
    let subject = 'Moonshot Sales Lead - From Home Page';

    let content = "<div>"
        + "<h3>Sales Lead from Home Page:</h3>"
        + "<p>Name: "
        + sanitize(req.body.name)
        + "</p>"
        + "<p>Email: "
        + sanitize(req.body.email)
        + "</p>"
        + "<p>Company: "
        + company
        + "</p>"
        + "<p>Phone Number: "
        + phone
        + "</p>"
        + "</div>";

    const sendFrom = "Moonshot";
    sendEmail(recipients, subject, content, sendFrom, undefined, function (success, msg) {
        if (success) {
            res.json("Thank you for contacting us, our team will get back to you shortly.");
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
    let recipients = ["kyle@moonshotinsights.io", "justin@moonshotinsights.io"];
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

function POST_answerQuestion(req, res) {
    const body = req.body;
    const userId = sanitize(body.user.userId);
    const employeeId = sanitize(body.user.employeeId);
    const verificationToken = sanitize(body.user.verificationToken);
    const questionIndex = sanitize(body.user.questionIndex);
    const score = sanitize(body.user.score);
    const companyId = sanitize(body.user.companyId);
    const gradingComplete = sanitize(body.user.gradingComplete);

    if (!userId || !verificationToken || !(typeof questionIndex === 'number') || !(typeof score === 'number') || !employeeId || !companyId) {
        return res.status(400).send("Bad request.");
    }

    // verify the employer is actually a part of this organization
    verifyEmployerAndReturnBusiness(userId, verificationToken, companyId)
    .then(business => {
        // if employer does not have valid credentials
        if (!business) {
            console.log("Employer tried to update an answer to a question and didn't have access.");
            return res.status(403).send("You do not have permission to change an employees answers.");
        }

        // the index of the employee in the employee array
        const employeeIndex = business.employees.findIndex(currEmployee => {
            return currEmployee.employeeId.toString() === employeeId.toString();
        });

        let employee = business.employees[employeeIndex];


        // get the index of the answer in the user's answers array
        const answerIndex = employee.answers.findIndex(answer => {
            return answer.questionIndex === questionIndex;
        });

        if (answerIndex === -1) {
            const newAnswer = {
                complete: true,
                score: score,
                questionIndex: questionIndex
            };
            employee.answers.push(newAnswer);
        } else {
            employee.answers[answerIndex].score = score;
        }

        employee.gradingComplete = gradingComplete;

        // update the employee in the business object
        business.employees[employeeIndex] = employee;

        // save the business
        business.save()
        .then(updatedBusiness => {
            return res.json(employee.answers);
        })
        .catch(updateBusinessErr => {
            return res.status(500).send("failure!");
        });
    })
    .catch(verifyEmployerErr => {
        console.log("Error when trying to verify employer when they were trying to edit an answer for a question: ", verifyEmployerErr);
        return res.status(500).send("Server error, try again later.");
    })
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
            Users.findById(userId)
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

function GET_employees(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    Users.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their employees: ", findBUserErr);
            return res.status(500).send("Server error, try again later.");
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            return res.status(403).send("You do not have permission to access employee info.");
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            return res.status(403).send("You do not have permission to access employee info.");
        }

        const companyId = user.businessInfo.company.companyId;
        let businessQuery = { '_id': companyId }

        Businesses.find(businessQuery)
        .select("employees employeeQuestions")
        .exec(function(findEmployeesErr, employees)
        {
            if (findEmployeesErr) {
                return res.status(500).send("Server error, couldn't get employees.");
            } else {
                return res.json(employees[0]);
            }
        });
    })
}

function GET_positions(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    Users.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their positions: ", findBUserErr);
            return res.status(500).send("Server error, try again later.");
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            return res.status(403).send("You do not have permission to access positions info.");
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            return res.status(403).send("You do not have permission to access positions info.");
        }

        const companyId = user.businessInfo.company.companyId;
        let businessQuery = { '_id': companyId }

        Businesses.find(businessQuery)
        .select("positions")
        .exec(function(findPositionsErr, positions)
        {
            if (findPositionsErr) {
                return res.status(500).send("Server error, couldn't get positions.");
            } else {
                return res.json(positions[0]);
            }
        });
    })
}

function GET_pathways(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    Users.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their pathways: ", findBUserErr);
            return res.status(500).send("Server error, try again later.");
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            return res.status(403).send("You do not have permission to access pathway info.");
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            return res.status(403).send("You do not have permission to access pathway info.");
        }

        const companyId = user.businessInfo.company.companyId;
        Businesses.findById(companyId, function(findBizErr, company) {
            if (findBizErr) {
                console.log("Error finding business when trying to search for pathways: ", findBizErr);
                return res.status(500).send("Server error, try again later.");
            }

            if (!company) {
                console.log("Business not found when trying to search for pathways.");
                return res.status(500).send("Server error, try again later.");
            }

            // if the business doesn't have an associated user with the given
            // user id, don't let them see this business' candidates
            const userIdString = userId.toString();
            if (!company.employerIds.some(function(bizUserId) {
                return bizUserId.toString() === userIdString;
            })) {
                console.log("User tried to log in to a business with an id that wasn't in the business' id array.");
                return res.status(403).send("You do not have access to this business' pathways.");
            }

            // if we got to this point it means the user is allowed to see pathways

            let pathwayQuery = { '_id': { $in: company.pathwayIds } }

            // find names of all the pathways associated with the business
            Pathways.find(pathwayQuery)
            .select("name")
            .exec(function(findPathwaysErr, pathways) {
                if (findPathwaysErr) {
                    return res.status(500).send("Server error, couldn't get pathways to search by.");
                } else {
                    const pathwaysToReturn = pathways.map(function(path) {
                        return {name: path.name, _id: path._id};
                    });
                    return res.json(pathwaysToReturn);
                }
            });
        });
    })
}


function GET_candidateSearch(req, res) {
    const userId = sanitize(req.query.userId);
    const verificationToken = sanitize(req.query.verificationToken);

    if (!userId || !verificationToken) {
        return res.status(400).send("Bad request.");
    }

    Users.findById(userId, function(findBUserErr, user) {
        // error finding user in db
        if (findBUserErr) {
            console.log("Error finding business user who was trying to see their candidates: ", findBUserErr);
            return res.status(500).send("Server error, try again later.");
        }

        // couldn't find user in business user db, either they have the wrong
        // type of account or are trying to pull some dubious shenanigans
        if (!user) {
            return res.status(403).send("You do not have permission to access candidate info.");
        }

        // user does not have the right verification token, probably trying to
        // pull a fast one on us
        if (user.verificationToken !== verificationToken) {
            return res.status(403).send("You do not have permission to access candidate info.");
        }

        const companyId = user.businessInfo.company.companyId;
        Businesses.findById(companyId, function(findBizErr, company) {
            if (findBizErr) {
                console.log("Error finding business when trying to search for candidates: ", findBizErr);
                return res.status(500).send("Server error, try again later.");
            }

            if (!company) {
                console.log("Business not found when trying to search for candidates.");
                return res.status(500).send("Server error, try again later.");
            }

            // if the business doesn't have an associated user with the given
            // user id, don't let them see this business' candidates
            const userIdString = userId.toString();
            if (!company.employerIds.some(function(bizUserId) {
                return bizUserId.toString() === userIdString;
            })) {
                console.log("User tried to log in to a business with an id that wasn't in the business' id array.");
                return res.status(403).send("You do not have access to this business' candidates.");
            }

            // if we got to this point it means the user is allowed to see candidates

            // all of a company's candidates
            const allCandidates = company.candidates;

            const searchTerm = sanitize(req.query.searchTerm);
            const hiringStage = sanitize(req.query.hiringStage);
            const pathway = sanitize(req.query.pathway);

            let candidatesToReturn = [];

            // go through each candidate, only add them if they match all
            // the search factors
            allCandidates.forEach(function(candidate) {
                if (searchTerm) {
                    // case insensitive search term regex
                    const termRegex = new RegExp(searchTerm, "i");
                    // if neither name nor email match search term, don't add
                    if (!(termRegex.test(candidate.email) || termRegex.test(candidate.name))) {
                        return;
                    }
                }
                if (hiringStage || pathway) {
                    // go through each of the candidates pathways, if they aren't
                    // at this hiring stage for any, return
                    const hasStageAndPathway = candidate.pathways.some(function(path) {
                        // if only looking for a certain pathway, just look for matching pathway
                        if (!hiringStage) {
                            return path.name == pathway;
                        }
                        // if only looking for certain hiring stage, just look for matching hiring stage
                        else if (!pathway) {
                            return path.hiringStage == hiringStage;
                        }
                        // otherwise look for a matching pathway name AND hiring stage on the same pathway
                        else {
                            return path.hiringStage == hiringStage && path.name == pathway;
                        }
                    });
                    if (!hasStageAndPathway) {
                        return;
                    }
                }

                // if the candidate made it past all the search terms, add them
                candidatesToReturn.push(candidate);
            });

            res.json(candidatesToReturn);
        });
    })
}


module.exports = businessApis;
