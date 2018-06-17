"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import {  } from '../../actions/usersActions';
import {injectStripe, CardElement} from 'react-stripe-elements';

class BillingForm extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    handleSubmit = (e) => {
        // We don't want to let default form submission happen here, which would refresh the page.
        e.preventDefault();

        const currentUser = this.props.currentUser;

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        this.props.stripe.createToken({name: currentUser.name, email: currentUser.email}).then(({token}) => {
            console.log('Received Stripe token:', token);
            
        });

        // However, this line of code will do the same thing:
        //
        // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});

        // You can also use createSource to create Sources. See our Sources
        // documentation for more: https://stripe.com/docs/stripe-js/reference#stripe-create-source
        //
        // this.props.stripe.createSource({type: 'card', name: 'Jenny Rosen'});
    };

    render() {
        return (
            <div>
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 className="marginTop15px marginBottom20px">Billing</h1>
                        <div className="center" style={{width: "90%", marginLeft:"5%"}}>
                            <div className="blueTextHome font18px marginBottom10px">Payment Information</div>
                            <div className="whiteText font14px marginBottom20px">Please enter your payment information below and we will
                            bill your card with our agreed upon terms for your active positions.</div>
                            <CardElement style={{base: {fontSize: '16px', color:'white'}}} />
                        </div>
                        <RaisedButton
                            label="Submit"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{margin: '30px 0'}}
                        />
                    </form>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}

BillingForm = injectStripe(BillingForm);


export default connect(mapStateToProps, mapDispatchToProps)(BillingForm);
