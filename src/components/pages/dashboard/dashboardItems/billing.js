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
            billingIsSetUp: undefined,
            // the length of time the user selected to pay for new hires
            pricing: "24 Months",
            // what the user will pay per month
            price: 80
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
            self.setState({ billingIsSetUp: false })
            // if (propertyExists(response, ["data", "billingIsSetUp"])) {
            //     self.setState({ billingIsSetUp: response.data.billingIsSetUp });
            // } else {
            //     self.setState({ billingIsSetUp: false });
            // }
        })
        .catch(error => {
            self.setState({ billingIsSetUp: false });
        });
    }


    // create the dropdown for a candidate's hiring stage
    makePricingDropdown(pricingValue) {
        const monthNumbers = ["24 Months", "18 Months", "12 Months", "6 Months"];

        // create the stage name menu items
        const monthNumberItems = monthNumbers.map(monthNumber => {
            return (
                <MenuItem
                    value={monthNumber}
                    key={`pricing ${monthNumber}`}
                >
                    { monthNumber }
                </MenuItem>
            )
        });

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootBlue home-pricing-select underline",
                    icon: "selectIconWhiteImportant"
                }}
                style={{width: "110px"}}
                value={pricingValue}
                onChange={this.handleChangePricingValue(pricingValue)}
                key={`pricingValue`}
            >
                { monthNumberItems }
            </Select>
        );
    }


    // handle a click on a hiring stage
    handleChangePricingValue = pricing => event => {
        const pricingValue = event.target.value;
        let price = 80;
        switch (pricingValue) {
            case "24 Months": { price = 80; break; }
            case "18 Months": { price = 105; break; }
            case "12 Months": { price = 150; break; }
            case "6 Months": { price = 300; break; }
            default: { break; }
        }
        this.setState({pricing: pricingValue, price});
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
        let currentPlan = "Starter";
        if (this.state.billingIsSetUp) { currentPlan = "Pro"; }

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Current Plan: { currentPlan }</div>
            </div>
        );

        const content = (
            <div style={{padding: "5px 14px"}}>
                { this.state.billingIsSetUp ?
                    <div styleName="payment-plan">
                        Only Pay When You Hire
                    </div>
                    : null
                }
                <ul styleName="pricing-list">
                    <li>Unlimited candidates, positions, and employees</li>
                    <li>
                        { this.state.billingIsSetUp ?
                            "Only pay us when you hire a top performer who stays at your company"
                            : "Your first hire is free, each additional hire:"
                        }
                    </li>
                </ul>
                { this.state.billingIsSetUp ? null :
                    <div className="primary-white center">
                        <span className="font30px font24pxUnder400 home-blue" style={{fontWeight:"bold"}}>${this.state.price}</span>
                        <span className="font16px font14pxUnder400">&nbsp;/ month</span>
                        <div className="font16px font14pxUnder400" style={{marginTop:"-10px"}}>
                            <span>for up to&nbsp;</span>
                            {this.makePricingDropdown(this.state.pricing)}
                        </div>
                    </div>
                }
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
