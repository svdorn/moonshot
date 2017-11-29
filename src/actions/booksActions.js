"use strict"
import axios from 'axios';

// GET BOOKS
export function getUsers() {
  return function(dispatch) {
    axios.get("/api/books")
      .then(function(response) {
        dispatch({type:"GET_USERS", payload: response.data});
      })
      .catch(function(err) {
        dispatch({type: "GET_USERS_REJECTED", payload: err});
      });
  }
}

// POST BOOKS
export function postUser(user) {
  return function(dispatch) {
    axios.post("/api/books", user)
      .then(function(response) {
        dispatch({type:"POST_USER", payload:response.data});
      })
      .catch(function(err) {
        dispatch({type: "POST_USER_REJECTED", payload: "there was an error while posting a new user"});
      });
  }
}

// DELETE A BOOK
export function deleteUser(id) {
  return function(dispatch) {
    axios.delete("/api/books/" + id)
      .then(function(response) {
        dispatch({type: "DELETE_USER", payload: id});
      })
      .catch(function(err) {
        dispatch({type: "DELETE_USER_REJECTED", payload: err});
      })
  }
}

// UPDATE A BOOK
export function updateUser(user) {
  return {
    type: "UPDATE_USER",
    payload: user
  }
}

// RESET BUTTON
export function resetButton() {
  return {
    type: "RESET_BUTTON",
  }
}
