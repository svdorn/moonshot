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
            gradingInProgress: false
        }
    }

    // Set the current question when the component mounts
    componentDidMount() {
        // Start the test at the last unanswered question
        let maxQuestionIndex = 0;
        let questionAnswer = 0;

        for (let i = 0; i < this.props.answers.length; i++) {
            const answer = this.props.answers[i];
            if (answer.questionIndex >= maxQuestionIndex) {
                maxQuestionIndex = answer.questionIndex;
            }
        }

        if ((maxQuestionIndex + 1) < this.props.answers.length) {
            // Go to the next unanswered question
            maxQuestionIndex = maxQuestionIndex + 1;
        } else {
            // Go to the last question, which has already been filled out
            maxQuestionIndex = this.props.answers.length;
        }

        this.setState({
            ...this.state,
            questionIndex: maxQuestionIndex,
            questionAnswer: questionAnswer
        });
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleOpen() {
        this.setState({
            ...this.state,
            gradingInProgress: true
        })
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
            companyId: this.props.currentUser.company.companyId
        }
        axios.post("/api/business/answerQuestion", {user})
        .then(function (res) {
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
                })
            } else {
                self.setState({
                    ...self.state,
                    questionAnswer: 0,
                    answers: res.data
                })
            }
        })
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
            companyId: this.props.currentUser.company.companyId
        }
        axios.post("/api/business/answerQuestion", {user})
        .then(function (res) {
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
                })
            } else {
                self.setState({
                    ...self.state,
                    questionAnswer: 0,
                    answers: res.data
                })
            }
        })
    }

    changeQuestionAnswer(e, value) {
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
                                value={this.state.questionAnswer}
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
