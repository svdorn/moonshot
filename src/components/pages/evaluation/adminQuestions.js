"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { answerEvaluationQuestion, skipAdminQuestions } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";
import { CircularProgress, Slider } from "material-ui";
import { button } from "../../../classes";

import "./evaluation.css";

class AdminQuestions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1,
            otherInput: "",
            otherInputSelected: false
        };
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    selectAnswer(selectedId, selectedText, otherInputSelected) {
        this.setState({...this.state, selectedId, selectedText, otherInputSelected});
    }


    // change response to an "Other" question
    changeOtherInput(e) {
        // get the input the user entered
        const otherInput = e.target.value;
        // save it to state
        this.setState({ otherInput });
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

        let { sliderValue, selectedId, selectedText } = this.state;

        // take the input value if Other selected
        if (this.state.otherInputSelected) { selectedText = this.state.otherInput; }

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
                    <div className={`${button.orangeRed} marginBottom50px marginTop20px`}
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

        // add all the options to the question
        let options = question.options.map(option => {
            const isSelected = this.state.selectedId === option._id;
            const selectedClass = isSelected ? " selected" : "";

            const inputArea = !option.includeInputArea ? null : (
                <input
                    type="text"
                    styleName="other-input"
                    placeholder="Please Specify"
                    onChange={this.changeOtherInput.bind(this)}
                    value={this.state.otherInput}
                />
            );

            return (
                <div key={option.body}
                     onClick={() => self.selectAnswer(option._id, option.body, option.includeInputArea)}
                     className={"skillMultipleChoiceAnswer" + selectedClass}
                >
                    <div className={"skillMultipleChoiceCircle" + selectedClass}><div/></div>
                    <div className="skillMultipleChoiceOptionText">{option.body}</div>
                    {inputArea}
                </div>
            );
        });

        // add the option not to answer
        const PREFER_NOT = "Prefer Not to Answer";
        const isSelected = this.state.selectedId === PREFER_NOT;
        const selectedClass = isSelected ? " selected" : "";
        options.push(
            <div key={PREFER_NOT}
                 onClick={() => self.selectAnswer(PREFER_NOT, PREFER_NOT)}
                 className={"skillMultipleChoiceAnswer" + selectedClass}
            >
                <div className={"skillMultipleChoiceCircle" + selectedClass}><div/></div>
                <div className="skillMultipleChoiceOptionText">{PREFER_NOT}</div>
            </div>
        );

        const buttonClass = this.state.selectedId === undefined ? button.disabled : button.orangeRed;

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
                    <p>The following is a series of questions administered by Moonshot Insights to collect pertinent information for regulatory purposes. Your answers will only be used for government reporting purposes and will only be presented in de-identified form to maintain confidentiality. Answers you provide will not affect your candidacy or employment status.</p>
                    <p>The following questions are not part of your application or administered by the employer you are applying to work for. You can voluntarily answer the questions and refusal to provide them will not subject you to any adverse treatment.</p>
                    <p>Once again, your answers are collected for government reporting purposes only and you can choose not to answer any or all of the questions.</p>
                </div>
                <br/>
                {this.props.loading ?
                    <CircularProgress color="#ff582d" />
                    :
                    <div style={{textAlign: "center"}}>
                        <div
                            style={{width: "initial", margin: "10px"}}
                            className={button.orangeRed}
                            onClick={this.begin.bind(this)}
                        >
                            Begin
                        </div>
                        <br/>
                        <div
                            className="inline-block underline font14px pointer"
                            style={{marginBottom: "40px"}}
                            onClick={this.skipAdminQuestions.bind(this)}
                        >
                            Click here if you prefer not to answer
                        </div>
                    </div>
                }
            </div>
        )
    }


    // start the admin questions
    begin() { this.props.answerEvaluationQuestion("Admin", this.props.credentials); }


    // skip all the admin questions
    skipAdminQuestions() { this.props.skipAdminQuestions(this.props.credentials); }


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
        answerEvaluationQuestion,
        skipAdminQuestions
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
