"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep } from "../../../../../actions/usersActions";
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
        console.log("here");
    }

    render() {
        return (
            <div className="inline-block" styleName="onboarding-info ml-step">
                <div>
                    <div>{"Why gamble on your hires? We use machine learning, predictive data, and decades of psychology research to find the candidates who can take your company to the next level. Leave the data-sifting to us so you can focus on shooting for the stars."}</div>
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
        updateOnboardingStep
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(WhyItWorks);
