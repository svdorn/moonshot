"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { setupBillingCustomer, startLoading, addNotification, stopLoading } from '../../actions/usersActions';
import {injectStripe, CardElement} from 'react-stripe-elements';
import axios from "axios";

class BillingForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            business: undefined,
            numPositions: 0,
            subscriptionTerm: undefined,
            amount: 0
        };
    }

    componentDidMount() {
        let self = this;

        axios.get("/api/business/business", {
            params: {
                userId: self.props.currentUser._id,
                verificationToken: self.props.currentUser.verificationToken,
                businessId: self.props.currentUser.businessInfo.company.companyId
            }
        })
        .then(function (res) {
            const billingInfo = res.data.billing;
            if (billingInfo) {
                const numPositions = billingInfo.positions;
                const subscriptionTerm = billingInfo.length;
                const amount = billingInfo.amount;
                const business = res.data;
                self.setState({numPositions, subscriptionTerm, amount, business});
            } else {
                const business = {};
                self.setState({business})
            }
        })
        .catch (function(error) {
            // console.log("error getting the positions: ", error);
            const business = {};
            self.setState({business})
            console.log(error);
        })
    }

    handleSubmit = (e) => {
        // We don't want to let default form submission happen here, which would refresh the page.
        e.preventDefault();
        this.props.startLoading();

        let self = this;
        const currentUser = this.props.currentUser;

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        const email = currentUser.email;
        const verificationToken = currentUser.verificationToken;
        const userId = currentUser._id;

        this.props.stripe.createSource({type: 'card', owner: { name: currentUser.name}}).then(function(result) {
            if (result.error) {
                console.log(result.error);
                self.props.stopLoading();
                self.props.addNotification("Error adding card, please review credit card information and retry.", "error");
            } else {
                self.props.setupBillingCustomer(result.source, email, userId, verificationToken);
            }
        })
    }

    render() {
        return (
            <div>
                {this.state.business ?
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 className="marginTop15px marginBottom20px">Billing</h1>
                        <div className="center" style={{width: "90%", marginLeft:"5%"}}>
                            <div className="blueTextHome font18px marginBottom10px">Subscription Information</div>
                            {(this.state.numPositions > 0 && this.state.amount > 0 && this.state.subscriptionTerm)
                                ?
                                <div className="whiteText font14px marginBottom30px">
                                    You have an {this.state.subscriptionTerm} subscription plan that includes up to {this.state.numPositions} active positions for
                                    ${this.state.amount} per month. Please enter your payment information below and we will bill your card according to these agreed upon terms and conditions.
                                </div>
                            :<div className="whiteText font14px marginBottom30px">Please enter your payment information below and we will
                            bill your card with our agreed upon terms for your active positions.</div>
                            }
                            <CardElement style={{base: {fontSize: '16px', color:'white'}}} />
                        </div>
                        <RaisedButton
                            label="Submit"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{margin: '30px 0'}}
                        />
                        <br/>
                        {this.props.loading ? <CircularProgress color="white"/> : null}
                    </form>
                </div>
                :
                <div className="marginTop20px"><CircularProgress color="white"/> </div>
            }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setupBillingCustomer,
        startLoading,
        stopLoading,
        addNotification
    }, dispatch);
}

BillingForm = injectStripe(BillingForm);


export default connect(mapStateToProps, mapDispatchToProps)(BillingForm);
