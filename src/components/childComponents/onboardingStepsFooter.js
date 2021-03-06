"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, postBusinessInterests } from "../../actions/usersActions";
import { withRouter } from "react-router";
import { goTo } from "../../miscFunctions";
import axios from "axios";

import "./onboardingStepsFooter.css";

const checklistInfo = [
    {
        title: "What Candidates See",
        step: 1
    },
    {
        title: "What You'll See",
        step: 2
    },
    {
        title: "What To Do",
        step: 3
    }
];

class OnboardingStepsFooter extends Component {
    constructor(props) {
        super(props);

        this.startOnboarding = this.startOnboarding.bind(this);
    }

    startOnboarding = () => {
        goTo("/dashboard");
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }
        const userId = currentUser._id;
        const verificationToken = currentUser.verificationToken;
        const businessId = currentUser.businessInfo.businessId;
        const choiceArr = [];
        let popups = currentUser.popups;
        if (popups) {
            popups.businessInterests = false;
        } else {
            popups = {};
            popups.businessInterests = false;
        }

        this.props.postBusinessInterests(userId, verificationToken, businessId, choiceArr, popups);
    };

    makeChecklist() {
        const user = this.props.currentUser;
        if (!user || !user.onboard) {
            return null;
        }
        const onboard = user.onboard;
        const popups = user.popups;
        const step = onboard && typeof onboard.step === "number" ? onboard.step : 1;
        const highestStep =
            onboard && typeof onboard.highestStep === "number" ? onboard.highestStep : 1;
        if (onboard.timeFinished) {
            return null;
        }
        let buttonText = "Continue";
        let onClick = () => goTo("/dashboard");
        if (popups && popups.businessInterests && highestStep === 1) {
            buttonText = "Start";
            onClick = () => this.startOnboarding();
        }
        // create the item list shown on the left
        const checklistItems = checklistInfo.map(info => {
            return (
                <div styleName={`checklist-item`} key={info.title}>
                    <div
                        styleName={`complete-mark ${
                            info.step < highestStep ? "complete" : "incomplete"
                        }`}
                    >
                        <div />
                    </div>
                    <div>{info.title}</div>
                    {info.step === onboard.highestStep ? (
                        <div styleName="box-cta" onClick={onClick}>
                            {buttonText} <img src={`/icons/ArrowBlue${this.props.png}`} />
                        </div>
                    ) : null}
                </div>
            );
        });

        return (
            <div styleName={"checklist-container" + (this.props.footerOnScreen ? " absolute" : "")}>
                <div styleName="checklist">{checklistItems}</div>
            </div>
        );
    }

    render() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return null;
        }

        const popups = currentUser.popups;
        // get the current path from the url
        let pathname = undefined;
        // try to get the path; lowercased because capitalization will vary
        try {
            pathname = this.props.location.pathname.toLowerCase();
        } catch (e) {
            // if the pathname is not yet defined, don't do anything, this will be executed again later
            pathname = "";
        }

        const showFooter = pathname !== "/dashboard" || (popups && popups.businessInterests);

        if (!showFooter) {
            return null;
        } else {
            return <div style={{ zIndex: "100" }}>{this.makeChecklist()}</div>;
        }
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        footerOnScreen: state.users.footerOnScreen
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            postBusinessInterests
        },
        dispatch
    );
}

OnboardingStepsFooter = withRouter(OnboardingStepsFooter);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OnboardingStepsFooter);
