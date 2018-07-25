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
        let amountDone = .8;

        // purple and blue, respectively
        let rStart = 177,
            gStart = 125,
            bAlways = 254,
            rEnd = 118,
            gEnd = 222;

        // what the r and g values of the end of the bar should be
        const rRight = Math.round(((1 - amountDone) * rStart) + (amountDone * rEnd));
        const gRight = Math.round(((1 - amountDone) * gStart) + (amountDone * gEnd));

        return (
            <div
                className={"onboarding-progress-container " + (this.props.className ? (this.props.className) : "default")}
                style={this.props.style}
            >
                <div style={{
                    width: `${amountDone * 100}%`,
                    background: `linear-gradient(to right, rgb(${rStart},${gStart},${bAlways}), rgb(${rRight},${gRight},${bAlways}))`
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
