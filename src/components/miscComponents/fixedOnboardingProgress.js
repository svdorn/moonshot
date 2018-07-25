"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../actions/usersActions';
import OnboardingProgress from "./onboardingProgress";


class FixedOnboardingProgress extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="fixed-onboarding-progress">
                <div>
                    <div className="center primary-white">{"Onboarding Progress"}</div>
                    <OnboardingProgress className="fixed-progress-bar"/>
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


export default connect(mapStateToProps, mapDispatchToProps)(FixedOnboardingProgress);
