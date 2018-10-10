"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, postBusinessInterests } from '../../actions/usersActions';
import { withRouter } from 'react-router';
import { goTo } from "../../miscFunctions";
import axios from 'axios';

import './onboardingStepsFooter.css';

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
        title: "How It Works",
        step: 3
    },
    {
        title: "What To Do",
        step: 4
    }
];

class OnboardingStepsFooter extends Component {
    constructor(props) {
        super(props);

        this.startOnboarding = this.startOnboarding.bind(this);
    }

    startOnboarding = () => {
        const userId = this.props.currentUser._id;
        const verificationToken = this.props.currentUser.verificationToken;
        const businessId = this.props.currentUser.businessInfo.businessId;
        const choiceArr = [];
        let popups = this.props.currentUser.popups;
        if (popups) {
            popups.businessInterests = false;
        } else {
            popups = {};
            popups.businessInterests = false;
        }

        this.props.postBusinessInterests(userId, verificationToken, businessId, choiceArr, popups);
        goTo("/dashboard");
    }

    makeChecklist() {
        const user = this.props.currentUser;
        if (!user || !user.onboard) { return null; }
        const onboard = user.onboard;
        const popups = user.popups;
        const step = onboard && typeof onboard.step === "number" ? onboard.step : 1;
        const highestStep = onboard && typeof onboard.highestStep === "number" ? onboard.highestStep : 1;
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
                <div
                    styleName={`checklist-item`}
                    key={info.title}
                >
                    <div styleName={`complete-mark ${info.step < highestStep ? "complete" : "incomplete"}`}><div/></div>
                    <div>{info.title}</div>
                    {info.step === onboard.highestStep ?
                        <div styleName="box-cta" onClick={onClick}>
                            {buttonText} <img src={`/icons/LineArrow${this.props.png}`} />
                        </div>
                         : null
                     }
                </div>
            );
        });

        return (
            <div styleName="checklist-container">
                <div styleName="checklist">
                    { checklistItems }
                </div>
            </div>
        );
    }

    render() {
        const popups = this.props.currentUser.popups;
        // get the current path from the url
        let pathname = undefined;
        // try to get the path; lowercased because capitalization will vary
        try { pathname = this.props.location.pathname.toLowerCase(); }
        // if the pathname is not yet defined, don't do anything, this will be executed again later
        catch (e) { pathname = ""; }

        const showFooter = pathname !== "/dashboard" || (popups && popups.businessInterests);

        return (
            <div>
                {showFooter ?
                    <div>
                        { this.makeChecklist() }
                    </div>
                    : null
                }
            </div>
        );
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
    return bindActionCreators({
        addNotification,
        postBusinessInterests
    }, dispatch);
}

OnboardingStepsFooter = withRouter(OnboardingStepsFooter);

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingStepsFooter);
