"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { answerAdminQuestion } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";
import { CircularProgress, Slider } from "material-ui";

class AdminQuestions extends Component {
    constructor(props) {
        super(props);

        console.log(props);

        this.state = {
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1,
            credentials: {
                userId: props.currentUser._id,
                verificationToken: props.currentUser.verificationToken
            }
        };
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    selectAnswer(selectedId, selectedText) {
        this.setState({...this.state, selectedId, selectedText});
    }


    handleSlider = (event, sliderValue) => {
        this.setState({sliderValue});
    };


    nextQuestion() {
        const question = this.props.questionInfo;
        // don't do anything if nothing is selected on a multiple choice question
        if (!this.state.question || (this.state.question.questionType === "multipleChoice" && this.state.selectedId === undefined)) {
            return;
        }

        const { sliderValue, selectedId, selectedText } = this.state;

        this.props.answerAdminQuestion({
            ...this.state.credentials,
            sliderValue, selectedId, selectedText
        });

        const newState = {
            ...this.state,
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1
        }

        this.setState(newState);
    }


    makeSliderQuestion() {
        const question = this.props.questionInfo;
        let sliderNumbers = [];
        const lowRange = question.sliderMin;
        const highRange = question.sliderMax;
        for (let number = lowRange; number <= highRange; number++) {
            sliderNumbers.push(
                <div key={`sliderNumber${number}`} className="adminQuestions sliderNumber">
                    { number }
                </div>
            );
        }
        return (
            <div className="adminQuestionsContainer">
                <div className="adminQuestions question">{question.questionText}</div>
                <div className="center">
                    <div className="center adminQuestions gradingSliderContainer">
                        <Slider min={question.sliderMin}
                                max={question.sliderMax}
                                step={1}
                                value={this.state.sliderValue}
                                onChange={this.handleSlider}
                        />
                        <div className="adminQuestions sliderNumbers noselect">
                            { sliderNumbers }
                        </div>
                    </div>
                </div>
                <div className="skillContinueButton marginBottom50px marginTop20px"
                     onClick={this.nextQuestion.bind(this)}
                >
                    Next
                </div>
            </div>
        );
    }


    makeMultipleChoiceQuestion() {
        const self = this;
        const question = this.props.questionInfo;

        if (!Array.isArray(question.options)) {
            return null;
        }

        let options = question.options.map(option => {
            const isSelected = this.state.selectedId === option._id;
            const selectedClass = isSelected ? " selected" : "";
            return (
                <div key={option.body}
                     onClick={() => self.selectAnswer(option._id, option.body)}
                     className={"skillMultipleChoiceAnswer" + selectedClass}
                >
                    <div className={"skillMultipleChoiceCircle" + selectedClass}><div/></div>
                    <div className="skillMultipleChoiceOptionText">{option.body}</div>
                </div>
            );
        });

        const buttonClass = this.state.selectedId === undefined ? "disabled skillContinueButton" : "skillContinueButton"

        return (
            <div>
                <div className="adminQuestions question">{question.questionText}</div>
                { options }
                <div className={"marginBottom50px " + buttonClass} onClick={this.nextQuestion.bind(this)}>Next</div>
            </div>
        );
    }


    makeIntroPage() {
        return (
            <div className="evalPortionIntro center">
                <div/>
                <div>
                    <p>You will be asked a series of short questions for legal and administrative purposes.</p>
                    <p>None of your answers will be shown to employers, nor will they affect your candidacy or employment status.</p>
                    <p>Once again, your answers are collected for legal purposes only.</p>
                </div>
                <br/>
                <div style={{marginBottom: "40px", width: "initial"}} className={"skillContinueButton"} onClick={this.begin.bind(this)}>Begin</div>
            </div>
        )
    }


    // start the admin questions
    begin() { this.props.answerAdminQuestion(this.state.credentials); }


    render() {
        let self = this;
        const question = this.props.questionInfo;

        console.log("question: ", question);

        // the main content that will be shown in the page
        let content = null;

        // if user has not started the admin questions before, show them the intro page
        if (this.props.showIntro) { content = this.makeIntroPage(); }

        else if (!question) {
            content = (
                <CircularProgress color="#FB553A" />
            );
        }

        else {
            const questionType = question.questionType;

            if (questionType === "slider") {
                content = this.makeSliderQuestion();
            }

            else if (questionType === "multipleChoice") {
                content = this.makeMultipleChoiceQuestion();
            }

            // TODO: remove, do something else here
            else {
                content = <div>WHERE AM I</div>
            }
        }

        return content
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        answerAdminQuestion
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        questionInfo: state.users.evaluationState.componentInfo,
        showIntro: state.users.evaluationState.showIntro
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminQuestions);
