"use strict"
import axios from 'axios';
import { browserHistory } from 'react-router'

// GET USERS
export function getUsers() {
  return function(dispatch) {
    axios.get("/api/users")
      .then(function(response) {
        dispatch({type:"GET_USERS", payload: response.data});
      })
      .catch(function(err) {
        dispatch({type: "GET_USERS_REJECTED", payload: err});
      });
  }
}

export function login(user) {
  return function(dispatch) {
    axios.post("/api/login", user)
      .then(function(response) {
        dispatch({type:"LOGIN", payload: response.data});
        browserHistory.push('/');
        //return "successful Login, got this from the action creator";
      })
      .catch(function(err) {
        dispatch({type: "LOGIN_REJECTED", payload: err});
      });
  }
}

// POST USERS
export function postUser(user) {
  return function(dispatch) {
    axios.post("/api/users", user)
      .then(function(response) {
        dispatch({type:"POST_USER", payload:response.data});
        browserHistory.push('/login');
      })
      .catch(function(err) {
        dispatch({type: "POST_USER_REJECTED", payload: "there was an error while posting a new user"});
      });
  }
}

// DELETE A USER
export function deleteUser(id) {
  return function(dispatch) {
    axios.delete("/api/users/" + id)
      .then(function(response) {
        dispatch({type: "DELETE_USER", payload: id});
      })
      .catch(function(err) {
        dispatch({type: "DELETE_USER_REJECTED", payload: err});
      })
  }
}

// UPDATE A USER
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
