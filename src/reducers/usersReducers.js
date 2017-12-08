"use strict"

// USERS REDUCERS
const initialState = {
    users: [],
    currentUser: undefined,
    isFetching: false,
    errorMessage: undefined
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
            return {...state, loginError: undefined, currentUser: action.payload};
            break;
        case "LOGIN_REJECTED":
            // TODO deal with failed login
            console.log("LOGIN FAILED");
            console.log(action.payload);
            return {...state, loginError: action.payload};
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
                emailSentMessage: action.payload,
                loadingSomething: false
            };
            break;
        case "POST_USER_REJECTED":
            console.log("user rejected");
            return {
                ...state, failure: action.payload
            };
            break;
        case "VERIFY_EMAIL_REJECTED":
            return {
                ...state,
                verifyEmailErrorMsg: 'Error verifying email'
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
                ...state, currentUser: action.payload, success: "User Updated"
            };
            break;
        case "UPDATE_USER_REJECTED":
            return {
                ...state, failure: action.payload
            };
            break;
        case "CHANGE_PASSWORD":
            return {
                ...state, success: "Password Changed"
            };
            break;
        case "CHANGE_PASSWORD_REJECTED":
            return {
                ...state, failure: action.payload
            };
            break;
        case "FORGOT_PASSWORD":
            return {
                ...state, forgotPassSuccess: action.payload, loadingSomething: false
            };
            break;
        case "FORGOT_PASSWORD_REJECTED":
            return {
                ...state, forgotPassFailure: action.payload, loadingSomething: false
            };
            break;
    }

    return state
}
