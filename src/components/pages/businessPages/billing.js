"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../../actions/usersActions';


class Billing extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        document.body.appendChild(script);
    }

    render() {
        return (
            <div className="fillScreen lightBlackBackground">
                <div className="headerDiv"/>
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
