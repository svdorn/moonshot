"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../actions/usersActions";
import {} from "../../../miscFunctions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan, primaryWhite } from "../../../colors";

import Onboarding from "./dashboardItems/onboarding/onboarding";
import Activity from "./dashboardItems/activity";
import BuildTeam from "./dashboardItems/onboarding/buildTeam";
import InvitePage from "./dashboardItems/onboarding/invitePage";
import WelcomePage from "./dashboardItems/onboarding/welcomePage";
import AddPositionPage from "./dashboardItems/onboarding/addPositionPage";
import Candidates from "./dashboardItems/candidates.js";
import Employees from "./dashboardItems/employees.js";
import Evaluations from "./dashboardItems/evaluations.js";
import Account from "./dashboardItems/account.js";
import Billing from "./dashboardItems/billing.js";

import "./dashboard.css";

class DashboardItem extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        // get the relative width of the dashboard item
        let { width, widthMobile } = this.props;
        if (typeof width === "string") {
            width = parseInt(this.props.width, 10);
        }
        if (typeof width !== "number" || width === NaN || width < 1 || width > 4) {
            width = 1;
        }
        width = Math.round(width);
        let mobileWidth = "";
        if (typeof widthMobile === "number") {
            mobileWidth = `mobile-width-${widthMobile}`;
        }

        let content = null;
        switch (this.props.type) {
            case "Onboarding": {
                content = <Onboarding {...this.props} />;
                break;
            }
            case "Activity": {
                content = <Activity {...this.props} />;
                break;
            }
            case "BuildTeam": {
                content = <BuildTeam {...this.props} />;
                break;
            }
            case "InvitePage": {
                content = <InvitePage {...this.props} />;
                break;
            }
            case "WelcomePage": {
                content = <WelcomePage {...this.props} />;
                break;
            }
            case "AddPositionPage": {
                content = <AddPositionPage {...this.props} />;
                break;
            }
            case "Candidates": {
                content = <Candidates {...this.props} />;
                break;
            }
            case "Employees": {
                content = <Employees {...this.props} />;
                break;
            }
            case "Evaluations": {
                content = <Evaluations {...this.props} />;
                break;
            }
            case "Account": {
                content = <Account {...this.props} />;
                break;
            }
            case "Billing": {
                content = <Billing {...this.props} />;
                break;
            }
            default: {
                content = null;
                break;
            }
        }

        const { currentUser, positionCount } = this.props;

        if (currentUser && this.props.positionCount == undefined) {
            content = <div className="fully-center"><CircularProgress style={{ color: primaryCyan }} /></div>;
        }

        return (
            <div
                styleName={`dashboard-item-container width-${width} ` + mobileWidth}
                className={this.props.blurred ? "slightly-blurred" : ""}
            >
                {content}
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
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DashboardItem);
