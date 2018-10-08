"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, updateUser } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import { button } from "../../classes";
import axios from "axios";

import "./adminVerifyEmail.css";


class AdminVerifyEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    reSend() {
        const { currentUser } = this.props;

        // standard error checking
        if (!currentUser) { return this.props.addNotification("Not logged in!", "error"); }

        const credentials = {
            userId: currentUser._id,
            verificationToken: currentUser.verificationToken
        }

        // re-send the verification email
        const self = this;
        axios.post("/api/user/reSendVerificationEmail", credentials)
        .then(response => {
            if (response.data.alreadyVerified) {
                if (response.data.user) { self.props.updateUser(response.data.user); }
                self.props.addNotification("Email already verified, your evaluations are now active!", "info");
            }
            else if (response.data.emailSent) {
                const usedEmail = response.data.email ? response.data.email : email;
                self.props.addNotification(`Email sent to ${usedEmail} - if this is the wrong email, change it in Settings.`, "info");
            }
        })
        .catch(error => {
            self.props.addNotification("Error sending verification email, try refreshing the page.", "error");
            console.log(error);
        })
    }


    checkStatus() {
        const { currentUser } = this.props;

        // standard error checking
        if (!currentUser) { return this.props.addNotification("Not logged in!", "error"); }

        const credentials = {
            params: {
                userId: currentUser._id,
                verificationToken: currentUser.verificationToken
            }
        }

        const self = this;
        axios.get("/api/user/checkEmailVerified", credentials)
        .then(response => {
            if (response.data.user) { this.props.updateUser(response.data.user); }
            self.props.addNotification("Awesome, your evaluations are now active!");
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                return self.props.addNotification("Looks like you aren't verified yet, try sending yourself a new email!", "error");
            } else {
                return self.props.addNotification("Whoops, there was an error. Try refreshing!", "error");
            }
        })
    }


    render() {
        const { currentUser } = this.props;
        // if the current user is an unverified admin, show them this message
        if (currentUser && currentUser.userType === "accountAdmin" && !currentUser.verified) {
            return (
                <div styleName="banner">
                    <div className="inline-block">Verify your email to activate your evaluations!</div>
                    <div className={button.purpleBlue} onClick={this.reSend.bind(this)}>
                        Re-send Verification Email
                    </div>
                    <div className={button.purpleBlue} onClick={this.checkStatus.bind(this)}>
                        I Already Did!
                    </div>
                </div>
            );
        }
        // otherwise don't return anything
        else { return null; }
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        updateUser
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminVerifyEmail);
