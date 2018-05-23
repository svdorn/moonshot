import React, {Component} from 'react';
import {
    Paper,
    Stepper,
    Step,
    StepButton,
    Slider,
    FlatButton,
    RaisedButton,
    MenuItem,
    DropDownMenu
} from 'material-ui';
import axios from 'axios';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';

class EmployeePreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gradingComplete: props.gradingComplete,
            answers: props.answers,
            gradingInProgress: false,
            questionIndex: 0,
            questionAnswer: 0
        }
    }

    // since some components will be rendered in the same place but be for
    // different people, need to update state when new props are received
    componentWillReceiveProps(nextProps) {
        this.setState({
            ...this.state,
            gradingComplete: nextProps.gradingComplete,
            answers: nextProps.answers
        });
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleOpen() {
        console.log("here");
        this.setState({
            ...this.state,
            gradingInProgress: true
        })
    }

    handleNextQuestion() {
        // Post the answer in the database
        let self = this;
        axios.post("/api/business/answerQuestion", {
            params: {
                userId: this.props.currentUser._id,
                employeeId: this.props.employeeId,
                verificationToken: this.props.currentUser.verificationToken,
                score: this.state.questionAnswer,
                questionIndex: this.state.questionIndex
            }
        })
        .then(function (res) {
            // Save the answer in state
            console.log(res);

            // Advance to the next questionAnswer
            const newQuestionIndex = this.state.questionIndex + 1;
            if (newQuestionIndex < this.props.questions.length) {
                this.setState({
                    ...this.state,
                    questionIndex: newQuestionIndex
                })
            }
        })
    }

    handlePreviousQuestion() {
        // Post the answer in the database

        // Go to the previous question
        const newQuestionIndex = this.state.questionIndex - 1;
        if (newQuestionIndex >= 0) {
            this.setState({
                ...this.state,
                questionIndex: newQuestionIndex
            })
        }
    }

    changeQuestionAnswer(e, value) {
        console.log(value);
        this.setState({
            ...this.state,
            questionAnswer: value
        })
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
                color: "rgba(255, 255, 255, .8)",
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
                zIndex: "6",
            }
        };

        const questionIndex = this.state.questionIndex;
        const questionIndexDisplay = this.state.questionIndex + 1;
        // Get the answer to this specific question
        let questionAnswer = 0;
        for (answer in this.state.answers) {
            if (answer.questionIndex === questionIndex) {
                questionAnswer = answer.score;
                break;
            }
        }

        return (
            <div>
            {this.state.gradingInProgress ?
                <div className="employeePreviewGrading center">
                    <div className="employeeName font18px center">
                        {this.props.name.toUpperCase()}
                    </div>
                    <div className="center font18px redPinkText">
                        Question:
                        <br/>
                        {questionIndexDisplay + '/' + this.props.questions.length}
                    </div>
                    <div>
                        {this.props.questions[questionIndex].questionBody}
                    </div>
                    <div className="center width80width80percentImportant">
                        <Slider min={this.props.questions[questionIndex].range.lowRange}
                                max={this.props.questions[questionIndex].range.highRange}
                                step={1}
                                value={questionAnswer}
                                onChange={(e, value) => this.changeQuestionAnswer(e, value)}
                                />
                    </div>
                    <div className="marginTop10px">
                        <i className="completionStage clickable underline center font14px"
                            onClick={this.handlePreviousQuestion.bind(this)}>
                            Previous
                        </i>
                        <button className="slightlyRoundedButton marginTop10px orangeToRedButtonGradientSmall transitionButton whiteText font14px clickableNoUnderline marginLeft30px"
                                onClick={this.handleNextQuestion.bind(this)}>
                            Next
                        </button>
                    </div>
                </div>
                :
            <div className="employeePreview center">
                <div className="employeeName font18px center">
                    {this.props.name.toUpperCase()}
                </div>
                <br/>
                <img
                    className="completionImage marginBottom10px"
                    src={this.state.gradingComplete ? "/icons/CheckMarkEmployeePreview.png" : "/icons/X.png"}
                />
                <br />
                <i className={"completionStage center font14px " + (this.state.gradingComplete ? "" : "redPinkText")}>
                    {this.state.gradingComplete ? "Complete" : "Incomplete"}
                </i>
                <br/>
                <div className="marginTop10px">
                    <button className="slightlyRoundedButton marginTop10px orangeToRedButtonGradientSmall transitionButton whiteText font14px clickableNoUnderline"
                            onClick={this.handleOpen.bind(this)}>
                        Grade
                    </button>
                    <i className="completionStage clickable underline center font14px marginLeft30px">
                        See Results
                    </i>
                </div>
            </div>
            }
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}



export default connect(mapStateToProps, mapDispatchToProps)(EmployeePreview);
