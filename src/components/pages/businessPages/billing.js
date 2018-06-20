"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../../actions/usersActions';
import {Elements} from 'react-stripe-elements';
import MetaTags from 'react-meta-tags';
import AddUserDialog from '../../childComponents/addUserDialog';
import HomepageTriangles from '../../miscComponents/HomepageTriangles';
import BillingForm from '../../childComponents/billingForm';

class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                    <title>Billing | Moonshot</title>
                    <meta name="description" content="Manage your current bills and enter credit card information to pay bills." />
                </MetaTags>
                <AddUserDialog />
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="5" />
                <Elements>
                    <BillingForm />
                </Elements>
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


export default connect(mapStateToProps, mapDispatchToProps)(Billing);
