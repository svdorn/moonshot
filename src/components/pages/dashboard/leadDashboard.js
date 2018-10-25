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
import ModalSignup from "./dashboardItems/onboarding/childComponents/modalSignup";
import IntroductionModal from "./dashboardItems/onboarding/childComponents/modalSignup";

import WelcomeMessage from "./dashboardItems/welcomeMessage";

import "./dashboard.css";

const videoSizes = {
    huge: { height: 732, width: 1280 },
    under1500: { height: 549, width: 960 },
    under1100: { height: 366, width: 640 },
    under750: { height: 275, width: 480 },
    under600: { height: 183, width: 320 },
    under420: { height: 117, width: 204 }
};

class GuestDashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // show the banner with introduction to the dashboard
            showWelcomeBanner: true,
            // if the tutorial video should be open on page load
            showTutorialVideo:
                props.location && props.location.query && props.location.query.tutorialVideo,
            // what the size of the video should be
            videoSize: "huge"
        };

        this.bound_handleResize = this.handleResize.bind(this);
    }

    // if the props want us to show the intro video, show it and set a listener
    // to resize the video if necessary
    componentDidMount() {
        if (this.state.showTutorialVideo) {
            this.bound_handleResize();
            this.props.updateStore("blurMenu", true);
            window.addEventListener("resize", this.bound_handleResize);
        }
    }

    // make sure the video listener is removed when no longer needed
    componentWillUnmount() {
        window.removeEventListener("resize", this.bound_handleResize);
    }

    // close the video, unblur the screen, and remove the event listener on video close
    closeTutorialVideo = () => {
        this.setState({ showTutorialVideo: false });
        this.props.updateStore("blurMenu", false);
        window.removeEventListener("resize", this.bound_handleResize);
    };

    // when the screen is resized, check if the video needs to be resized as well
    handleResize() {
        const windowWidth = window.innerWidth;
        let videoSize = "huge";
        if (windowWidth <= 420) {
            videoSize = "under420";
        } else if (windowWidth <= 600) {
            videoSize = "under600";
        } else if (windowWidth <= 750) {
            videoSize = "under750";
        } else if (windowWidth <= 1100) {
            videoSize = "under1100";
        } else if (windowWidth <= 1500) {
            videoSize = "under1500";
        }
        if (this.state.videoSize !== videoSize) {
            this.setState({ videoSize });
        }
    }

    render() {
        let activity = null;
        // if the lead has not said which jobs they want to do with the site
        if (this.props.selectedJobsToBeDone === undefined) {
            activity = <DashboardItem type="BuildTeam" width={3} />;
        } else {
            activity = <DashboardItem type="InvitePage" width={3} />;
        }

        let blurredClass = "";
        if (this.props.roiModal || this.props.onboardingModel || this.state.showTutorialVideo) {
            blurredClass = "dialogForBizOverlay";
        }

        const { videoSize } = this.state;
        const { height, width } = videoSizes[videoSize];
        const videoOpts = {
            height,
            width,
            playerVars: {
                // autoplay the video when it appears
                autoplay: 1,
                // don't show YouTube branding
                modestbranding: 1,
                // only show related videos from the Moonshot channel
                rel: 0
            }
        };

        const tutorialVideo = (
            <Dialog
                open={!!this.state.showTutorialVideo}
                maxWidth={false}
                onClose={this.closeTutorialVideo}
            >
                <div style={{ backgroundColor: "black" }}>
                    <YouTube
                        videoId="K_QHU89CY0s"
                        opts={videoOpts}
                        onEnd={this.closeTutorialVideo}
                    />
                    <div styleName="remove-youtube-space" />
                </div>
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
                <ModalSignup />
                <IntroductionModal />
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
