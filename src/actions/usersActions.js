"use strict"
import axios from 'axios';
import { browserHistory } from 'react-router'
import { reset } from 'redux-form';


// GET USER FROM SESSION
export function getUserFromSession(callback) {
    return function(dispatch) {
        dispatch({
            type: "GET_USER_FROM_SESSION_REQUEST",
            isFetching: true,
            errorMessage: undefined
        });

        axios.get("/api/user/session")
            .then(function(response) {
                dispatch({
                    type: "GET_USER_FROM_SESSION",
                    payload: response.data,
                    isFetching: false});
                callback(true);
            })
            .catch(function(err) {
                dispatch({
                    type: "GET_USER_FROM_SESSION_REJECTED",
                    errorMessage:"error getting user from session",
                    isFetching: false});
                callback(true);
            })
    };
}

export function openAddUserModal() {
    return function(dispatch) {
        dispatch({type: "OPEN_ADD_USER_MODAL"});
    }
}

export function closeAddUserModal() {
    return function(dispatch) {
        dispatch({type: "CLOSE_ADD_USER_MODAL"});
    }
}

export function emailFailureExitPage() {
    return function(dispatch) {
        dispatch({type: "EMAIL_FAILURE_EXIT_PAGE"});
    }
}

export function login(user, saveSession, navigateBackUrl, pathwayId, pathwayName, employerAgreedToTerms) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});

        axios.post("/api/user/login", {user, saveSession, employerAgreedToTerms})
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({type:"LOGIN", payload: returnedUser});
                let nextUrl = '/myEvaluations';
                if (navigateBackUrl) {
                    nextUrl = navigateBackUrl;
                }

                // should add pathway to user if pathway id exists and user
                // doesn't already have that pathway
                const shouldAddPathwayToUser = pathwayId !== undefined && !returnedUser.pathways.some(function(path) {
                    return path.pathwayId === pathwayId;
                });

                // add pathway if user came here from trying to sign up for a pathway
                if (shouldAddPathwayToUser) {
                    // if the user doesn't already have this pathway, give it
                    // to them, then redirect to the pathway content page
                    axios.post("/api/candidate/addPathway", {_id: returnedUser._id, verificationToken: returnedUser.verificationToken, pathwayId: pathwayId, pathwayName: pathwayName})
                    .then(function(response) {
                        dispatch({type:"ADD_PATHWAY", payload:response.data, notification:{message:"Pathway added to My Pathways. Thanks for signing up!", type:"infoHeader"}});
                        // navigateBackUrl should be equal to the url for the pathway
                        if (!navigateBackUrl) {
                            navigateBackUrl = "/myEvaluations";
                        }
                        browserHistory.push(nextUrl);
                        window.scrollTo(0, 0);
                    })
                    .catch(function(err) {
                        dispatch({type:"ADD_PATHWAY_REJECTED", notification: {message: "Cannot sign up for pathway more than once. Sign up for pathway failed.", type: "errorHeader"}})
                        browserHistory.push(nextUrl);
                        window.scrollTo(0, 0);
                    })
                } else {
                    // otherwise go to the next screen
                    browserHistory.push(nextUrl);
                    window.scrollTo(0, 0);
                }
            })
            .catch(function(err) {
                dispatch({type: "LOGIN_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}


export function answerAdminQuestion(userId, verificationToken, questionType, questionId, sliderAnswer, selectedId, selectedText, finished) {
    return function(dispatch) {
        axios.post("/api/user/answerAdminQuestion", {userId, verificationToken, questionType, questionId, sliderAnswer, selectedId, selectedText, finished})
        .then(response => {
            dispatch({type: "NEW_CURRENT_USER", currentUser: response.data});
        })
        .catch(error => {
            // console.log("error answering admin question: ", error);
        })
    }
}


// LOG USER OUT
export function signout() {
    return function(dispatch) {
        dispatch({type:"SIGNOUT"});
        axios.post("/api/user/signOut")
        .then(function(response) {})
        .catch(function(err) {});
    }
}

export function onSignUpPage() {
    return function(dispatch) {
        dispatch({type: "ON_SIGNUP_PAGE"});
    }
}


export function positionSignup(userId, verificationToken, positionId, businessId) {
    return function(dispatch) {
        axios.post("/api/user/startPositionEval", {userId, verificationToken, positionId, businessId})
        .then(response => {
            dispatch({type: "START_POSITION_EVAL", currentUser: response.data.updatedUser});
            if (response.data.finished) {
                // console.log("All parts already answered!");
            } else {
                browserHistory.push(response.data.nextUrl);
                window.scrollTo(0, 0);
            }
        })
        .catch(error => {
            // console.log("Error starting position evaluation: ", error);
            // if (error.response && error.response.data) {
            //     console.log(error.response.data);
            // }
        })
    }
}


export function continueEval(userId, verificationToken, positionId, businessId) {
    return function(dispatch) {
        axios.post("/api/user/continuePositionEval", {userId, verificationToken, positionId, businessId})
        .then(response => {
            dispatch({type: "CONTINUE_POSITION_EVAL", currentUser: response.data.updatedUser});
            if (response.data.finished) {
                // console.log("All parts already answered!");
            } else {
                browserHistory.push(response.data.nextUrl);
                window.scrollTo(0, 0);
            }
        })
        .catch(error => {
            // console.log("Error starting position evaluation: ", error);
            // if (error.response && error.response.data) {
            //     console.log(error.response.data);
            // }
        })
    }
}


export function startPsychEval(userId, verificationToken) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post("/api/user/startPsychEval", {userId, verificationToken})
        .then(response => {
            dispatch({type: "START_PSYCH_EVAL", currentUser: response.data});
        })
        .catch(e => {
            let message = e.response && e.response.data ? e.response.data : "Error starting psych analysis.";
            dispatch({type: "START_PSYCH_EVAL_ERROR", notification: {message, type: "errorHeader"}});
        });
    }
}


export function agreeToTerms(userId, verificationToken, agreements) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post("/api/user/agreeToTerms", {userId, verificationToken, termsAndConditions: agreements})
        .then(response => {
            dispatch({type: "USER_UPDATE", currentUser: response.data});
        })
        .catch(error => {
            console.log("error: ", error);
        })
    }
}


export function agreeToSkillTestTerms(userId, verificationToken) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post("/api/skill/agreeToTerms", {userId, verificationToken})
        .then(response => {
            console.log("got response: ", response);
            dispatch({type: "USER_UPDATE", currentUser: response.data});
        })
        .catch(error => {
            console.log("error: ", error);
        })
    }
}


export function sawEvaluationIntro(userId, verificationToken) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post("/api/user/sawEvaluationIntro", {userId, verificationToken})
        .then(response => {
            dispatch({type: "USER_UPDATE", currentUser: response.data});

            const currentUser = response.data;
            const currentPosition = currentUser.currentPosition;

            // if the user doesn't actually have a test in progress
            if (!currentPosition) {
                browswerHistory.push("/myEvaluations");
            }

            // if the user has not yet dont the admin questions, they're on the first step
            else if (!currentUser.adminQuestions || !currentUser.adminQuestions.finished) {
                browserHistory.push("/adminQuestions");
            }
            // if user has not yet taken psych test or if they're currently taking it
            // they're on the second step
            else if (!currentUser.psychometricTest || (currentUser.psychometricTest && !currentUser.psychometricTest.endDate)) {
                browserHistory.push("/psychometricAnalysis");
            }
            // if they are on a skills test, add 3 to the current skill test index
            // (one because index 0 would be the first one and another two because of the psych test and admin questions)
            else if (currentPosition.skillTests && parseInt(currentPosition.testIndex, 10) < currentPosition.skillTests.length) {
                browserHistory.push(`/skillTest/${currentPosition.skillTests[currentPosition.testIndex]}`);
            }
            // otherwise user must be on the free response portion
            else {
                browswerHistory.push("/freeResponse");
            }
        })
        .catch(error => {
            console.log("error: ", error);
        })
    }
}


export function submitFreeResponse(userId, verificationToken, frqs) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post("/api/user/submitFreeResponse", {userId, verificationToken, frqs})
        .then(response => {
            dispatch({
                type: "SUBMIT_FREE_RESPONSE",
                currentUser: response.data.updatedUser,
                notification: {message: "Position evaluation complete!", type: "infoHeader"}
            });
            browserHistory.push("/myEvaluations");
            window.scrollTo(0, 0);
        })
        .catch(error => {
            // console.log("Error submitting free response answers: ", error);
        });
    }
}


export function resetFrizz(userId, verificationToken) {
    return function(dispatch) {
        axios.post("/api/user/resetFrizz", {userId, verificationToken})
        .then(response => {
            dispatch({type: "USER_UPDATE", currentUser: response.data, notification:{message: "Frizz reset!", type: "infoHeader"}});
            browserHistory.push("/positionSignup");
            window.scrollTo(0, 0);
        })
        .catch(error => {
            dispatch({type: "NOTIFICATION", notification:{message: error.response.data, type: "errorHeader"}})
            // console.log("error: ", error);
        })
    }
}
export function reset24(userId, verificationToken) {
    return function(dispatch) {
        axios.post("/api/user/reset24", {userId, verificationToken})
        .then(response => {
            dispatch({type: "USER_UPDATE", currentUser: response.data, notification:{message: "24 reset!", type: "infoHeader"}});
            browserHistory.push("/positionSignup");
            window.scrollTo(0, 0);
        })
        .catch(error => {
            dispatch({type: "NOTIFICATION", notification:{message: error.response.data, type: "errorHeader"}})
            // console.log("error: ", error);
        })
    }
}


// POST USER
export function postUser(user) {
    return function(dispatch) {

        dispatch({type: "POST_USER_REQUESTED"});

        // post user to database
        axios.post("/api/candidate/candidate", user)
            // user successfully posted
            .then(function(response) {
                // send verification email
                axios.post("/api/candidate/sendVerificationEmail", {email: user.email})
                    // successfully sent verification email
                    .then(function(emailResponse) {
                        dispatch({type:"POST_USER"});
                        window.scrollTo(0,0);
                    })
                    // error sending verification email
                    .catch(function(emailError) {
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", notification:{message: emailError.response.data, type: "errorHeader"}});
                        window.scrollTo(0,0);
                    });
            })
            // error posting user
            .catch(function(err) {
                dispatch({type: "POST_USER_REJECTED", notification:{message: err.response.data, type: "errorHeader"}});
            });
    }
}

// POST EMAIL INVITES
export function postEmailInvites(candidateEmails, employeeEmails, adminEmails, currentUserInfo) {
    return function(dispatch) {
        dispatch({type: "POST_EMAIL_INVITES_REQUESTED"});

        axios.post("/api/business/postEmailInvites", {candidateEmails, employeeEmails, adminEmails, currentUserInfo})
            // email invites success
            .then(function(res) {
                dispatch({type: "POST_EMAIL_INVITES_SUCCESS"});
            })
            // error posting email invites
            .catch(function(err) {
                dispatch({type: "POST_EMAIL_INVITES_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}

// POST BUSINESS USER
export function postEmployer(newUser, currentUser) {
    return function(dispatch) {
        dispatch({type: "POST_USER_REQUESTED"});

        // post user to database
        axios.post("/api/employer/newEmployer", {newUser, currentUser})
            // user successfully posted
            .then(function(companyName) {
                // send verification email
                axios.post("/api/employer/sendVerificationEmail", {email: newUser.email, companyName})
                    // successfully sent verification email
                    .then(function(emailResponse) {
                        dispatch({type:"POST_USER"});
                        window.scrollTo(0,0);
                    })
                    // error sending verification email
                    .catch(function(emailError) {
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", notification:{message: emailError.response.data, type: "errorHeader"}});
                        window.scrollTo(0,0);
                    });
            })
            // error posting user
            .catch(function(err) {
                dispatch({type: "POST_USER_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}


export function addNotification(message, notificationType) {
    return function(dispatch) {
        let noteType = "infoHeader";
        if (notificationType === "error") {
            noteType = "errorHeader";
        }
        dispatch({type: "ADD_NOTIFICATION", notification:{message, type: noteType}});
    }
}


export function closeNotification() {
    return function(dispatch) {
        dispatch({type: "CLOSE_NOTIFICATION"});
    }
}

// FORGOT PASSWORD
export function forgotPassword(user) {
    return function(dispatch) {
        dispatch({type: "FORGOT_PASSWORD_REQUESTED"});

        axios.post("/api/user/forgotPassword", user)
            .then(function(response) {
                dispatch({type:"FORGOT_PASSWORD", notification:{message: response.data, type:"infoHeader"}})
            })
            .catch(function(err) {
                dispatch({type:"FORGOT_PASSWORD_REJECTED", notification:{message: err.response.data, type:"errorHeader"}})
            })
    }
}


export function newCurrentUser(currentUser) {
    return function(dispatch) {
        dispatch({type: "NEW_CURRENT_USER", currentUser})
    }
}


// UPDATE A USER
export function updateUser(user) {
    return function(dispatch) {
        // make loading circle show up
        dispatch({type:"START_LOADING"});
        // update user on the database
        axios.post("/api/user/changeSettings", user)
        .then(function(response) {
            dispatch({type:"UPDATE_USER", payload:response.data, notification:{message: "Settings updated!", type: "infoHeader"}});
            window.scrollTo(0, 0);
        })
        .catch(function(err) {
            dispatch({type:"UPDATE_USER_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
            window.scrollTo(0, 0);
        });
    }
}

export function changePassword(user) {
    return function(dispatch) {
        // make loading circle show up
        dispatch({type:"START_LOADING"});

        axios.post('/api/user/changePassword', user)
        .then(function(response) {
            dispatch({type:"CHANGE_PASSWORD", payload:response.data, notification:{message:"Password changed!", type:"infoHeader"}})
            // reset the form
            dispatch(reset("changePassword"));
        })
        .catch(function(err){
            dispatch({type:"CHANGE_PASSWORD_REJECTED", notification:{message: err.response.data, type: "errorHeader"}})
        });
    }
}

// VERIFY EMAIL
export function verifyEmail(userType, token) {
    return function(dispatch) {
        axios.post("/api/user/verifyEmail", {userType, token})
            .then(function(response) {
                if (!response.data || response.data === "go to login") {
                    let nextLocation = "/login";
                    dispatch({type: "NOTIFICATION", notification:{message: "Account verified!", type: "infoHeader"}});
                    browserHistory.push(nextLocation);
                } else {
                    // don't show verification notification if going straight to onboarding because it's implied
                    dispatch({type: "LOGIN", payload:response.data});
                    browserHistory.push('/myEvaluations');
                }
            })
            .catch(function(err) {
                dispatch({type: "VERIFY_EMAIL_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}

export function changePasswordForgot(user) {
    return function(dispatch) {
        // activate loading spinner
        dispatch({type: "START_LOADING"});

        axios.post("api/user/changePasswordForgot", user)
            .then(function(response) {
                const foundUser = response.data;
                axios.post("/api/user/session", {userId: foundUser._id, verificationToken: foundUser.verificationToken})
                .catch(function(err2) {});

                dispatch({type:"LOGIN", payload:foundUser, notification:{message:"Password changed!", type:"infoHeader"}});
                let nextUrl = "/";
                let returnedUser = response.data;
                browserHistory.push(nextUrl);
            })
            .catch(function(err) {
                dispatch({type:"CHANGE_PASS_FORGOT_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
            })
    }
}

export function changeTempPassword(user) {
    return function(dispatch) {
        axios.post("/api/employer/changeTempPassword", user)
        .then(function(response) {
            const returnedUser = response.data;

            dispatch({type: "LOGIN", payload: returnedUser, notification: {message: "Your password was changed, you are now logged in!", type: "infoHeader"}});
            browserHistory.push('/myEvaluations');

            axios.post("/api/user/session", {userId: returnedUser._id, verificationToken: returnedUser.verificationToken})
            .catch(function(err) {
                // what to do if session couldn't be saved for some reason
            });
        })
        .catch(function(err) {
            dispatch({type:"CHANGE_TEMP_PASS_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
        })
    }
}

// Send an email when form filled out on forBusiness page
export function demoEmail(user){
    return function(dispatch) {
        axios.post("api/business/demoEmail", user)
            .then(function(response) {
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on forBusiness page
export function dialogEmail(user){
    return function(dispatch) {
        axios.post("api/business/dialogEmail", user)
            .then(function(response) {
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on forBusiness page
export function dialogEmailScreen2(user){
    return function(dispatch) {
        axios.post("api/business/dialogEmailScreen2", user)
            .then(function(response) {
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on forBusiness page
export function dialogEmailScreen3(user){
    return function(dispatch) {
        axios.post("api/business/dialogEmailScreen3", user)
            .then(function(response) {
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on forBusiness page
export function dialogEmailScreen4(user){
    return function(dispatch) {
        axios.post("api/business/dialogEmailScreen4", user)
            .then(function(response) {
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on forBusiness page
export function forBusiness(user){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/business/forBusinessEmail", user)
            .then(function(response) {
                dispatch({type:"FOR_BUSINESS", notification: {message:response.data, type:"infoHeader"}});
                browserHistory.push('/');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}


// Send an email when somebody completes a pathway
export function completePathway(user){
    return function(dispatch) {
        dispatch({type: "COMPLETE_PATHWAY_REQUESTED"});

        axios.post("api/candidate/completePathway", user)
            .then(function(response) {
                dispatch({type:"COMPLETE_PATHWAY", user: response.data.user, notification: {message:response.data.message, type:"infoHeader"}});
                browserHistory.push('/');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                // info we get back from the error
                const errData = err.response.data;
                // if the error is due to the user not having all steps complete
                if (typeof errData === "object" && errData.incompleteSteps) {
                    dispatch({type: "COMPLETE_PATHWAY_REJECTED_INCOMPLETE_STEPS", incompleteSteps: errData.incompleteSteps});
                    return;
                }

                // if there is a notification message, show that
                let notification = undefined;
                if (typeof errData === "string") {
                    notification = {
                        message: errData,
                        type: "errorHeader"
                    }
                }

                dispatch({ type:"COMPLETE_PATHWAY_REJECTED", notification })
            })
    }
}


// get rid of any old incomplete steps that would prevent the user from
// completing a pathway
export function resetIncompleteSteps() {
    return function(dispatch) {
        dispatch({type: "RESET_INCOMPLETE_STEPS"});
    }
}



// Send an email when form filled out on unsubscribe page
export function unsubscribe(user, showNotification){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/user/unsubscribeEmail", user)
            .then(function(response) {
                let action = { type:"FOR_BUSINESS" };
                // only show the notification if the user unsubscribed by typing
                // in their email address
                if (showNotification) {
                    action.notification = { message:response.data, type:"infoHeader" }
                }

                dispatch(action);
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on comingSoon page
export function comingSoon(user, signedIn){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/candidate/comingSoonEmail", user)
            .then(function(response) {
                if (!signedIn) {
                    dispatch({type:"FOR_BUSINESS", notification: {message:response.data, type:"infoHeader"}});
                    browserHistory.push('/login')
                    dispatch({type:"CHANGE_CURRENT_ROUTE", payload:'/login'})
                    window.scrollTo(0, 0);
                } else {
                    dispatch({type:"FOR_BUSINESS", notification: undefined});
                }
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// ADD a pathway to a user
export function addPathway(user) {
    return function(dispatch) {
        axios.post("/api/candidate/addPathway", user)
            .then(function(response) {
                dispatch({type:"ADD_PATHWAY", payload:response.data, notification:{message:"Pathway added to My Pathways. Thanks for signing up!", type:"infoHeader"}});
                window.scrollTo(0, 0);
                browserHistory.push("/pathwayContent?pathway=" + user.pathwayUrl);
            })
            .catch(function(err) {
                dispatch({type:"ADD_PATHWAY_REJECTED", notification: {message: "You can't sign up for a pathway more than once.", type: "errorHeader"}})
                window.scrollTo(0, 0);
            })
    }
}

// DELETE A USER
export function deleteUser(id) {
  return function(dispatch) {
    axios.delete("/api/user/" + id)
      .then(function(response) {
        dispatch({type: "DELETE_USER", payload: id});
      })
      .catch(function(err) {
        dispatch({type: "DELETE_USER_REJECTED", payload: err});
      })
  }
}

export function updateCurrentSubStep(user, pathwayId, stepNumber, subStep) {
    return function(dispatch) {
        let currentUser = Object.assign({}, user);
        // set the current step for the user in redux state
        currentUser.pathways.find(function(path) {
            return path.pathwayId == pathwayId
        }).currentStep = {subStep: subStep.order, step: stepNumber};
        dispatch({type: "UPDATE_CURRENT_SUBSTEP", payload: subStep, pathwayId, currentUser});

        axios.post("/api/candidate/currentPathwayStep", {
            params: {
                userId: user._id,
                pathwayId: pathwayId,
                stepNumber: stepNumber,
                subStepNumber: subStep.order,
                verificationToken: user.verificationToken
            }
        })
        .then(function(response) {
        })
        .catch(function(err) {
        });
    }
}

export function updateAnswer(userId, verificationToken, quizId, answer) {
    return function(dispatch) {
        axios.post("/api/candidate/updateAnswer", {
            params: { userId, verificationToken, quizId, answer }
        })
        .then(function(response) {
            dispatch({type: "UPDATE_ANSWER", currentUser: response.data});
        })
        .catch(function(error) {
            // console.log("ERROR: ", error);
            // console.log(error.response.data)
        });
    }
}


export function updateAllOnboarding(userId, verificationToken, interests, goals, info) {
    return function(dispatch) {
        axios.post("/api/candidate/updateAllOnboarding", {
            params: { userId, verificationToken, interests, goals, info }
        })
        .then(function(response) {
            dispatch({type: "UPDATE_USER_ONBOARDING", payload: response.data});
        })
        .catch(function(err) {
            // console.log("Error updating onboarding info: ", err);
        })
    }
}


export function startOnboarding(){
    return function(dispatch) {
        dispatch({type: "START_ONBOARDING"});
    }
}

export function endOnboarding(user, markOnboardingComplete, removeRedirectField){
    return function(dispatch) {
        if (markOnboardingComplete) {
            axios.post("/api/candidate/endOnboarding", {userId: user._id, verificationToken: user.verificationToken, removeRedirectField})
            .then(function(response) {
                dispatch({type: "END_ONBOARDING", user: response.data});
            })
            .catch(function(err) {
                // onboarding setting not able to be turned off for some reason
                // console.log("onboarding mark complete error: ", err);
                dispatch({type: "END_ONBOARDING_REJECTED"});
            })
        } else {
            dispatch({type: "END_ONBOARDING"});
        }

    }
}


export function answerPsychQuestion(userId, verificationToken, answer) {
    return function(dispatch) {
        axios.post("/api/user/answerPsychQuestion", {userId, verificationToken, answer})
        .then(response => {
            dispatch({
                type: "ANSWER_PSYCH_QUESTION",
                user: response.data.user,
                finishedTest: response.data.finishedTest
            })
        })
        .catch(err => {
            // console.log("Error answering psych question: ", err);
            dispatch({type: "ANSWER_PSYCH_QUESTION_ERROR", notification: { message: err.response.data, type: "errorHeader" } });
        });
    }
}


// Send an email when form filled out on contactUs page
export function contactUs(user){
    return function(dispatch) {
        dispatch({type: "CONTACT_US_REQUESTED"});

        axios.post("/api/business/contactUsEmail", user)
            .then(function(response) {
                dispatch({type:"CONTACT_US", notification: {message:response.data, type:"infoHeader"}});
                browserHistory.push('/myPathways');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"CONTACT_US", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}


// POST A NEW BUSINESS
export function postBusiness(business) {
    return function(dispatch) {
        // show loading bar
        dispatch({type:"START_LOADING"});

        axios.post("/api/admin/business", business)
        .then(function(response) {
            dispatch({type: "SUCCESS_FINISHED_LOADING", notification: {message: response.data, type: "infoHeader"}});
            // redirect to edit business page
            if (typeof business.businessName === "string") {
                const editBusinessUrl = '/admin/editBusiness?' + business.businessName;
                browserHistory.push(editBusinessUrl);
                window.scrollTo(0,0);
            }
        })
        .catch(function(err) {
            let msg = "Error creating new business. Try again later.";
            if (err && err.response && typeof err.response.data === "string") {
                msg = err.response.data;
            }
            dispatch({type: "ERROR_FINISHED_LOADING", notification: {message: msg, type: "errorHeader"}});
            window.scrollTo(0,0);
        })
    }
}


export function formError() {
    return function(dispatch) {
        dispatch({type:"FORM_ERROR", notification: {message: "Fields must all be filled in to submit form.", type: "errorHeader"}})
    }
}
