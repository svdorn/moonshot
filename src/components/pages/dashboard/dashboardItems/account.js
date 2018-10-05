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


const planDescriptions = {
    "Free Trial":
        "With the free trial, you can create as many evaluations and send \
        through as many candidates as you want, and you can hire one candidate \
        for free.",
    "Paid Plan":
        "Send as many candidates through as many evaluations as you want! \
        Three-month guarantee when you hire a candidate."
}


class Evaluations extends Component {
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

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Account</div>
            </div>
        );

        // by default show that we're going to be adding billing info
        let billingAction = "Add";
        let currentPlan = "Free Trial";
        if (this.state.billingIsSetUp) {
            billingAction === "View";
            currentPlan = "Paid Plan";
        }

        const content = (
            <div style={{padding: "5px 14px"}}>
                <div styleName="payment-plan">Current Plan: <span>{ currentPlan }</span></div>
                <div>{ planDescriptions[currentPlan] }</div>
                <div onClick={() => goTo("/pricing")} styleName="pricing-link">See Pricing</div>
            </div>
        );

        const smallCTA = (
            <div styleName="box-cta" onClick={() => goTo("/billing")}>
                { billingAction } Billing Info <img src={`/icons/LineArrow${this.props.png}`} />
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


export default connect(mapStateToProps, mapDispatchToProps)(Evaluations);
