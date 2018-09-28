"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../actions/usersActions";
import {  } from "../../../miscFunctions";
import MetaTags from "react-meta-tags";
import DashboardItem from "./dashboardItem";

import "./dashboard.css";


class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="center full-height">
                <MetaTags>
                    <title>Dashboard | Moonshot</title>
                    <meta name="description" content="Your home base for checking in on your candidates, employees, evaluations, and more."/>
                </MetaTags>
                <div styleName="dashboard">
                    <DashboardItem type="Onboarding" width={3} />
                    <DashboardItem type="Activity" width={1} />
                    <DashboardItem type="Candidates" width={1} />
                    <DashboardItem type="Employees" width={1} />
                    <DashboardItem type="Evaluations" width={1} />
                    <DashboardItem type="Account" width={1} />
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
