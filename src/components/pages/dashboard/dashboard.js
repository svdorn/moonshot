"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
import { generalAction, updatePositionCount, addNotification } from "../../../actions/usersActions";
import {} from "../../../miscFunctions";
import MetaTags from "react-meta-tags";
import DashboardItem from "./dashboardItem";
import InviteCandidatesModal from "./inviteCandidatesModal";
import AddPositionDialog from "../../childComponents/addPositionDialog";
import AddUserDialog from "../../childComponents/addUserDialog";
import VerificationModal from "./dashboardItems/onboarding/childComponents/verificationModal";
import axios from "axios";

import "./dashboard.css";

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const { currentUser, positionCount, location } = this.props;
        if (!currentUser) {
            return;
        }

        if (location && location.query && location.query.inviteCandidates === "open") {
            this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
        }
        let self = this;
        if (!positionCount || positionCount < 1) {
            // get all the positions they're evaluating for
            axios
                .get("/api/business/positions", {
                    params: {
                        userId: currentUser._id,
                        verificationToken: currentUser.verificationToken
                    }
                })
                .then(res => {
                    const positions = res.data.positions;
                    if (positions && Array.isArray(positions) && positions.length > 0) {
                        this.props.updatePositionCount(positions.length);
                    } else {
                        this.props.updatePositionCount(0);
                    }
                })
                .catch(err => {
                    console.log("error getting positions: ", err);
                    if (err.response && err.response.data) {
                        console.log(err.response.data);
                    }
                });
        }
    }

    componentDidUpdate() {
        const { positionCount, currentUser } = this.props;
        if (!positionCount || positionCount < 1) {
            if (!currentUser) {
                return;
            }

            // get all the positions they're evaluating for
            axios
                .get("/api/business/positions", {
                    params: {
                        userId: currentUser._id,
                        verificationToken: currentUser.verificationToken
                    }
                })
                .then(res => {
                    const positions = res.data.positions;
                    if (positions && Array.isArray(positions) && positions.length > 0) {
                        this.props.updatePositionCount(positions.length);
                    } else {
                        this.props.updatePositionCount(0);
                    }
                })
                .catch(err => {
                    console.log("error getting positions: ", err);
                    if (err.response && err.response.data) {
                        console.log(err.response.data);
                    }
                });
        }
    }

    render() {
        const user = this.props.currentUser;
        const positionCount = this.props.positionCount;

        if (!user) {
            return null;
        }

        let activity = <DashboardItem type="Activity" width={3} />;
        if (user && user.popups && user.popups.dashboard) {
            activity = <DashboardItem type="WelcomePage" width={3} widthMobile={2} />;
        } else if (user && user.popups && user.popups.businessInterests) {
            activity = <DashboardItem type="BuildTeam" width={3} />;
        } else if (user && (!positionCount || positionCount < 1)) {
            activity = <DashboardItem type="AddPositionPage" width={3} widthMobile={2} />;
        } else if (
            user &&
            user.onboard &&
            !user.onboard.timeFinished &&
            typeof user.onboard.step === "number"
        ) {
            activity = <DashboardItem type="Onboarding" width={3} />;
        }

        // old acc admins won't have onboard object, so if they don't just say the finished
        const finishedOnboarding =
            !user.onboard || typeof user.onboard.step !== "number" || user.onboard.timeFinished;

        return (
            <div className="center full-height ">
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
                <VerificationModal />
                <div className="page-line-header">
                    <div />
                    <div>Dashboard</div>
                </div>
                <div styleName="dashboard">
                    {activity}
                    <DashboardItem type="Candidates" width={1} blurred={!finishedOnboarding} />
                    <DashboardItem type="Evaluations" width={1} blurred={!finishedOnboarding} />
                    <DashboardItem type="Employees" width={1} blurred={!finishedOnboarding} />
                    <DashboardItem type="Account" width={1} blurred={!finishedOnboarding} />
                    <DashboardItem type="Billing" width={1} blurred={!finishedOnboarding} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        positionCount: state.users.positionCount
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            generalAction,
            updatePositionCount,
            addNotification
        },
        dispatch
    );
}

Dashboard = withRouter(Dashboard);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dashboard);
