"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../actions/usersActions';


class OnboardingProgress extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let amountDone = .5;

        const width = this.props.width ? this.props.width : "100px";
        const height = this.props.height ? this.props.height : "20px";

        // purple and blue, respectively
        let rStart = 118,
            gStart = 222,
            bAlways = 254,
            rEnd = 177,
            gEnd = 125;

        // what the r and g values of the end of the bar should be
        const rRight = Math.round(((1 - amountDone) * rStart) + (amountDone + rEnd));
        const gRight = Math.round(((1 - amountDone) * gStart) + (amountDone + gEnd));

        return (
            <div className="onboarding-progress-container" style={{width, height, ...this.props.style}}>
                <div style={{
                    width: `${amountDone * 100}%`,
                    background: `linear-gradient(to right, rgb(${rStart},${gStart},${bAlways}), rgb(${rEnd},${gEnd},${bAlways}))`
                }}/>
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


export default connect(mapStateToProps, mapDispatchToProps)(OnboardingProgress);
