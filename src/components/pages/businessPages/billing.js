"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getBillingInfo, billingCardOnFileFalse, generalAction, updateStore } from '../../../actions/usersActions';
import { makeSingular } from "../../../miscFunctions";
import {Elements} from 'react-stripe-elements';
import MetaTags from 'react-meta-tags';
import axios from "axios";
import AddUserDialog from '../../childComponents/addUserDialog';
import CornersButton from '../../miscComponents/cornersButton';
import CircularProgress from "@material-ui/core/CircularProgress";
import HoverTip from "../../miscComponents/hoverTip";
import colors from "../../../colors";
import BillingForm from '../../childComponents/billingForm';
import CancelPlanModal from '../../childComponents/cancelPlanModal';

import "./billing.css";

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

class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // the plan that is selected
            plan: undefined,
            // if the user is currently updating their plan
            updatePlan: false,
            updateCard: false
        };
    }

    componentDidMount() {
        const self = this;

        const { currentUser, billing } = this.props;

        if (billing) { return; }

        const businessId = currentUser && currentUser.businessInfo ? currentUser.businessInfo.businessId : null;

        this.props.getBillingInfo(currentUser._id, currentUser.verificationToken, businessId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.billing && nextProps.billing.subscription && nextProps.billing.subscription.name !== this.state.plan) {
            this.setState({ plan: nextProps.billing.subscription.name });
        }
    }

    selectPlan = (plan) => {
        // check if the user is trying to update their plan
        const statePlan = this.state.plan;
        const { billing } = this.props;
        let updatePlan = false;
        if (statePlan && billing && billing.subscription) {
            updatePlan = true;
        }

        if (typeof plan === "string") {
            this.setState({ plan, updatePlan })
        }
    }

    updatePlan = (plan) => {
        console.log("update plan: ", plan);
    }

    updateCard = () => {
        this.props.billingCardOnFileFalse(this.props.billing);
        this.setState({updateCard: true})
    }

    updateCardFalse = () => {
        this.setState({updateCard: false})
    }

    cancelPlan = () => {
        this.props.generalAction("OPEN_CANCEL_PLAN_MODAL");
        this.props.updateStore("blurMenu", true);
    }

    pricingBoxes() {
        const { plan } = this.state;
        const { billing } = this.props;

        let baseButtonText = "Select";
        if (plan && billing && billing.subscription) {
            baseButtonText = "Switch Plan";
        }

        const pricingBoxes = boxes.map(box => {
            let buttonText = baseButtonText;
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
        const { plan } = this.state;
        const { billing } = this.props;

        let header = "Select a Plan";
        if (plan && billing) {
            header = "Pricing Plans";
        }
        return (
            <div styleName="pricing">
                <div>
                    { header }
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
        const { plan, updateCard } = this.state;
        const { billing } = this.props;

        if (!plan) return null;
        if (billing && billing.cardOnFile) {
            if (!updateCard) {
                return null;
            } else {
                return this.updateCardFalse();
            }
        }

        if (updateCard) {
            var update = true;
        }

        return (
            <div styleName="credit-card">
                <div>
                    Please enter your card information below
                </div>
                <Elements>
                    <BillingForm subscriptionTerm={plan} update={update} />
                </Elements>
            </div>
        );
    }

    updatePlanSection() {
        const { plan, updatePlan } = this.state;
        const { billing } = this.props;

        if (!updatePlan) return null;

        const planName = makeSingular(plan);

        return (
            <div styleName="update-plan">
                <div>
                    {`The ${planName} plan will begin after your current plan of ${billing.subscription.name} is completed`}
                </div>
                <CornersButton
                    onClick={() => this.updatePlan(plan)}
                    content="Update Plan"
                    color1={colors.primaryCyan}
                    color2={colors.primaryWhite}
                    className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                />
            </div>
        );
    }

    learnFromHiresSection() {
        const { plan, updatePlan, updateCard } = this.state;
        const { billing } = this.props;
        // don't show section
        if (!plan || !billing || (billing && !billing.cardOnFile && !updateCard) || updatePlan) return null;

        const features = [
            {
                title: "Unlimited Candidates",
                text1: "Evaluate and receive insights",
                text2: "for any number of candidates",
                icon: "CandidatesIcon",
                alt: "Candidates Icon",
                iconStyle: {}
            },
            {
                title: "Any Position",
                text1: "Evaluations for any position",
                text2: <div>across <div className="primary-cyan inlineBlock">five position types</div><HoverTip
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
                            src={`/icons/billing/${feature.icon}${this.props.png}`}
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
                className="primary-cyan left-align font26px font22pxUnder800 font18pxUnder700"
                style={{lineHeight: "1.3"}}
            >
                We learn from each hire<br/> so that we can make the next one even better.
            </div>
        )

        return (
            <section styleName="learn-from-hires-section">
                <div className="center">
                    <div className="primary-white inline-block" style={{maxWidth: "1200px"}}>
                        { featureBoxes }
                    </div>
                    <div styleName="update-cancel">
                        <div onClick={() => this.updateCard()}>
                            Update Card
                        </div>
                        <div>
                            |
                        </div>
                        <div onClick={() => this.cancelPlan()}>
                            Cancel Plan
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    render() {

        const { billing, blur } = this.props;

        const blurredClass = blur ? "dialogForBizOverlay" : "";


        return (
            <div className={"jsxWrapper blackBackground fillScreen " + blurredClass}>
                <AddUserDialog />
                <CancelPlanModal />
                <MetaTags>
                    <title>Billing | Moonshot</title>
                    <meta name="description" content="Manage your current bills and enter credit card information to pay bills." />
                </MetaTags>
                {billing ?
                    <div styleName="billing">
                        { this.pricingSection() }
                        { this.updatePlanSection() }
                        { this.learnFromHiresSection() }
                        { this.creditCardSection() }
                    </div>
                :
                    <div styleName="circular-progress"><CircularProgress style={{ color: colors.primaryWhite }} /></div>
                }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        billing: state.users.billing,
        blur: state.users.cancelPlanModal
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getBillingInfo,
        billingCardOnFileFalse,
        generalAction,
        updateStore
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Billing);
