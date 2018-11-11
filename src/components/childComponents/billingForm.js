"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { setupBillingCustomer, startLoading, addNotification, stopLoading } from '../../actions/usersActions';
import {injectStripe, CardElement} from 'react-stripe-elements';
import axios from "axios";

import "./billingForm.css";

class BillingForm extends Component {
    constructor(props) {
        super(props);

        this.state = { };
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
            <div styleName="container">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <div styleName="card-element">
                        <CardElement style={{base: {fontSize: '16px', color:'white'}}} />
                    </div>
                    <RaisedButton
                        label="Submit"
                        type="submit"
                        styleName="button"
                    />
                    <br/>
                    {this.props.loading ? <CircularProgress color="white"/> : null}
                </form>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png
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
