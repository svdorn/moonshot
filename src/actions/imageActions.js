"use strict"
import axios from 'axios';

export function getHomepageImages() {
    return function(dispatch) {
        axios.get('/api/images')
            .then(response => {
                console.log("in imageActions, payload is: ", response.data);
                dispatch({type: "GET_HOMEPAGE_IMAGES", payload: response.data})
            })
            .catch(err => {
                dispatch({type: "GET_HOMEPAGE_IMAGES_REJECTED", payload: "server error"})
            })
    }
}
