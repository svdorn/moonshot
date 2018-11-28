"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MetaTags from "react-meta-tags";
import axios from "axios";

import "./pricing.css";

const boxes = [
    {
        name: "12 MONTHS",
        period: "1 year",
        price: "$199",
        icon: "Rocket"
    },
    {
        name: "6 MONTHS",
        period: "6 months",
        price: "$299",
        icon: "Airplane"
    },
    {
        name: "3 MONTHS",
        period: "3 months",
        price: "$399",
        icon: "Balloon"
    },
    {
        name: "1 MONTH",
        period: "1 month",
        price: "$529",
        icon: "PaperAirplane"
    }
];

class Pricing extends Component {
    constructor(props) {
        super(props);
    }


    pricingBoxes() {
        const pricingBoxes = boxes.map(box => {
            return (
                <div styleName="pricing-box" key={`pricing-box-${box.period}`}>
                    <div>
                        <img src={`/icons/pricing/${box.icon}${this.props.png}`} />
                        <div>{box.name}</div>
                        <div styleName="seperator" />
                        <div>
                            <span>{box.price}</span> / Month
                        </div>
                    </div>
                </div>
            );
        });

        return pricingBoxes;
    }

    pricingSection() {

        return (
            <div styleName="pricing">
                <div>Pricing Plans</div>
                <div styleName="header-seperator" />
                <div>Invite unlimited candidates, create evaluations for any of your open positions and evaluate any number of employees to customize and improve your candidate predictions with any plan.</div>
                <div>{this.pricingBoxes()}</div>
            </div>
        );
    }


    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen ">
                <MetaTags>
                    <title>Pricing | Moonshot</title>
                    <meta
                        name="description"
                        content="Pricing plans for Moonshot Insights."
                    />
                </MetaTags>
                <div styleName="container">
                    { this.pricingSection() }
                </div>
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
    return bindActionCreators(
        {
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Pricing);
