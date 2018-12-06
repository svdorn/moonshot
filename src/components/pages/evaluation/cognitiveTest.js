"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import {
    closeNotification,
    answerEvaluationQuestion,
    answerOutOfTimeCognitive,
    addNotification
} from "../../../actions/usersActions";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";
import { htmlDecode } from "../../../miscFunctions";
import { Button, CheckBox } from "../../miscComponents";

import test from "./cognitiveTest.css";
import evalCSS from "./evaluation.css";

class CognitiveTest extends Component {
    constructor(props) {
        super(props);

        const { textColor } = props;
        const imgColor = !textColor
            ? "White"
            : textColor.toLowerCase() == "white" || props.textColor.toLowerCase() == "#ffffff"
                ? "White"
                : "Black";

        this.state = {
            selectedId: undefined,
            questionId: undefined,
            agreedToTerms: false,
            // the time they have left to finish the questions
            timer: undefined,
            // whether the timer is done or not
            outOfTime: false,
            // the timeouts
            timeouts: [],
            loading: false,
            imgColor
        };
    }

    componentDidMount() {
        if (
            this.props.questionInfo &&
            !(this.props.questionInfo.questionId === this.state.questionId) &&
            this.props.questionInfo.rpm
        ) {
            this.setState({ questionId: this.props.questionInfo.questionId }, () => {
                this.getTimer(true);
            });
        }
    }

    componentDidUpdate() {
        if (
            this.props.questionInfo &&
            !(this.props.questionInfo.questionId === this.state.questionId) &&
            this.props.questionInfo.rpm
        ) {
            this.setState({ questionId: this.props.questionInfo.questionId }, () => {
                this.getTimer(true);
            });
        }
    }

    // when any answer is clicked
    selectAnswer(selectedId) {
        this.setState({ ...this.state, selectedId });
    }

    // move on to the next question (or start/finish the test)
    nextQuestion = () => {
        if (
            (typeof this.state.selectedId !== "undefined" || this.state.outOfTime) &&
            !this.props.loading
        ) {
            const selectedId = this.state.selectedId;
            this.resetTimer(() => {
                this.props.answerEvaluationQuestion("Cognitive", {
                    ...this.props.credentials,
                    selectedId
                });
            });
        }
    };

    startTest = () => {
        // can only start test if have agreed to cognitive terms
        if (this.state.agreedToTerms) {
            this.props.answerEvaluationQuestion("Cognitive", this.props.credentials);
        }
    };

    // agree to the terms to taking the test
    agreeToTerms = () => {
        if (this.state.agreedToTerms) {
            this.setState({ showExample: true });
        }
    };

    handleCheckMarkClick = () => {
        this.setState({ agreedToTerms: !this.state.agreedToTerms });
    };

    // generic error
    errorPage() {
        return <div>Something is wrong. Try refreshing.</div>;
    }

    // rendered if the user is on the first skill test of an eval and hasn't agreed to the test terms
    introPage() {
        // if the user agreed to the terms and is seeing an example now
        if (this.state.showExample) {
            return (
                <div
                    styleName={"evalCSS.eval-portion-intro"}
                    className="skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450"
                >
                    <div className="font24px">
                        <span style={{ color: this.props.primaryColor }}>Pattern Recognition</span>
                    </div>
                    <div>
                        <p>
                            You will be given a series of problems. Each will contain 8 images
                            arranged in a 3 x 3 grid. These shapes make up some pattern. The grid is
                            missing an the image in the bottom right.
                        </p>
                        <p>
                            Your goal is to find the image that matches the pattern. In the example
                            there are only two options to choose from, but in the real test there
                            will be 8 options.
                        </p>
                        <p>
                            Click the option that you think is correct and click the {'"Next"'}{" "}
                            button before time runs out.
                        </p>
                        <p>
                            Once you click {'"Start"'} you have to finish the full test at the same
                            time or you will lose points.
                        </p>
                        <p>
                            The test is meant to be very difficult, so do your best but don{"'"}t
                            worry if you don{"'"}t get them all!
                        </p>
                        <p>Good luck!</p>
                        <p style={{ marginBottom: "0" }}>
                            (P.S. The process of elimination doesn{"'"}t usually work out so great.
                            It{"'"}s generally better to figure out what you think the answer should
                            be before looking at the solutions.)
                        </p>
                    </div>
                    <img
                        src={`/images/cognitiveTest/RPM-Example-2-${this.state.imgColor}${
                            this.props.png
                        }`}
                        styleName="test.example-rpm"
                    />
                    <br />
                    {this.props.loading ? (
                        <CircularProgress color="primary" style={{ marginBottom: "40px" }} />
                    ) : (
                        <Button onClick={this.startTest} style={{ marginBottom: "40px" }}>
                            Start
                        </Button>
                    )}
                </div>
            );
        }
        // if the user needs to agree to the user agreement first
        else {
            return (
                <div
                    styleName="evalCSS.eval-portion-intro"
                    className="skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450"
                >
                    <div className="font24px">
                        <span style={{ color: this.props.primaryColor }}>Pattern Recognition</span>
                    </div>
                    <div>
                        <p>
                            This is the pattern recognition portion of the evaluation. Here you will
                            be tested on your aptitude in problem solving.
                        </p>
                        <p>
                            <span style={{ color: this.props.primaryColor }}>
                                TIME IS A FACTOR.
                            </span>{" "}
                            You have 60 seconds to complete each question. After this, whatever
                            answer you have will be saved. If you have no answer, the question will
                            be marked wrong.
                        </p>
                        <p>
                            <span style={{ color: this.props.primaryColor }}>DO NOT</span> exit this
                            tab, go to another tab, or leave this window. Each time you do, your
                            overall score will decrease.
                        </p>
                        <p>The test will take no more than 12 minutes.</p>
                    </div>
                    <br />
                    <div>
                        <CheckBox
                            checked={this.state.agreedToTerms}
                            onClick={this.handleCheckMarkClick}
                            size="medium"
                            style={{ position: "absolute", marginTop: "3px" }}
                        />
                        <p style={{ padding: "0 40px" }}>
                            By checking this box, I agree that I will answer the questions without
                            help from anyone or any external resources and that if I were to be
                            discovered doing so, at any point, all my results are void.
                        </p>
                    </div>
                    <br />
                    {this.props.loading ? (
                        <CircularProgress color="primary" style={{ marginBottom: "40px" }} />
                    ) : (
                        <Button
                            disabled={!this.state.agreedToTerms}
                            style={{ marginBottom: "40px" }}
                            onClick={this.agreeToTerms}
                        >
                            Continue
                        </Button>
                    )}
                </div>
            );
        }
    }

    // get the time remaining for the question - initial call is a boolean for
    // whether this is being called on page load
    getTimer(initialCall) {
        if (!this.state.timer) {
            const questionInfo = this.props.questionInfo;
            const time = new Date().getTime() - new Date(questionInfo.startDate).getTime();
            var seconds = 60 - Math.floor(time / 1000);
        } else {
            var seconds = this.state.timer - 1;
        }

        // If there is no time left, set outOfTime to be true and don't continue counting down
        if (seconds <= 0) {
            this.setState({ outOfTime: true }, () => {
                if (!initialCall) {
                    // after setting that the user is out of time, submit their current answer
                    this.props.answerOutOfTimeCognitive({
                        ...this.props.credentials,
                        selectedId: this.state.selectedId
                    });
                }
            });
        } else {
            let self = this;
            this.setState(
                {
                    timer: seconds,
                    outOfTime: false,
                    loading: false
                },
                () => {
                    self.state.timeouts.push(
                        setTimeout(function() {
                            self.getTimer(false);
                        }, 1000)
                    );
                }
            );
        }
    }

    resetTimer(callback) {
        for (let i = 0; i < this.state.timeouts.length; i++) {
            clearTimeout(this.state.timeouts[i]);
        }
        this.setState(
            {
                timer: undefined,
                outOfTime: false,
                selectedId: undefined,
                loading: true
            },
            callback
        );
    }

    // main content with the quiz and questions
    createContent() {
        let self = this;

        const questionInfo = this.props.questionInfo;

        const answers = questionInfo.options.map(option => {
            const isSelected = this.state.selectedId === option._id;
            const selectedClass = isSelected ? " selected" : "";
            const outOfTimeClass = this.state.outOfTime ? " outOfTime" : "";
            const imgSrc = option.src + this.props.png;
            return (
                <div
                    key={option.src}
                    onClick={this.state.outOfTime ? null : () => self.selectAnswer(option._id)}
                    styleName={"test.multipleChoiceAnswer" + selectedClass + outOfTimeClass}
                >
                    <div styleName={"test.multipleChoiceCircle" + selectedClass + outOfTimeClass}>
                        <div />
                    </div>
                    <div styleName="test.answersImg">
                        <img src={imgSrc} />
                    </div>
                </div>
            );
        });

        const canContinue =
            !this.props.loading && (!!this.state.selectedId || this.state.outOfTime);

        const rpmSrc = questionInfo.rpm + this.props.png;

        let timer = "00";
        if (this.state.timer) {
            const time = this.state.timer;
            if (time < 10) {
                timer = "0" + time;
            } else {
                timer = time;
            }
        }

        return (
            <div className="font16px font14pxUnder600 font12pxUnder450">
                {this.state.loading ? (
                    <div className="secondary-gray">Loading next question...</div>
                ) : (
                    <div>
                        {this.state.outOfTime ? (
                            <div styleName="test.error-red">
                                Out of time - please advance to the next question.
                            </div>
                        ) : (
                            <div className="secondary-gray">0:{timer}</div>
                        )}
                        <div className="marginBottom40px">
                            <img styleName="test.rpmImg" src={rpmSrc} />
                        </div>
                        <div className="center" style={{ maxWidth: "1000px", margin: "auto" }}>
                            {answers}
                        </div>
                        <Button
                            disabled={!canContinue}
                            onClick={this.nextQuestion}
                            style={{ margin: "30px 0 50px" }}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    render() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return null;
        }

        // all info about the current question to answer
        const questionInfo = this.props.questionInfo;

        // if user has never done a cognitive test before, show them the legalese stuff
        if (this.props.showIntro && !currentUser.agreedToSkillTerms) {
            return this.introPage(true);
        }

        // if the user has taken a cognitive test before
        else if (this.props.showIntro) {
            return this.introPage(false);
        }

        // if the question has not been loaded yet
        else if (!questionInfo) {
            return <CircularProgress color="primary" />;
        }

        // the typical interface with the slider
        else if (questionInfo.rpm) {
            return this.createContent();
        }

        // something is up if we get here
        else {
            return this.errorPage();
        }
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeNotification,
            answerEvaluationQuestion,
            answerOutOfTimeCognitive,
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        evaluationState: state.users.evaluationState,
        questionInfo: state.users.evaluationState.componentInfo,
        showIntro: state.users.evaluationState.showIntro,
        loading: state.users.loadingSomething,
        png: state.users.png,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CognitiveTest);
