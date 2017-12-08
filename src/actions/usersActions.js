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

// GET USER FROM SESSION
export function getUserFromSession() {
    return function(dispatch) {
        dispatch({
            type: "GET_USER_FROM_SESSION_REQUEST",
            isFetching: true,
            errorMessage: undefined
        });

        console.log("about to get the user");
        axios.get("/api/userSession")
            .then(function(response) {
                console.log("got the user, dispatching");
                dispatch({
                    type: "GET_USER_FROM_SESSION",
                    payload: response.data,
                    isFetching: false});
            })
            .catch(function(err) {
                dispatch({
                    type: "GET_USER_FROM_SESSION_REJECTED",
                    errorMessage:"error getting user from session",
                    isFetching: false})
            })
    };
}

export function login(user) {
  return function(dispatch) {
    axios.post("/api/login", user)
      .then(function(response) {
        dispatch({type:"LOGIN", payload: response.data});
        browserHistory.push('/');

        axios.post("/api/userSession", {userId: response.data._id})
            .then(function(response) {
                console.log("added user to session");
            })
            .catch(function(err) {
                console.log("error adding user to session", err);
            });
      })
      .catch(function(err) {
        dispatch({type: "LOGIN_REJECTED", payload: err});
      });
  }
}

// LOG USER OUT
export function signout() {
    return function(dispatch) {
        dispatch({type:"SIGNOUT"});
        axios.post("/api/userSession", {userId: undefined})
            .then(function(response) {
                console.log("removed user from session");
            })
            .catch(function(err) {
                console.log("error removing user from session", err);
            });
    }
}

// POST USERS
export function postUser(user) {
    return function(dispatch) {

        dispatch({type: "POST_USER_REQUESTED"});

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
                        dispatch({type:"POST_USER", payload:emailResponse.data});
                        browserHistory.push('/');
                    })
                    // error sending verification email
                    .catch(function(emailError) {
                        console.log("user successfully posted but error sending email: ", emailError)
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", payload:response.data});
                        browserHistory.push('/login');
                    });
            })
            // error posting user
            .catch(function(err) {
                dispatch({type: "POST_USER_REJECTED", payload: "there was an error while posting a new user"});
            });
    }
}

// FORGOT PASSWORD
export function forgotPassword(user) {
    return function(dispatch) {
        dispatch({type: "FORGOT_PASSWORD_REQUESTED"});

        axios.post("/api/forgotPassword", user)
            .then(function(response) {
                dispatch({type:"FORGOT_PASSWORD", payload:response.data})
            })
            .catch(function(err) {
                dispatch({type:"FORGOT_PASSWORD_REJECTED", payload:err})
            })
    }
}

// UPDATE A USER
export function updateUser(user) {
    return function(dispatch) {

        // update user on the database
        axios.put("/api/users/" + user._id, user)
            .then(function(response) {
                dispatch({type:"UPDATE_USER", payload:response.data})
            })
            .catch(function(err) {

            });
    }
}

export function changePassword(user) {
    return function(dispatch) {

        axios.put('/api/users/changepassword/' +user._id, user)
            .then(function(response) {
                dispatch({type:"CHANGE_PASSWORD", payload:response.data})
            })
            .catch(function(err){
                dispatch({type:"CHANGE_PASSWORD_REJECTED", payload:err})
            });
    }
}

// VERIFY EMAIL
export function verifyEmail(token) {
    return function(dispatch) {
        axios.post("/api/verifyEmail", {token: token})
            .then(function(response) {
                console.log("EMAIL VERIFIED!");
                dispatch({type: "LOGIN", payload:response.data});
                browserHistory.push('/');
            })
            .catch(function(err) {
                console.log("EMAIL VERIFIED REJECTED");
                dispatch({type: "VERIFY_EMAIL_REJECTED"});
            });
    }
}

export function changePasswordForgot(user) {
    return function(dispatch) {
        axios.post("api/users/changePasswordForgot", user)
            .then(function(response) {
                dispatch({type:"LOGIN", payload:response.data});
                browserHistory.push('/');
            })
            .catch(function(err) {
                dispatch({type:"CHANGE_PASS_FORGOT_REJECTED"})
            })
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

// RESET BUTTON
export function resetButton() {
  return {
    type: "RESET_BUTTON",
  }
}
