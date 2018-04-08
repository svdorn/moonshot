"use strict"
import axios from 'axios';
import { browserHistory } from 'react-router'
import { reset } from 'redux-form';

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

export function login(user, saveSession, navigateBackUrl, pathwayId, pathwayName) {
    return function(dispatch) {
        axios.post("/api/login", {user, saveSession})
            .then(function(response) {
                const returnedUser = response.data;
                dispatch({type:"LOGIN", payload: returnedUser});
                dispatch({type: "CLOSE_NOTIFICATION"});
                let nextUrl = '/discover';
                console.log(returnedUser.userType);
                if (returnedUser.userType === "employer") {
                    nextUrl = 'businessHome';
                }
                if (returnedUser.userType === "candidate" && !returnedUser.hasFinishedOnboarding) {
                    nextUrl = "/onboarding";
                } else if (navigateBackUrl) {
                    nextUrl = navigateBackUrl;
                }

                // should add pathway to user if pathway id exists and user
                // doesn't already have that pathway
                const shouldAddPathwayToUser = pathwayId !== undefined && !returnedUser.pathways.some(function(path) {
                    return path.pathwayId === pathwayId;
                });

                // add pathway if user came here from trying to sign up for a pathway
                if (shouldAddPathwayToUser) {
                    // if the user doesn't already have this pathway, give it
                    // to them, then redirect to the pathway content page
                    axios.post("/api/user/addPathway", {_id: returnedUser._id, verificationToken: returnedUser.verificationToken, pathwayId: pathwayId, pathwayName: pathwayName})
                    .then(function(response) {
                        dispatch({type:"ADD_PATHWAY", payload:response.data, notification:{message:"Pathway added to My Pathways. Thanks for signing up!", type:"infoHeader"}});
                        // navigateBackUrl should be equal to the url for the pathway
                        if (!navigateBackUrl) {
                            navigateBackUrl = "/discover";
                        }
                        browserHistory.push(nextUrl);
                        window.scrollTo(0, 0);
                    })
                    .catch(function(err) {
                        console.log(err);
                        dispatch({type:"ADD_PATHWAY_REJECTED", notification: {message: "Cannot sign up for pathway more than once. Sign up for pathway failed.", type: "errorHeader"}})
                        browserHistory.push(nextUrl);
                        window.scrollTo(0, 0);
                    })
                } else {
                    // otherwise go to the next screen
                    browserHistory.push(nextUrl);
                    window.scrollTo(0, 0);
                }
            })
            .catch(function(err) {
                dispatch({type: "LOGIN_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}

//
// export function addPathwayAndLogin(user, saveSession, pathwayName) {
//     return function(dispatch) {
//         axios.post("/api/login", {user, saveSession})
//             .then(function(response) {
//                 const returnedUser = response.data;
//                 dispatch({type:"LOGIN", payload: returnedUser});
//                 dispatch({type: "CLOSE_NOTIFICATION"});
//                 let nextUrl = '/discover';
//                 if (!returnedUser.hasFinishedOnboarding) {
//                     nextUrl = "/onboarding";
//                 } else if (navigateBackUrl) {
//                     nextUrl = navigateBackUrl;
//                 }
//                 browserHistory.push(nextUrl);
//             })
//             .catch(function(err) {
//                 dispatch({type: "LOGIN_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
//             });
//     }
// }


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
                        console.log("emailSend fail: ", emailError);
                        dispatch({type:"POST_USER_SUCCESS_EMAIL_FAIL", notification:{message: emailError.response.data, type: "errorHeader"}});
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
export function postEmployer(newUser, currentUser) {
    return function(dispatch) {
        dispatch({type: "POST_USER_REQUESTED"});

        // post user to database
        axios.post("/api/employer", {newUser, currentUser})
            // user successfully posted
            .then(function(companyName) {
                // send verification email
                axios.post("/api/sendEmployerVerificationEmail", {email: newUser.email, companyName})
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


export function addNotification(message, notificationType) {
    return function(dispatch) {
        let noteType = "infoHeader";
        if (notificationType === "error") {
            noteType = "errorHeader";
        }
        dispatch({type: "ADD_NOTIFICATION", notification:{message, type: noteType}});
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
        axios.post("/api/user/changeSettings", user)
            .then(function(response) {
                dispatch({type:"UPDATE_USER", payload:response.data, notification:{message: "Settings updated!", type: "infoHeader"}})
            })
            .catch(function(err) {
                dispatch({type:"UPDATE_USER_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
            });
    }
}

export function changePassword(user) {
    return function(dispatch) {

        axios.post('/api/user/changepassword', user)
            .then(function(response) {
                dispatch({type:"CHANGE_PASSWORD", payload:response.data, notification:{message:"Password changed!", type:"infoHeader"}})
                // reset the form
                dispatch(reset("changePassword"));
            })
            .catch(function(err){
                dispatch({type:"CHANGE_PASSWORD_REJECTED", notification:{message: err.response.data, type: "errorHeader"}})
            });
    }
}

// VERIFY EMAIL
export function verifyEmail(userType, token) {
    return function(dispatch) {
        axios.post("/api/verifyEmail", {userType, token})
            .then(function(response) {
                if (!response.data || response.data === "go to login" || userType == "employer") {
                    let nextLocation = "/login";
                    if (userType == "employer") {
                        const email = response.data;
                        nextLocation = "/changeTempPassword?email=" + email;
                    }

                    dispatch({type: "NOTIFICATION", notification:{message: "Account verified!", type: "infoHeader"}});
                    browserHistory.push(nextLocation);
                } else {
                    // don't show verification notification if going straight to onboarding because it's implied
                    dispatch({type: "LOGIN", payload:response.data});
                    browserHistory.push('/onboarding');
                }
            })
            .catch(function(err) {
                dispatch({type: "VERIFY_EMAIL_REJECTED", notification: {message: err.response.data, type: "errorHeader"}});
            });
    }
}

export function changePasswordForgot(user) {
    return function(dispatch) {
        axios.post("api/user/changePasswordForgot", user)
            .then(function(response) {
                const foundUser = response.data;
                axios.post("/api/userSession", {userId: foundUser._id, verificationToken: foundUser.verificationToken})
                .catch(function(err2) { console.log(err2) });

                dispatch({type:"LOGIN", payload:foundUser, notification:{message:"Password changed!", type:"infoHeader"}});
                let nextUrl = "/";
                let returnedUser = response.data;
                if (!returnedUser.hasFinishedOnboarding) {
                    nextUrl = "/onboarding";
                }
                browserHistory.push(nextUrl);
            })
            .catch(function(err) {
                dispatch({type:"CHANGE_PASS_FORGOT_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
            })
    }
}

export function changeTempPassword(user) {
    return function(dispatch) {
        axios.post("/api/changeTempPassword", user)
        .then(function(response) {
            const returnedUser = response.data;

            dispatch({type: "LOGIN", payload: returnedUser, notification: {message: "Your password was changed, you are now logged in!", type: "infoHeader"}});
            browserHistory.push('/businessHome');

            axios.post("/api/userSession", {userId: returnedUser._id, verificationToken: returnedUser.verificationToken})
            .catch(function(err) {
                // what to do if session couldn't be saved for some reason
            });
        })
        .catch(function(err) {
            dispatch({type:"CHANGE_TEMP_PASS_REJECTED", notification: {message: err.response.data, type: "errorHeader"}})
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

// Send an email when somebody completes a pathway
export function completePathway(user){
    return function(dispatch) {
        dispatch({type: "COMPLETE_PATHWAY_REQUESTED"});

        axios.post("api/user/completePathway", user)
            .then(function(response) {
                dispatch({type:"COMPLETE_PATHWAY", user: response.data.user, notification: {message:response.data.message, type:"infoHeader"}});
                browserHistory.push('/discover');
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                dispatch({type:"COMPLETE_PATHWAY_REJECTED", user: response.data.user, notification: {message: response.data.message, type: "errorHeader"}})
            })
    }
}


// Send an email when form filled out on unsubscribe page
export function unsubscribe(user, showNotification){
    return function(dispatch) {
        dispatch({type: "FOR_BUSINESS_REQUESTED"});

        axios.post("api/user/unsubscribeEmail", user)
            .then(function(response) {
                let action = { type:"FOR_BUSINESS" };
                // only show the notification if the user unsubscribed by typing
                // in their email address
                if (showNotification) {
                    action.notification = { message:response.data, type:"infoHeader" }
                }

                dispatch(action);
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

// ADD a pathway to a user
export function addPathway(user) {
    return function(dispatch) {
        axios.post("/api/user/addPathway", user)
            .then(function(response) {
                dispatch({type:"ADD_PATHWAY", payload:response.data, notification:{message:"Pathway added to My Pathways. Thanks for signing up!", type:"infoHeader"}});
                window.scrollTo(0, 0);
                browserHistory.push("/pathwayContent?pathway=" + user.pathwayUrl);
            })
            .catch(function(err) {
                console.log(err);
                dispatch({type:"ADD_PATHWAY_REJECTED", notification: {message: "You can't sign up for a pathway more than once.", type: "errorHeader"}})
                window.scrollTo(0, 0);
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

export function updateAnswer(userId, verificationToken, quizId, answer) {
    return function(dispatch) {
        axios.post("/api/updateAnswer", {
            params: { userId, verificationToken, quizId, answer }
        })
        .then(function(response) {
            dispatch({type: "UPDATE_ANSWER", currentUser: response.data});
        })
        .catch(function(error) {
            console.log("ERROR: ", error);
            console.log(error.response.data)
        });
    }
}


export function updateAllOnboarding(userId, verificationToken, interests, goals, info) {
    return function(dispatch) {
        axios.post("/api/updateAllOnboarding", {
            params: { userId, verificationToken, interests, goals, info }
        })
        .then(function(response) {
            dispatch({type: "UPDATE_USER_ONBOARDING", payload: response.data});
        })
        .catch(function(err) {
            console.log("Error updating onboarding info: ", err);
        })
    }
}


export function startOnboarding(){
    return function(dispatch) {
        dispatch({type: "START_ONBOARDING"});
    }
}

export function endOnboarding(user, markOnboardingComplete, removeRedirectField){
    return function(dispatch) {
        if (markOnboardingComplete) {
            axios.post("/api/endOnboarding", {userId: user._id, verificationToken: user.verificationToken, removeRedirectField})
            .then(function(response) {
                dispatch({type: "END_ONBOARDING", user: response.data});
            })
            .catch(function(err) {
                // onboarding setting not able to be turned off for some reason
                console.log("onboarding mark complete error: ", err);
                dispatch({type: "END_ONBOARDING_REJECTED"});
            })
        } else {
            dispatch({type: "END_ONBOARDING"});
        }

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


// POST A NEW BUSINESS
export function postBusiness(business) {
    return function(dispatch) {
        // show loading bar
        dispatch({type:"START_LOADING"});

        axios.post("/api/business", business)
        .then(function(response) {
            dispatch({type: "SUCCESS_FINISHED_LOADING", notification: {message: response.data, type: "infoHeader"}});
            // redirect to edit business page
            if (typeof business.businessName === "string") {
                const editBusinessUrl = '/admin/editBusiness?' + business.businessName;
                browserHistory.push(editBusinessUrl);
                window.scrollTo(0,0);
            }
        })
        .catch(function(err) {
            console.log("error: ", err);
            let msg = "Error creating new business. Try again later.";
            if (err && err.response && typeof err.response.data === "string") {
                msg = err.response.data;
            }
            dispatch({type: "ERROR_FINISHED_LOADING", notification: {message: msg, type: "errorHeader"}});
            window.scrollTo(0,0);
        })
    }
}


export function formError() {
    return function(dispatch) {
        dispatch({type:"FORM_ERROR", notification: {message: "Fields must all be filled in to submit form.", type: "errorHeader"}})
    }
}
