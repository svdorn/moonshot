"use strict"

// USERS REDUCERS
const initialState = {
    currentUser: undefined,
    isFetching: false,
    headerMessage: undefined,
    headerType: undefined,
    headerExpirationTime: undefined,
    blueHeader: false,
    userPosted: false
}
export function usersReducers(state = initialState, action) {
    switch (action.type) {
        case "GET_USER_FROM_SESSION_REQUEST":
        case "GET_USER_FROM_SESSION_REJECTED":
            return {
                ...state,
                isFetching: action.isFetching,
                errorMessage: action.errorMessage
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
                notification: undefined,
                currentUser: action.payload
            };
            break;
        case "NOTIFICATION":
        case "LOGIN_REJECTED":
        case "VERIFY_EMAIL_REJECTED":
        case "UPDATE_USER_REJECTED":
        case "CHANGE_PASSWORD":
        case "CHANGE_PASSWORD_REJECTED":
        case "ADD_PATHWAY_REJECTED":
        case "ADD_NOTIFICATION":
            return {...state, notification: action.notification};
            break;
        case "SIGNOUT":
            return {...state, currentUser: undefined};
            break;
        case "FORGOT_PASSWORD_REQUESTED":
        case "POST_USER_REQUESTED":
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
        case "UPDATE_USER":
            return {
                ...state, currentUser: action.payload, notification: action.notification
            };
            break;
        case "UPDATE_ANSWER":
            return {
                ...state,
                currentUser: action.currentUser
            };
            break;
        case "FOR_BUSINESS_REQUESTED":
        case "CONTACT_US_REQUESTED":
        case "COMPLETE_PATHWAY_REQUESTED":
            return {
                ...state, loadingSomething: true
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
            return {
                ...state, notification: action.notification, loadingSomething: false
            };
            break;
        case "REGISTER_FOR_PATHWAY":
            return {
                ...state, notification: action.notification, loadingEmail: false
            };
            break;
        case "REGISTER_FOR_PATHWAY_REQUESTED":
            return {
                ...state, loadingEmail: true
            };
            break;
        case "UPDATE_CURRENT_SUBSTEP":
            const subStep = {...action.payload, pathwayId: action.pathwayId}
            return {
                ...state, currentSubStep: subStep, currentUser: action.currentUser
            }
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
        case "ADD_PATHWAY":
            return {
                ...state, currentUser: action.payload, notification: action.notification
            };
            break;
        case "TURN_HEADER_BLUE":
            return {
                ...state, blueHeader: action.shouldBeBlue
            }
            break;
    }

    return state
}
