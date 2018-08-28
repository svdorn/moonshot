"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MetaTags from 'react-meta-tags';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import HoverTip from '../../miscComponents/hoverTip';
import { goTo } from "../../../miscFunctions";

import './pricing.css';

class Pricing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pricing: "24 Months",
            price: 80,
        };
    }

    // create the dropdown for a candidate's hiring stage
    makePricingDropdown(pricingStage) {
        const stageNames = ["24 Months", "18 Months", "12 Months", "6 Months"];

        // create the stage name menu items
        const stages = stageNames.map(stage => {
            return (
                <MenuItem
                    value={stage}
                    key={`pricingStage${stage}`}
                >
                    { stage }
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
                value={pricingStage}
                onChange={this.handleChangePricingStage(pricingStage)}
                key={`pricingStage`}
            >
                { stages }
            </Select>
        );
    }

    // handle a click on a hiring stage
    handleChangePricingStage = pricing => event => {
        const pricingStage = event.target.value;
        let price = 80;
        switch (pricingStage) {
            case "24 Months":
                price = 80;
                break;
            case "18 Months":
                price = 105;
                break;
            case "12 Months":
                price = 150;
                break;
            case "6 Months":
                price = 300;
                break;
            default:
                break;
        }
        this.setState({pricing: pricingStage, price});
    }

    pricingSection() {
        const positionUrl = this.state.position ? ("?position=" + this.state.position) : "";

        return (
            <section id="pricingSection" styleName="pricing-section">
                <a id="pricing" name="pricing" className="anchor" />
                <div style={{margin: "auto", textAlign: "center", position: "relative"}}>
                    <div
                        className="font36px font32pxUnder700 font26pxUnder500 center home-peach"
                        style={{marginBottom: '30px'}}
                    >
                        Pay Only When You Hire
                        <div className="font18px font16pxUnder700 font12pxUnder400 primary-white" style={{width:"80%", margin:"auto"}}>
                            Our incentives are aligned. You only pay when you hire<div className="above700only br"><br/></div> a top performer who stays at your company.
                        </div>
                    </div>
                    <div styleName="pricing-box box-1">
                        <div style={{textAlign: "center", position: "relative"}}>
                            <img
                                src={"/images/businessHome/Flourish1" + this.props.png}
                                alt="Flourish Icon"
                                styleName="flourish-icon"
                            />
                            <div styleName="pricing-container">
                                <div className="home-peach paddingTop10px font20px font16pxUnder400" style={{fontWeight: "bold"}}>
                                    Test It Out
                                </div>
                                <img
                                    src={"/images/businessHome/PaperAirplane2" + this.props.png}
                                    alt="Paper Airplane Icon"
                                    styleName="aircraft-icon"
                                />
                                <div className="marginTop10px primary-white font22px font18pxUnder400">
                                    First Hire
                                </div>
                                <div styleName="price-free" className="home-peach font30px font24pxUnder400">
                                    FREE
                                </div>
                                <ul className="primary-white font14px font12pxUnder400">
                                    <li>Select a position to evaluate</li>
                                    <li>Invite applicants to the evaluation</li>
                                    <li>Review the results</li>
                                    <li>Hire the best candidate</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="under800only" style={{height:"0px"}}><br/></div>
                    <div styleName="pricing-box box-2">
                        <div style={{textAlign: "center", position: "relative"}}>
                            <img
                                src={"/images/businessHome/Flourish2" + this.props.png}
                                styleName="flourish-icon flourish-2"
                                alt="Flourish Icon"
                            />
                            <div styleName="pricing-container">
                                <div className="home-blue paddingTop10px font20px font16pxUnder400" style={{fontWeight: "bold"}}>
                                    Scale It Up
                                </div>
                                <img
                                    src={"/images/businessHome/EnterpriseRocket2" + this.props.png}
                                    alt="Enterprise Rocket Icon"
                                    styleName="aircraft-icon"
                                />
                                <div className="primary-white marginTop10px font22px font18pxUnder400">
                                    Each Additional Hire
                                </div>
                                <div className="primary-white">
                                    <span className="font30px font24pxUnder400 home-blue" style={{fontWeight:"bold"}}>${this.state.price}</span>
                                    <span className="font16px font14pxUnder400">&nbsp;/ month</span>
                                    <div className="font16px font14pxUnder400" style={{marginTop:"-10px"}}>
                                        <span>for up to&nbsp;</span>
                                        {this.makePricingDropdown(this.state.pricing)}
                                    </div>
                                </div>
                                <ul className="primary-white font14px font12pxUnder400" style={{textAlign: "left", width: "95%", margin:"auto"}}>
                                    <li>Monthly payments stop if a<br/>hire is no longer employed</li>
                                    <li>Pay off your balance at any time</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="primary-white font18px font16pxUnder700 font12pxUnder450">
                            Unlimited evaluations of all your applicants across <div className="home-peach inlineBlock">five position types</div><HoverTip
                                style={{marginTop: "26px", marginLeft: "-70px"}}
                                text={<div>Development<br/>Sales<br/>Support<br/>Marketing<br/>Product</div>}
                            />.
                        </div>
                        <div className="marginTop15px">
                            <button className="button gradient-transition gradient-1-home-peach gradient-2-home-pink round-4px font20px font18pxUnder700 font16pxUnder500 primary-white" onClick={() => goTo("/billing")} style={{padding: "5px 17px"}}>
                                {"Select Payment Method"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    learnFromHiresSection() {
        const features = [
            {
                title: "Unlimited Applicants",
                text1: "Evaluate and receive insights",
                text2: "for any number of applicants",
                icon: "CandidatesIcon",
                alt: "Candidates Icon",
                iconStyle: {}
            },
            {
                title: "Any Position",
                text1: "Evaluations for any position",
                text2: <div>across <div className="home-pink inlineBlock">five position types</div><HoverTip
                    style={{marginTop: "26px", marginLeft: "-70px"}}
                    text={<div>Development<br/>Sales<br/>Support<br/>Marketing<br/>Product</div>}
                /></div>,
                icon: "5Icon",
                alt: "5 Icon",
                iconStyle: {}
            },
            {
                title: "Unlimited Employees",
                text1: "Evaluate employees to strengthen",
                text2: "your company's predictive baseline",
                icon: "EmployeeIcon",
                alt: "Employee Icon",
                iconStyle: { height: "85px" }
            },
            {
                title: "Quarterly Reviews",
                text1: "Hires are reviewed to update",
                text2: "and improve your predictive model",
                icon: "FlameIcon",
                alt: "Flame Icon",
                iconStyle: { height: "84px", marginTop: "-2px" }
            },
            {
                title: "Analytics and Reporting",
                text1: "Get in-depth breakdowns on",
                text2: "all of your candidates and hires",
                icon: "GraphIcon",
                alt: "Graph Icon",
                iconStyle: {}
            },
        ]

        // create a box for each feature
        let featureBoxes = features.map(feature => {
            return (
                <div styleName="feature-box" key={feature.title}>
                    <div>
                        <img
                            src={`/images/businessHome/${feature.icon}${this.props.png}`}
                            style={feature.iconStyle}
                            alt={feature.alt}
                        />
                    </div>
                    <div>
                        <div className="bold font16pxUnder800 font14pxUnder700">{ feature.title }</div>
                        <div className="secondary-gray font14pxUnder800 font12pxUnder700">{ feature.text1 }<br/>{ feature.text2 }</div>
                    </div>
                </div>
            )
        });

        // add the box at the top left with the title for the whole area
        featureBoxes.unshift(
            <div
                key="featuresHeader"
                styleName="feature-box"
                className="primary-peach left-align font26px font22pxUnder800 font18pxUnder700"
                style={{lineHeight: "1.3"}}
            >
                We learn from each hire<br/> so that we can make the next one even better.
            </div>
        )

        return (
            <section id="learnFromHires" styleName="learn-from-hires-section">
                <div className="center">
                    <div className="primary-white inline-block" style={{maxWidth: "1200px"}}>
                        { featureBoxes }
                    </div>
                </div>
            </section>
        );
    }

    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen paddingBottom20px">
                <MetaTags>
                    <title>Pricing | Moonshot</title>
                    <meta name="description" content="View the pricing structure for hiring candidates."/>
                </MetaTags>
                { this.pricingSection() }
                { this.learnFromHiresSection() }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Pricing);
