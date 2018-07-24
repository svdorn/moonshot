"use strict"

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
        case "POST_LINK_SUCCESS":
            console.log(action.payload);
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
                currentUser: action.payload,
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
            return {...state, notification: action.notification};
            break;
        case "UPDATE_USER_REJECTED":
        case "LOGIN_REJECTED":
        case "UPDATE_ONBOARDING_REJECTED":
        case "CHANGE_PASSWORD":
        case "CHANGE_PASSWORD_REJECTED":
            return {...state, notification: action.notification, loadingSomething: false};
            break;
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
                loadingSomething: false
            };
            break;
        case "POST_USER_SUCCESS_EMAIL_FAIL":
            return {
                ...state,
                loadingSomething: false,
                notification: action.notification
            };
            break;
        case "POST_USER_REJECTED":
            return {
                ...state,
                notification: action.notification,
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
                loadingSomething: false
            }
            break;
        case "UPDATE_USER":
            return {
                ...state, currentUser: action.payload, notification: action.notification, loadingSomething: false
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
                ...state, notification: action.notification, loadingSomething: false
            };
            break;
        case "STOP_LOADING":
            return {
                ...state, loadingSomething: false
            };
            break;
        case "CLOSE_NOTIFICATION":
            return {
                ...state, notification: undefined
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
                ...state, currentUser: action.payload
            };
            break;
        case "START_PSYCH_EVAL":
        case "USER_UPDATE":
            return {
                ...state, currentUser: action.currentUser, loadingSomething: false
            }
            break;
        case "ANSWER_PSYCH_QUESTION":
            return {
                ...state, currentUser: action.user, finishedPsychTest: action.finishedTest
            }
            break;
        case "ANSWER_PSYCH_QUESTION_ERROR":
            return {
                ...state, notification: action.notification
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
        case "ADD_PATHWAY":
            return {
                ...state, currentUser: action.payload, notification: action.notification
            };
            break;
        default:
            return {...state};
            break;
    }

    return state
}
