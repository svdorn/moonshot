"use strict";
import { Stack } from "../miscFunctions";

// USERS REDUCERS
const initialState = {
    currentUser: undefined,
    isFetching: false,
    headerMessage: undefined,
    headerType: undefined,
    headerExpirationTime: undefined,
    userPosted: false
};
export function usersReducers(state = initialState, action) {
    switch (action.type) {
        case "UPDATE_STORE": {
            return {
                ...state,
                [action.variableName]: action.value
            };
        }
        case "OPEN_ADD_USER_MODAL":
            return {
                ...state,
                userModalOpen: true
            };
            break;
        case "CLOSE_ADD_USER_MODAL":
            return {
                ...state,
                userModalOpen: false,
                userPosted: false,
                userPostedFailed: false
            };
            break;
        case "OPEN_VERIFICATION_MODAL":
            return {
                ...state,
                verificationModal: true
            };
            break;
        case "CLOSE_VERIFICATION_MODAL":
            return {
                ...state,
                verificationModal: false,
            };
            break;
        case "OPEN_LOCKED_ACCOUNT_MODAL":
            return {
                ...state,
                lockedAccountModal: true
            };
            break;
        case "CLOSE_LOCKED_ACCOUNT_MODAL":
            return {
                ...state,
                lockedAccountModal: false,
            };
            break;
        case "OPEN_HIRE_VERIFICATION_MODAL":
            return {
                ...state,
                hireVerificationModal: true,
                hireVerificationCandidateId: action.candidateId,
                hireVerificationName: action.candidateName
            };
            break;
        case "CLOSE_HIRE_VERIFICATION_MODAL":
            return {
                ...state,
                hireVerificationModal: false
            };
            break;
        case "OPEN_CANCEL_PLAN_MODAL":
            return {
                ...state,
                cancelPlanModal: true
            };
            break;
        case "CLOSE_CANCEL_PLAN_MODAL":
            return {
                ...state,
                cancelPlanModal: false,
            };
            break;
        case "OPEN_CLAIM_PAGE_MODAL":
            return {
                ...state,
                claimPageModal: true
            };
            break;
        case "CLOSE_CLAIM_PAGE_MODAL":
            return {
                ...state,
                claimPageModal: false,
            };
            break;
        case "OPEN_INTRODUCTION_MODAL":
            return {
                ...state,
                introductionModal: true
            };
            break;
        case "CLOSE_INTRODUCTION_MODAL":
            return {
                ...state,
                introductionModal: false,
            };
            break;
        case "OPEN_CANDIDATES_POPUP_MODAL":
            return {
                ...state,
                candidatesPopupModalOpen: true
            };
            break;
        case "CLOSE_CANDIDATES_POPUP_MODAL":
            Intercom("update");
            return {
                ...state,
                candidatesPopupModalOpen: false,
                loadingSomething: false
            };
            break;
        case "OPEN_SIGNUP_MODAL":
            let signupModalInfo = { type: action.category, name: action.name };
            return {
                ...state,
                signupModalOpen: true,
                signupModalInfo
            };
            break;
        case "CLOSE_SIGNUP_MODAL":
            return {
                ...state,
                signupModalOpen: false,
                signupModalInfo: null
            };
            break;
        case "OPEN_ADD_ADMIN_MODAL":
            return {
                ...state,
                addAdminModalOpen: true
            };
            break;
        case "CLOSE_ADD_ADMIN_MODAL":
            return {
                ...state,
                addAdminModalOpen: false,
                userPosted: false,
                userPostedFailed: false
            };
            break;
        case "OPEN_ADD_POSITION_MODAL":
            return {
                ...state,
                positionModalOpen: true
            };
            break;
        case "CLOSE_ADD_POSITION_MODAL":
            return {
                ...state,
                positionModalOpen: false,
                positionPosted: false,
                posiitonPostedFailed: false
            };
            break;
        case "OPEN_INVITE_CANDIDATES_MODAL": {
            return { ...state, inviteCandidatesModalOpen: true };
            break;
        }
        case "CLOSE_INVITE_CANDIDATES_MODAL": {
            return { ...state, inviteCandidatesModalOpen: false };
            break;
        }
        case "OPEN_CONTACT_US_MODAL":
            return {
                ...state,
                contactUsModal: true
            };
            break;
        case "CLOSE_CONTACT_US_MODAL":
            return {
                ...state,
                contactUsModal: false,
                message: undefined
            };
            break;
        case "MARK_FOOTER_ON_SCREEN": {
            return { ...state, footerOnScreen: action.footerOnScreen };
        }
        case "UPDATE_ONBOARDING_STEP": {
            let currentUser = state.currentUser;
            // create onboarding object with new step or with time finished marked
            let onboard = {};
            // if the user is finished, update that on the frontend
            if (action.newStep === -1) {
                onboard = { timeFinished: new Date() };
            } else {
                onboard = { step: action.newStep };
            }

            // fill in onboarding info with any that already exists
            if (!currentUser && typeof state.guestOnboard === "object") {
                // if there is no user, must be a guest going through onboarding
                onboard = { ...state.guestOnboard, ...onboard };
            } else if (currentUser && typeof currentUser.onboard === "object") {
                // if there is a user and they've already started, fill in old info
                onboard = { ...currentUser.onboard, ...onboard };
            }
            // update highest step user has been to
            if (typeof onboard.highestStep !== "number" || onboard.highestStep < action.newStep) {
                onboard.highestStep = action.newStep;
            }

            if (currentUser) {
                // throw the onboarding stuff back into the user
                currentUser = { ...currentUser, onboard };
                // save the state with the new current user
                return { ...state, currentUser, loadingSomething: false };
            } else {
                return { ...state, guestOnboard: onboard };
            }
            break;
        }
        case "CREATED_NO_VERIFY_EMAIL_SENT": {
            return {
                ...state,
                sendVerifyEmailTo: action.sendVerifyEmailTo,
                loadingSomething: false,
                userPosted: true
            };
            break;
        }
        case "CONTACT_US_EMAIL_SUCCESS":
        case "CONTACT_US_EMAIL_FAILURE":
            return {
                ...state,
                contactUsModal: false,
                loadingSomething: false
            };
            break;
        case "POST_LINK_SUCCESS":
            return {
                ...state,
                link: action.payload,
                loadingSomething: false
            };
            break;
        case "GET_USER_FROM_SESSION_REQUEST":
        case "GET_USER_FROM_SESSION_REJECTED":
            return {
                ...state,
                isFetching: action.isFetching,
                errorMessage: action.errorMessage
            };
            break;
        case "EMAIL_FAILURE_EXIT_PAGE":
            return {
                ...state,
                userPostedFailed: false
            };
            break;
        case "GET_USER_FROM_SESSION":
            return {
                ...state,
                currentUser: action.payload.user,
                fullAccess: action.payload.fullAccess,
                isFetching: action.isFetching,
                errorMessage: undefined
            };
            break;
        case "INTERCOM_EVENT":
            Intercom("update");
            return { ...state, loadingSomething: false };
            break;
        case "INTERCOM_EVENT_TEMP":
            if (action.user && action.user.intercom) {
                const intercom = action.user.intercom;
                Intercom("update", {
                    email: intercom.email,
                    user_id: intercom.id,
                    user_hash: action.user.hmac
                });
            }
            return { ...state, loadingSomething: false };
            break;
        case "LOGIN":
            if (action.user && action.user.intercom) {
                const intercom = action.user.intercom;
                Intercom("update", {
                    email: intercom.email,
                    user_id: intercom.id,
                    name: action.user.name,
                    user_hash: action.user.hmac
                });
            }
            return {
                ...state,
                notification: action.notification,
                notificationDate: new Date(),
                currentUser: action.user,
                fullAccess: action.fullAccess,
                loadingSomething: false
            };
            break;
        // case "UPDATE_ONBOARDING":
        case "HIDE_POPUPS":
        case "CONFIRM_EMBED_LINK":
            return {
                ...state,
                currentUser: action.payload,
                loadingSomething: false
            };
            break;
        case "NOTIFICATION":
        case "VERIFY_EMAIL_REJECTED":
        case "CHANGE_TEMP_PASS_REJECTED":
        case "ADD_PATHWAY_REJECTED":
        case "HIDE_POPUPS_REJECTED":
        case "CONFIRM_EMBED_LINK_REJECTED":
        case "POST_BUSINESS_INTERESTS_REJECTED":
        case "ADD_NOTIFICATION":
            return {
                ...state,
                notification: action.notification,
                notificationDate: new Date(),
                autoCloseNotification: action.notification.closeSelf === false ? false : true
            };
            break;
        case "NOTIFICATION_AND_STOP_LOADING":
        case "CHANGE_PASSWORD_REJECTED":
        case "LOGIN_REJECTED":
            return {
                ...state,
                notification: action.notification,
                notificationDate: new Date(),
                loadingSomething: false
            };
            break;
        case "UPDATE_USER_REJECTED":
        //case "UPDATE_ONBOARDING_REJECTED":
        case "CHANGE_PASSWORD":
        case "POST_EMAIL_INVITES_REJECTED":
            return {
                ...state,
                loadingSomething: false,
                userPostedFailed: true,
                ...notificationInfo(action.notification)
            };
            break;
        case "SIGNOUT":
            Intercom("shutdown");
            Intercom("boot", {
                app_id: "xki3jtkg"
            });
            return { ...state, currentUser: undefined, billing: undefined };
            break;
        case "FORGOT_PASSWORD_REQUESTED":
        case "POST_USER_REQUESTED":
        case "POST_EMAIL_INVITES_REQUESTED":
        case "FOR_BUSINESS_REQUESTED":
        case "CONTACT_US_REQUESTED":
        case "COMPLETE_PATHWAY_REQUESTED":
        case "START_LOADING":
        case "BILLING_CUSTOMER_LOADING":
            return {
                ...state,
                loadingSomething: true
            };
            break;
        case "STOP_LOADING":
            return { ...state, loadingSomething: false };
            break;
        case "ON_SIGNUP_PAGE":
            return {
                ...state,
                userPosted: false
            };
            break;
        case "POST_USER": {
            return {
                ...state,
                currentUser: action.user,
                userPosted: true,
                loadingSomething: false
            };
        }
        case "POST_EMAIL_INVITES_SUCCESS":
            return {
                ...state,
                userPosted: true,
                loadingSomething: false
            };
            break;
        case "POST_USER_SUCCESS_EMAIL_FAIL":
            return {
                ...state,
                loadingSomething: false,
                notification: action.notification,
                notificationDate: new Date()
            };
            break;
        case "POST_USER_REJECTED":
            return {
                ...state,
                notification: action.notification,
                notificationDate: new Date(),
                loadingSomething: false
            };
            break;
        case "DELETE_USER":
            // TODO
            break;
        case "SUBMIT_FREE_RESPONSE":
            return {
                ...state,
                currentUser: action.currentUser,
                notification: action.notification,
                notificationDate: new Date(),
                loadingSomething: false
            };
            break;
        case "UPDATE_USER":
            return { ...state, currentUser: action.user };
            break;
        case "UPDATE_USER_SETTINGS":
            return {
                ...state,
                currentUser: action.user,
                notification: action.notification,
                notificationDate: new Date(),
                loadingSomething: false
            };
            break;
        case "UPDATE_ANSWER":
        case "START_POSITION_EVAL":
        case "CONTINUE_POSITION_EVAL":
        case "NEW_CURRENT_USER":
            return {
                ...state,
                currentUser: action.currentUser
            };
            break;
        case "FOR_BUSINESS":
        case "COMPLETE_PATHWAY":
        case "COMPLETE_PATHWAY_REJECTED":
            let newState = {
                ...state,
                ...notificationInfo(action.notification),
                loadingSomething: false
            };
            if (action.user) {
                newState.currentUser = action.user;
            }
            return newState;
            break;
        case "SUCCESS_BILLING_INFO":
            return {
                ...state,
                ...notificationInfo(action.notification),
                billing: action.billing,
                loadingSomething: false
            };
            break;
        case "SUCCESS_BILLING_CUSTOMER":
            return {
                ...state,
                ...notificationInfo(action.notification),
                billing: action.billing,
                fullAccess: action.fullAccess,
                loadingSomething: false
            };
            break;
        case "CONTACT_US":
        case "FORGOT_PASSWORD":
        case "FORGOT_PASSWORD_REJECTED":
        case "CHANGE_PASS_FORGOT_REJECTED":
        case "FORM_ERROR":
        case "ERROR_FINISHED_LOADING":
        case "SUCCESS_FINISHED_LOADING":
        case "START_PSYCH_EVAL_ERROR":
        case "FAILURE_BILLING_CUSTOMER":
            return {
                ...state,
                ...notificationInfo(action.notification),
                loadingSomething: false
            };
            break;
        case "CLOSE_NOTIFICATION":
            return {
                ...state,
                notification: undefined,
                notificationDate: new Date()
            };
            break;
        // case "START_ONBOARDING":
        //     return {
        //         ...state, isOnboarding: true
        //     }
        //     break;
        // case "END_ONBOARDING":
        //     // update the user if an update was sent
        //     if (action.user) {
        //         return {
        //             ...state,
        //             isOnboarding: false,
        //             currentUser: action.user
        //         }
        //     } else {
        //         return {
        //             ...state,
        //             isOnboarding: false
        //         }
        //     }
        //     break;
        // case "UPDATE_USER_ONBOARDING":
        //     return {
        //         ...state, currentUser: action.user
        //     };
        //     break;
        case "START_PSYCH_EVAL":
        case "USER_UPDATE":
            return {
                ...state,
                currentUser: action.currentUser,
                loadingSomething: false
            };
            break;
        case "COMPLETE_PATHWAY_REJECTED_INCOMPLETE_STEPS":
            return {
                ...state,
                incompleteSteps: action.incompleteSteps,
                loadingSomething: false
            };
            break;
        case "RESET_INCOMPLETE_STEPS":
            return {
                ...state,
                incompleteSteps: undefined
            };
            break;
        case "SET_WEBP_SUPPORT":
            // set image file types
            const png = action.webpSupported ? ".webp" : ".png";
            const jpg = action.webpSupported ? ".webp" : ".jpg";
            return {
                ...state,
                webpSupportChecked: true,
                png,
                jpg
            };
            break;
        case "UPDATE_POSITION_COUNT":
            return {
                ...state,
                positionCount: action.count
            };
            break;
        case "CHANGE_AUTOMATE_INVITES": {
            // get the automateInvites info up to this point
            let automateInvites = state.automateInvites ? state.automateInvites : {};
            // get the arguments we could receive
            const {
                page,
                header,
                goBack,
                nextPage,
                nextCallable,
                lastSubStep,
                extraNextFunction,
                extraNextFunctionPage
            } = action.args;
            // if the header should be changed, do so
            if (header !== undefined) {
                automateInvites.header = header;
            }
            // if the next page to be navigated to should be changed, do so
            if (nextPage !== undefined) {
                automateInvites.nextPage = nextPage;
            }
            // if this should be marked as the last page in a sequence, mark it
            // should always be able to move on to next STEP if on the last SUB STEP
            if (typeof lastSubStep === "boolean") {
                automateInvites.lastSubStep = lastSubStep;
            }
            // if the ability to move to the next step should be changed, change it
            if (typeof nextCallable === "boolean") {
                automateInvites.nextCallable = nextCallable;
            }
            // if there is a function to call when Next button pressed, add it
            if (extraNextFunction !== undefined) {
                automateInvites.extraNextFunction = extraNextFunction;
            }
            // if there is a page going along with the above function, add it
            if (extraNextFunctionPage !== undefined) {
                automateInvites.extraNextFunctionPage = extraNextFunctionPage;
            }
            // if there is a page to be navigated to
            if (page !== undefined) {
                // make sure there is a page stack
                if (!automateInvites.pageStack) {
                    // if not, create one
                    automateInvites.pageStack = new Stack();
                }
                // if the requested page isn't the same as the one we're already on ...
                if (automateInvites.pageStack.top() !== page) {
                    // ... add the requested page to the stack
                    automateInvites.pageStack.push(page);
                }
                // add the page as the current page
                automateInvites.currentPage = page;
                // if the page currently being added is listed as the next page
                // AND new next page isn't being added, get rid of the page that
                // says it should be up next, because it's now the current page
                if (!nextPage && page === automateInvites.nextPage) {
                    automateInvites.nextPage = undefined;
                }
            }
            // if we should be navigating back to a previous page
            else if (goBack !== undefined) {
                // if the page stack exists ...
                if (automateInvites.pageStack && automateInvites.pageStack.size() > 0) {
                    // remove the top of the page stack
                    automateInvites.pageStack.pop();
                    // and set the current page to the one at the new top
                    automateInvites.currentPage = automateInvites.pageStack.top();
                }
            }
            return { ...state, automateInvites };
            break;
        }
        case "POP_GO_BACK_STACK": {
            let automateInvites = state.automateInvites ? state.automateInvites : {};
            // if there is a stack of actions that allow you to go backwards
            if (automateInvites.goBackStack) {
                // remove the top action from the stack
                automateInvites.goBackStack.pop();
            }
            // save the updated automateInvites object
            return { ...state, automateInvites };
        }
        // override ALL of evaluation state
        case "SET_EVALUATION_STATE": {
            return { ...state, evaluationState: action.evaluationState };
        }
        // override parts of old evaluation state with new eval state
        case "UPDATE_EVALUATION_STATE": {
            let newState = {
                ...state,
                loadingSomething: false,
                // update evaluation state without resetting everything
                evaluationState: {
                    ...state.evaluationState,
                    ...action.evaluationState
                }
            };
            // update user if given
            if (action.user) {
                newState.currentUser = action.user;
            }
            return newState;
        }
        case "ADD_PATHWAY":
            return {
                ...state,
                currentUser: action.payload,
                notification: action.notification,
                notificationDate: new Date()
            };
            break;
        default:
            return { ...state };
            break;
    }

    return state;
}

// type is optional as it should be included within the notification object
function notificationInfo(notification, givenType) {
    const errorTypes = ["error", "errorHeader"];
    let message = undefined;
    // assume info headers instead of error headers
    let type = "infoHeader";
    // if the given notification is the message
    if (typeof notification === "string") {
        message = notification;
        if (errorTypes.includes(givenType)) {
            type = "errorHeader";
        }
    }
    // if the given notification is a notification object
    else if (typeof notification === "object") {
        // add the given message if provided
        if (typeof notification.message === "string") {
            message = notification.message;
        }
        // add the message type if given
        if (errorTypes.includes(notification.type) || errorTypes.includes(givenType)) {
            type = "errorHeader";
        }
    }
    // return the notification information if enough info is given to make one
    return typeof message === "string"
        ? {
              notification: { message, type },
              notificationDate: new Date()
          }
        : {};
}
