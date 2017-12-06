"use strict"

// USERS REDUCERS
export function usersReducers(state = {users: []}, action) {
    switch (action.type) {
        case "GET_USERS":
            return {...state, users: [...action.payload]}
            break;
        case "LOGIN":
            console.log("printing payload");
            console.log(action.payload);
            return {...state, loginError: undefined, currentUser: action.payload}
            break;
        case "LOGIN_REJECTED":
            // TODO deal with failed login
            console.log("LOGIN FAILED");
            console.log(action.payload);
            return {...state, loginError: action.payload}
            break;
        case "POST_USER":
            return {
                ...state,
                users: [...state.users, ...action.payload],
                msg: 'Saved! Click to continue',
                style: 'success',
                validation: 'success'
            }
            break;
        case "POST_USER_REJECTED":
            return {
                ...state,
                msg: 'Please try again',
                style: 'danger',
                validation: 'error'
            }
            break;
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
            const currentUserToUpdate = [...state.users];
            // Determine at which index in users array is the user to be deleted
            const indexToUpdate = currentUserToUpdate.findIndex(
                function (user) {
                    return user._id === action.payload._id;
                }
            )
            // create a new user object with the new values
            const newUser = {
                ...currentUserToUpdate[indexToUpdate],
                username: action.payload.username
            }
            console.log("what newUser is: ", newUser);
            return {
                users: [...currentUserToUpdate.slice(0, indexToUpdate),
                    newUser, ...currentUserToUpdate.slice(indexToUpdate + 1)]
            }
            break;
    }

    return state
}
