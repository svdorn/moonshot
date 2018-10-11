"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep, intercomEvent } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";
import colors from "../../../../../colors";

import PsychSlider from "../../../evaluation/psychSlider";

import "../../dashboard.css";
import { button } from "../../../../../classes";


// the example psych questions
const questions = [
    {
        text: <span>Your friend offers to take you on a motorcycle ride, but it{"'"}s storming<span styleName="not-small-mobile"> out</span>:</span>,
        leftOption: "I'll pass",
        rightOption: "Let's go!"
    },
    {
        text: "Being one with nature:",
        leftOption: "Not my thing",
        rightOption: "I am nature"
    },
    {
        text: "At restaurants you order:",
        leftOption: "Your tried and true",
        rightOption: "Something new"
    }
];
const psychSliders = questions.map((q, index) => {
    return (
        <div>
            <div styleName="ex-question-text">{ q.text }</div>
            <div styleName="ex-question-answers">
                <div>{ q.leftOption }</div>
                <div>{ q.rightOption }</div>
            </div>
            <PsychSlider
                width={200}
                height={100}
                backgroundColor={"#393939"}
                color1={colors.primaryCyan}
                color2={colors.primaryPurpleLight}
                className="center"
                updateAnswer={() => {}}
                questionId={index + 1}
            />
        </div>
    );
});


class CandidateView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // whether we're on psych or gca view
            step: "psych",
            // index of the psych question we're currently on
            questionIndex: 0
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

    intercomMsg = (instance) => {
        const { _id, verificationToken } = this.props.currentUser;
        // trigger intercom event
        this.props.intercomEvent(`onboarding-step-1${instance}`, _id, verificationToken, null);
    }

    emojiButtons(instance) {
        return (
            <div styleName="emoji-buttons">
                <div onClick={this.next}>
                    <img
                        src={`/icons/emojis/ThumbsUp${this.props.png}`}
                    />
                    <div>Got it</div>
                </div>
                <div onClick={() => this.intercomMsg(instance)}>
                    <img
                        src={`/icons/emojis/Face${this.props.png}`}
                    />
                    <div>More info</div>
                </div>
            </div>
        );
    }


    // choose which example psych question you want to see
    choosePsychQuestion = (index) => {
        if (0 <= index && index < questions.length) {
            this.setState({ questionIndex: Math.round(index) });
        }
    }


    // go forward or backward to a different psych question
    navPsychQuestions = (direction) => {
        let newIndex = this.state.questionIndex;
        if (direction === "back") {
            newIndex--;
            if (newIndex < 0) { newIndex = questions.length - 1; }
        } else {
            newIndex++;
            if (newIndex >= questions.length) { newIndex = 0; }
        }

        this.setState({ questionIndex: newIndex });
    }


    psychView() {
        const { questionIndex } = this.state;

        let navArea = [];
        const selectedStyle = {
            background: `linear-gradient(to bottom, ${colors.primaryWhite}, ${colors.primaryCyan})`
        };
        // add the circles you can navigate with
        for (let navCircleIdx = 0; navCircleIdx < psychSliders.length; navCircleIdx++) {
            navArea.push(
                <div
                    styleName="nav-circle"
                    onClick={this.choosePsychQuestion.bind(this, navCircleIdx)}
                    style={questionIndex === navCircleIdx ? selectedStyle : {}}
                    key={`psych question ${navCircleIdx}`}
                />
            )
        }
        // add the left and right arrows
        const arrowStyle = { width: "12px", height: "12px", display: "inline-block", margin: "2px 8px" };
        navArea.unshift(
            <div
                className="left circleArrowIcon arrow-2px"
                style={arrowStyle}
                onClick={this.navPsychQuestions.bind(this, "back")}
                key="back arrow"
            />
        );
        navArea.push(
            <div
                className="right circleArrowIcon arrow-2px"
                style={arrowStyle}
                onClick={this.navPsychQuestions.bind(this, "next")}
                key="next arrow"
            />
        );


        return (
            <div className="inline-block" styleName="onboarding-info candidate-view">
                <div>
                    <div className="primary-cyan font18px" styleName="mobile-center title-margin text-padding">
                        Understand Personality
                    </div>
                    <div styleName="text-padding">
                        {"Candidates complete a series of questions so we can form archetypes and predict how they'll behave and fit in your work environment."}
                    </div>
                    { this.emojiButtons("a") }
                </div>
                <div className="noselect">
                    { psychSliders[this.state.questionIndex] }
                    <div style={{marginTop: "20px"}}>
                        { navArea }
                    </div>
                </div>
            </div>
        );
    }


    gcaView() {
        return (
            <div className="inline-block" styleName="onboarding-info candidate-view">
                <div>
                    <div className="primary-cyan font18px" styleName="mobile-center title-margin text-padding">
                        Evaluate Intellect
                    </div>
                    <div styleName="text-padding">
                        Candidates then complete a short quiz highly predictive
                        of job performance and growth potential that demonstates
                        their ability to
                        <span styleName="desktop-only">:</span>
                        <span styleName="mobile-only">
                            { " solve problems, learn quickly, and adapt to \
                            complex situations." }
                        </span>
                    </div>
                    <ul styleName="desktop-only">
                        <li>Solve Problems</li>
                        <li>Learn Quickly</li>
                        <li>Adapt to Complex Situations</li>
                    </ul>
                    { this.emojiButtons("b") }
                </div>
                <div className="gca-example">
                    <div className="left-align">Select the image that completes the pattern (easy example):</div>
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
        updateOnboardingStep,
        intercomEvent
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(CandidateView);
