"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { setupBillingCustomer, startLoading } from '../../actions/usersActions';
import {injectStripe, CardElement} from 'react-stripe-elements';

class BillingForm extends Component {
    constructor(props) {
        super(props);

        this.state = {};
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
            // Handle result.error or result.source
            if (result.error) {
                console.log(result.error);
                console.log("error");
            } else {
                self.props.setupBillingCustomer(result.source, email, userId, verificationToken);
            }
        })
    }

    render() {
        return (
            <div>
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 className="marginTop15px marginBottom20px">Billing</h1>
                        <div className="center" style={{width: "90%", marginLeft:"5%"}}>
                            <div className="blueTextHome font18px marginBottom10px">Payment Information</div>
                            <div className="whiteText font14px marginBottom30px">Please enter your payment information below and we will
                            bill your card with our agreed upon terms for your active positions.</div>
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
        startLoading
    }, dispatch);
}

BillingForm = injectStripe(BillingForm);


export default connect(mapStateToProps, mapDispatchToProps)(BillingForm);
