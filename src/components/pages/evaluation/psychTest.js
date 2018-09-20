"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { closeNotification, addNotification, answerEvaluationQuestion } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import PsychSlider from "./psychSlider";
import { CircularProgress } from "material-ui";


class PsychAnalysis extends Component {
    constructor(props) {
        super(props);

        this.bound_resized = this.resized.bind(this);

        // start out with the slider in the middle
        this.state = {
            answer: 0,
            windowWidth: window.innerWidth
         };
    }


    componentDidMount() {
        window.addEventListener("resize", this.bound_resized);
    }


    componentWillUnmount() {
        window.removeEventListener("resize", this.bound_resized);
    }


    resized() { this.setState({ windowWidth: window.innerWidth }); }


    // move on to the next psych question
    nextQuestion() {
        if (!this.props.loading) {
            this.props.answerEvaluationQuestion("Psych", {
                ...this.props.credentials,
                answer: this.state.answer
            });
        }
    }


    // start the eval for the first time
    startTest() { this.props.answerEvaluationQuestion("Psych", this.props.credentials); }


    // when slider is moved
    updateAnswer(newAnswer) {
        this.setState({
            ...this.state,
            answer: newAnswer
        });
    }


    // show this if user has never started psych test
    makeIntroPage() {
        const isAdmin = this.props.currentUser.userType === "accountAdmin";

        return (
            <div className="evalPortionIntro skillsUserAgreement center">
                <div>
                    <p>{"This is the psychometrics portion of the evaluation. In essence, this is a personality test."}</p>
                    <p>{"You'll be given two choices per question. Drag the slider according to the degree that you agree with a given choice."}</p>
                    <p><span>{"DON'T OVERTHINK."}</span>{" Each question is meant to be taken at a surface level. Don't overthink it! If you don't understand a question, take your best guess and move on."}</p>
                    <p><span>{"YOU CAN"}</span>{" go to other tabs and windows. So if you don't understand something, feel free to look it up. The test should take around ten minutes."}</p>
                </div>
                <br/>
                {this.props.loading ?
                    <CircularProgress color="#ff582d" />
                    :
                    <div
                        style={{marginBottom: "40px", width: "initial"}}
                        className={"skillContinueButton"}
                        onClick={this.startTest.bind(this)}
                    >
                        Begin
                    </div>
                }
            </div>
        )
    }


    // the main content - the question and the slider
    createContent() {
        // all information about the current psych question
        const questionInfo = this.props.questionInfo;

        // get all info about the question
        const question = questionInfo.body;
        const leftOption = questionInfo.leftOption;
        const rightOption = questionInfo.rightOption;
        const questionId = questionInfo.questionId;

        // missing information about the question
        if (!question || !leftOption || !rightOption) { return this.errorPage(); }

        // all is good, create styles for slider and options
        let windowWidth = this.state.windowWidth;

        // MAX and MIN widths
        if (windowWidth > 850) { windowWidth = 850; }
        else if (windowWidth < 300) { windowWidth = 300; }

        function widthParabolicFunc(x) { return x * (.7 - ((x-300)/2000)); }
        const sliderWidth = widthParabolicFunc(windowWidth);
        const sliderHeight = sliderWidth * 4 / 7;

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

        const nextButtonClass = this.props.loading ? " disabled" : "";

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


    // generic error
    errorPage() { return <div>Something is wrong. Try refreshing.</div>; }


    render() {
        // all info about the current question to answer
        const questionInfo = this.props.questionInfo;

        // if user has not started the admin questions before, show them the intro page
        if (this.props.showIntro) { return this.makeIntroPage(); }

        // if the question has not been loaded yet
        else if (!questionInfo) { return <CircularProgress color="#76defe" />; }

        // the typical interface with the slider
        else if (questionInfo.body) { return this.createContent(); }

        // something is up if we get here
        else { return this.errorPage(); }
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        answerEvaluationQuestion,
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
