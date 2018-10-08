"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import { button } from "../../classes";

import "./adminVerifyEmail.css";


class AdminVerifyEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    reSend() {
        console.log("resending verification email");
    }


    checkStatus() {
        console.log("checking status");
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

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminVerifyEmail);
