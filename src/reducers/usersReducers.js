"use strict"

// USERS REDUCERS
const initialState = {
    users: [],
    currentUser: undefined,
    isFetching: false,
    headerMessage: undefined,
    headerType: undefined,
    headerExpirationTime: undefined
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
            console.log("setting current user from session: ", action.payload);
            return {
                ...state,
                currentUser: action.payload,
                isFetching: action.isFetching,
                errorMessage: undefined
            };
            break;
        case "GET_USERS":
            return {...state, users: [...action.payload]};
            break;
        case "LOGIN":
            console.log("printing payload");
            console.log(action.payload);
            return {...state, notification: undefined, currentUser: action.payload};
            break;
        case "LOGIN_REJECTED":
            // TODO deal with failed login
            console.log("LOGIN FAILED");
            console.log(action.payload);
            return {...state, notification: action.notification};
            break;
        case "SIGNOUT":
            return {...state, currentUser:undefined};
            break;
        case "FORGOT_PASSWORD_REQUESTED":
        case "POST_USER_REQUESTED":
            return {
                ...state,
                loadingSomething: true
            }
        case "POST_USER":
            return {
                ...state,
                notification: action.notification,
                loadingSomething: false
            };
            break;
        case "POST_USER_REJECTED":
            console.log("user rejected");
            return {
                ...state,
                notification: action.notification,
                loadingSomething: false
            };
            break;
        case "VERIFY_EMAIL_REJECTED":
            return {
                ...state,
                notification: action.notification
            }
        case "RESET_BUTTON":
            return {
                ...state,
                msg: null,
                style: 'primary',
                validation: null
            };
            break;
        case "DELETE_USER":
            // Create a copy of the current array of users
            const currentUserToDelete = [...state.users];
            // Determine at which index in users array is
            // the user to be deleted
            const indexToDelete = currentUserToDelete.findIndex(
                function (user) {
                    return user._id == action.payload;
                }
            )
            // use slice to remove the user at the specified index
            return {
                users: [...currentUserToDelete.slice(0, indexToDelete),
                    ...currentUserToDelete.slice(indexToDelete + 1)]
            }
            break;

        case "UPDATE_USER":
            // Create a copy of the current array of users
            console.log("in reducer");
            console.log("what newUser is: ", action.payload);
            return {
                ...state, currentUser: action.payload, notification: action.notification
            };
            break;
        case "UPDATE_USER_REJECTED":
            return {
                ...state, notification: action.notification
            };
            break;
        case "CHANGE_PASSWORD":
            return {
                ...state, notification: action.notification
            };
            break;
        case "CHANGE_PASSWORD_REJECTED":
            return {
                ...state, notification: action.notification
            };
            break;
        case "FOR_BUSINESS_REQUESTED":
            return {
                ...state, loadingSomething: true
            };
            break;
        case "FOR_BUSINESS":
            return {
                ...state, notification: action.notification, loadingSomething: false
            };
            break;
        case "REGISTER_FOR_PATHWAY":
            return {
                ...state, notification: action.notification, loadingSomething: false
            };
            break;
        case "FORGOT_PASSWORD":
            return {
                ...state, notification: action.notification, loadingSomething: false
            };
            break;
        case "FORGOT_PASSWORD_REJECTED":
            return {
                ...state, notification: action.notification, loadingSomething: false
            };
            break;
        case "UPDATE_CURRENT_SUBSTEP":
            return {
                ...state, currentSubStep: action.payload
            }
            break;
        case "CLOSE_NOTIFICATION":
            return {
                ...state, notification: undefined
            }
            break;
    }

    return state
}
