"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../../actions/usersActions';
import {Elements} from 'react-stripe-elements';
import MetaTags from 'react-meta-tags';
import AddUserDialog from '../../childComponents/addUserDialog';
import CornersButton from '../../miscComponents/cornersButton';
import colors from "../../../colors";
import BillingForm from '../../childComponents/billingForm';

import "./billing.css";

const boxes = [
    {
        name: "12 MONTHS",
        period: "year",
        price: "$199",
        icon: "Rocket"
    },
    {
        name: "6 MONTHS",
        period: "6mo",
        price: "$299",
        icon: "Airplane"
    },
    {
        name: "3 MONTHS",
        period: "3mo",
        price: "$399",
        icon: "Balloon"
    },
    {
        name: "1 MONTH",
        period: "1mo",
        price: "$529",
        icon: "PaperAirplane"
    }
];

class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            plan: undefined
        };
    }

    selectPlan = (plan) => {
        if (typeof plan === "string") {
            this.setState({ plan })
        }
    }

    pricingBoxes() {
        const { plan } = this.state;

        const pricingBoxes = boxes.map(box => {
            let buttonText = "Select";
            let active = "";
            if (plan === box.period) {
                active = "active";
                buttonText = "Selected";
            }
            return (
                <div styleName={"pricing-box " + active} key={`pricing-box-${box.period}`}>
                    <div>
                        <img src={`/icons/pricing/${box.icon}${this.props.png}`} />
                        <div>
                            {box.name}
                        </div>
                        <div styleName="seperator" />
                        <div>
                            <span>{box.price}</span> / Month
                        </div>
                        <CornersButton
                            onClick={() => this.selectPlan(box.period)}
                            content={buttonText}
                            active={active}
                            size="small-padding"
                            color1={colors.primaryCyan}
                            color2={colors.primaryWhite}
                            className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                        />
                    </div>
                </div>
            )
        });

        return pricingBoxes;
    }

    pricingSection() {
        return (
            <div styleName="pricing">
                <div>
                    Select a Plan
                </div>
                <div styleName="header-seperator">
                </div>
                <div>
                    There will be text here for two lines. There will be text here for two lines. There will be text here for two lines.
                </div>
                <div>
                    { this.pricingBoxes() }
                </div>
            </div>
        );
    }

    creditCardSection() {
        const { plan } = this.state;

        if (!plan) return null;

        return (
            <div styleName="credit-card">
                <div>
                    Please enter your card information below
                </div>
                <Elements>
                    <BillingForm subscriptionTerm={plan} />
                </Elements>
            </div>
        );
    }

    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen">
                <AddUserDialog />
                <MetaTags>
                    <title>Billing | Moonshot</title>
                    <meta name="description" content="Manage your current bills and enter credit card information to pay bills." />
                </MetaTags>
                { this.pricingSection() }
                { this.creditCardSection() }
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

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Billing);
