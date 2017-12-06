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

// LOG USER OUT
export function signout() {
  return{
    type: "SIGNOUT",
  }
}

// POST USERS
export function postUser(user) {
    return function(dispatch) {

    // post user to database
    axios.post("/api/users", user)
        // user successfully posted
        .then(function(response) {
            // send verification email
            console.log("about to try to send email");
            axios.post("/api/sendVerificationEmail", {username: user[0].username})
                // successfully sent verification email
                .then(function(emailResponse) {
                    console.log("email sent");
                    dispatch({type:"POST_USER", payload:response.data});
                    browserHistory.push('/login');
                })
                // error sending verification email
                .catch(function(emailError) {
                    console.log("user successfully posted but error sending email: ", emailError)
                    dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL"}, payload:response.data);
                    browserHistory.push('/login');
                });
        })
        // error posting user
        .catch(function(err) {
            dispatch({type: "POST_USER_REJECTED", payload: "there was an error while posting a new user"});
        });
    }
}

// VERIFY EMAIL
export function verifyEmail() {
    return function(dispatch) {
        axios.post("/api/verifyEmail")
            .then(function(response) {
                console.log("EMAIL VERIFIED!");
                dispatch({type: "VERIFY_EMAIL"});
            })
            .catch(function(err) {
                console.log("EMAIL VERIFIED REJECTED");
                dispatch({type: "VERIFY_EMAIL_REJECTED"});
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
