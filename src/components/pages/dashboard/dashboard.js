"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../actions/usersActions";
import {  } from "../../../miscFunctions";
import DashboardItem from "./dashboardItem";


class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
                <DashboardItem name="Activity" width={3} />
                <DashboardItem name="Candidates" width={1} />
                <DashboardItem name="Employees" width={1} />
                <DashboardItem name="Evaluations" width={1} />
                <DashboardItem name="Account" width={1} />
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
