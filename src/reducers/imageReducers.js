"use strict"

// USERS REDUCERS
// const initialState = {
//     homepageImages: []
// }
export function imageReducers(state = {images:[]}, action) {
    switch (action.type) {
        case "GET_HOMEPAGE_IMAGES":
            console.log("got homepage images");
            console.log("payload is: ", action.payload);
            return {
                ...state,
                images: action.payload
            };
            break;
    }

    return state
}
