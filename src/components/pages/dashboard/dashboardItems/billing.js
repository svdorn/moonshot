"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction, getBillingInfo } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";

import "../dashboard.css";

class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            billing: undefined,
            currentPlan: undefined,
            html: undefined,
            CTA: undefined
        };
    }

    // load graph data for the candidate completions over last week
    componentDidMount() {
        const self = this;
        const { currentUser, billing, fullAccess, getBillingInfo } = this.props;

        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        // if already have billng
        if (billing) {
            return this.getState(billing);
        }

        const businessId =
            currentUser && currentUser.businessInfo ? currentUser.businessInfo.businessId : null;

        getBillingInfo(currentUser._id, currentUser.verificationToken, businessId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.billing != this.state.billing) {
            this.getState(nextProps.billing);
        }
    }

    freeContent() {
        return (
            <div>
                {
                    "It's free until you make your first hire or evaluate 20 candidates, whichever comes first."
                }
            </div>
        );
    }

    freePlanEnded() {
        return (
            <div>
                Your free plan has ended but everything has been saved for you.{" "}
                <span className="primary-cyan clickable" onClick={() => goTo("/billing")}>
                    Select a plan
                </span>{" "}
                to continue using your account.
            </div>
        );
    }

    currentPlanEnded() {
        return (
            <div>
                Your current plan has ended but everything has been saved for you.{" "}
                <span className="primary-cyan clickable" onClick={() => goTo("/billing")}>
                    Select a new plan
                </span>{" "}
                to continue using your account.
            </div>
        );
    }

    currentPlanEnding(date) {
        return (
            <div>
                Your current plan is ending {new Date(date).toDateString()}.{" "}
                <span className="primary-cyan clickable" onClick={() => goTo("/billing")}>
                    Select a new plan
                </span>{" "}
                to continue using your account.
            </div>
        );
    }

    customPlan() {
        return (
            <div>
                {
                    "You have a custom plan with Moonshot Insights, for more information or to change your plan, please message us and we are happy to help out."
                }
            </div>
        );
    }

    unlimited() {
        return (
            <div>
                {
                    "Invite unlimited candidates, create evaluations for all your open positions and evaluate employees to customize and improve your candidate predictions."
                }
            </div>
        );
    }

    getState = billing => {
        const { fullAccess } = this.props;

        let currentPlan = "";
        let html = null;
        let CTA = "See Plans";
        if (billing && billing.customPlan) {
            currentPlan = "Custom";
            html = this.customPlan();
        } else if (!billing || !billing.subscription) {
            if (!billing || fullAccess) {
                // on free plan
                currentPlan = "Free";
                html = this.freeContent();
                CTA = "See Pricing";
            } else {
                currentPlan = "Select One";
                if (billing.oldSubscriptions && billing.oldSubscriptions.length > 0) {
                    // cancelled and old subscription is over
                    html = this.currentPlanEnded();
                } else {
                    // never added a subscription after free trial
                    html = this.freePlanEnded();
                }
            }
        } else {
            if (billing.subscription.toCancel && !billing.newSubscription) {
                // subscription still active but set to cancel
                currentPlan = "Select One";
                html = this.currentPlanEnding(billing.subscription.dateEnding);
            } else {
                currentPlan = "Unlimited";
                html = this.unlimited();
            }
        }

        return this.setState({ billing, currentPlan, html, CTA });
    };

    render() {
        const { billing } = this.props;
        const { currentPlan, html, CTA } = this.state;

        // return progress bar if not ready yet
        if (!billing) {
            return (
                <div className="fully-center">
                    <CircularProgress style={{ color: primaryCyan }} />
                </div>
            );
        }

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">
                    Plan:{" "}
                    <span
                        className="primary-cyan clickableNoUnderline"
                        onClick={() => goTo("/billing")}
                    >
                        {currentPlan}
                    </span>
                </div>
            </div>
        );

        const content = <div style={{ padding: "20px 14px" }}>{html}</div>;

        const smallCTA = (
            <div styleName="box-cta" onClick={() => goTo("/billing")}>
                {CTA} <img src={`/icons/LineArrow${this.props.png}`} />
            </div>
        );

        return (
            <div>
                {header}
                {content}
                {smallCTA}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        billing: state.users.billing,
        fullAccess: state.users.fullAccess,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            generalAction,
            getBillingInfo
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Billing);
