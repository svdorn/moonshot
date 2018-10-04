"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";

import CandidateView from "./candidateView";
import AdminView from "./adminView";
import WhyItWorks from "./whyItWorks";
import WhatToDo from "./whatToDo";

import "../../dashboard.css";


// the steps within onboarding
const checklistInfo = [
    {
        title: "What Candidates See",
        body: <CandidateView/>,
        step: 1
    },
    {
        title: "What You'll See",
        body: <AdminView/>,
        step: 2
    },
    {
        title: "Why It Works",
        body: <WhyItWorks/>,
        step: 3
    },
    {
        title: "What To Do",
        body: <WhatToDo/>,
        step: 4
    }
];


class Onboarding extends Component {
    constructor(props) {
        super(props);

        this.state = { };
    }

    handleChecklistItemClick(step) {
        const onboard = this.props.currentUser.onboard;
        if (onboard &&
            typeof onboard.step === "number" &&
            typeof onboard.highestStep === "number" &&
            step <= onboard.highestStep
        ) {
            const { _id, verificationToken } = this.props.currentUser;
            this.props.updateOnboardingStep(_id, verificationToken, step)
        }
    }

    render() {
        const user = this.props.currentUser;
        const onboard = user.onboard;
        const step = onboard && typeof onboard.step === "number" ? onboard.step : 1;
        const highestStep = onboard && typeof onboard.highestStep === "number" ? onboard.highestStep : 1;

        // create the item list shown on the left
        const checklistItems = checklistInfo.map(info => {
            return (
                <div
                    styleName={`checklist-item ${info.step === step ? "selected" : ""}`}
                    key={info.title}
                    onClick={this.handleChecklistItemClick.bind(this, info.step)}
                    className={info.step <= highestStep ? "pointer" : ""}
                >
                    <div styleName={`complete-mark ${info.step < highestStep ? "complete" : "incomplete"}`}><div/></div>
                    <div>{info.title}</div>
                </div>
            );
        });

        // get the content that goes on the right side (the actual info)
        let content = <div>Invalid step</div>;
        if (step >= 1 && step <= 4) { // make sure idx is valid
            content = checklistInfo[Math.round(step) - 1].body;
        } else {
            // show the first step if given step is invalid
            content = checklistInfo[0].body;
        }

        return (
            <div styleName="dashboard-item" style={{display: "flex"}}>
                <div styleName="checklist-container">
                    <div styleName="checklist">
                        { checklistItems }
                    </div>
                </div>
                <div styleName="onboarding-content">
                    { content }
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateOnboardingStep
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
