"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";

import PsychSlider from "../../../evaluation/psychSlider";

import "../../dashboard.css";
import { button } from "../../../../../classes";


class AdminView extends Component {
    constructor(props) {
        super(props);

        this.next = this.next.bind(this);
        this.intercomMsg = this.intercomMsg.bind(this);
    }

    next = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, 3);
    }

    intercomMsg = () => {
        console.log("here");
    }

    render() {
        return (
            <div className="inline-block" styleName="onboarding-info admin-view">
                <div>
                    <div className="center primary-cyan font16px">A Predictive View of Candidates</div>
                    <div>{"Job Performance and Growth Potential predictions for each candidate along with a Candidate Score and results from their evaluation. We generate Longevity/tenure and Culture Fit predictions after at least 16 of your employees have been entered."}</div>
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img
                                src={`/icons/emojis/ThumbsUp${this.props.png}`}
                            />
                            <div>Got it</div>
                        </div>
                        <div onClick={this.intercomMsg}>
                            <img
                                src={`/icons/emojis/Face${this.props.png}`}
                            />
                            <div>More info</div>
                        </div>
                    </div>
                </div>
                <div>
                    <img
                        src={`/images/ReportsPage${this.props.png}`}
                        styleName="admin-image"
                    />
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
        updateOnboardingStep
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminView);
