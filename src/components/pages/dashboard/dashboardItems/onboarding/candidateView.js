"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../../actions/usersActions";
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
    }


    next = () => {
        this.setState({ step: "gca" });
    }


    psychView() {
        return (
            <div className="inline-block" styleName="onboarding-info candidate-view">
                <div>
                    <div>{"Candidates will take a 12-minute quiz that determines their personality. It will involve a series of questions that look like this:"}</div>
                    <div
                        className={button.cyan}
                        styleName="got-it-button"
                        onClick={this.next.bind(this)}
                    >
                        Got It
                    </div>
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
                    <div>{"Candidates will then take a 12-minute pattern recognition test. Results on this type of test are highly correlated with ability to:"}</div>
                    <ul>
                        <li>Solve Problems</li>
                        <li>Learn Quickly</li>
                        <li>Adapt to Complex Situations</li>
                    </ul>
                    <div
                        className={button.cyan}
                        styleName="got-it-button"
                        onClick={this.next.bind(this)}
                    >
                        Got It
                    </div>
                </div>
                <div className="gca-example">
                    <div>Select the image that completes the pattern:</div>
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

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(CandidateView);
