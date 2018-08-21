"use strict"
import axios from 'axios';
import { browserHistory } from 'react-router'
import { reset } from 'redux-form';
import { goTo } from "../miscFunctions";


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


// set whether the webp image format is supported
export function setWebpSupport(webpSupported) {
    return function(dispatch) {
        dispatch({type: "SET_WEBP_SUPPORT", webpSupported})
    }
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

export function openContactUsModal() {
    return function(dispatch) {
        dispatch({type: "OPEN_CONTACT_US_MODAL"});
    }
}

export function closeContactUsModal() {
    return function(dispatch) {
        dispatch({type: "CLOSE_CONTACT_US_MODAL"});
    }
}

// Send an email when form filled out on forBusiness page
export function contactUsEmail(user){
    return function(dispatch) {
        dispatch({type: "START_LOADING"});

        axios.post("api/business/contactUsEmailNotLoggedIn", user)
            .then(function(response) {
                dispatch({type:"CONTACT_US_EMAIL_SUCCESS", payload: response.data})
            })
            .catch(function(err) {
                dispatch({type:"CONTACT_US_EMAIL_FAILURE", payload: "Error sending email."})
            })
    }
}

export function emailFailureExitPage() {
    return function(dispatch) {
        dispatch({type: "EMAIL_FAILURE_EXIT_PAGE"});
    }
}

export function login(user, saveSession, navigateBackUrl) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});

        axios.post("/api/user/login", {user, saveSession})
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({type:"LOGIN", user: returnedUser});
                let nextUrl = '/myEvaluations';
                if (navigateBackUrl) {
                    nextUrl = navigateBackUrl;
                }
                // go to the next screen
                browserHistory.push(nextUrl);
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type: "LOGIN_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}


// update user object in redux store
export function updateUser(user) {
    return function(dispatch) {
        dispatch({type: "UPDATE_USER", user});
    }
}


export function updateOnboarding(onboarding, verificationToken, userId, extraArgs) {
    return function(dispatch) {
        axios.post("/api/user/updateOnboarding", {onboarding, verificationToken, userId})
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({type:"UPDATE_ONBOARDING", payload: returnedUser});
            })
            .catch(function(err) {
                dispatch({type: "UPDATE_ONBOARDING_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}


export function sawMyCandidatesInfoBox(userId, verificationToken) {
    return function(dispatch) {
        axios.post("/api/business/sawMyCandidatesInfoBox", {userId, verificationToken})
        .then(response => {
            dispatch({type: "USER_UPDATE", currentUser: response.data});
        })
        .catch(error => {
            console.log("Error seeing my candidates info box: ", error);
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

export function startLoading() {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
    }
}

export function stopLoading() {
    return function(dispatch) {
        dispatch({type: "STOP_LOADING"});
    }
}


export function setupBillingCustomer(source, email, userId, verificationToken) {
    return function(dispatch) {
        axios.post("/api/billing/customer", {source, email, userId, verificationToken})
        .then(response => {
            dispatch({type: "SUCCESS_BILLING_CUSTOMER", notification: {message: "Success adding credit card to company.", type: "infoHeader"}});
        })
        .catch(error => {
            console.log(error);
            dispatch({type: "FAILURE_BILLING_CUSTOMER", notification: {message: error, type: "errorHeader"}});
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


export function createBusinessAndUser(userInfo) {
    return function(dispatch) {
        // start the loading bar
        dispatch({type: "START_LOADING"});
        axios.post("/api/business/createBusinessAndUser", userInfo)
        .then(response => {
            dispatch({ type: "LOGIN", user: response.data, notification: { message: "Your account has been activated! Thanks for signing up!", type: "infoHeader"} });
            goTo("/onboarding");
        })
        .catch(error => {
            dispatch({type: "NOTIFICATION_AND_STOP_LOADING", notification: {message: error.response.data, type: "errorHeader"}});
        })
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

            if (response.data.positionId === "5b2952445635d4c1b9ed7b04" && response.data.businessId === "5b29597efb6fc033f887fda0") {
                let url = "/influencer?user=" + response.data.updatedUser._id + "&businessId=" + response.data.businessId + "&positionId=" + response.data.positionId;
                browserHistory.push(url);
            } else {
                browserHistory.push("/myEvaluations");
            }
            window.scrollTo(0, 0);
        })
        .catch(error => {
            // console.log("Error submitting free response answers: ", error);
        });
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
                const waitingForFinalization = !!res && !!res.data && res.data.waitingForFinalization === true;
                dispatch({type: "POST_EMAIL_INVITES_SUCCESS", waitingForFinalization});
            })
            // error posting email invites
            .catch(function(err) {
                dispatch({type: "POST_EMAIL_INVITES_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}

// POST CREATE LINK
export function postCreateLink(currentUserInfo) {
    return function(dispatch) {
        dispatch({type: "POST_EMAIL_INVITES_REQUESTED"});

        axios.post("/api/business/postCreateLink", {currentUserInfo})
            // email invites success
            .then(function(res) {
                console.log(res)
                dispatch({type: "POST_LINK_SUCCESS", payload:res.data[0].code});
            })
            // error posting email invites
            .catch(function(err) {
                dispatch({type: "POST_LINK_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
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
export function updateUserSettings(user) {
    return function(dispatch) {
        // make loading circle show up
        dispatch({type:"START_LOADING"});
        // update user on the database
        axios.post("/api/user/changeSettings", user)
        .then(function(response) {
            dispatch({type:"UPDATE_USER_SETTINGS", user: response.data, notification:{message: "Settings updated!", type: "infoHeader"}});
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


export function changePasswordForgot(user) {
    return function(dispatch) {
        // activate loading spinner
        dispatch({type: "START_LOADING"});

        axios.post("api/user/changePasswordForgot", user)
            .then(function(response) {
                const foundUser = response.data;
                axios.post("/api/user/session", {userId: foundUser._id, verificationToken: foundUser.verificationToken})
                .catch(function(err2) {});

                dispatch({type:"LOGIN", user: foundUser, notification:{message:"Password changed!", type:"infoHeader"}});
                let nextUrl = "/";
                let returnedUser = response.data;
                browserHistory.push(nextUrl);
            })
            .catch(function(err) {
                dispatch({type:"CHANGE_PASS_FORGOT_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
            })
    }
}

// Send an email when admin tries to add another evaluation
export function addEvaluationEmail(userId, verificationToken, positionName){
    return function(dispatch) {
        axios.post("api/business/addEvaluationEmail", {userId, verificationToken, positionName})
            .then(function(response) { } )
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

        axios.post("api/misc/unsubscribeEmail", user)
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
            dispatch({type: "UPDATE_USER_ONBOARDING", user: response.data});
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
                finishedTest: response.data.finishedTest,
                finishedEval: response.data.finishedEval
            });
        })
        .catch(err => {
            // console.log("Error answering psych question: ", err);
            dispatch({type: "ANSWER_PSYCH_QUESTION_ERROR", notification: { message: err.response.data, type: "errorHeader" } });
        });
    }
}


// change info during onboarding for automating candidate emails
export function changeAutomateInvites(args) {
    return function (dispatch) {
        dispatch({ type: "CHANGE_AUTOMATE_INVITES", args });
    }
}


// removes the top step for going back from the stack of Back options
export function popGoBackStack() {
    return function(dispatch) {
        dispatch({ type: "POP_GO_BACK_STACK" });
    }
}


// set the state of the current position evaluation
export function setEvaluationState(evaluationState) {
    return function(dispatch) {
        dispatch({ type: "SET_EVALUATION_STATE", evaluationState });
    }
}


// Send an email when form filled out on contactUs page
export function contactUs(user){
    return function(dispatch) {
        dispatch({type: "CONTACT_US_REQUESTED"});

        axios.post("/api/business/contactUsEmail", user)
            .then(function(response) {
                dispatch({type:"CONTACT_US", notification: {message:response.data, type:"infoHeader"}});
                browserHistory.push('/myEvaluations');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"CONTACT_US", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}


export function formError() {
    return function(dispatch) {
        dispatch({type:"FORM_ERROR", notification: {message: "Fields must all be filled in to submit form.", type: "errorHeader"}})
    }
}
