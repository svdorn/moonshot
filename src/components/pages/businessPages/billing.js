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

class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: "year"
        };
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
                    <div styleName="pricing-box">
                        <img src={`/icons/pricing/Rocket${this.props.png}`} />
                        <div>
                            12 MONTHS
                        </div>
                        <div styleName="seperator" />
                        <div>
                            <span>$199</span> / Month
                        </div>
                        <CornersButton
                            content="Select"
                            size="small-padding"
                            color1={colors.primaryCyan}
                            color2={colors.primaryWhite}
                            className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                        />
                    </div>
                    <div styleName="pricing-box">
                        <img src={`/icons/pricing/Airplane${this.props.png}`} />
                        <div>
                            6 MONTHS
                        </div>
                        <div styleName="seperator" />
                        <div>
                            <span>$299</span> / Month
                        </div>
                        <CornersButton
                            content="Select"
                            size="small-padding"
                            color1={colors.primaryCyan}
                            color2={colors.primaryWhite}
                            className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                        />
                    </div>
                    <div styleName="pricing-box">
                        <img src={`/icons/pricing/Balloon${this.props.png}`} />
                        <div>
                            3 MONTHS
                        </div>
                        <div styleName="seperator" />
                        <div>
                            <span>$399</span> / Month
                        </div>
                        <CornersButton
                            content="Select"
                            size="small-padding"
                            color1={colors.primaryCyan}
                            color2={colors.primaryWhite}
                            className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                        />
                    </div>
                    <div styleName="pricing-box">
                        <img src={`/icons/pricing/PaperAirplane${this.props.png}`} />
                        <div>
                            1 MONTH
                        </div>
                        <div styleName="seperator" />
                        <div>
                            <span>$529</span> / Month
                        </div>
                        <CornersButton
                            content="Select"
                            size="small-padding"
                            active="active"
                            color1={colors.primaryCyan}
                            color2={colors.primaryWhite}
                            className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                        />
                    </div>
                </div>
            </div>
        );
    }

    creditCardSection() {
        const { selected } = this.state;

        if (!selected) return null;

        return (
            <div styleName="credit-card">
                <div>
                    Please enter your card information below
                </div>
                <Elements>
                    <BillingForm subscriptionTerm={selected} />
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
