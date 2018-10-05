"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";

import PsychSlider from "../../../evaluation/psychSlider";

import "../../dashboard.css";
import { button } from "../../../../../classes";


class CandidateView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: "psych"
        };

        this.next = this.next.bind(this);
        this.intercomMsg = this.intercomMsg.bind(this);
    }


    next = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // if currently seeing the psych info, show the gca info
        if (this.state.step === "psych") { this.setState({ step: "gca" }); }
        // otherwise go to the next onboarding step
        else { this.props.updateOnboardingStep(_id, verificationToken, 2); }
    }

    intercomMsg = () => {
        console.log("here");
    }

    emojiButtons() {
        return (
            <div styleName="emoji-buttons">
                <div onClick={this.next}>
                    <img
                        src={`/icons/emojis/ThumbsUp${this.props.png}`}
                    />
                    <div>Got it</div>
                </div>
                <div onClick={this.intercomMsg}>
                    <img
                        src={`/icons/emojis/Face${this.props.png}`}
                    />
                    <div>More info</div>
                </div>
            </div>
        );
    }


    psychView() {
        return (
            <div className="inline-block" styleName="onboarding-info candidate-view">
                <div>
                    <div>{"Candidates will take a 12-minute quiz that evaluates their personality. It will involve a series of questions that look like the following:"}</div>
                    { this.emojiButtons() }
                </div>
                <div className="noselect">
                    <div>Flattery is important to getting ahead:</div>
                    <div styleName="ex-question-answers">
                        <div>Definitely</div>
                        <div>Nope</div>
                    </div>
                    <PsychSlider
                        width={200}
                        height={100}
                        backgroundColor={"#393939"}
                        className="center"
                        updateAnswer={() => {}}
                        questionId={"1"}
                    />
                </div>
            </div>
        );
    }


    gcaView() {
        return (
            <div className="inline-block" styleName="onboarding-info candidate-view">
                <div>
                    <div>{"Candidates will then take a short cognitive test that demonstrates their ability to:"}</div>
                    <ul>
                        <li>Solve Problems</li>
                        <li>Learn Quickly</li>
                        <li>Adapt to Complex Situations</li>
                    </ul>
                    { this.emojiButtons() }
                </div>
                <div className="gca-example">
                    <div>(Easy example) Select the image that completes the pattern:</div>
                    <img
                        src={`/images/cognitiveTest/RPM-Example${this.props.png}`}
                        styleName="gca-image"
                    />
                </div>
            </div>
        );
    }


    render() {
        switch (this.state.step) {
            case "psych": return this.psychView();
            case "gca": return this.gcaView();
            default: return <div>Here</div>;
        }
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


export default connect(mapStateToProps, mapDispatchToProps)(CandidateView);
