"use strict"
import { Stack } from "../miscFunctions";

// USERS REDUCERS
const initialState = {
    currentUser: undefined,
    isFetching: false,
    headerMessage: undefined,
    headerType: undefined,
    headerExpirationTime: undefined,
    userPosted: false
}
export function usersReducers(state = initialState, action) {
    switch (action.type) {
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
        case "OPEN_CONTACT_US_MODAL":
            return {
                ...state,
                contactUsModal: true,
            };
            break;
        case "CLOSE_CONTACT_US_MODAL":
            return {
                ...state,
                contactUsModal: false,
                message: undefined
            };
            break;
        case "CREATED_NO_VERIFY_EMAIL_SENT": {
            return {
                ...state,
                sendVerifyEmailTo: action.sendVerifyEmailTo,
                loadingSomething: false,
                userPosted: true
            }
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
                currentUser: action.payload,
                isFetching: action.isFetching,
                errorMessage: undefined
            };
            break;
        case "LOGIN":
            return {
                ...state,
                notification: action.notification,
                notificationDate: new Date(),
                currentUser: action.user,
                loadingSomething: false
            };
            break;
        case "UPDATE_ONBOARDING":
            return {
                ...state,
                currentUser: action.payload
            }
            break;
        case "NOTIFICATION":
        case "VERIFY_EMAIL_REJECTED":
        case "CHANGE_TEMP_PASS_REJECTED":
        case "ADD_PATHWAY_REJECTED":
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
        case "UPDATE_ONBOARDING_REJECTED":
        case "CHANGE_PASSWORD":
        case "POST_EMAIL_INVITES_REJECTED":
            return {...state, loadingSomething:false, userPostedFailed: true}
            break;
        case "SIGNOUT":
            return {...state, currentUser: undefined};
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
            }
            break;
        case "STOP_LOADING":
            return { ...state, loadingSomething: false };
            break;
        case "ON_SIGNUP_PAGE":
            return {
                ...state,
                userPosted: false
            }
            break;
        case "POST_USER":
        case "POST_EMAIL_INVITES_SUCCESS":
            return {
                ...state,
                userPosted: true,
                loadingSomething: false,
                waitingForFinalization: action.waitingForFinalization,
                sendVerifyEmailTo: undefined
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
            }
            break;
        case "UPDATE_USER":
            return {...state, currentUser: action.user };
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
            let newState = {...state, loadingSomething: false};
            if (action.notification) {
                newState.notification = action.notification;
            }
            if (action.user) {
                newState.currentUser = action.user;
            }
            return newState;
            break;
        case "CONTACT_US":
        case "FORGOT_PASSWORD":
        case "FORGOT_PASSWORD_REJECTED":
        case "CHANGE_PASS_FORGOT_REJECTED":
        case "FORM_ERROR":
        case "ERROR_FINISHED_LOADING":
        case "SUCCESS_FINISHED_LOADING":
        case "START_PSYCH_EVAL_ERROR":
        case "SUCCESS_BILLING_CUSTOMER":
        case "FAILURE_BILLING_CUSTOMER":
            return {
                ...state,
                notification: action.notification,
                notificationDate: new Date(),
                loadingSomething: false
            };
            break;
        case "CLOSE_NOTIFICATION":
            return {
                ...state, notification: undefined, notificationDate: new Date()
            }
            break;
        case "START_ONBOARDING":
            return {
                ...state, isOnboarding: true
            }
            break;
        case "END_ONBOARDING":
            // update the user if an update was sent
            if (action.user) {
                return {
                    ...state,
                    isOnboarding: false,
                    currentUser: action.user
                }
            } else {
                return {
                    ...state,
                    isOnboarding: false
                }
            }
            break;
        case "UPDATE_USER_ONBOARDING":
            return {
                ...state, currentUser: action.user
            };
            break;
        case "START_PSYCH_EVAL":
        case "USER_UPDATE":
            return {
                ...state, currentUser: action.currentUser, loadingSomething: false
            }
            break;
        case "COMPLETE_PATHWAY_REJECTED_INCOMPLETE_STEPS":
            return {
                ...state, incompleteSteps: action.incompleteSteps, loadingSomething: false
            }
            break;
        case "RESET_INCOMPLETE_STEPS":
            return {
                ...state, incompleteSteps: undefined
            }
            break;
        case "SET_WEBP_SUPPORT":
            // set image file types
            const png = action.webpSupported ? ".webp" : ".png"
            const jpg = action.webpSupported ? ".webp" : ".jpg";
            return {
                ...state, webpSupportChecked: true, png, jpg
            }
            break;
        case "CHANGE_AUTOMATE_INVITES": {
            // get the automateInvites info up to this point
            let automateInvites = state.automateInvites ? state.automateInvites : {};
            // get the arguments we could receive
            const { page, header, goBack, nextPage, nextCallable, lastSubStep, extraNextFunction, extraNextFunctionPage } = action.args;
            // if the header should be changed, do so
            if (header !== undefined) { automateInvites.header = header; }
            // if the next page to be navigated to should be changed, do so
            if (nextPage !== undefined) { automateInvites.nextPage = nextPage; }
            // if this should be marked as the last page in a sequence, mark it
            // should always be able to move on to next STEP if on the last SUB STEP
            if (typeof lastSubStep === "boolean") { automateInvites.lastSubStep = lastSubStep; }
            // if the ability to move to the next step should be changed, change it
            if (typeof nextCallable === "boolean") { automateInvites.nextCallable = nextCallable; }
            // if there is a function to call when Next button pressed, add it
            if (extraNextFunction !== undefined) { automateInvites.extraNextFunction = extraNextFunction; }
            // if there is a page going along with the above function, add it
            if (extraNextFunctionPage !== undefined) { automateInvites.extraNextFunctionPage = extraNextFunctionPage; }
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
            return { ...state, evaluationState: action.evaluationState }
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
            }
            console.log("new eval state in reducer: ", newState.evaluationState);
            // update user if given
            if (action.user) { newState.currentUser = action.user; }
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
            return {...state};
            break;
    }

    return state
}
