"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
import { generalAction, updateStore } from "../../../actions/usersActions";
import {} from "../../../miscFunctions";
import MetaTags from "react-meta-tags";
import YouTube from "react-youtube";
import Dialog from "@material-ui/core/Dialog";
import DashboardItem from "./dashboardItem";
import ROIOnboardingDialog from "../../childComponents/roiOnboardingDialog";
import OnboardingStep4Dialog from "../../childComponents/onboardingStep4Dialog";
import ModalSignup from "./dashboardItems/onboarding/childComponents/modalSignup";

import WelcomeMessage from "./dashboardItems/welcomeMessage";

import "./dashboard.css";

class GuestDashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // show the banner with introduction to the dashboard
            showWelcomeBanner: true,
            // if the tutorial video should be open on page load
            showTutorialVideo:
                props.location && props.location.query && props.location.query.tutorialVideo
        };
    }

    componentDidMount() {
        if (this.state.showTutorialVideo) {
            this.props.updateStore("blurMenu", true);
        }
    }

    closeTutorialVideo = () => {
        this.setState({ showTutorialVideo: false });
        this.props.updateStore("blurMenu", false);
    };

    render() {
        let activity = null;
        // if the lead has not said which jobs they want to do with the site
        if (this.props.selectedJobsToBeDone === undefined) {
            activity = <DashboardItem type="BuildTeam" width={3} />;
        } else {
            activity = <DashboardItem type="Onboarding" width={3} />;
        }

        let blurredClass = "";
        if (this.props.roiModal || this.props.onboardingModel || this.state.showTutorialVideo) {
            blurredClass = "dialogForBizOverlay";
        }

        const videoOpts = {
            height: "366",
            width: "640",
            playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0
            }
        };

        const tutorialVideo = (
            <Dialog
                open={!!this.state.showTutorialVideo}
                maxWidth={false}
                onClose={this.closeTutorialVideo}
            >
                <YouTube videoId="K_QHU89CY0s" opts={videoOpts} onEnd={this.closeTutorialVideo} />
                <div styleName="remove-youtube-space" />
            </Dialog>
        );

        return (
            <div
                className={
                    "center full-height " +
                    blurredClass +
                    (this.props.blurLeadDashboard ? " blur" : "")
                }
            >
                <MetaTags>
                    <title>Dashboard | Moonshot</title>
                    <meta
                        name="description"
                        content="Your home base for checking in on your candidates, employees, evaluations, and more."
                    />
                </MetaTags>
                {tutorialVideo}
                <ROIOnboardingDialog />
                <OnboardingStep4Dialog />
                <ModalSignup />
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
                    {/*<DashboardItem type="Billing" width={1} />*/}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        roiModal: state.users.roiOnboardingOpen,
        onboardingModel: state.users.onboardingStep4Open,
        selectedJobsToBeDone: state.users.selectedJobsToBeDone,
        onboardingPositions: state.users.onboardingPositions,
        blurLeadDashboard: state.users.blurLeadDashboard
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ generalAction, updateStore }, dispatch);
}

GuestDashboard = withRouter(GuestDashboard);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GuestDashboard);
