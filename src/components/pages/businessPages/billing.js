"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getBillingInfo, billingCardOnFileFalse, billingCardOnFileTrue, generalAction, updateStore, updateBillingPlan } from '../../../actions/usersActions';
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
            // currentPlan
            currentPlan: undefined,
            // if the user is currently updating their plan
            updatePlan: false,
            // if the user is currently updating their card
            updateCard: false
        };
    }

    componentDidMount() {
        const self = this;

        const { currentUser, billing } = this.props;

        // if already have billng
        if (billing && billing.subscription) { return this.setState({ plan: billing.subscription.name, currentPlan: billing.subscription.name }); }

        const businessId = currentUser && currentUser.businessInfo ? currentUser.businessInfo.businessId : null;

        this.props.getBillingInfo(currentUser._id, currentUser.verificationToken, businessId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.billing && nextProps.billing.subscription && nextProps.billing.subscription.name !== this.state.plan) {
            const plan = nextProps.billing.subscription.name;
            if (!this.state.plan) {
                var currentPlan = plan;
            }
            this.setState({ plan, currentPlan });
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
        const { _id, verificationToken } = this.props.currentUser;

        this.props.updateBillingPlan(_id, verificationToken, plan);
        this.setState({ updatePlan: false });
    }

    updateCard = () => {
        this.props.billingCardOnFileFalse(this.props.billing);
        this.setState({updateCard: true})
    }

    updateCardFalse = () => {
        this.props.billingCardOnFileTrue(this.props.billing);
        this.setState({updateCard: false})
    }

    cancelPlan = () => {
        this.props.generalAction("OPEN_CANCEL_PLAN_MODAL");
        this.props.updateStore("blurMenu", true);
    }

    pricingBoxes() {
        const { plan, currentPlan, updatePlan } = this.state;
        const { billing } = this.props;

        let baseButtonText = "Select";
        if (plan && billing && billing.subscription) {
            baseButtonText = "Switch Plan";
        }
        if (billing && billing.subscription && billing.subscription.toCancel) {
            if (billing.newSubscription && billing.newSubscription.name) { } else {
                baseButtonText = "Select";
                if (!updatePlan) {
                    var allNotActive = true;
                }
            }
        }

        const pricingBoxes = boxes.map(box => {
            let buttonText = baseButtonText;
            let shadowActive = "";
            if (plan === box.period && !allNotActive) {
                var active = "active";
                shadowActive = "active";
                buttonText = "Selected";
            }
            if (currentPlan === box.period && !allNotActive) {
                var active = "active";
                buttonText = "Current Plan";
            }
            return (
                <div styleName={"pricing-box " + shadowActive} key={`pricing-box-${box.period}`}>
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
                            onClick={active ? null : () => this.selectPlan(box.period)}
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
        if (plan && billing && billing.subscription && billing.subscription.id) {
            header = "Pricing Plans";
        }
        if (billing && billing.subscription && billing.subscription.toCancel) {
            var info = `Your current plan is ending ${new Date(billing.subscription.dateEnding).toDateString()}. Select a new plan below.`
            if (billing.newSubscription && billing.newSubscription.name) {
                info = `Your current ${makeSingular(billing.subscription.name)} plan is changing to a ${makeSingular(billing.newSubscription.name)} on ${new Date(billing.subscription.dateEnding).toDateString()}.`
            }
        }
        return (
            <div styleName="pricing">
                <div>
                    { header }
                </div>
                <div styleName="header-seperator" />
                <div>
                    There will be text here for two lines. There will be text here for two lines. There will be text here for two lines.
                </div>
                <div>
                    {info ?
                        <div>
                            <div styleName="info">i</div>
                            { info }
                        </div>
                        : null
                    }
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
                    Please enter your card information below:
                </div>
                <Elements>
                    <BillingForm subscriptionTerm={plan} update={update} />
                </Elements>
                {update ?
                    <div styleName="close-section" onClick={this.updateCardFalse}>
                        x Close
                    </div>
                    : null
                }
            </div>
        );
    }

    updatePlanSection() {
        let { plan, updatePlan } = this.state;
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
                    size="small-padding"
                    color1={colors.primaryCyan}
                    color2={colors.primaryWhite}
                    className="font18px font16pxUnder900 font12pxUnder400 marginTop20px"
                />
            </div>
        );
    }

    updateOrCancelSection() {
        const { plan } = this.state;
        const { billing, loading } = this.props;
        // don't show section
        if (!plan || !billing || (billing && !billing.cardOnFile)) return null;

        if (billing && billing.subscription && billing.subscription.toCancel) {
            if (billing.newSubscription && billing.newSubscription.name) { } else {
                return null;
            }
        }

        return (
            <div className="center">
                {!loading ?
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
                    :
                    <div styleName="circular-progress"><CircularProgress style={{ color: colors.primaryWhite }} /></div>
                }
            </div>
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
                        { this.updateOrCancelSection() }
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
        blur: state.users.cancelPlanModal,
        loading: state.users.loadingSomething
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getBillingInfo,
        billingCardOnFileFalse,
        billingCardOnFileTrue,
        generalAction,
        updateStore,
        updateBillingPlan
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Billing);
