"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { getBillingInfo } from "../../actions/usersActions";
import { goTo } from "../../miscFunctions";
import { withRouter } from "react-router";

import "./billingBanners.css";

class BillingBanners extends Component {
    constructor(props) {
        super(props);

        this.state = {
            billing: undefined,
            html: undefined,
            candidateCount: undefined
        };
    }

    // load graph data for the candidate completions over last week
    componentDidMount() {
        const self = this;
        const { currentUser, billing, fullAccess, getBillingInfo } = this.props;

        if (!currentUser || currentUser.userType !== "accountAdmin" || !currentUser.businessInfo)
            return;
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

    noPlanSelected() {
        return (
            <div className="secondary-gray">
                Your free plan is nearing its end.{" "}
                <span className="primary-cyan clickable" onClick={() => goTo("/billing")}>
                    Select a plan
                </span>{" "}
                to continue.
            </div>
        );
    }

    currentPlanEnding(date) {
        return (
            <div className="secondary-gray">
                Your plan is ending {new Date(date).toDateString()}.{" "}
                <span className="primary-cyan clickable" onClick={() => goTo("/billing")}>
                    Select a new plan
                </span>{" "}
                to continue using your account.
            </div>
        );
    }

    getState = billing => {
        const { currentUser, fullAccess } = this.props;

        // if there isn't a current user, don't update anything - nothing will be shown anyway
        if (!currentUser) {
            return;
        }

        let { candidateCount } = this.state;

        let html = null;

        if (!billing || !billing.subscription) {
            if (!billing || fullAccess) {
                // on free plan, if 13-19 candidates
                if (typeof candidateCount !== "number") {
                    const query = {
                        params: {
                            userId: currentUser._id,
                            verificationToken: currentUser.verificationToken,
                            businessId: currentUser.businessInfo.businessId
                        }
                    };
                    axios
                        .get("/api/business/candidateCount", query)
                        .then(response => {
                            candidateCount = response.data;
                            if (candidateCount > 12 && candidateCount < 20) {
                                html = this.noPlanSelected();
                            }

                            return this.setState({ billing, html, candidateCount });
                        })
                        .catch(error => {
                            console.log("error getting billing banner");
                        });
                } else {
                    if (candidateCount > 12 && candidateCount < 20) {
                        html = this.noPlanSelected();
                    }

                    return this.setState({ billing, html, candidateCount });
                }
            } else {
                return this.setState({ billing, html, candidateCount });
            }
        } else if (billing.subscription.toCancel && !billing.newSubscription) {
            // subscription still active but set to cancel
            html = this.currentPlanEnding(billing.subscription.dateEnding);
            return this.setState({ billing, html, candidateCount });
        } else {
            return this.setState({ billing, html, candidateCount });
        }
    };

    render() {
        const { html } = this.state;

        if (!html) return null;

        const { currentUser } = this.props;
        if (!currentUser || currentUser.userType !== "accountAdmin" || !currentUser.businessInfo)
            return null;

        const { location } = this.props;

        if (location.pathname === "/billing") return null;

        return (
            <div>
                <div styleName="banner">{html}</div>
                <div styleName="banner-space" />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        billing: state.users.billing,
        fullAccess: state.users.fullAccess
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            getBillingInfo
        },
        dispatch
    );
}

BillingBanners = withRouter(BillingBanners);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BillingBanners);
