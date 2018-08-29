"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { answerEvaluationQuestion } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";
import { CircularProgress, Slider } from "material-ui";

class AdminQuestions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1
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
        if (!question || !question.text || (question.questionType === "multipleChoice" && this.state.selectedId === undefined)) {
            return;
        }

        const { sliderValue, selectedId, selectedText } = this.state;

        this.props.answerEvaluationQuestion("Admin", {
            ...this.props.credentials,
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
                <div className="adminQuestions question">{question.text}</div>
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
                {this.props.loading ?
                    <CircularProgress color="ff582d" />
                    :
                    <div className="skillContinueButton marginBottom50px marginTop20px"
                         onClick={this.nextQuestion.bind(this)}
                    >
                        Next
                    </div>
                }
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
                <div className="adminQuestions question">{question.text}</div>
                { options }
                {this.props.loading ?
                    <CircularProgress color="#ff582d" />
                    :
                    <div
                        className={"marginBottom50px " + buttonClass}
                        onClick={this.nextQuestion.bind(this)}
                    >
                        Next
                    </div>
                }
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
                {this.props.loading ?
                    <CircularProgress color="#ff582d" />
                    :
                    <div
                        style={{marginBottom: "40px", width: "initial"}}
                        className={"skillContinueButton"}
                        onClick={this.begin.bind(this)}
                    >
                        Begin
                    </div>
                }
            </div>
        )
    }


    // start the admin questions
    begin() { this.props.answerEvaluationQuestion("Admin", this.props.credentials); }


    render() {
        // all info about the current question to answer
        const question = this.props.questionInfo;

        // if user has not started the admin questions before, show them the intro page
        if (this.props.showIntro) { return this.makeIntroPage(); }

        // if the question has not been loaded yet
        else if (!question) { return <CircularProgress color="#ff582d" />; }

        else {
            const questionType = question.questionType;

            // slider type question
            if (questionType === "slider") { return this.makeSliderQuestion(); }

            // multiple choice type question
            else if (questionType === "multipleChoice") {
                return this.makeMultipleChoiceQuestion();
            }

            // shouldn't be able to get here
            else { return <div>Something{"'"}s messed up. Try refreshing.</div> }
        }
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        answerEvaluationQuestion
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        questionInfo: state.users.evaluationState.componentInfo,
        showIntro: state.users.evaluationState.showIntro,
        loading: state.users.loadingSomething
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminQuestions);
