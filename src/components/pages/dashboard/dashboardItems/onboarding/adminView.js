"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep, intercomEvent } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";

import PsychSlider from "../../../evaluation/psychSlider";

import "../../dashboard.css";
import { button } from "../../../../../classes";


class AdminView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // whether we're on admin or ml view
            step: "admin"
        };
    }

    next = () => {
        if (this.props.currentUser) {
            var { _id, verificationToken } = this.props.currentUser;
        } else {
            var _id = undefined;
            var verificationToken = undefined;
        }

        // if currently seeing the psych info, show the gca info
        if (this.state.step === "admin") {
            this.setState({ step: "ml" });
        } else {
            // go to the next onboarding step
            this.props.updateOnboardingStep(_id, verificationToken, 3);
        }
    }

    intercomMsg = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // trigger intercom event
        this.props.intercomEvent('onboarding-step-2', _id, verificationToken, null);
    }

    intercomMsgPart3 = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // trigger intercom event
        this.props.intercomEvent('onboarding-step-3', _id, verificationToken, null);
    }

    makeAdminView() {
        return (
            <div className="inline-block" styleName="onboarding-info admin-view">
                <div>
                    <div className="primary-cyan" styleName="small-title mobile-center title-margin">
                        A Predictive View of Candidates
                    </div>
                    <div styleName="desktop-only">{"Job Performance and Growth Potential predictions for each candidate along with a Candidate Score and results from their evaluation. We generate Longevity/tenure and Culture Fit predictions after at least 16 of your employees have been evaluated."}</div>
                    <div styleName="mobile-only">{"Job Performance and Growth Potential predictions for each candidate along with a Candidate Score and evaluation results. We generate Longevity and Culture Fit predictions after 16+ employees have been evaluated."}</div>
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

    makeMLView() {
        return (
            <div className="inline-block" styleName="onboarding-info ml-step">
                <div>
                    <div className="primary-cyan font16px" styleName="mobile-center title-margin">
                        {"We Are Your Data Scientists"}
                    </div>
                    <div styleName="why-it-works-desc">
                        Education and experience provide 1% and 1.1% predictive
                        ability compared to your evaluations with us, which
                        provide more than 50%. We then layer on machine learning
                        to<span styleName="desktop-only"> improve your predictive model and
                        </span> identify insights on your company to drive
                        hyperintelligent hiring.
                    </div>
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img
                                src={`/icons/emojis/Sunglass${this.props.png}`}
                            />
                            <div>Got it!</div>
                        </div>
                        <div onClick={this.intercomMsgPart3}>
                            <img
                                src={`/icons/emojis/Face${this.props.png}`}
                            />
                            <div>More info</div>
                        </div>
                    </div>
                </div>
                <div>
                    <img
                        src={`/icons/Astrobot${this.props.png}`}
                        styleName="astrobot-image"
                    />
                </div>
            </div>
        );
    }

    render() {
        switch (this.state.step) {
            case "admin":
                return this.makeAdminView();
            case "ml":
                return this.makeMLView();
            default:
                return <div>Here</div>;
        }
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateOnboardingStep,
        intercomEvent
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminView);
