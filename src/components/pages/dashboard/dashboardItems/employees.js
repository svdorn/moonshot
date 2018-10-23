"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { openSignupModal } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";
import HoverTip from "../../../miscComponents/hoverTip";

import "../dashboard.css";

class Employees extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // the number of candidates that have not yet been reviewed
            newEmployees: undefined,
            // if there was an error getting any employees data
            fetchDataError: false
        };
    }

    // load data for the number of candidates that need review as well as the
    // graph for new candidates over the last 7 days
    componentDidMount() {
        const self = this;
        const user = this.props.currentUser;

        // if there is no user, say there are no employees waiting for grading
        if (!user) {
            self.setState({ newEmployees: 0 });
        }
        // otherwise get real number of employees who are awaiting grading
        else {
            const query = {
                params: {
                    userId: user._id,
                    verificationToken: user.verificationToken,
                    businessId: user.businessInfo.businessId
                }
            };

            axios
                .get("/api/business/employeesAwaitingReview", query)
                .then(response => {
                    if ((propertyExists(response, ["data", "newEmployees"]), "number")) {
                        self.setState({ newEmployees: response.data.newEmployees });
                    } else {
                        self.setState({ fetchDataError: true });
                    }
                })
                .catch(error => {
                    self.setState({ fetchDataError: true });
                });
        }
    }

    render() {
        // return error message if errored out
        if (this.state.fetchDataError) {
            return (
                <div className="fully-center" style={{ width: "100%" }}>
                    Error fetching data.
                </div>
            );
        }

        const { newEmployees } = this.state;

        // return progress bar if not ready yet
        if (newEmployees === undefined) {
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
                    Employees
                    <div className="info-hoverable">i</div>
                    <HoverTip
                        className="font10px secondary-gray"
                        style={{ marginTop: "18px", marginLeft: "-6px" }}
                        text="Customize your model and enable culture fit and longevity predictions with employee evaluations."
                    />
                </div>
            </div>
        );

        const employeeAction = newEmployees > 0 ? "Grade" : "Invite";
        let onClick = () => goTo("/myEmployees");
        if (!this.props.currentUser) {
            onClick = () => this.props.openSignupModal("boxes", "Employee");
        }
        const smallCTA = (
            <div styleName="box-cta" onClick={onClick}>
                {employeeAction} Employees <img src={`/icons/LineArrow${this.props.png}`} />
            </div>
        );

        return (
            <div>
                {header}

                <div className="fully-center" style={{ width: "100%" }}>
                    <div
                        styleName="important-number"
                        style={{ marginRight: "0", fontSize: "64px" }}
                    >
                        {newEmployees}
                    </div>
                    <br />
                    <div>Awaiting Grading</div>
                </div>

                {smallCTA}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ openSignupModal }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Employees);
