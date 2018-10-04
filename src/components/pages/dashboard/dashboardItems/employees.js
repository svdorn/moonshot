"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import {  } from "../../../../actions/usersActions";
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

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/employeesAwaitingReview", query )
        .then(response => {
            console.log("response: ", response);
            if (propertyExists(response, ["data", "newEmployees"]), "number") {
                self.setState({ newEmployees: response.data.newEmployees });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            console.log(error);
            self.setState({ fetchDataError: true });
        });
    }


    render() {
        // return error message if errored out
        if (this.state.fetchDataError) {
            return <div className="fully-center" style={{width:"100%"}}>Error fetching data.</div>;
        }

        // return progress bar if not ready yet
        if (this.state.newEmployees === undefined) {
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
                    <div className="info-hoverable background-primary-black-dark secondary-gray">i</div>
                    <HoverTip className="font10px secondary-gray" text="If you invite employees to take your evaluation and then grade them, we can improve our candidate predictions."/>
                </div>
            </div>
        );

        const smallCTA = <div styleName="box-cta" onClick={() => goTo("/myEmployees")}>View Employees</div>

        return (
            <div>
                { header }

                <div className="fully-center" style={{width:"100%"}}>
                    <div styleName="important-number" style={{marginRight: "0", fontSize: "60px"}}>{ this.state.newEmployees }</div><br/>
                    <div>Awaiting Grading</div>
                </div>

                { smallCTA }
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


export default connect(mapStateToProps, mapDispatchToProps)(Employees);
