"use strict";
import axios from "axios";
import { reset } from "redux-form";
import { goTo, propertyExists, makeSingular } from "../miscFunctions";

// GET USER FROM SESSION
export function getUserFromSession(callback) {
    return function(dispatch) {
        dispatch({
            type: "GET_USER_FROM_SESSION_REQUEST",
            isFetching: true,
            errorMessage: undefined
        });

        // TODO: DELETE THE dispatches AND MAKE NEW ONES PROBABLY
        const backgroundColor = "#2e2e2e";
        const textColor = "#ffffff";

        dispatch({ type: "UPDATE_STORE", variableName: "backgroundColor", value: backgroundColor });
        dispatch({ type: "UPDATE_STORE", variableName: "primaryColor", value: "#76defe" });
        dispatch({ type: "UPDATE_STORE", variableName: "textColor", value: textColor });

        document.body.style.backgroundColor = backgroundColor;
        document.body.style.color = textColor;

        axios
            .get("/api/user/session")
            .then(function(response) {
                dispatch({
                    type: "GET_USER_FROM_SESSION",
                    payload: response.data,
                    isFetching: false
                });
                callback(true);
            })
            .catch(function(err) {
                dispatch({
                    type: "GET_USER_FROM_SESSION_REJECTED",
                    errorMessage: "error getting user from session",
                    isFetching: false
                });
                callback(true);
            });
    };
}

// set whether the webp image format is supported
export function setWebpSupport(webpSupported) {
    return function(dispatch) {
        dispatch({ type: "SET_WEBP_SUPPORT", webpSupported });
    };
}

export function updatePositionCount(count) {
    return function(dispatch) {
        dispatch({ type: "UPDATE_POSITION_COUNT", count });
    };
}

export function openAddPositionModal() {
    return function(dispatch) {
        dispatch({ type: "OPEN_ADD_POSITION_MODAL" });
    };
}

export function closeAddPositionModal() {
    return function(dispatch) {
        // reset the form
        dispatch(reset("addPosition"));
        // close the modal
        dispatch({ type: "CLOSE_ADD_POSITION_MODAL" });
    };
}

export function openHireVerificationModal(candidateId, candidateName) {
    return function(dispatch) {
        dispatch({ type: "OPEN_HIRE_VERIFICATION_MODAL", candidateId, candidateName });
    };
}

export function openClaimPageModal() {
    return function(dispatch) {
        dispatch({ type: "OPEN_CLAIM_PAGE_MODAL" });
        dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: true });
        dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: true });
    };
}

export function closeClaimPageModal() {
    return function(dispatch) {
        dispatch({ type: "CLOSE_CLAIM_PAGE_MODAL" });
        dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: false });
        dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: false });
    };
}

export function openSignupModal(type, name) {
    return function(dispatch) {
        dispatch({ type: "OPEN_SIGNUP_MODAL", category: type, name });
        dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: true });
        dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: true });
    };
}

export function closeSignupModal() {
    return function(dispatch) {
        dispatch({ type: "CLOSE_SIGNUP_MODAL" });
        dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: false });
        dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: false });
    };
}

export function openIntroductionModal() {
    return function(dispatch) {
        dispatch({ type: "OPEN_INTRODUCTION_MODAL" });
        dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: true });
        dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: true });
    };
}

export function closeIntroductionModal() {
    return function(dispatch) {
        dispatch({ type: "CLOSE_INTRODUCTION_MODAL" });
        dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: false });
        dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: false });
    };
}

export function closeCandidatesPopupModal(userId, verificationToken, popups) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/user/popups", { userId, verificationToken, popups })
            .then(function(response) {
                dispatch({ type: "CLOSE_CANDIDATES_POPUP_MODAL" });
            })
            .catch(function(err) {
                dispatch({ type: "HIDE_POPUPS_REJECTED", ...notification(err, "error") });
            });
    };
}

export function openAddUserModal() {
    return function(dispatch) {
        dispatch({ type: "OPEN_ADD_USER_MODAL" });
    };
}

export function closeAddUserModal() {
    return function(dispatch) {
        dispatch({ type: "CLOSE_ADD_USER_MODAL" });
    };
}

export function openContactUsModal() {
    return function(dispatch) {
        dispatch({ type: "OPEN_CONTACT_US_MODAL" });
    };
}

export function closeContactUsModal() {
    return function(dispatch) {
        dispatch({ type: "CLOSE_CONTACT_US_MODAL" });
    };
}

// general action to just call a reducer that has no additional arguments
export function generalAction(type) {
    return function(dispatch) {
        dispatch({ type });
    };
}

// Send an email when form filled out on forBusiness page
export function contactUsEmail(user, callback) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("api/business/contactUsEmail", user)
            .then(function(response) {
                dispatch({ type: "CONTACT_US_EMAIL_SUCCESS" });
                dispatch({
                    type: "ADD_NOTIFICATION",
                    ...notification("Message sent, we'll get back to you soon!")
                });
                if (typeof callback === "function") {
                    callback();
                }
            })
            .catch(function(err) {
                dispatch({ type: "CONTACT_US_EMAIL_FAILURE" });
                dispatch({
                    type: "ADD_NOTIFICATION",
                    ...notification(
                        "Something went wrong :( Shoot us an email at support@moonshotinsights.io",
                        "error",
                        false
                    )
                });
                if (typeof callback === "function") {
                    callback();
                }
            });
    };
}

export function emailFailureExitPage() {
    return function(dispatch) {
        dispatch({ type: "EMAIL_FAILURE_EXIT_PAGE" });
    };
}

export function login(user, saveSession, navigateBackUrl) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/user/login", { user, saveSession })
            .then(function(response) {
                const returnedUser = response.data.user;
                const fullAccess = response.data.fullAccess;
                dispatch({ type: "LOGIN", user: returnedUser, fullAccess });
                let nextUrl = "/myEvaluations";
                if (returnedUser && returnedUser.userType === "accountAdmin") {
                    nextUrl = "/dashboard";
                }
                if (navigateBackUrl) {
                    nextUrl = navigateBackUrl;
                }
                // go to the next screen
                goTo(nextUrl);
            })
            .catch(function(err) {
                dispatch({ type: "LOGIN_REJECTED", ...notification(err, "error") });
            });
    };
}

export function intercomEvent(eventName, userId, verificationToken, metadata) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/user/intercomEvent", { eventName, userId, verificationToken, metadata })
            .then(function(response) {
                if (response.data.temp) {
                    dispatch({ type: "INTERCOM_EVENT_TEMP", user: response.data.user });
                } else {
                    dispatch({ type: "INTERCOM_EVENT", user: response.data.user });
                }
            })
            .catch(function(err) {
                dispatch({ type: "INTERCOM_EVENT_REJECTED", ...notification(err, "error") });
            });
    };
}

// update any variable value within redux store
export function updateStore(variableName, value) {
    return function(dispatch) {
        dispatch({ type: "UPDATE_STORE", variableName, value });
    };
}

export function hidePopups(userId, verificationToken, popups) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/user/popups", { userId, verificationToken, popups })
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({ type: "HIDE_POPUPS", payload: returnedUser });
            })
            .catch(function(err) {
                dispatch({ type: "HIDE_POPUPS_REJECTED", ...notification(err, "error") });
            });
    };
}

export function confirmEmbedLink(userId, verificationToken) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/user/confirmEmbedLink", { userId, verificationToken })
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({ type: "CONFIRM_EMBED_LINK", payload: returnedUser });
            })
            .catch(function(err) {
                dispatch({ type: "CONFIRM_EMBED_LINK_REJECTED", ...notification(err, "error") });
            });
    };
}

export function postBusinessInterests(userId, verificationToken, businessId, interests, popups) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/business/interests", { userId, verificationToken, businessId, interests })
            .then(function(response) {
                dispatch(hidePopups(userId, verificationToken, popups));
            })
            .catch(function(err) {
                dispatch({
                    type: "POST_BUSINESS_INTERESTS_REJECTED",
                    ...notification(err, "error")
                });
            });
    };
}

// update user object in redux store
export function updateUser(user) {
    return function(dispatch) {
        dispatch({ type: "UPDATE_USER", user });
    };
}

// save an answer for ANY eval component (AdminQuestion, PsychQuestion, GCAQuestion, SkillQuestion)
export function answerEvaluationQuestion(evalComponent, options) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });
        axios
            .post(`/api/evaluation/answer${evalComponent}Question`, options)
            .then(response => updateEvalState(dispatch, response.data))
            .catch(error => defaultErrorHandler(dispatch, { error }));
    };
}

// save a gca answer because time ran out
export function answerOutOfTimeCognitive(options) {
    return function(dispatch) {
        axios
            .post(`/api/evaluation/answerOutOfTimeCognitive`, options)
            .then(response => updateEvalState(dispatch, response.data))
            .catch(error => defaultErrorHandler(dispatch, { error, doNotAlertUser: true }));
    };
}

// skip all the evaluation admin questions
export function skipAdminQuestions(options) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });
        axios
            .post("/api/evaluation/skipAdminQuestions", options)
            .then(response => updateEvalState(dispatch, response.data))
            .catch(error => defaultErrorHandler(dispatch, { error }));
    };
}

function updateEvalState(dispatch, data) {
    // if nothing should be made based on the update, do nothing
    if (typeof data === "object" && data.noChange) {
        return;
    }
    // scroll up if needed
    const scrollTop =
        window.pageYOffset !== undefined
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    if (scrollTop > 80) {
        window.scrollTo(0, 80);
    }
    // if the user finished the eval
    if (data.evaluationState.component === "Finished") {
        // go home
        goTo("/myEvaluations");
        // add a notification saying they finished the eval
        dispatch({
            type: "ADD_NOTIFICATION",
            ...notification("Congratulations, you finished the evaluation!")
        });
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
    if (options.doNotAlertUser) {
        return;
    }
    // log the error if provided
    if (options.error) {
        console.log(options.error);
    }
    // the message to show the userPositionIndex
    const errorMessage = options.message ? options.message : "Error, try refreshing.";

    dispatch({
        type: "NOTIFICATION_AND_STOP_LOADING",
        ...notification(errorMessage, "error")
    });
}

// change the current step within onboarding
export function updateOnboardingStep(userId, verificationToken, newStep) {
    return function(dispatch) {
        if (newStep !== -1) {
            dispatch({ type: "UPDATE_ONBOARDING_STEP", newStep });
        } else {
            dispatch({ type: "START_LOADING" });
        }

        if (userId && verificationToken) {
            axios
                .post("/api/user/updateOnboardingStep", { userId, verificationToken, newStep })
                .then(result => {
                    // if done with onboarding
                    if (newStep === -1) {
                        dispatch({ type: "UPDATE_ONBOARDING_STEP", newStep });
                    }
                })
                .catch(error => {
                    console.log("ERROR: ", error);
                    if (newStep === -1) {
                        dispatch({ type: "UPDATE_ONBOARDING_STEP", newStep });
                    }
                });
        }
    };
}

// generally used to bring up the loading spinner
export function startLoading() {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });
    };
}
// generally used to remove the loading spinner
export function stopLoading() {
    return function(dispatch) {
        dispatch({ type: "STOP_LOADING" });
    };
}

export function getBillingInfo(userId, verificationToken, businessId) {
    return function(dispatch) {
        axios
            .get("/api/business/billingInfo", { params: { userId, verificationToken, businessId } })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_INFO",
                    billing: response.data
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

export function setupBillingCustomer(source, email, userId, verificationToken, subscriptionTerm) {
    return function(dispatch) {
        axios
            .post("/api/billing/customer", {
                source,
                email,
                userId,
                verificationToken,
                subscriptionTerm
            })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_CUSTOMER",
                    billing: response.data.billing,
                    fullAccess: response.data.fullAccess,
                    ...notification(
                        `You have successfully added your ${makeSingular(subscriptionTerm)} plan`
                    )
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

export function billingCardOnFileFalse(billing) {
    return function(dispatch) {
        billing.cardOnFile = false;
        dispatch({
            type: "SUCCESS_BILLING_INFO",
            billing
        });
    };
}
export function billingCardOnFileTrue(billing) {
    return function(dispatch) {
        billing.cardOnFile = true;
        dispatch({
            type: "SUCCESS_BILLING_INFO",
            billing
        });
    };
}

export function updateBillingSource(source, userId, verificationToken) {
    return function(dispatch) {
        axios
            .post("/api/billing/updateSource", { source, userId, verificationToken })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_INFO",
                    billing: response.data,
                    ...notification(`You have successfully updated your card`)
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

// cancel a billing plan
export function cancelBillingPlan(userId, verificationToken, message) {
    return function(dispatch) {
        axios
            .post("/api/billing/cancelPlan", { userId, verificationToken, message })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_INFO",
                    billing: response.data
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

// pause a billing plan
export function pauseBillingPlan(userId, verificationToken, message) {
    return function(dispatch) {
        dispatch({
            type: "CLOSE_CANCEL_PLAN_MODAL"
        });

        axios
            .post("/api/billing/pausePlan", { userId, verificationToken, message })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_INFO",
                    billing: response.data,
                    ...notification(`Our team will contact you shortly`)
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

// update a billing plan
export function updateBillingPlan(userId, verificationToken, subscriptionTerm) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/billing/updatePlan", { userId, verificationToken, subscriptionTerm })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_INFO",
                    billing: response.data,
                    ...notification(`You have successfully updated your plan`)
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

// post a new billing plan
export function newBillingPlan(userId, verificationToken, subscriptionTerm) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/billing/newPlan", { userId, verificationToken, subscriptionTerm })
            .then(response => {
                dispatch({
                    type: "SUCCESS_BILLING_CUSTOMER",
                    billing: response.data.billing,
                    fullAccess: response.data.fullAccess,
                    ...notification(`You have successfully updated your plan`)
                });
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: "FAILURE_BILLING_CUSTOMER", ...notification(error, "error") });
            });
    };
}

// LOG USER OUT
export function signout(callback) {
    return function(dispatch) {
        // dispatch({ type: "SIGNOUT" });
        axios
            .post("/api/user/signOut")
            .then(function(response) {
                dispatch({ type: "SIGNOUT" });
                if (typeof callback === "function") {
                    callback();
                }
            })
            .catch(function(err) {
                console.log("error signing out: ", err);
                dispatch({
                    type: "ADD_NOTIFICATION",
                    ...notification(
                        "There was an error signing you out, let us know by using the bubble on the bottom right.",
                        "error"
                    )
                });
                dispatch({ type: "SIGNOUT" });
                if (typeof callback === "function") {
                    callback();
                }
            });
    };
}

export function onSignUpPage() {
    return function(dispatch) {
        dispatch({ type: "ON_SIGNUP_PAGE" });
    };
}

export function createBusinessAndUser(userInfo, customErrorAction) {
    return function(dispatch) {
        // start the loading bar
        dispatch({ type: "START_LOADING" });
        axios
            .post("/api/business/createBusinessAndUser", userInfo)
            .then(response => {
                dispatch({
                    type: "LOGIN",
                    user: response.data.user,
                    fullAccess: response.data.fullAccess,
                    ...notification(
                        `Your account has been activated! Continue to set things up for ${
                            userInfo.company
                        }.`
                    )
                });
                dispatch({ type: "UPDATE_STORE", variableName: "blurLeadDashboard", value: false });
                dispatch({ type: "UPDATE_STORE", variableName: "blurMenu", value: false });
                dispatch({ type: "CLOSE_SIGNUP_MODAL" });
                dispatch({ type: "CLOSE_CLAIM_PAGE_MODAL" });
                goTo("/dashboard");
                if (userInfo.verificationModal) {
                    dispatch({ type: "OPEN_VERIFICATION_MODAL" });
                }
            })
            .catch(error => {
                // if something besides the usual action should happen on error, do that
                if (typeof customErrorAction === "function") {
                    dispatch({ type: "STOP_LOADING" });
                    customErrorAction(error);
                }
                // otherwise show an error notification and stop loading
                else {
                    dispatch({
                        type: "NOTIFICATION_AND_STOP_LOADING",
                        ...notification(error, "error")
                    });
                }
            });
    };
}

export function agreeToTerms(userId, verificationToken, agreements) {
    return function(dispatch) {
        dispatch({ type: "START_LOADING" });
        axios
            .post("/api/user/agreeToTerms", {
                userId,
                verificationToken,
                termsAndConditions: agreements
            })
            .then(response => {
                dispatch({ type: "USER_UPDATE", currentUser: response.data });
            })
            .catch(error => {
                console.log("error: ", error);
            });
    };
}

// set the user as posted to show screen saying user should check email
export function setUserPosted() {
    return function(dispatch) {
        dispatch({ type: "POST_USER" });
    };
}

// POST USER
export function postUser(user) {
    return function(dispatch) {
        dispatch({ type: "POST_USER_REQUESTED" });

        axios
            .post("/api/candidate/candidate", user)
            .then(response => {
                dispatch({
                    type: "POST_USER",
                    user: response.data.user,
                    fullAccess: response.data.fullAccess
                });
                goTo("/myEvaluations");
            })
            .catch(error => {
                // standard error message
                let message = "Could not create account. Refresh and try again.";
                if (propertyExists(error, ["response", "data"], "object")) {
                    const data = error.response.data;
                    // if the user was created, must have just been an error sending
                    // the verification email
                    if (data.userCreated) {
                        return dispatch({
                            type: "CREATED_NO_VERIFY_EMAIL_SENT",
                            sendVerifyEmailTo: user.email
                        });
                    }
                    // if no user created, see if there is an error message
                    else if (typeof data.message === "string") {
                        message = data.message;
                    }
                }
                dispatch({ type: "POST_USER_REJECTED", ...notification(message, "error") });
            });
    };
}

// INVITE ANY TYPE OF USER VIA EMAIL
export function postEmailInvites(candidateEmails, employeeEmails, currentUserInfo) {
    return function(dispatch) {
        dispatch({ type: "POST_EMAIL_INVITES_REQUESTED" });

        axios
            .post("/api/business/postEmailInvites", {
                candidateEmails,
                employeeEmails,
                ...currentUserInfo
            })
            // email invites success
            .then(function(res) {
                dispatch({ type: "POST_EMAIL_INVITES_SUCCESS" });
            })
            // error posting email invites
            .catch(function(err) {
                dispatch({ type: "POST_EMAIL_INVITES_REJECTED", ...notification(err, "error") });
            });
    };
}

// INVITE ACCOUNT ADMINS VIA EMAIL
export function postAdminInvites(adminEmails, currentUserInfo) {
    return function(dispatch) {
        dispatch({ type: "POST_EMAIL_INVITES_REQUESTED" });

        axios
            .post("/api/business/inviteAdmins", { adminEmails, ...currentUserInfo })
            // email invites success
            .then(function(res) {
                dispatch({ type: "POST_EMAIL_INVITES_SUCCESS" });
            })
            // error posting email invites
            .catch(function(err) {
                dispatch({ type: "POST_EMAIL_INVITES_REJECTED", ...notification(err, "error") });
            });
    };
}

export function addNotification(message, notificationType) {
    return function(dispatch) {
        dispatch({ type: "ADD_NOTIFICATION", ...notification(message, notificationType) });
    };
}

export function closeNotification() {
    return function(dispatch) {
        dispatch({ type: "CLOSE_NOTIFICATION" });
    };
}

// FORGOT PASSWORD
export function forgotPassword(user) {
    return function(dispatch) {
        dispatch({ type: "FORGOT_PASSWORD_REQUESTED" });

        axios
            .post("/api/user/forgotPassword", user)
            .then(function(response) {
                dispatch({ type: "FORGOT_PASSWORD", ...notification(response) });
            })
            .catch(function(err) {
                dispatch({ type: "FORGOT_PASSWORD_REJECTED", ...notification(err, "error") });
            });
    };
}

export function newCurrentUser(currentUser) {
    return function(dispatch) {
        dispatch({ type: "NEW_CURRENT_USER", currentUser });
    };
}

// UPDATE A USER
export function updateUserSettings(user) {
    return function(dispatch) {
        // make loading circle show up
        dispatch({ type: "START_LOADING" });
        // update user on the database
        axios
            .post("/api/user/changeSettings", user)
            .then(function(response) {
                dispatch({
                    type: "UPDATE_USER_SETTINGS",
                    user: response.data,
                    ...notification("Settings updated!")
                });
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({ type: "UPDATE_USER_REJECTED", ...notification(err, "error") });
                window.scrollTo(0, 0);
            });
    };
}

export function changePassword(user) {
    return function(dispatch) {
        // make loading circle show up
        dispatch({ type: "START_LOADING" });

        axios
            .post("/api/user/changePassword", user)
            .then(function(response) {
                dispatch({ type: "CHANGE_PASSWORD", ...notification("Password changed!") });
                // reset the form
                dispatch(reset("changePassword"));
            })
            .catch(function(err) {
                dispatch({ type: "CHANGE_PASSWORD_REJECTED", ...notification(err, "error") });
            });
    };
}

export function changePasswordForgot(user) {
    return function(dispatch) {
        // activate loading spinner
        dispatch({ type: "START_LOADING" });

        axios
            .post("api/user/changePasswordForgot", user)
            .then(function(response) {
                const foundUser = response.data;
                axios
                    .post("/api/user/session", {
                        userId: foundUser._id,
                        verificationToken: foundUser.verificationToken
                    })
                    .catch(function(err2) {});

                dispatch({ type: "LOGIN", user: foundUser, ...notification("Password changed!") });
                goTo("/myEvaluations");
            })
            .catch(function(err) {
                dispatch({ type: "CHANGE_PASS_FORGOT_REJECTED", ...notification(err, "error") });
            });
    };
}

// Send an email when form filled out on unsubscribe page
export function unsubscribe(user, showNotification) {
    return function(dispatch) {
        dispatch({ type: "FOR_BUSINESS_REQUESTED" });

        axios
            .post("api/misc/unsubscribeEmail", user)
            .then(function(response) {
                let toDispatch = { type: "FOR_BUSINESS" };
                if (showNotification) {
                    toDispatch = { ...toDispatch, ...notification(response) };
                }
                dispatch(toDispatch);
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({ type: "FOR_BUSINESS", ...notification(err, "error") });
            });
    };
}

// DELETE A USER
export function deleteUser(id) {
    return function(dispatch) {
        axios
            .delete("/api/user/" + id)
            .then(function(response) {
                dispatch({ type: "DELETE_USER", payload: id });
            })
            .catch(function(err) {
                dispatch({ type: "DELETE_USER_REJECTED", payload: err });
            });
    };
}

export function updateAnswer(userId, verificationToken, quizId, answer) {
    return function(dispatch) {
        axios
            .post("/api/candidate/updateAnswer", {
                params: { userId, verificationToken, quizId, answer }
            })
            .then(function(response) {
                dispatch({ type: "UPDATE_ANSWER", currentUser: response.data });
            })
            .catch(function(error) {
                // console.log("ERROR: ", error);
                // console.log(error.response.data)
            });
    };
}

// set the state of the current position evaluation
export function setEvaluationState(evaluationState) {
    return function(dispatch) {
        dispatch({ type: "SET_EVALUATION_STATE", evaluationState });
    };
}

export function formError() {
    return function(dispatch) {
        dispatch({
            type: "FORM_ERROR",
            ...notification("Fields must all be filled in to submit form.", "error")
        });
    };
}

export function markFooterOnScreen(footerOnScreen) {
    return function(dispatch) {
        dispatch({ type: "MARK_FOOTER_ON_SCREEN", footerOnScreen });
    };
}

// NOT EXPORTED
// adds a notification if given
function notification(msgInput, type, closeSelf) {
    let message = msgInput;
    // various types of message input that could be received
    if (typeof msgInput === "object") {
        // GIVEN msgInput is error
        if (msgInput.response) {
            if (typeof msgInput.response.data === "string") {
                message = msgInput.response.data;
            } else if (msgInput.response.data && typeof msgInput.response.data.message) {
                message = msgInput.response.data.message;
            }
        }

        // GIVEN msgInput is response OR error.response
        else if (typeof msgInput.data === "string") {
            message = msgInput.data;
        } else if (msgInput.data && typeof msgInput.data.message === "string") {
            message = msgInput.data.message;
        }

        // GIVEN msgInput is response.data OR error.response.data
        else if (msgInput.message) {
            message = msgInput.message;
        }
    }
    // type of notification (changes the colors)
    const headerType = ["error", "errorHeader"].includes(type) ? "errorHeader" : "infoHeader";
    // if there is no message
    if (typeof message !== "string") {
        // standard error message if it's an error
        if (headerType === "errorHeader") {
            message = "Error. Try refreshing.";
        }
        // otherwise don't display a notification
        else {
            return {};
        }
    }
    // return an object with a notification object inside it
    let toReturn = {
        notification: { message, type: headerType }
    };
    // add the information about closing itself if included
    if (typeof closeSelf === "boolean") {
        toReturn.notification.closeSelf = closeSelf;
    }
    // return the object with the notification
    return toReturn;
}
