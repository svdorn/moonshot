"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import {
    closeNotification,
    answerEvaluationQuestion,
    addNotification
} from "../../../actions/usersActions";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";
import StyledContent from "../../childComponents/styledContent";
import { htmlDecode } from "../../../miscFunctions";
import { Button } from "../../miscComponents";

import "./evaluation.css";

class SkillTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            agreedToTerms: false
        };
    }

    // shuffles a general array, used for shuffling questions around
    shuffle(arr) {
        let array = arr.slice();
        let currentIndex = array.length,
            temporaryValue,
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    // when any answer is clicked
    selectAnswer(selectedId) {
        this.setState({ ...this.state, selectedId });
    }

    // move on to the next question (or start/finish the test)
    nextQuestion = () => {
        if (typeof this.state.selectedId !== "undefined" && !this.props.loading) {
            this.props.answerEvaluationQuestion("Skill", {
                ...this.props.credentials,
                selectedId: this.state.selectedId
            });
        }
    };

    // when new question is here, set the current answer as nonexistent
    componentDidUpdate(prevProps, prevState) {
        try {
            if (prevProps.questionInfo._id !== this.props.questionInfo._id) {
                this.setState({ selectedId: undefined });
            }
        } catch (e) {
            /* if this fails it's probably because there is no question info */
        }
    }

    startTest = () => {
        // can only start test if have agreed to skill terms now or in past
        const { currentUser } = this.props;
        if ((currentUser && currentUser.agreedToSkillTerms) || this.state.agreedToTerms) {
            this.props.answerEvaluationQuestion("Skill", this.props.credentials);
        }
    };

    handleCheckMarkClick() {
        this.setState({ agreedToTerms: !this.state.agreedToTerms });
    }

    // used if the user has been through a skill in the past but hasn't started this one yet
    introPage() {
        return (
            <div className="center primary-white">
                <h4>Skill Test</h4>
                <p>Ready for another skill test?</p>
                <p>
                    Don{"'"}t forget, your questions are timed, so don{"'"}t take a nap in the
                    middle.
                </p>
                <p>
                    Let{"'"}s see what you{"'"}ve got!
                </p>
                {this.props.loading ? (
                    <CircularProgress color="primary" style={{ marginBottom: "40px" }} />
                ) : (
                    <Button style={{ marginBottom: "40px" }} onClick={this.startTest}>
                        Begin
                    </Button>
                )}
            </div>
        );
    }

    // rendered if the user is on the first skill test of an eval and hasn't agreed to the test terms
    userAgreementPage() {
        return (
            <div
                styleName="eval-portion-intro"
                className="skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450"
            >
                <div className="font24px" style={{ marginBottom: "20px" }}>
                    <span style={{ color: this.props.primaryColor }}>Skills</span>
                </div>
                <div>
                    <p>
                        This is the skills portion of the evaluation. Here you will be tested on
                        your aptitude in one or more skills.
                    </p>
                    <p>
                        <span style={{ color: this.props.primaryColor }}>TIME IS A FACTOR.</span>{" "}
                        After 60 seconds for each question, your score for that question will
                        decrease as time goes on.
                    </p>
                    <p>
                        <span style={{ color: this.props.primaryColor }}>DO NOT</span> exit this
                        tab, go to another tab, or leave this window. Each time you do, your overall
                        score will decrease.
                    </p>
                    <p>
                        The number of questions in the skills test will change as you go depending
                        on a number of factors. It will end once a score has been determined, but
                        each test should take no more than ten minutes.
                    </p>
                </div>
                <br />
                <div>
                    <div
                        className="checkbox mediumCheckbox whiteCheckbox"
                        onClick={this.handleCheckMarkClick.bind(this)}
                    >
                        <img
                            alt=""
                            className={"checkMark" + this.state.agreedToTerms}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                        />
                    </div>
                    <p style={{ padding: "0 40px" }}>
                        By checking this box, I agree that I will answer the questions without help
                        from anyone or any external resources and that if I were to be discovered
                        doing so, at any point, all my results are void.
                    </p>
                </div>
                <br />
                {this.props.loading ? (
                    <CircularProgress color="primary" style={{ marginBottom: "40px" }} />
                ) : (
                    <Button
                        style={{ marginBottom: "40px" }}
                        onClick={this.startTest}
                        disabled={this.state.agreedToTerms}
                    >
                        Begin
                    </Button>
                )}
            </div>
        );
    }

    // main content with the quiz and questions
    createContent() {
        let self = this;

        const questionInfo = this.props.questionInfo;

        const answers = questionInfo.options.map(option => {
            const isSelected = this.state.selectedId === option._id;
            const selectedClass = isSelected ? " selected" : "";
            return (
                <div
                    key={option.body}
                    onClick={() => self.selectAnswer(option._id)}
                    styleName="multiple-choice-answer"
                >
                    <div styleName={"multiple-choice-circle" + selectedClass}>
                        <div />
                    </div>
                    <div styleName="multiple-choice-option-text">{htmlDecode(option.body)}</div>
                </div>
            );
        });

        const canContinue = typeof this.state.selectedId !== "undefined" && !this.props.loading;

        // otherwise, good to go - show them the question
        return (
            <div className="font16px font14pxUnder600 font12pxUnder450">
                <StyledContent contentArray={questionInfo.body} style={{ marginBottom: "40px" }} />
                {answers}
                <Button
                    disabled={!canContinue}
                    onClick={this.nextQuestion}
                    style={{ marginBottom: "50px" }}
                >
                    Next
                </Button>
            </div>
        );
    }

    render() {
        const { currentUser } = this.props;

        // all info about the current question to answer
        const questionInfo = this.props.questionInfo;

        // if user has never done a skill test before, show them the legalese stuff
        if (this.props.showIntro && (!currentUser || !currentUser.agreedToSkillTerms)) {
            return this.userAgreementPage();
        }

        // if the user has taken a skill test before
        else if (this.props.showIntro) {
            return this.introPage();
        }

        // if the question has not been loaded yet
        else if (!questionInfo) {
            return <CircularProgress color="secondary" />;
        }

        // the typical interface with the slider
        else if (questionInfo.body) {
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
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        questionInfo: state.users.evaluationState.componentInfo,
        showIntro: state.users.evaluationState.showIntro,
        loading: state.users.loadingSomething,
        png: state.users.png,
        primaryColor: state.users.primaryColor
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SkillTest);
