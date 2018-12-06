"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { answerEvaluationQuestion, skipAdminQuestions } from "../../../actions/usersActions";
import Select from "react-select";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";
import { Slider } from "material-ui";
import { CircularProgress } from "@material-ui/core";
import { Button } from "../../miscComponents";
import { darken } from "../../../miscFunctions";

import "./evaluation.css";

const dropDownStyles = {
    container: base => ({
        ...base,
        width: "25%",
        minWidth: "180px",
        display: "inline-block"
    }),
    option: base => ({
        ...base,
        color: "black"
    })
};

class AdminQuestions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1,
            otherInput: "",
            otherInputSelected: false,
            // goes in order from top level to bottom level
            dropDownSelected: []
        };
    }

    selectAnswer(selectedId, selectedText, otherInputSelected) {
        this.setState({ ...this.state, selectedId, selectedText, otherInputSelected });
    }

    // change response to an "Other" question
    changeOtherInput = e => {
        // get the input the user entered
        const otherInput = e.target.value;
        // save it to state
        this.setState({ otherInput });
    };

    handleSlider = (event, sliderValue) => {
        this.setState({ sliderValue });
    };

    nextQuestion = () => {
        const question = this.props.questionInfo;
        // can't submit if there is no question
        if (!question) {
            return;
        }

        // args that will be sent with POST method
        let apiArgs = { ...this.props.credentials };

        // don't submit if no answer is provided
        switch (question.questionType) {
            case "multipleChoice": {
                // if no value chosen, can't submit
                if (this.state.selectedId === undefined) {
                    return;
                }
                // add values to save to backend
                apiArgs.selectedId = this.state.selectedId;
                // take the input value if Other selected
                apiArgs.selectedText = this.state.otherInputSelected
                    ? this.state.otherInput
                    : this.state.selectedText;
                break;
            }
            case "dropDown": {
                // if no value is selected in the first drop down, can't submit
                if (!this.state.dropDownSelected[0]) {
                    return;
                }
                apiArgs.dropDownResponses = this.state.dropDownSelected;
            }
            // sliders can't have an invalid value
            case "slider": {
                apiArgs.sliderValue = this.state.sliderValue;
                break;
            }
            // if you get here, something has gone terribly wrong
            default: {
                return this.props.addNotification(
                    "Whoops, something went wrong. Try refreshing.",
                    "errorHeader"
                );
            }
        }

        // send answer to the backend
        this.props.answerEvaluationQuestion("Admin", apiArgs);

        const newState = {
            ...this.state,
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1,
            otherInput: "",
            dropDownSelected: []
        };

        this.setState(newState);
    };

    makeSliderQuestion() {
        const question = this.props.questionInfo;
        let sliderNumbers = [];
        const lowRange = question.sliderMin;
        const highRange = question.sliderMax;
        for (let number = lowRange; number <= highRange; number++) {
            sliderNumbers.push(
                <div key={`sliderNumber${number}`} className="adminQuestions sliderNumber">
                    {number}
                </div>
            );
        }
        return (
            <div styleName="adminQuestionsContainer">
                <div styleName="admin-question">{question.text}</div>
                <div className="center">
                    <div className="center" styleName="grading-slider-container">
                        <Slider
                            min={question.sliderMin}
                            max={question.sliderMax}
                            step={1}
                            value={this.state.sliderValue}
                            onChange={this.handleSlider}
                        />
                        <div className="admin-questions slider-numbers noselect">
                            {sliderNumbers}
                        </div>
                    </div>
                </div>
                {this.props.loading ? (
                    <CircularProgress color="primary" />
                ) : (
                    <Button style={{ margin: "20px auto 50px" }} onClick={this.nextQuestion}>
                        Next
                    </Button>
                )}
            </div>
        );
    }

    makeMultipleChoiceQuestion() {
        const self = this;
        const question = this.props.questionInfo;

        if (!Array.isArray(question.options)) return null;

        // add all the options to the question
        let options = question.options.map(option => {
            const isSelected = this.state.selectedId === option._id;
            const selectedClass = isSelected ? " selected" : "";

            // console.log("darken");

            const inputArea = !option.includeInputArea ? null : (
                <input
                    type="text"
                    styleName="other-input"
                    style={{
                        background: darken(this.props.backgroundColor),
                        color: this.props.textColor
                    }}
                    placeholder="Please Specify"
                    onChange={this.changeOtherInput}
                    value={this.state.otherInput}
                />
            );

            return (
                <div
                    key={option.body}
                    onClick={() =>
                        self.selectAnswer(option._id, option.body, option.includeInputArea)
                    }
                    styleName="multiple-choice-answer"
                >
                    <div
                        styleName={"multiple-choice-circle" + selectedClass}
                        style={{ backgroundColor: this.props.primaryColor }}
                    >
                        <div style={{ backgroundColor: this.props.backgroundColor }} />
                    </div>
                    <div styleName="multiple-choice-option-text">{option.body}</div>
                    {inputArea}
                </div>
            );
        });

        return (
            <div>
                <div styleName="admin-question">{question.text}</div>
                {options}
                {this.props.loading ? (
                    <CircularProgress color="primary" />
                ) : (
                    <Button
                        style={{ marginBottom: "50px" }}
                        disabled={this.state.selectedId === undefined}
                        onClick={this.nextQuestion}
                    >
                        Next
                    </Button>
                )}
            </div>
        );
    }

    makeDropDownsQuestion() {
        const self = this;
        // current question to answer
        const question = this.props.questionInfo;
        // if the user can go on to the next question, will look clickable
        const disabled = this.state.dropDownSelected.length < 1 || !this.state.dropDownSelected[0];
        // the list of drop downs to render
        const dropDowns = [];
        // the drop down we are currently dealing with
        let currDropDown = question.dropDown;
        // start at the first (top) drop down menu
        let level = 0;
        // whether there is another drop down to add further down the drop down tree
        let addAnotherDropDown = true;

        // go through every drop down and sub drop down
        while (addAnotherDropDown) {
            // the options for the drop down
            const options = currDropDown.options.map((option, index) => {
                return { value: option.body, label: option.body, index, optionId: option._id };
            });

            const placeholder = { level };

            // add the drop down to the list of them
            dropDowns.push(
                <div style={{ margin: "10px" }} key={`dropdown-${level}`}>
                    {!currDropDown.title ? null : (
                        <div
                            style={{ textAlign: "center", display: "inline-block", width: "120px" }}
                        >
                            {currDropDown.title}:
                        </div>
                    )}
                    <Select
                        value={this.state.dropDownSelected[level]}
                        onChange={selectedOption =>
                            this.handleDropDownChange(placeholder.level, selectedOption)
                        }
                        options={options}
                        styles={dropDownStyles}
                        key={`dropdown${level}-${currDropDown.title}`}
                    />
                </div>
            );

            // assume there isn't another drop down to render
            addAnotherDropDown = false;

            // if an option is selected for this level, check if there is a sub dropdown for it
            if (this.state.dropDownSelected[level]) {
                // get the full object of the option that is selected
                const selectedOption =
                    currDropDown.options[this.state.dropDownSelected[level].index];
                // get the sub drop down of that option
                currDropDown = selectedOption.subDropDown;
                // check that it is a legit drop down
                if (
                    typeof currDropDown === "object" &&
                    Array.isArray(currDropDown.options) &&
                    currDropDown.options.length > 0
                ) {
                    // if so, we'll want to add it
                    addAnotherDropDown = true;
                }
            }

            // go a level down the drop down tree
            level++;
        }

        return (
            <div>
                <div styleName="admin-question">{question.text}</div>
                <div className="center" style={{ marginBottom: "40px" }}>
                    {dropDowns}
                </div>
                {this.props.loading ? (
                    <CircularProgress color="primary" />
                ) : (
                    <Button
                        style={{ marginBottom: "50px" }}
                        disabled={disabled}
                        onClick={this.nextQuestion}
                    >
                        Next
                    </Button>
                )}
            </div>
        );
    }

    // select a drop down value
    handleDropDownChange(level, selectedOption) {
        // if an invalid argument is provided, return
        if (typeof selectedOption !== "object" || !selectedOption.value) {
            return;
        }
        // add the info to the array of selected items, removing anything past
        // it in the tree; second arg is null to reset the next value
        const dropDownSelected = this.state.dropDownSelected
            .slice(0, level)
            .concat([selectedOption, null]);
        // save the options
        this.setState({ dropDownSelected });
    }

    makeIntroPage() {
        return (
            <div className="center" styleName="eval-portion-intro">
                <div />
                <div>
                    <p>
                        The following is a series of questions administered by Moonshot Insights to
                        collect pertinent information for regulatory purposes. Your answers will
                        only be used for government reporting purposes and will only be presented in
                        de-identified form to maintain confidentiality. Answers you provide will not
                        affect your candidacy or employment status.
                    </p>
                    <p>
                        The following questions are not part of your application or administered by
                        the employer you are applying to work for. You can voluntarily answer the
                        questions and refusal to provide them will not subject you to any adverse
                        treatment.
                    </p>
                    <p>
                        Once again, your answers are collected for government reporting purposes
                        only and you can choose not to answer any or all of the questions.
                    </p>
                </div>
                <br />
                {this.props.loading ? (
                    <CircularProgress color="primary" />
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <Button style={{ width: "initial", margin: "10px" }} onClick={this.begin}>
                            Begin
                        </Button>
                        <br />
                        <div
                            className="inline-block underline font14px pointer"
                            style={{ marginBottom: "40px" }}
                            onClick={this.skipAdminQuestions.bind(this)}
                        >
                            Click here if you prefer not to answer
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // start the admin questions
    begin = () => {
        this.props.answerEvaluationQuestion("Admin", this.props.credentials);
    };

    // skip all the admin questions
    skipAdminQuestions() {
        this.props.skipAdminQuestions(this.props.credentials);
    }

    render() {
        // all info about the current question to answer
        const question = this.props.questionInfo;

        // if user has not started the admin questions before, show them the intro page
        if (this.props.showIntro) {
            return this.makeIntroPage();
        }

        // if the question has not been loaded yet
        else if (!question) {
            return <CircularProgress color="primary" />;
        } else {
            switch (question.questionType) {
                case "slider": {
                    return this.makeSliderQuestion();
                }
                case "multipleChoice": {
                    return this.makeMultipleChoiceQuestion();
                }
                case "dropDown": {
                    return this.makeDropDownsQuestion();
                }
                default: {
                    return <div>Something{"'"}s messed up. Try refreshing.</div>;
                }
            }
        }
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            answerEvaluationQuestion,
            skipAdminQuestions
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        questionInfo: state.users.evaluationState.componentInfo,
        showIntro: state.users.evaluationState.showIntro,
        loading: state.users.loadingSomething,
        primaryColor: state.users.primaryColor,
        backgroundColor: state.users.backgroundColor,
        textColor: state.users.textColor
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AdminQuestions);
