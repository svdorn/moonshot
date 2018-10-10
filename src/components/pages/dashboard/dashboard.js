"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router';
import { bindActionCreators } from "redux";
import { generalAction } from "../../../actions/usersActions";
import {  } from "../../../miscFunctions";
import MetaTags from "react-meta-tags";
import DashboardItem from "./dashboardItem";
import InviteCandidatesModal from "./inviteCandidatesModal";
import AddPositionDialog from '../../childComponents/addPositionDialog';
import AddUserDialog from '../../childComponents/addUserDialog';

import WelcomeMessage from "./dashboardItems/welcomeMessage";

import "./dashboard.css";


class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        if (this.props.location && this.props.location.query && this.props.location.query.inviteCandidates === "open") {
            this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
        }
    }

    render() {
        const user = this.props.currentUser;

        let activity = <DashboardItem type="Activity" width={3} />;
        // if the user is not done with onboarding
        if (user && user.onboard && !user.onboard.timeFinished) {
            activity = <DashboardItem type="Onboarding" width={3} />;
        }
        // if the user has the popups at onboarding
        if (user && user.popups && user.popups.businessInterests) {
            activity = <DashboardItem type="BuildTeam" width={3} />;
        }

        return (
            <div className="center full-height">
                <MetaTags>
                    <title>Dashboard | Moonshot</title>
                    <meta name="description" content="Your home base for checking in on your candidates, employees, evaluations, and more."/>
                </MetaTags>
                <InviteCandidatesModal />
                <AddPositionDialog />
                <AddUserDialog />
                <div className="page-line-header"><div/><div>Dashboard</div></div>
                <WelcomeMessage />
                <div styleName="dashboard">
                    { activity }
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
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction
    }, dispatch);
}

Dashboard = withRouter(Dashboard);

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
