"use strict"

// USERS REDUCERS
// const initialState = {
//     homepageImages: []
// }
export function imageReducers(state = {images:[]}, action) {
    switch (action.type) {
        case "GET_HOMEPAGE_IMAGES":
            return {
                ...state,
                images: action.payload
            };
            break;
    }

    return state
}
