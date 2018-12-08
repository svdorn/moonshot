"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router";
import {
    updateOnboardingStep,
    addNotification,
    generalAction,
    updateUser,
    intercomEvent
} from "../../../../../actions/usersActions";
import clipboard from "clipboard-polyfill";
import { goTo, makePossessive, propertyExists, updateStore } from "../../../../../miscFunctions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { TextField, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarGroup } from "material-ui";
import { primaryCyan } from "../../../../../colors";
import axios from "axios";
import { ShiftArrow, Button } from "../../../../miscComponents/ShiftArrow";

import "../../dashboard.css";

const required = value => (value ? undefined : "This field is required.");

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
    <TextField
        hintText={label}
        hintStyle={{ color: "white" }}
        inputStyle={{ color: "#72d6f5" }}
        underlineStyle={{ color: "#72d6f5" }}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

class WhatToDo extends Component {
    constructor(props) {
        super(props);

        this.next = this.next.bind(this);
        this.intercomMsg = this.intercomMsg.bind(this);
        this.handleCustomPage = this.handleCustomPage.bind(this);
        this.copyLink = this.copyLink.bind(this);
    }

    next = () => {
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        const { _id, verificationToken, verified } = currentUser;

        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, -1);
        this.props.addNotification(
            "Free until you make your first hire or evaluate 20 candidates, whichever comes first.",
            "info"
        );
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
        this.props.intercomEvent("onboarding-step-4", _id, verificationToken, null);
    };

    copyLink = () => {
        const { currentUser } = this.props;
        if (propertyExists(currentUser, ["businessInfo", "uniqueName"], "string")) {
            let URL = "https://moonshotinsights.io/apply/" + currentUser.businessInfo.uniqueName;
            URL = encodeURI(URL);
            clipboard.writeText(URL);
            this.props.addNotification("Link copied to clipboard", "info");
        } else {
            this.props.addNotification("Error copying link, try refreshing", "error");
        }
    };

    handleCustomPage = () => {
        const { currentUser } = this.props;
        if (propertyExists(currentUser, ["businessInfo", "uniqueName"], "string")) {
            goTo(`/apply/${currentUser.businessInfo.uniqueName}`);
        } else {
            this.props.addNotification(
                "Error getting to your custom page, try refreshing.",
                "error"
            );
        }
    };

    highlight(event) {
        try {
            event.target.select();
        } catch (e) {
            /* not a big deal if can't highlight the link */
        }
    }

    copyLinkView() {
        const { currentUser } = this.props;
        let possessiveBusinessName = "Your";
        let uniqueName = "";
        if (currentUser && typeof currentUser.businessInfo === "object") {
            const { businessInfo } = currentUser;
            uniqueName = businessInfo.uniqueName;
            if (businessInfo.businessName.length < 8) {
                possessiveBusinessName = makePossessive(businessInfo.businessName);
            }
        }

        const showMoreInfoButton =
            !currentUser ||
            !currentUser.triggeredIntercomEvents ||
            !currentUser.triggeredIntercomEvents.includes("onboarding-step-4");

        return (
            <div styleName="full-step-container">
                <div styleName="copy-link-view">
                    <div styleName="onboarding-title title-margin">
                        A Candidate Invite Page Just For You
                    </div>
                    <div>
                        <span styleName="desktop-only">
                            {`${possessiveBusinessName} invite link is
                        designed to be embedded in your automated emails or other
                        messages to candidates. We see the best results when
                        companies invite all applicants to complete an evaluation,
                        as their highest performers are often screened out based on
                        non-predictive data in resumes. Copy and embed your link in
                        emails you already send to new applicants. Here's an `}
                        </span>
                        <span styleName="mobile-only">
                            {`Your invite link is
                            designed to be embedded in your automated emails or other
                            messages to candidates. Best results are seen when
                            companies invite all applicants to complete an evaluation,
                            as high performers are often screened out based on
                            non-predictive data in resumes. Copy and embed your link in
                            emails you send to new applicants. Here's an `}
                        </span>
                        <span
                            onClick={() => this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL")}
                            className="primary-cyan clickable"
                        >
                            {"email template"}
                        </span>
                        {" you can use."}
                    </div>
                    <div styleName="link-area">
                        <input
                            id="unique-link"
                            readOnly={true}
                            onClick={this.highlight}
                            value={`https://moonshotinsights.io/apply/${uniqueName}`}
                        />
                        <Button onClick={this.copyLink}>Copy Link</Button>
                        <br styleName="small-mobile-only" />
                        <div
                            className="pointer transition-all"
                            styleName="link-to-custom-page"
                            onClick={this.handleCustomPage}
                        >
                            See Your Page
                            <div className="inline-block" style={{ width: "2px" }} />
                            <ShiftArrow style={{ marginLeft: "5px" }} />
                        </div>
                    </div>
                    {!this.props.loading ? (
                        <div styleName="emoji-buttons">
                            <div onClick={this.next}>
                                <img src={`/icons/emojis/PartyPopper${this.props.png}`} />
                                <div style={{ paddingTop: "5px" }}>All set!</div>
                            </div>
                            {showMoreInfoButton ? (
                                <div onClick={this.intercomMsg}>
                                    <img src={`/icons/emojis/Face${this.props.png}`} />
                                    <div style={{ paddingTop: "5px" }}>More info</div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div styleName="circular-progress">
                            <CircularProgress style={{ color: primaryCyan }} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    render() {
        return <div style={{ height: "100%" }}>{this.copyLinkView()}</div>;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        loading: state.users.loadingSomething,
        onboardingPositions: state.users.onboardingPositions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            updateOnboardingStep,
            addNotification,
            generalAction,
            updateUser,
            intercomEvent,
            updateStore
        },
        dispatch
    );
}

WhatToDo = withRouter(WhatToDo);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WhatToDo);
