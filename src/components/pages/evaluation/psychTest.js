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
            if (!this.props.questionInfo) { return; }
            const currentQuestionId = this.props.questionInfo.questionId;
            const prevQuestionId = prevProps.questionInfo.questionId;
            if (currentQuestionId !== prevQuestionId) {
                this.setState({ loadingQuestion: false });
            }
        } catch (e) {
            console.log(e);
            this.props.addNotification("Whoops, something's weird. Try reloading.", "errorHeader")
        }
    }


    resized() { this.setState({ windowWidth: window.innerWidth }); }


    // move on to the next psych question
    nextQuestion() {
        this.setState({ loadingQuestion: true });
        if (!this.state.loadingQuestion) {
            this.props.answerEvalQuestion("AdminQuestion", {
                ...this.props.credentials,
                answer: this.state.answer
            });
        }
    }


    // start the eval for the first time
    startTest() { this.props.answerPsychQuestion(this.props.credentials); }


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
                    <CircularProgress />
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
        // TODO: make this scale nicely with min and max widths
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


    // generic error
    errorPage() { return <div>Something is wrong. Try refreshing.</div>; }


    render() {
        // all info about the current question to answer
        const question = this.props.questionInfo;

        // if user has not started the admin questions before, show them the intro page
        if (this.props.showIntro) { return this.makeIntroPage(); }

        // if the question has not been loaded yet
        else if (!questionInfo) { return <CircularProgress color="#FB553A" />; }

        // the typical interface with the slider
        else if (questionInfo.body) { return this.createContent(); }

        // something is up if we get here
        else { return this.errorPage(); }
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
