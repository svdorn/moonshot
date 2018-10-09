"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";

import "../dashboard.css";


class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // whether the business has billing set up for their account
            billingIsSetUp: undefined
        };
    }


    // load graph data for the candidate completions over last week
    componentDidMount() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        // find out whether billing is set up, if error assume not
        axios.get("/api/business/billingIsSetUp", query)
        .then(response => {
            if (propertyExists(response, ["data", "billingIsSetUp"])) {
                self.setState({ billingIsSetUp: response.data.billingIsSetUp });
            } else {
                self.setState({ billingIsSetUp: false });
            }
        })
        .catch(error => {
            self.setState({ billingIsSetUp: false });
        });
    }


    render() {
        // return progress bar if not ready yet
        if (typeof this.state.billingIsSetUp !== "boolean") {
            return (
                <div className="fully-center">
                    <CircularProgress style={{ color: primaryCyan }} />
                </div>
            );
        }

        // by default show that we're going to be adding billing info
        let currentPlan = "Starter Plan";
        if (this.state.billingIsSetUp) { currentPlan = "Pro Plan"; }

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">{ currentPlan }</div>
            </div>
        );

        const content = (
            <div style={{padding: "5px 14px"}}>
                <div styleName="payment-plan">
                    { this.state.billingIsSetUp ? "Only Pay When You Hire" : "Your First Hire Is Free" }
                </div>
                <ul styleName="pricing-list">
                    <li>Unlimited candidates, positions, and employees</li>
                    <li>Only pay us when you hire a top performer who stays at your company</li>
                </ul>
                <div onClick={() => goTo("/pricing")} styleName="pricing-link">See Pricing</div>
            </div>
        );

        const smallCTA = (
            <div styleName="box-cta" onClick={() => goTo("/billing")}>
                { this.state.billingIsSetUp ? "" : "Add" } Billing
                Info <img src={`/icons/LineArrow${this.props.png}`} />
            </div>
        );

        return (
            <div>
                { header }
                { content }
                { smallCTA }
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
    return bindActionCreators({
        generalAction
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Billing);
