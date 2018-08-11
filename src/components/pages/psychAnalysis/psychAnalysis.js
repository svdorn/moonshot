"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { closeNotification, addNotification, answerPsychQuestion, startPsychEval } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import PsychSlider from "./psychSlider";
import ProgressBar from "../../miscComponents/progressBar";
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
        const currentUser = this.props.currentUser;
        // make sure a user is logged in
        if (!currentUser) {
            this.goTo("/login");
        }

        window.addEventListener("resize", this.bound_resized);
    }


    componentWillUnmount() {
        window.removeEventListener("resize", this.bound_resized);
    }


    // makes the button be not disabled
    componentDidUpdate(prevProps, prevState) {
        try {
            const currentQuestionId = this.props.currentUser.psychometricTest.currentQuestion.questionId;
            const prevQuestionId = prevProps.currentUser.psychometricTest.currentQuestion.questionId;
            if (currentQuestionId !== prevQuestionId) {
                this.setState({ loadingQuestion: false });
            }
        } catch (e) {
            console.log(e);
        }
    }


    resized() {
        this.setState({ windowWidth: window.innerWidth });
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
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


    finishTest() {
        // if the user is taking a position evaluation, go to the next step of that
        const user = this.props.currentUser;
        const currentPosition = user.currentPosition;
        if (currentPosition) {
            // if there are skill tests the user still has to take, go to that skill test
            if (currentPosition.skillTests && currentPosition.testIndex < currentPosition.skillTests.length) {
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
            this.goTo("/myEvaluations");
        }
    }


    updateAnswer(newAnswer) {
        this.setState({
            ...this.state,
            answer: newAnswer
        })
    }


    createContent(currentUser) {
        // if there is no current user or we're waiting for the psych test to
        // start, show loading symbol
        if (!currentUser || this.props.startingPsychTest) {
            return (
                <CircularProgress color="#FB553A" />
            );
        }

        // check if they're in a position evaluation, and if so if they can do this step yet
        if (currentUser.currentPosition && (!currentUser.adminQuestions || !currentUser.adminQuestions.finished)) {
            return (
                <div className="center">
                    You have to complete the administrative questions first!<br/>
                    <button onClick={() => this.goTo("/adminQuestions")} className="button gradient-transition gradient-1-red gradient-2-orange round-4px marginTop10px primary-white font22px font16pxUnder600">
                        Take me there!
                    </button>
                </div>
            );
        }

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

        // we know the user previously started the psych test
        const finishedTest = psychometricTest.inProgress === false || psychometricTest.endDate;

        // if they are finished with the test and ready to move on, give them a finish button
        if (finishedTest) {
            return (
                <div>
                    {"You're done with the psychometric analysis!"}
                    <br/>
                    <div className="psychAnalysisButton" style={{marginTop: "20px"}} onClick={this.finishTest.bind(this)}>
                        Finish
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
        const currentUser = this.props.currentUser;
        let content = this.createContent(currentUser);

        const progressBar = currentUser && currentUser.currentPosition ?
            <ProgressBar /> : null;


        return (
            <div className="blackBackground fillScreen primary-white center">
                <MetaTags>
                    <title>Psychometric Analysis | Moonshot</title>
                    <meta name="description" content={"Find out what personality type you have! This will let us know how to best help you in getting the perfect job."} />
                </MetaTags>
                { progressBar }
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
        startingPsychTest: state.users.loadingSomething
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(PsychAnalysis);
