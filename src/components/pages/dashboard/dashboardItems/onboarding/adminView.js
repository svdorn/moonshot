"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    updateOnboardingStep,
    intercomEvent,
    addNotification
} from "../../../../../actions/usersActions";
import {} from "../../../../../miscFunctions";

import PsychSlider from "../../../evaluation/psychSlider";
import HoverTip from "../../../../miscComponents/hoverTip";

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
    };

    intercomMsg = () => {
        const { currentUser } = this.props;
        if (currentUser) {
            var { _id, verificationToken } = currentUser;
        } else {
            var _id = undefined;
            var verificationToken = undefined;
        }
        // trigger intercom event
        this.props.intercomEvent("onboarding-step-2", _id, verificationToken, null);
    };

    intercomMsgPart3 = () => {
        const { currentUser } = this.props;
        if (currentUser) {
            var { _id, verificationToken } = currentUser;
        } else {
            var _id = undefined;
            var verificationToken = undefined;
        }
        // trigger intercom event
        this.props.intercomEvent("onboarding-step-3", _id, verificationToken, null);
    };

    makeAdminView() {
        const user = this.props.currentUser;
        const showMoreInfoButton =
            !user ||
            !user.triggeredIntercomEvents ||
            !user.triggeredIntercomEvents.includes("onboarding-step-2");

        return (
            <div className="inline-block" styleName="onboarding-info admin-view">
                <div>
                    <div styleName="predictive-view-info">
                        <div
                            className="primary-cyan"
                            styleName="small-title mobile-center title-margin"
                        >
                            A Predictive View of Candidates
                        </div>
                        <div>
                            <div style={{ marginBottom: "10px" }}>
                                We predict the job performance, growth potential,{" "}
                                <span>culture fit, and longevity</span> of each candidate.
                            </div>
                            <div>
                                You can also see an overall Candidate Score and a breakdown of each
                                candidate’s results.
                            </div>
                        </div>
                    </div>
                    <HoverTip
                        style={{ width: "216px", marginLeft: "12px" }}
                        text="Culture fit and longevity predictions are enabled after at least 16 of your employees have been evaluated because these predictions are company-specific."
                    />
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img src={`/icons/emojis/ThumbsUp${this.props.png}`} />
                            <div>Got it!</div>
                        </div>
                        {showMoreInfoButton ? (
                            <div onClick={this.intercomMsg}>
                                <img src={`/icons/emojis/Face${this.props.png}`} />
                                <div>More info</div>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div>
                    <img src={`/images/ReportsPage${this.props.png}`} styleName="admin-image" />
                </div>
            </div>
        );
    }

    makeMLView() {
        const user = this.props.currentUser;
        const showMoreInfoButton =
            !user ||
            !user.triggeredIntercomEvents ||
            !user.triggeredIntercomEvents.includes("onboarding-step-3");

        return (
            <div className="inline-block" styleName="onboarding-info ml-step">
                <div>
                    <div className="primary-cyan font16px" styleName="mobile-center title-margin">
                        {"We Are Your Data Scientists"}
                    </div>
                    <div styleName="why-it-works-desc">
                        Education and experience are 1% and 1.1% predictive of job performance,
                        whereas your evaluations with us are more than 50% predictive. We layer on
                        machine learning to identify insights on your company to drive
                        hyperintelligent hiring.
                    </div>
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img src={`/icons/emojis/Sunglass${this.props.png}`} />
                            <div>Got it!</div>
                        </div>
                        {showMoreInfoButton ? (
                            <div onClick={this.intercomMsgPart3}>
                                <img src={`/icons/emojis/Face${this.props.png}`} />
                                <div>More info</div>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div>
                    <img src={`/icons/Astrobot${this.props.png}`} styleName="astrobot-image" />
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
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            updateOnboardingStep,
            intercomEvent,
            addNotification
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AdminView);
