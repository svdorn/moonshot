import React, { Component } from "react";
import {
    Stepper,
    Step,
    StepButton,
    Slider,
    FlatButton,
    RaisedButton,
    MenuItem,
    DropDownMenu
} from "material-ui";
import axios from "axios";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { browserHistory } from "react-router";
import HoverTip from "../miscComponents/hoverTip";

class EmployeePreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gradingComplete: props.gradingComplete,
            answers: props.answers,
            gradingInProgress: false,
            questionIndex: 0
        };
    }

    // Set the current question when the component mounts
    componentDidMount() {
        let questionAnswer = 0;
        if (this.props.answers.length >= 1) {
            questionAnswer = this.props.answers[0].score;
        }
        this.setState({ questionAnswer: questionAnswer });
    }

    handleOpen() {
        this.setState({
            ...this.state,
            gradingInProgress: true
        });
    }

    handleSubmit() {
        // Post the answer in the database
        let self = this;
        const user = {
            userId: this.props.currentUser._id,
            employeeId: this.props.employeeId,
            verificationToken: this.props.currentUser.verificationToken,
            score: this.state.questionAnswer,
            questionIndex: this.state.questionIndex,
            positionId: this.props.positionId,
            gradingComplete: true
        };
        axios.post("/api/business/answerQuestion", user).then(function(res) {
            // TODO: fix the question answer
            // Advance to the next questionAnswer and save the answers in state
            let questionAnswer = 0;
            if (self.state.answers.length >= 1) {
                questionAnswer = self.state.answers[0].score;
            }
            self.setState({
                ...self.state,
                questionAnswer,
                questionIndex: 0,
                answers: res.data,
                gradingInProgress: false,
                gradingComplete: true
            });
        });
    }

    handleNextQuestion() {
        // Post the answer in the database
        let self = this;
        const user = {
            userId: this.props.currentUser._id,
            employeeId: this.props.employeeId,
            verificationToken: this.props.currentUser.verificationToken,
            score: this.state.questionAnswer,
            questionIndex: this.state.questionIndex,
            positionId: this.props.positionId,
            gradingComplete: this.state.gradingComplete
        };
        axios.post("/api/business/answerQuestion", user).then(function(res) {
            // Advance to the next questionAnswer and save the answers in state
            const newQuestionIndex = self.state.questionIndex + 1;
            if (newQuestionIndex < self.props.questions.length) {
                let newQuestionAnswer = 0;
                for (let i = 0; i < res.data.length; i++) {
                    const answer = res.data[i];
                    if (answer.questionIndex === newQuestionIndex) {
                        newQuestionAnswer = answer.score;
                        break;
                    }
                }
                self.setState({
                    ...self.state,
                    questionIndex: newQuestionIndex,
                    questionAnswer: newQuestionAnswer,
                    answers: res.data
                });
            } else {
                self.setState({
                    ...self.state,
                    questionAnswer: 0,
                    answers: res.data
                });
            }
        });
    }

    handlePreviousQuestion() {
        // Post the answer in the database
        let self = this;
        const user = {
            userId: this.props.currentUser._id,
            employeeId: this.props.employeeId,
            verificationToken: this.props.currentUser.verificationToken,
            score: this.state.questionAnswer,
            questionIndex: this.state.questionIndex,
            positionId: this.props.positionId,
            gradingComplete: this.state.gradingComplete
        };
        axios.post("/api/business/answerQuestion", user).then(function(res) {
            // Go to the previous questionAnswer and save the answers in state
            const newQuestionIndex = self.state.questionIndex - 1;
            if (newQuestionIndex >= 0) {
                let newQuestionAnswer = 0;
                for (let i = 0; i < res.data.length; i++) {
                    const answer = res.data[i];
                    if (answer.questionIndex === newQuestionIndex) {
                        newQuestionAnswer = answer.score;
                        break;
                    }
                }
                self.setState({
                    ...self.state,
                    questionIndex: newQuestionIndex,
                    questionAnswer: newQuestionAnswer,
                    answers: res.data
                });
            } else {
                self.setState({
                    ...self.state,
                    questionAnswer: 0,
                    answers: res.data
                });
            }
        });
    }

    changeQuestionAnswer(e, value) {
        this.setState({
            ...this.state,
            questionAnswer: value
        });
    }

    render() {
        const style = {
            redLink: {
                color: "#D1576F",
                textDecoration: "underline"
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "middle"
            },
            targetOrigin: {
                vertical: "top",
                horizontal: "middle"
            },
            menuStyle: {
                marginLeft: "20px"
            },
            menuLabelStyle: {
                color: "rgba(255, 255, 255, .8)"
            },
            menuUnderlineStyle: {
                display: "none"
            },
            menuItemStyle: {
                textAlign: "center"
            },
            seeResults: {
                position: "absolute",
                left: "12px",
                bottom: "5px",
                zIndex: "7"
            },
            lastUpdated: {
                position: "absolute",
                textAlign: "center",
                width: "92px",
                bottom: "3px",
                right: "8px",
                zIndex: "6"
            }
        };

        const questionIndex = this.state.questionIndex;
        const questionIndexDisplay = this.state.questionIndex + 1;

        let sliderNumbers = [];
        const lowRange = this.props.questions[questionIndex].range.lowRange;
        const highRange = this.props.questions[questionIndex].range.highRange;
        for (let number = lowRange; number <= highRange; number++) {
            sliderNumbers.push(
                <div key={`sliderNumber${number}`} className="myEmployees sliderNumber">
                    {number}
                </div>
            );
        }

        let seeResults = null;
        // if the candidate has been graded, allow results to be seen

        let resultsUrl = "/myEmployees";
        try {
            const employeeId = this.props.employeeId;
            const positionId = this.props.positionId;
            resultsUrl = `/employeeResults/${employeeId}/${positionId}`;
        } catch (e) {
            // console.log("Error getting results url: ", e);
        }

        // the text that will let the user know whether the employee finished the eval
        let evalProgressText = "Incomplete";
        let progressHoverText = "The employee has not yet completed the evaluation.";
        if (this.props.score) {
            evalProgressText = "Complete";
            progressHoverText = "The employee completed the evaluation.";
        }

        const evalProgress = (
            <div className="inlineBlock">
                <div className="inlineBlock secondary-gray font12px" style={{ marginLeft: "20px" }}>
                    {evalProgressText}
                </div>
                <HoverTip
                    className="font12px"
                    style={{ left: "50%", top: "100%" }}
                    text={progressHoverText}
                />
            </div>
        );

        let completionImage;
        const gradingComplete = this.state.gradingComplete;
        if (gradingComplete) {
            completionImage = "/icons/CheckMarkEmployeePreview" + this.props.png;
        } else {
            completionImage = "/icons/X" + this.props.png;
        }

        return (
            <div>
                {this.state.gradingInProgress ? (
                    <div className="employeePreviewGrading center">
                        <div className="employeeName font18px center">
                            {this.props.name.toUpperCase()}
                        </div>
                        <div className="center font14px primary-cyan">
                            Question:
                            <br />
                            {questionIndexDisplay + "/" + this.props.questions.length}
                        </div>
                        <div className="font14px">
                            {this.props.questions[questionIndex].questionBody}
                        </div>
                        <div className="center width80width80percentImportant gradingSliderContainer">
                            <Slider
                                min={lowRange}
                                max={highRange}
                                step={1}
                                value={this.state.questionAnswer}
                                onChange={(e, value) => this.changeQuestionAnswer(e, value)}
                            />
                            <div className="myEmployees sliderNumbers">{sliderNumbers}</div>
                        </div>
                        <div className="marginTop10px gradingMovementButtons">
                            {questionIndexDisplay === this.props.questions.length ? (
                                <div>
                                    <i
                                        className="completionStage clickable underline center font14px"
                                        onClick={this.handlePreviousQuestion.bind(this)}
                                    >
                                        Previous
                                    </i>
                                    <button
                                        className="button round-4px gradient gradient-1-red gradient-2-orange marginTop10px primary-white font14px marginLeft30px"
                                        onClick={this.handleSubmit.bind(this)}
                                    >
                                        Submit
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <i
                                        className="completionStage clickable underline center font14px"
                                        onClick={this.handlePreviousQuestion.bind(this)}
                                    >
                                        Previous
                                    </i>
                                    <button
                                        className="button round-4px background-primary-cyan marginTop10px primary-white font14px marginLeft30px"
                                        onClick={this.handleNextQuestion.bind(this)}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="employeePreview center">
                        <div className="employeeName font18px center">
                            {this.props.name.toUpperCase()}
                        </div>
                        <br />
                        <img className="completionImage marginBottom10px" src={completionImage} />
                        <br />
                        <i
                            className={
                                "completionStage center font14px " +
                                (this.state.gradingComplete ? "" : "secondary-red")
                            }
                        >
                            {this.state.gradingComplete ? "Graded" : "Needs Grading"}
                        </i>
                        <br />
                        <div className="gradingMovementButtons">
                            {this.state.gradingComplete ? (
                                <button className="button round-4px gradient disabled primary-white font14px">
                                    Grade
                                </button>
                            ) : (
                                <button
                                    className="button round-4px gradient gradient-1-red gradient-2-orange marginTop10px primary-white font14px"
                                    onClick={this.handleOpen.bind(this)}
                                >
                                    Grade
                                </button>
                            )}
                            {evalProgress}
                            {seeResults}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EmployeePreview);
