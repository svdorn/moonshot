"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CircularProgress } from "material-ui";
import {
    updateBillingSource,
    setupBillingCustomer,
    startLoading,
    addNotification,
    stopLoading
} from "../../actions/usersActions";
import { button } from "../../classes.js";
import { injectStripe, CardElement } from "react-stripe-elements";
import axios from "axios";

import "./billingForm.css";

class BillingForm extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    handleSubmit = e => {
        // We don't want to let default form submission happen here, which would refresh the page.
        e.preventDefault();
        this.props.startLoading();

        if (!this.props.currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        let self = this;
        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        const { name, email, _id, verificationToken } = this.props.currentUser;
        const { subscriptionTerm, update } = this.props;

        this.props.stripe.createSource({ type: "card", owner: { name } }).then(function(result) {
            if (result.error) {
                self.props.stopLoading();
                self.props.addNotification(
                    "Error adding card, please review credit card information and retry.",
                    "error"
                );
            } else {
                if (update) {
                    self.props.updateBillingSource(result.source.id, _id, verificationToken);
                } else {
                    self.props.setupBillingCustomer(
                        result.source.id,
                        email,
                        _id,
                        verificationToken,
                        subscriptionTerm
                    );
                }
            }
        });
    };

    render() {
        const { update, loading } = this.props;

        return (
            <div styleName="container">
                <form onSubmit={this.handleSubmit}>
                    <div styleName="card-element">
                        <CardElement style={{ base: { fontSize: "16px", color: "white" } }} />
                    </div>
                    <div className={button.white} onClick={this.handleSubmit} styleName="button">
                        {update ? <div>Update Card</div> : <div>Start Plan</div>}
                    </div>
                    <br />
                    {loading ? <CircularProgress color="white" /> : null}
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
    return bindActionCreators(
        {
            updateBillingSource,
            setupBillingCustomer,
            startLoading,
            stopLoading,
            addNotification
        },
        dispatch
    );
}

BillingForm = injectStripe(BillingForm);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BillingForm);
