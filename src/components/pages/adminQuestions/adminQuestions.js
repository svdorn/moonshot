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
import ProgressBar from '../../miscComponents/progressBar';

class AdminQuestions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            selectedText: undefined,
            demographics: undefined,
            selfRating: undefined,
            sliderValue: 1,
            question: undefined,
            questionType: undefined,
            finished: false,
            clickedBegin: false
        };
    }


    componentDidMount() {
        // make sure the user actually should be answering the admin questions
        const currentUser = this.props.currentUser;
        if (!currentUser || !currentUser.currentPosition || (currentUser.adminQuestions && currentUser.adminQuestions.finishedQuestions)) {
            this.setState({finished: true});
        }

        const self = this;

        // get the admin questions
        axios.get("/api/user/adminQuestions", { params:
            {
                userId: currentUser._id,
                verificationToken: currentUser.verificationToken
            }
        })
        .then(response => {
            const questionInfo = response.data;

            if (!Array.isArray(questionInfo.demographics) || questionInfo.demographics.length === 0) {
                return;
            }

            // set the current question as the first one
            let question = questionInfo.demographics[0];
            let questionType = "demographics";

            // see if the user has already done some of the questions
            if (currentUser.adminQuestions && Array.isArray(currentUser.adminQuestions.demographics) && currentUser.adminQuestions.demographics.length > 0) {
                // find the index of a question within demographics that is unanswered
                questionType = "demographics";
                let unansweredIndex = self.findUnansweredIndex("demographics", questionInfo.demographics);

                // if the user does have an unanswered question, ask that one
                if (typeof unansweredIndex === "number" && unansweredIndex >= 0) {
                    question = questionInfo.demographics[unansweredIndex];
                }

                // if the user has answered all demographic questions, check if
                // they should be given self rating questions
                else {
                    // if they should, get them a self rating question
                    if (currentUser.userType === "employee") {
                        if (!Array.isArray(questionInfo.selfRating) || questionInfo.selfRating.length === 0) {
                            return;
                        }

                        // set the question to be the first self rating question
                        question = questionInfo.selfRating[0];
                        // check if the user has already answered some self rating questions
                        if (currentUser.adminQuestions && Array.isArray(currentUser.adminQuestions.selfRating) && currentUser.adminQuestions.selfRating.length > 0) {
                            questionType = "selfRating";
                            unansweredIndex = self.findUnansweredIndex("selfRating", questionInfo.selfRating);

                            // if the user does have an unanswered question, ask that one
                            if (typeof unansweredIndex === "number" && unansweredIndex >= 0) {
                                question = questionInfo.selfRating[unansweredIndex];
                                questionType = "selfRating";
                            }
                            // if the user has answered all self rating questions, they're done
                            else {
                                self.setState({finished: true});
                                return;
                            }
                        }

                    }
                    // if they shouldn't, they're done
                    else {
                        self.setState({finished: true});
                        return;
                    }
                }
            }

            // see if the user has already answered some questions
            self.setState({...questionInfo, question, questionType});
        })
        .catch(error => {
            // console.log("error getting admin questions: ", error);
        });
    }


    findUnansweredIndex(questionType, realQuestions, excludeThis) {
        const currentUser = this.props.currentUser;
        return realQuestions.findIndex(realQ => {
            // question answered if user's answered questions contain the question
            return realQ._id.toString() !== excludeThis && !currentUser.adminQuestions[questionType].some(userQ => {
                return userQ.questionId.toString() === realQ._id.toString();
            });
        });
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
        // don't do anything if nothing is selected on a multiple choice question
        if (!this.state.question || (this.state.question.questionType === "multipleChoice" && this.state.selectedId === undefined)) {
            return;
        }

        const currentUser = this.props.currentUser;

        const demographics = this.state.demographics;
        if (!Array.isArray(demographics)) {
            return;
        }
        const demographicsLength = demographics.length;

        // check if user is finished with the admin questions
        let finished = false;
        let questionType = "demographics";
        if (currentUser.userType === "employee") {
            // employees must finish demographics and self rating parts
            if (Array.isArray(currentUser.adminQuestions.demographics) && currentUser.adminQuestions.demographics.length >= demographicsLength - 1) {
                // check that self rating questions exist
                const selfRating = this.state.selfRating;
                if (!Array.isArray(selfRating)) {
                    return;
                }

                questionType = "selfRating";

                // to finish, you have to have finished all but one and currently be answering one
                if (Array.isArray(currentUser.adminQuestions.selfRating) && currentUser.adminQuestions.selfRating.length === selfRating.length - 1) {
                    finished = true;
                }
            }
        }
        else {
            // everyone besides employees is finished after just finishing demographics
            if (Array.isArray(currentUser.adminQuestions.demographics) && currentUser.adminQuestions.demographics.length === demographicsLength - 1) {
                finished = true;
            }
        }

        this.props.answerAdminQuestion(
            currentUser._id,
            currentUser.verificationToken,
            this.state.questionType,
            this.state.question._id,
            this.state.sliderValue,
            this.state.selectedId,
            this.state.selectedText,
            finished
        );

        // get the next question if not done
        let question = undefined;
        if (!finished) {
            const currentQuestionId = this.state.question._id.toString();
            const questionIndex = this.findUnansweredIndex(questionType, this.state[questionType], currentQuestionId);
            question = this.state[questionType][questionIndex];
        }

        const newState = {
            ...this.state,
            finished,
            questionType,
            question,
            selectedId: undefined,
            selectedText: undefined,
            sliderValue: 1
        }

        this.setState(newState);
    }


    finish() {
        // if the user is taking a position evaluation, go to the next step of that
        const user = this.props.currentUser;
        const currentPosition = user.currentPosition;
        if (currentPosition) {
            // if the user has not taken the psych test, go to that
            if (!user.psychometricTest || !user.psychometricTest.endDate) {
                this.goTo(`/psychometricAnalysis`);
            }
            // if there are skill tests the user still has to take, go to that skill test
            else if (currentPosition.skillTests && currentPosition.testIndex < currentPosition.skillTests.length) {
                this.goTo(`/skillTest/${currentPosition.skillTests[currentPosition.testIndex]}`);
            }
            // otherwise, if there are free response questions to answer, go there
            else if (currentPosition.freeResponseQuestions && currentPosition.freeResponseQuestions.length > 0) {
                this.goTo("/freeResponse");
            }
            // otherwise, the user is done with the test; go home and give them
            // a notification saying they're done
            else {
                this.props.addNotification("Finished application!", "info");
                this.goTo("/");
            }
        }
        // otherwise the user took the exam as a one-off thing, so show them results
        else {
            // TODO make it go to the actual results page
            this.goTo("/");
        }
    }


    makeSliderQuestion() {
        const question = this.state.question;
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
        const question = this.state.question;

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


    begin() {
        this.setState({ clickedBegin: true });
    }


    render() {
        let self = this;

        let content = null;
        const question = this.state.question;

        // if finished with admin questions, show button letting you advance to the next step
        if (this.state.finished) {
            content = (
                <div>
                    Finished with the admin questions!<br/>
                    <button className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline"
                            onClick={this.finish.bind(this)}>
                        Advance
                    </button>
                </div>
            )
        }

        else if (!this.state.clickedBegin) {
            content = this.makeIntroPage();
        }

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

            if (this.state.finished) {
                content = (
                    <div>
                        Administrative questions complete!
                        <br/>
                        <div style={{marginTop:"20px"}} className="skillContinueButton" onClick={this.finish.bind(this)}>Finish</div>
                    </div>
                );
            }
        }

        return (
            <div className="blackBackground fillScreen whiteText center">
                <MetaTags>
                    <title>Admin Questions | Moonshot</title>
                    <meta name="description" content={"Answer some administrative questions and then you'll be ready for the position evaluation."} />
                </MetaTags>
                <ProgressBar />
                { content }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        answerAdminQuestion
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminQuestions);
