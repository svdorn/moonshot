"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { closeNotification, addNotification, answerPsychQuestion, startPsychEval } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import PsychSlider from "../psychAnalysis/psychSlider";
import { CircularProgress } from "material-ui";


class PsychAnalysis extends Component {
    constructor(props) {
        super(props);

        this.bound_resized = this.resized.bind(this);

        // start out with the slider in the middle
        this.state = {
            answer: 0,
            loadingQuestion: false,
            windowWidth: window.innerWidth
         };
    }


    componentDidMount() {
        window.addEventListener("resize", this.bound_resized);
    }


    componentWillUnmount() {
        window.removeEventListener("resize", this.bound_resized);
    }


    // makes the button be not disabled
    componentDidUpdate(prevProps, prevState) {
        try {
            const currentQuestionId = this.props.questionInfo.questionId;
            const prevQuestionId = prevProps.questionInfo.questionId;
            if (currentQuestionId !== prevQuestionId) {
                this.setState({ loadingQuestion: false });
            }
        } catch (e) {
            console.log(e);
            this.props.addNotification("Whoops, something's weird. Try reloading.")
        }
    }


    resized() {
        this.setState({ windowWidth: window.innerWidth });
    }


    // move on to the next psych question
    nextQuestion() {
        this.setState({ loadingQuestion: true });
        if (!this.state.loadingQuestion) {
            this.props.answerPsychQuestion(this.props.currentUser._id, this.props.currentUser.verificationToken, this.state.answer);
        }
    }


    startTest() {
        this.props.startPsychEval(this.props.currentUser._id, this.props.currentUser.verificationToken);
    }


    updateAnswer(newAnswer) {
        this.setState({
            ...this.state,
            answer: newAnswer
        })
    }


    createContent() {
        const psychometricTest = currentUser.psychometricTest;
        const isAdmin = this.props.currentUser.userType === "accountAdmin";

        // if the user hasn't taken the psych test, ask them if they want to
        if (typeof psychometricTest !== "object" || !psychometricTest.startDate) {
            return (
                <div className="evalPortionIntro skillsUserAgreement center">
                    <div/>
                    <div>
                        {this.props.currentUser.currentPosition ?
                            <p>This is the psychometrics portion of the evaluation. In essence, this is a personality test.</p>
                            :
                            <p>Welcome to the Moonshot psychometric analysis! In essence, this is a personality test.</p>
                        }
                        <p>{"You'll be given two choices per question. Drag the slider according to the degree that you agree with a given choice."}</p>
                        <p><span>{"DON'T OVERTHINK."}</span>{" Each question is meant to be taken at a surface level. Don't overthink it! If you don't understand a question, take your best guess and move on."}</p>
                        {isAdmin ? null : <p><span>{"YOU CAN"}</span>{" go to other tabs and windows. So if you don't understand something, feel free to look it up. The test should take around ten minutes."}</p>}
                    </div>
                    <br/>
                    <div className="psychAnalysisButton" style={{marginTop: "20px", width: "initial"}} onClick={this.startTest.bind(this)}>
                        Start!
                    </div>
                </div>
            );
        }

        // user is taking the psych test currently - get the question
        const currentQuestion = psychometricTest.currentQuestion;
        if (!currentQuestion) {
            return (
                <div>Error</div>
            );
        }

        // get all info about the question
        const question = currentQuestion.body;
        const leftOption = currentQuestion.leftOption;
        const rightOption = currentQuestion.rightOption;
        const questionId = currentQuestion.questionId;

        if (!question || !leftOption || !rightOption) {
            return (
                <div>Error</div>
            );
        }

        // all is good, create styles for slider and options
        let sliderWidth, sliderHeight;
        let windowWidth = this.state.windowWidth;
        if (windowWidth < 300) {
            windowWidth = 300;
        }
        if (windowWidth > 600) {
            sliderWidth = 350;
            sliderHeight = 200;
        } else if (windowWidth > 450) {
            sliderWidth = 250;
            sliderHeight = 120;
        } else {
            sliderWidth = 150;
            sliderHeight = 80;
        }
        const topMargin = 110;
        const sliderAndAnswerContainerStyle = {
            width: sliderWidth,
            display: "inline-block",
            position: "relative"
        }

        let leftOptionStyle = {
            position: "absolute",
            height: `${topMargin/2}px`,
            display: "table",
            top: `${topMargin/4}px`,
            maxWidth: "calc(100% * 2/3)"
        }
        let rightOptionStyle = Object.assign({}, leftOptionStyle);
        leftOptionStyle.transform = "translateX(-50%)";
        leftOptionStyle.left = "0";
        rightOptionStyle.transform = "translateX(50%)";
        rightOptionStyle.right = "0";

        const optionTextStyle = {
            display: "table-cell",
            verticalAlign: "middle",
            maxWidth: `${windowWidth/4}px`
        }

        const sliderStyle = {
            marginTop: `${topMargin}px`
        }

        const nextButtonClass = this.state.loadingQuestion ? " disabled" : "";

        return (
            <div className="noselect font16px font14pxUnder600 font12pxUnder450">
                <div className="center psychAnalysisQuestion">
                    {question}
                </div>

                <div style={sliderAndAnswerContainerStyle}>
                    <div style={leftOptionStyle}>
                        <div style={optionTextStyle}>{leftOption}</div>
                    </div>
                    <div style={rightOptionStyle}>
                        <div style={optionTextStyle}>{rightOption}</div>
                    </div>

                    <PsychSlider
                        width={sliderWidth}
                        height={sliderHeight}
                        className="center"
                        style={sliderStyle}
                        updateAnswer={this.updateAnswer.bind(this)}
                        questionId={questionId}
                    />
                </div>
                <br/>
                <div
                    className={"psychAnalysisButton marginBottom50px" + nextButtonClass}
                    onClick={this.nextQuestion.bind(this)}
                    style={{marginTop: "20px"}}
                >
                    Next
                </div>
            </div>
        );
    }


    render() {
        // what will be shown in the main area of the page
        let content = this.createContent();

        return (
            <div className="blackBackground fillScreen primary-white center">
                { content }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        answerPsychQuestion,
        startPsychEval,
        addNotification
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


export default connect(mapStateToProps, mapDispatchToProps)(PsychAnalysis);
