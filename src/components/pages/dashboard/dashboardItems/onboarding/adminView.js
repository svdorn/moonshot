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

        this.state = {
        };
    }

    next = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, 3);
    }


    render() {
        return (
            <div className="inline-block" styleName="onboarding-info admin-view">
                <div>
                    <div>{"Once a candidate finishes your evaluation, we'll make a report with our predictions, including an overall score and a breakdown of their results. You can see all of these in the 'Candidates' tab."}</div>
                    <div
                        className={button.cyan}
                        styleName="got-it-button"
                        onClick={this.next.bind(this)}
                    >
                        Got It
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
