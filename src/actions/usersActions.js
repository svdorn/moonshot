"use strict"
import axios from 'axios';
import { browserHistory } from 'react-router'
import { reset } from 'redux-form';
import { goTo, propertyExists } from "../miscFunctions";


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
export function contactUsEmail(user, callback) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});

        axios.post("api/business/contactUsEmail", user)
        .then(function(response) {
            dispatch({ type:"CONTACT_US_EMAIL_SUCCESS" });
            dispatch({ type: "ADD_NOTIFICATION", ...notification("Message sent, we'll get back to you soon!") });
            if (typeof callback === "function") { callback(); }
        })
        .catch(function(err) {
            dispatch({type:"CONTACT_US_EMAIL_FAILURE"});
            dispatch({type: "ADD_NOTIFICATION", ...notification("Something went wrong :( Shoot us an email at support@moonshotinsights.io", "error", false) });
            if (typeof callback === "function") { callback(); }
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
            if (navigateBackUrl) { nextUrl = navigateBackUrl; }
            // go to the next screen
            browserHistory.push(nextUrl);
            window.scrollTo(0, 0);
        })
        .catch(function(err) {
            dispatch({ type: "LOGIN_REJECTED", ...notification(err, "error") });
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
                dispatch({ type: "UPDATE_ONBOARDING_REJECTED", ...notification(err, "error") });
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


// save an answer for ANY eval component (AdminQuestion, PsychQuestion, GCAQuestion, SkillQuestion)
export function answerEvaluationQuestion(evalComponent, options) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post(`/api/evaluation/answer${evalComponent}Question`, options)
        .then(response => updateEvalState(dispatch, response.data))
        .catch(error => defaultErrorHandler(dispatch, { error }));
    }
}


// save a gca answer because time ran out
export function answerOutOfTimeCognitive(options) {
    return function(dispatch) {
        axios.post(`/api/evaluation/answerOutOfTimeCognitive`, options)
        .then(response => updateEvalState(dispatch, response.data))
        .catch(error => defaultErrorHandler(dispatch, { error, doNotAlertUser: true }));
    }
}


// skip all the evaluation admin questions
export function skipAdminQuestions(options) {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
        axios.post("/api/evaluation/skipAdminQuestions", options)
        .then(response => updateEvalState(dispatch, response.data))
        .catch(error => defaultErrorHandler(dispatch, { error }));
    }
}


function updateEvalState(dispatch, data) {
    // if nothing should be made based on the update, do nothing
    if (typeof data === "object" && data.noChange) { return; }
    // scroll up if needed
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    if (scrollTop > 80) { window.scrollTo(0,80); }
    // if the user finished the eval
    if (data.evaluationState.component === "Finished") {
        // go home
        goTo("/myEvaluations");
        // add a notification saying they finished the eval
        dispatch({ type: "ADD_NOTIFICATION", ...notification("Congratulations, you finished the evaluation! We'll be in touch soon.") })
    }
    dispatch({
        type: "UPDATE_EVALUATION_STATE",
        evaluationState: data.evaluationState,
        user: data.user
    });
}


// stop the loading bar and show an error message, also log an error if provided
function defaultErrorHandler(dispatch, options) {
    // if nothing should be done to shown user there is an error
    if (options.doNotAlertUser) { return; }
    // log the error if provided
    if (options.error) { console.log(options.error); }
    // the message to show the userPositionIndex
    const errorMessage = options.message ? options.message : "Error, try refreshing."

    dispatch({
        type: "NOTIFICATION_AND_STOP_LOADING",
        ...notification(errorMessage, "error")
    });
}


// generally used to bring up the loading spinner
export function startLoading() {
    return function(dispatch) {
        dispatch({type: "START_LOADING"});
    }
}
// generally used to remove the loading spinner
export function stopLoading() {
    return function(dispatch) {
        dispatch({type: "STOP_LOADING"});
    }
}


export function setupBillingCustomer(source, email, userId, verificationToken) {
    return function(dispatch) {
        axios.post("/api/billing/customer", {source, email, userId, verificationToken})
        .then(response => {
            dispatch({type: "SUCCESS_BILLING_CUSTOMER", ...notification("Success adding credit card to company.") });
        })
        .catch(error => {
            console.log(error);
            dispatch({type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
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
            dispatch({ type: "LOGIN", user: response.data, ...notification("Your account has been activated! Thanks for signing up!") });
            goTo("/onboarding");
        })
        .catch(error => {
            dispatch({ type: "NOTIFICATION_AND_STOP_LOADING", ...notification(error, "error") });
        })
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


// set the user as posted to show screen saying user should check email
export function setUserPosted() {
    return function(dispatch) { dispatch({ type: "POST_USER" }); }
}


// POST USER
export function postUser(user) {
    return function(dispatch) {
        dispatch({type: "POST_USER_REQUESTED"});

        axios.post("/api/candidate/candidate", user)
        .then(response => {
            dispatch({type: "POST_USER"});
            window.scrollTo(0,0);
        }).catch(error => {
            // standard error message
            let message = "Could not create account. Refresh and try again.";
            if (propertyExists(error, ["response", "data"], "object")) {
                const data = error.response.data;
                // if the user was created, must have just been an error sending
                // the verification email
                if (data.userCreated) {
                    return dispatch({type: "CREATED_NO_VERIFY_EMAIL_SENT", sendVerifyEmailTo: user.email});
                }
                // if no user created, see if there is an error message
                else if (typeof data.message === "string") { message = data.message; }
            }
            dispatch({type: "POST_USER_REJECTED", ...notification(message, "error") });
        });
    }
}

// POST EMAIL INVITES
export function postEmailInvites(candidateEmails, employeeEmails, adminEmails, currentUserInfo) {
    return function(dispatch) {
        dispatch({type: "POST_EMAIL_INVITES_REQUESTED"});

        axios.post("/api/business/postEmailInvites", {candidateEmails, employeeEmails, adminEmails, ...currentUserInfo})
        // email invites success
        .then(function(res) {
            const waitingForFinalization = !!res && !!res.data && res.data.waitingForFinalization === true;
            dispatch({type: "POST_EMAIL_INVITES_SUCCESS", waitingForFinalization});
        })
        // error posting email invites
        .catch(function(err) {
            dispatch({type: "POST_EMAIL_INVITES_REJECTED", ...notification(err, "error") });
        });
    }
}

// POST CREATE LINK
export function postCreateLink(currentUserInfo, closeDialog) {
    return function(dispatch) {
        dispatch({type: "POST_EMAIL_INVITES_REQUESTED"});

        axios.post("/api/business/postCreateLink", {currentUserInfo})
            // email invites success
            .then(function(res) {
                dispatch({type: "POST_LINK_SUCCESS", payload:res.data[0].code});
            })
            // error posting email invites
            .catch(function(err) {
                if (typeof closeDialog === "function") { closeDialog(); }
                dispatch({ type: "NOTIFICATION_AND_STOP_LOADING", ...notification("Error creating link, please refresh and try again.", "error") });
            });
    }
}

export function addNotification(message, notificationType) {
    return function(dispatch) {
        dispatch({ type: "ADD_NOTIFICATION", ...notification(message, notificationType) });
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
            dispatch({ type:"FORGOT_PASSWORD", ...notification(response) });
        })
        .catch(function(err) {
            dispatch({ type:"FORGOT_PASSWORD_REJECTED", ...notification(err, "error") });
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
            dispatch({ type:"UPDATE_USER_SETTINGS", user: response.data, ...notification("Settings updated!") });
            window.scrollTo(0, 0);
        })
        .catch(function(err) {
            dispatch({ type:"UPDATE_USER_REJECTED", ...notification(err, "error") });
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
            dispatch({type:"CHANGE_PASSWORD", ...notification("Password changed!") });
            // reset the form
            dispatch(reset("changePassword"));
        })
        .catch(function(err){
            dispatch({type:"CHANGE_PASSWORD_REJECTED", ...notification(err, "error") });
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

            dispatch({ type:"LOGIN", user: foundUser, ...notification("Password changed!") });
            browserHistory.push("/myEvaluations");
        })
        .catch(function(err) {
            dispatch({ type:"CHANGE_PASS_FORGOT_REJECTED", ...notification(err, "error") });
        })
    }
}

// Send an email when somebody completes a pathway
export function completePathway(user){
    return function(dispatch) {
        // dispatch({type: "COMPLETE_PATHWAY_REQUESTED"});
        //
        // axios.post("api/candidate/completePathway", user)
        //     .then(function(response) {
        //         dispatch({ type:"COMPLETE_PATHWAY", user: response.data.user, ...notification(response) });
        //         browserHistory.push('/');
        //         window.scrollTo(0, 0);
        //     })
        //     .catch(function(err) {
        //         // info we get back from the error
        //         const errData = err.response.data;
        //         // if the error is due to the user not having all steps complete
        //         if (typeof errData === "object" && errData.incompleteSteps) {
        //             dispatch({type: "COMPLETE_PATHWAY_REJECTED_INCOMPLETE_STEPS", incompleteSteps: errData.incompleteSteps});
        //             return;
        //         }
        //
        //         // if there is a notification message, show that
        //         let notification = undefined;
        //         if (typeof errData === "string") {
        //             notification = {
        //                 message: errData,
        //                 type: "errorHeader"
        //             }
        //         }
        //
        //         dispatch({ type:"COMPLETE_PATHWAY_REJECTED", notification })
        //     })
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
            let toDispatch = { type: "FOR_BUSINESS" };
            if (showNotification) { toDispatch = { ...toDispatch, ...notification(response) }}
            dispatch(toDispatch);
            window.scrollTo(0, 0);
        })
        .catch(function(err) {
            dispatch({type:"FOR_BUSINESS", ...notification(err, "error")})
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
                    dispatch({ type:"FOR_BUSINESS", ...notification(response) });
                    browserHistory.push('/login')
                    dispatch({ type:"CHANGE_CURRENT_ROUTE", payload:'/login' })
                    window.scrollTo(0, 0);
                } else {
                    dispatch({ type:"FOR_BUSINESS", notification: undefined });
                }
            })
            .catch(function(err) {
                dispatch({ type:"FOR_BUSINESS", ...notification("Error sending email", "error") })
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


export function formError() {
    return function(dispatch) {
        dispatch({type:"FORM_ERROR", ...notification("Fields must all be filled in to submit form.", "error") })
    }
}



// NOT EXPORTED
// adds a notification if given
function notification(msgInput, type, closeSelf) {
    let message = msgInput;
    // various types of message input that could be received
    if (typeof msgInput === "object") {
        // GIVEN msgInput is error
        if (msgInput.response) {
            if (typeof msgInput.response.data === "string") { message = msgInput.response.data; }
            else if (msgInput.response.data && typeof msgInput.response.data.message) { message = msgInput.response.data.message; }
        }

        // GIVEN msgInput is response OR error.response
        else if (typeof msgInput.data === "string") { message = msgInput.data; }
        else if (msgInput.data && typeof msgInput.data.message === "string") { message = msgInput.data.message; }

        // GIVEN msgInput is response.data OR error.response.data
        else if (msgInput.message) { message = msgInput.message; }
    }
    // type of notification (changes the colors)
    const headerType = ["error", "errorHeader"].includes(type) ? "errorHeader" : "infoHeader";
    // if there is no message
    if (typeof message !== "string") {
        // standard error message if it's an error
        if (headerType === "errorHeader") { message = "Error. Try refreshing."; }
        // otherwise don't display a notification
        else { return {}; }
    }
    // return an object with a notification object inside it
    let toReturn = {
        notification: { message, type: headerType }
    }
    // add the information about closing itself if included
    if (typeof closeSelf === "boolean") { toReturn.notification.closeSelf = closeSelf; }
    // return the object with the notification
    return toReturn;
}
