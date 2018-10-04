"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep, addNotification } from "../../../../../actions/usersActions";
import { goTo } from "../../../../../miscFunctions";
import axios from 'axios';

import "../../dashboard.css";

class WhatToDo extends Component {
    constructor(props) {
        super(props);

        this.next = this.next.bind(this);
        this.intercomMsg = this.intercomMsg.bind(this);
        this.handleCustomPage = this.handleCustomPage.bind(this);
    }

    next = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, 4);
    }

    intercomMsg = () => {
        console.log("here");
    }

    handleCustomPage = () => {
        let self = this;
        // get the business' unique name
        axios.get("/api/business/uniqueName", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            goTo(`/apply/${res.data}`);
        })
        .catch(function (err) {
            self.props.addNotification(err, "error");
        });
    }

    render() {
        return (
            <div className="inline-block" styleName="onboarding-info ml-step">
                <div>
                    <div className="primary-cyan font18px">
                        {"A Custom Page Just for You"}
                    </div>
                    <div>
                        {"Why gamble on your hires? We use machine learning, predictive data, and decades of psychology research to find the candidates who can take your company to the next level."}
                    </div>
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>Got it</div>
                        </div>
                        <div onClick={this.intercomMsg}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>More info</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <img
                            src={`/images/ApplyPage${this.props.png}`}
                            styleName="apply-image"
                        />
                    </div>
                    <div>
                        <button className="button noselect round-6px background-primary-cyan primary-white learn-more-texts" styleName="onboarding-button apply-button" onClick={this.handleCustomPage} style={{padding: "3px 10px"}}>
                            <span>See my Page &#8594;</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateOnboardingStep,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(WhatToDo);
