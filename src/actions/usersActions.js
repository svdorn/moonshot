"use strict"
import axios from 'axios';
import { browserHistory } from 'react-router'

// GET USER FROM SESSION
export function getUserFromSession(callback) {
    return function(dispatch) {
        dispatch({
            type: "GET_USER_FROM_SESSION_REQUEST",
            isFetching: true,
            errorMessage: undefined
        });

        axios.get("/api/userSession")
            .then(function(response) {
                dispatch({
                    type: "GET_USER_FROM_SESSION",
                    payload: response.data,
                    isFetching: false});
                callback(true);
            })
            .catch(function(err) {
                dispatch({
                    type: "GET_USER_FROM_SESSION_REJECTED",
                    errorMessage:"error getting user from session",
                    isFetching: false});
                callback(true);
            })
    };
}

export function login(user, saveSession, navigateBackUrl) {
    return function(dispatch) {
        axios.post("/api/login", {user, saveSession})
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({type:"LOGIN", payload: returnedUser});
                dispatch({type: "CLOSE_NOTIFICATION"});
                let nextUrl = '/discover';
                if (navigateBackUrl) {
                    nextUrl = navigateBackUrl;
                }
                browserHistory.push(nextUrl);
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
        axios.post("/api/signOut")
            .then(function(response) {
            })
            .catch(function(err) {
            });
    }
}

export function onSignUpPage() {
    return function(dispatch) {
        dispatch({type: "ON_SIGNUP_PAGE"});
    }
}

// POST USER
export function postUser(user) {
    return function(dispatch) {

        dispatch({type: "POST_USER_REQUESTED"});

        // post user to database
        axios.post("/api/user", user)
            // user successfully posted
            .then(function(response) {
                // send verification email
                axios.post("/api/sendVerificationEmail", {email: user.email})
                    // successfully sent verification email
                    .then(function(emailResponse) {
                        dispatch({type:"POST_USER"});
                        window.scrollTo(0,0);
                    })
                    // error sending verification email
                    .catch(function(emailError) {
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", notification:{message: response.data, type: "errorHeader"}});
                        window.scrollTo(0,0);
                    });
            })
            // error posting user
            .catch(function(err) {
                dispatch({type: "POST_USER_REJECTED", notification:{message: err.response.data, type: "errorHeader"}});
            });
    }
}

// POST BUSINESS USER
export function postBusinessUser(newUser, currentUser) {
    return function(dispatch) {
        dispatch({type: "POST_USER_REQUESTED"});

        // post user to database
        axios.post("/api/businessUser", {newUser, currentUser})
            // user successfully posted
            .then(function(companyName) {
                // send verification email
                axios.post("/api/sendBusinessUserVerificationEmail", {email: newUser.email, companyName})
                    // successfully sent verification email
                    .then(function(emailResponse) {
                        dispatch({type:"POST_USER"});
                        window.scrollTo(0,0);
                    })
                    // error sending verification email
                    .catch(function(emailError) {
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", notification:{message: response.data, type: "errorHeader"}});
                        window.scrollTo(0,0);
                    });
            })
            // error posting user
            .catch(function(err) {
                dispatch({type: "POST_USER_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
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
        axios.put("/api/user/" + user._id, user)
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

        axios.put('/api/user/changepassword/' +user._id, user)
            .then(function(response) {
                dispatch({type:"CHANGE_PASSWORD", payload:response.data, notification:{message:"Password changed!", type:"infoHeader"}})
            })
            .catch(function(err){
                dispatch({type:"CHANGE_PASSWORD_REJECTED", notification:{message: "Error changing password", type: "errorHeader"}})
            });
    }
}

// VERIFY EMAIL
export function verifyEmail(userType, token) {
    return function(dispatch) {
        axios.post("/api/verifyEmail", {userType, token})
            .then(function(response) {
                if (!response.data || response.data === "go to login" || userType == "businessUser") {
                    let msg = "Account verified!";
                    let nextLocation = "/login";
                    if (userType == "businessUser") {
                        msg = "Account verified! Please reset your password using the temporary password the account admin set up for you.";
                        nextLocation = "/changeTempPassword";
                    }

                    dispatch({type: "NOTIFICATION", notification:{message: msg, type: "infoHeader"}});
                    browserHistory.push(nextLocation);
                } else {
                    dispatch({type: "LOGIN", payload:response.data, notification:{message: "Account verified!", type: "infoHeader"}});
                    browserHistory.push('/onboarding');
                }
            })
            .catch(function(err) {
                dispatch({type: "VERIFY_EMAIL_REJECTED", notification: {message: "Error verifying email", type: "errorHeader"}});
            });
    }
}

export function changePasswordForgot(user) {
    return function(dispatch) {
        axios.post("api/user/changePasswordForgot", user)
            .then(function(response) {
                dispatch({type:"LOGIN", notification:{message:response.data, type:"infoHeader"}});
                browserHistory.push('/login');
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

        axios.post("api/user/forBusinessEmail", user)
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

// Send an email when form filled out on unsubscribe page
export function unsubscribe(user){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/user/unsubscribeEmail", user)
            .then(function(response) {
                dispatch({type:"FOR_BUSINESS", notification: {message:response.data, type:"infoHeader"}});
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"FOR_BUSINESS", notification: {message: "Error sending email", type: "errorHeader"}})
            })
    }
}

// Send an email when form filled out on comingSoon page
export function comingSoon(user, signedIn){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/user/comingSoonEmail", user)
            .then(function(response) {
                if (!signedIn) {
                    dispatch({type:"FOR_BUSINESS", notification: {message:response.data, type:"infoHeader"}});
                    browserHistory.push('/login')
                    dispatch({type:"CHANGE_CURRENT_ROUTE", payload:'/login'})
                    window.scrollTo(0, 0);
                } else {
                    dispatch({type:"FOR_BUSINESS", notification: undefined});
                }
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

        axios.post("/api/user/registerForPathway", user)
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
    axios.delete("/api/user/" + id)
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
                subStepNumber: subStep.order,
                verificationToken: user.verificationToken
            }
        })
        .then(function(response) {
        })
        .catch(function(err) {
        });
    }
}

export function updateInterests(user, interests) {
    return function(dispatch) {
        axios.post("/api/updateInterests", {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                interests: interests
            }
        })
            .then(function(response) {
                dispatch({type:"UPDATE_USER_ONBOARDING", payload:response.data});
            })
            .catch(function(err) {
            });
    }
}

export function updateGoals(user, goals) {
    return function(dispatch) {
        axios.post("/api/updateGoals", {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                goals
            }
        })
            .then(function(response) {
                dispatch({type:"UPDATE_USER_ONBOARDING", payload:response.data});
            })
            .catch(function(err) {
            });
    }
}

export function updateInfo(user, info) {
    return function(dispatch) {
        axios.post("/api/updateInfo", {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                info
            }
        })
            .then(function(response) {
                dispatch({type:"UPDATE_USER_ONBOARDING", payload: response.data});
            })
            .catch(function(err) {
            });
    }
}

export function startOnboarding(){
    return function(dispatch) {
        dispatch({type: "START_ONBOARDING"});
    }
}

export function endOnboarding(){
    return function(dispatch) {
        dispatch({type: "END_ONBOARDING"});
    }
}

export function setHeaderBlue(shouldBeBlue) {
    return function(dispatch) {
        dispatch({type: "TURN_HEADER_BLUE", shouldBeBlue});
    }
}

// Send an email when form filled out on contactUs page
export function contactUs(user){
    return function(dispatch) {
        dispatch({type: "CONTACT_US_REQUESTED"});

        axios.post("api/user/contactUsEmail", user)
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
