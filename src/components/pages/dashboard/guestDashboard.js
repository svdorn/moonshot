"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
import { generalAction } from "../../../actions/usersActions";
import {} from "../../../miscFunctions";
import MetaTags from "react-meta-tags";
import DashboardItem from "./dashboardItem";
import ROIOnboardingDialog from "../../childComponents/roiOnboardingDialog";
import OnboardingStep4Dialog from "../../childComponents/onboardingStep4Dialog";

import WelcomeMessage from "./dashboardItems/welcomeMessage";

import "./dashboard.css";

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // show the banner with introduction to the dashboard
            showWelcomeBanner: true,
            // show the 6 jobs to be done initially
            showJobs: true
        };
    }

    render() {
        const user = this.props.currentUser;

        const activity = <DashboardItem type="Onboarding" width={3} />;
        // if the user has the popups at onboarding
        if (user && user.popups && user.popups.businessInterests) {
            activity = <DashboardItem type="BuildTeam" width={3} />;
        }

        let blurredClass = "";
        if (this.props.roiModal || this.props.onboardingModel) {
            blurredClass = "dialogForBizOverlay";
        }

        return (
            <div className={"center full-height " + blurredClass}>
                <MetaTags>
                    <title>Dashboard | Moonshot</title>
                    <meta
                        name="description"
                        content="Your home base for checking in on your candidates, employees, evaluations, and more."
                    />
                </MetaTags>
                <InviteCandidatesModal />
                <AddPositionDialog />
                <AddUserDialog />
                <ROIOnboardingDialog />
                <OnboardingStep4Dialog />
                <div className="page-line-header">
                    <div />
                    <div>Dashboard</div>
                </div>
                <WelcomeMessage />
                <div styleName="dashboard">
                    {activity}
                    <DashboardItem type="Candidates" width={1} />
                    <DashboardItem type="Evaluations" width={1} />
                    <DashboardItem type="Employees" width={1} />
                    <DashboardItem type="Account" width={1} />
                    <DashboardItem type="Billing" width={1} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        roiModal: state.users.roiOnboardingOpen,
        onboardingModel: state.users.onboardingStep4Open
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            generalAction
        },
        dispatch
    );
}

Dashboard = withRouter(Dashboard);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dashboard);
