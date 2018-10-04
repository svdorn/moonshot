"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep, intercomEvent, addNotification } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";

import PsychSlider from "../../../evaluation/psychSlider";

import "../../dashboard.css";

class WhyItWorks extends Component {
    constructor(props) {
        super(props);

        this.next = this.next.bind(this);
        this.intercomMsg = this.intercomMsg.bind(this);
    }

    next = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, 4);
    }

    intercomMsg = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // trigger intercom event
        this.props.intercomEvent('whyItWorks', _id, verificationToken, null);

    }

    render() {
        return (
            <div className="inline-block" styleName="onboarding-info ml-step">
                <div>
                    <div className="primary-cyan font20px">
                        {"Team of Data Scientists"}
                    </div>
                    <div>
                        {"Why gamble on your hires? We use machine learning, predictive data, and decades of psychology research to find the candidates who can take your company to the next level."}
                    </div>
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>Got it</div>
                        </div>
                        <div onClick={this.intercomMsg}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>More info</div>
                        </div>
                    </div>
                </div>
                <div>
                    <img
                        src={`/icons/Astrobot${this.props.png}`}
                        styleName="astrobot-image"
                    />
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateOnboardingStep,
        intercomEvent,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(WhyItWorks);
