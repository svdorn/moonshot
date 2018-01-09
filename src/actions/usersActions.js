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
        dispatch({type: "CLOSE_NOTIFICATION"});
        browserHistory.push('/discover');

        axios.post("/api/userSession", {userId: response.data._id})
            .then(function(response) {
                console.log("added user to session");
            })
            .catch(function(err) {
                console.log("error adding user to session", err);
            });
      })
      .catch(function(err) {
        dispatch({type: "LOGIN_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
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
                        console.log("emailResponse is: ");
                        console.log(emailResponse);
                        dispatch({type:"POST_USER", notification:{message: emailResponse.data, type: "infoHeader"}});
                        browserHistory.push('/');
                    })
                    // error sending verification email
                    .catch(function(emailError) {
                        console.log("user successfully posted but error sending email: ", emailError)
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", notification:{message: response.data, type: "errorHeader"}});
                        browserHistory.push('/login');
                    });
            })
            // error posting user
            .catch(function(err) {
                console.log("error posting user");
                console.log(err);
                dispatch({type: "POST_USER_REJECTED", notification:{message: err.response.data, type: "errorHeader"}});
            });
    }
}

export function closeNotification() {
    return function(dispatch) {
        dispatch({type: "CLOSE_NOTIFICATION"});
    }
}

// FORGOT PASSWORD
export function forgotPassword(user) {
    return function(dispatch) {
        dispatch({type: "FORGOT_PASSWORD_REQUESTED"});

        axios.post("/api/forgotPassword", user)
            .then(function(response) {
                dispatch({type:"FORGOT_PASSWORD", notification:{message: response.data, type:"infoHeader"}})
            })
            .catch(function(err) {
                dispatch({type:"FORGOT_PASSWORD_REJECTED", notification:{message: err.response.data, type:"errorHeader"}})
            })
    }
}

// UPDATE A USER
export function updateUser(user) {
    return function(dispatch) {

        // update user on the database
        axios.put("/api/users/" + user._id, user)
            .then(function(response) {
                dispatch({type:"UPDATE_USER", payload:response.data, notification:{message: "Settings updated!", type: "infoHeader"}})
            })
            .catch(function(err) {
                dispatch({type:"UPDATE_USER_REJECTED", notification: {message: "Error updating settings", type: "errorHeader"}})
            });
    }
}

export function changePassword(user) {
    return function(dispatch) {

        axios.put('/api/users/changepassword/' +user._id, user)
            .then(function(response) {
                dispatch({type:"CHANGE_PASSWORD", payload:response.data, notification:{message:"Password changed!", type:"infoHeader"}})
            })
            .catch(function(err){
                console.log(err);
                dispatch({type:"CHANGE_PASSWORD_REJECTED", notification:{message: "Error changing password", type: "errorHeader"}})
            });
    }
}

// VERIFY EMAIL
export function verifyEmail(token) {
    return function(dispatch) {
        axios.post("/api/verifyEmail", {token: token})
            .then(function(response) {
                console.log("EMAIL VERIFIED!");
                dispatch({type: "LOGIN", payload:response.data, notification:{message: "Account verified!", type: "infoHeader"}});
                browserHistory.push('/onboarding');
            })
            .catch(function(err) {
                console.log("EMAIL VERIFIED REJECTED");
                dispatch({type: "VERIFY_EMAIL_REJECTED", notification: {message: "Error verifying email", type: "errorHeader"}});
            });
    }
}

export function changePasswordForgot(user) {
    return function(dispatch) {
        axios.post("api/users/changePasswordForgot", user)
            .then(function(response) {
                dispatch({type:"LOGIN", notification:{message:response.data, type:"infoHeader"}});
                browserHistory.push('/');
            })
            .catch(function(err) {
                dispatch({type:"CHANGE_PASS_FORGOT_REJECTED", notification: {message: "Error changing password", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on forBusiness page
export function forBusiness(user){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/users/forBusinessEmail", user)
            .then(function(response) {
                dispatch({type:"FOR_BUSINESS", notification: {message:response.data, type:"infoHeader"}});
                browserHistory.push('/');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when a student registers for a pathway
export function registerForPathway(user) {
    return function(dispatch) {
        dispatch({type: "REGISTER_FOR_PATHWAY_REQUESTED"});

        axios.post("/api/users/registerForPathway", user)
            .then(function(response) {
                window.scrollTo(0, 0);
                dispatch({type:"REGISTER_FOR_PATHWAY", notification: {message:response.data, type:"infoHeader"}});
            })
            .catch(function(err) {
                dispatch({type:"REGISTER_FOR_PATHWAY", notification: {message: "Error sending email and registering, please try again.", type: "errorHeader"}})
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

export function updateCurrentSubStep(user, pathwayId, stepNumber, subStep) {
    return function(dispatch) {
        let currentUser = Object.assign({}, user);
        // set the current step for the user in redux state
        currentUser.pathways.find(function(path) {
            return path.pathwayId == pathwayId
        }).currentStep = {subStep: subStep.order, step: stepNumber};
        dispatch({type: "UPDATE_CURRENT_SUBSTEP", payload: subStep, pathwayId, currentUser});

        axios.post("/api/userCurrentStep", {
            params: {
                userId: user._id,
                pathwayId: pathwayId,
                stepNumber: stepNumber,
                subStepNumber: subStep.order
            }
        })
        .then(function(response) {
            console.log("current step saved");
        })
        .catch(function(err) {
            console.log("error saving current step: ", err)
        });
    }
}

export function updateInterests(user, interests) {
    return function(dispatch) {
        axios.post("/api/updateInterests", {
            params: {
                userId: user._id,
                interests: interests
            }
        })
            .then(function(response) {
                console.log("updates to interests saved")
            })
            .catch(function(err) {
                console.log("error updating interests: ", err)
            });
    }
}

// Send an email when form filled out on contactUs page
export function contactUs(user){
    return function(dispatch) {
        dispatch({type: "CONTACT_US_REQUESTED"});

        axios.post("api/users/contactUsEmail", user)
            .then(function(response) {
                dispatch({type:"CONTACT_US", notification: {message:response.data, type:"infoHeader"}});
                browserHistory.push('/myPathways');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"CONTACT_US", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

export function formError() {
    return function(dispatch) {
        dispatch({type:"FORM_ERROR", notification: {message: "Fields must all be filled in to submit form.", type: "errorHeader"}})

    }
}

// RESET BUTTON
export function resetButton() {
  return {
    type: "RESET_BUTTON",
  }
}
