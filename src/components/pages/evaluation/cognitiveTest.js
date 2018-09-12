"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { closeNotification, answerEvaluationQuestion, addNotification } from "../../../actions/usersActions";
import axios from "axios";
import StyledContent from "../../childComponents/styledContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import ProgressBar from '../../miscComponents/progressBar';
import { htmlDecode } from "../../../miscFunctions";

import "./cognitiveTest.css";

class CognitiveTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            questionId: undefined,
            agreedToTerms: false,
            // the time they have left to finish the questions
            timer: undefined,
            // whether the timer is done or not
            outOfTime: false,
            // the timeouts
            timeouts: [],
            loading: false
        };
    }


    componentDidMount() {
        if (this.props.questionInfo && !(this.props.questionInfo.questionId === this.state.questionId) && !this.props.questionInfo.factorId) {
            this.setState({ questionId: this.props.questionInfo.questionId },() => {
                console.log("getting timer");
                this.getTimer();
            });
        }
    }

    componentDidUpdate() {
        if (this.props.questionInfo && !(this.props.questionInfo.questionId === this.state.questionId) && !this.props.questionInfo.factorId) {
            this.setState({ questionId: this.props.questionInfo.questionId },() => {
                this.getTimer();
            })
        }
    }

    // when any answer is clicked
    selectAnswer(selectedId) { this.setState({...this.state, selectedId}); }


    // move on to the next question (or start/finish the test)
    nextQuestion() {
        if ((typeof this.state.selectedId !== "undefined" || this.state.outOfTime) && !this.props.loading) {
            const selectedId = this.state.selectedId;
            this.resetTimer(() => {
                this.props.answerEvaluationQuestion("Cognitive", {
                    ...this.props.credentials,
                    selectedId
                })
            });
        }
    }


    startTest() {
        // can only start test if have agreed to cognitive terms
        if (this.state.agreedToTerms) {
            this.props.answerEvaluationQuestion("Cognitive", this.props.credentials);
        }
    }


    // agree to the terms to taking the test
    agreeToTerms() {
        if (this.state.agreedToTerms) {
            this.setState({ showExample: true });
        }
    }


    handleCheckMarkClick() {
        this.setState({ agreedToTerms: !this.state.agreedToTerms });
    }

    // generic error
    errorPage() { return <div>Something is wrong. Try refreshing.</div>; }

    // rendered if the user is on the first skill test of an eval and hasn't agreed to the test terms
    introPage() {
        // if the user agreed to the terms and is seeing an example now
        if (this.state.showExample) {
            return (
                <div className="evalPortionIntro skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450">
                    <div className="font24px"><span>Cognitive Test</span></div>
                    <div>
                        <p>You will be given a series of problems. Each will contain 8 images arranged in a 3 x 3 grid. These shapes make up some pattern. The grid is missing an the image in the bottom right.</p>
                        <p>Your goal is to find the image that matches the pattern. In the example there are only two options to choose from, but in the real test there will be 8 options.</p>
                        <p>Click the option that you think is correct and click the {"\"Next\""} button before time runs out.</p>
                        <p>Once you click {"\"Start\""} you have to finish the full test at the same time or you will lose points.</p>
                        <p>The test is meant to be difficult, so do your best but don{"'"}t worry if you don{"'"}t get them all!</p>
                        <p>Good luck!</p>
                        <p style={{marginBottom: "0"}}>(P.S. The process of elimination doesn{"'"}t usually work out so great. It{"'"}s generally better to figure out what you think the answer should be before looking at the solutions.)</p>
                    </div>
                    <img
                        src={"/images/cognitiveTest/RPM-Example" + this.props.png}
                        styleName="example-rpm"
                    /><br/>
                    {this.props.loading ?
                        <CircularProgress color="secondary" style={{marginBottom: "40px"}} />
                        :
                        <div
                            style={{marginBottom: "40px", width: "initial"}}
                            className="noselect skillContinueButton"
                            onClick={this.startTest.bind(this)}
                        >
                            Start
                        </div>
                    }
                </div>
            );
        }
        // if the user needs to agree to the user agreement first
        else {
            const buttonClass = "noselect skillContinueButton" + (this.state.agreedToTerms ? "" : " disabled");

            return (
                <div className="evalPortionIntro skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450">
                    <div className="font24px"><span>Cognitive Test</span></div>
                    <div>
                        <p>This is the cognitive portion of the evaluation. Here you will be tested on your aptitude in general cognition.</p>
                        <p><span>TIME IS A FACTOR.</span> You have 60 seconds to complete each question. After this, whatever answer you have will be saved and if you have no answer the question will be marked wrong.</p>
                        <p><span>DO NOT</span> exit this tab, go to another tab, or leave this window. Each time you do, your overall score will decrease.</p>
                        <p>The test will take no more than 8 minutes.</p>
                    </div>
                    <br/>
                    <div>
                        <div className="checkbox mediumCheckbox whiteCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                            <img
                                alt=""
                                className={"checkMark" + this.state.agreedToTerms}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        <p style={{padding: "0 40px"}}>By checking this box, I agree that I will answer the questions without help from anyone or any external resources and that if I were to be discovered doing so, at any point, all my results are void.</p>
                    </div>
                    <br/>
                    {this.props.loading ?
                        <CircularProgress color="secondary" style={{marginBottom: "40px"}} />
                        :
                        <div
                            style={{marginBottom: "40px", width: "initial"}}
                            className={buttonClass}
                            onClick={this.agreeToTerms.bind(this)}
                        >
                            Continue
                        </div>
                    }
                </div>
            );
        }
    }


    getTimer() {
        if (!this.state.timer) {
            const questionInfo = this.props.questionInfo;
            const time = (new Date()).getTime() - new Date(questionInfo.startDate).getTime();
            var seconds = 60 - Math.floor(time / 1000);
        } else {
            var seconds = this.state.timer - 1;
        }

        // If there is no time left, set outOfTime to be true and don't continue counting down
        if (seconds <= 0) {
            this.setState({ outOfTime: true });
        } else {
            let self = this;
            this.setState({
                timer: seconds,
                outOfTime: false,
                loading: false
            }, () => {
                self.state.timeouts.push(setTimeout(function() {
                    self.getTimer();
                }, 1000));
            });
        }
    }

    resetTimer(callback) {
        for (let i = 0; i < this.state.timeouts.length; i++) {
            clearTimeout(this.state.timeouts[i]);
        }
        this.setState({
            timer: undefined,
            outOfTime: false,
            selectedId: undefined,
            loading: true
        }, callback);
    }


    // main content with the quiz and questions
    createContent() {
        let self = this;

        const questionInfo = this.props.questionInfo;

        const answers = questionInfo.options.map(option => {
            const isSelected = this.state.selectedId === option._id;
            const selectedClass = isSelected ? " selected" : "";
            const outOfTimeClass = this.state.outOfTime ? " outOfTime" : "";
            const imgSrc = option.src + this.props.png;
            return (
                <div key={option.src}
                     onClick={this.state.outOfTime? null : () => self.selectAnswer(option._id)}
                     styleName={"multipleChoiceAnswer" + selectedClass + outOfTimeClass}
                >
                    <div styleName={"multipleChoiceCircle" + selectedClass + outOfTimeClass}><div/></div>
                    <div styleName="answersImg"><img src={imgSrc} /></div>
                </div>
            );
        });

        const canContinue = !this.props.loading && (this.state.selectedId || this.state.outOfTime);
        const buttonClass = "skillContinueButton" + (!canContinue ? " disabled" : "");

        const rpmSrc = questionInfo.rpm + this.props.png;

        let timer = "00";
        if (this.state.timer) {
            const time = this.state.timer;
            if (time < 10) {
                timer = "0" + time;
            } else {
                timer = time;
            }
        }

        return (
            <div className="font16px font14pxUnder600 font12pxUnder450">
                {this.state.loading ? <div className="secondary-gray">Loading next question...</div> :<div>
                {this.state.outOfTime ? <div styleName="error-red">Out of time - please advance to the next question.</div> : <div className="secondary-gray">0:{timer}</div> }
                <div className="marginBottom40px"><img styleName="rpmImg" src={rpmSrc} /></div>
                <div className="center" style={{maxWidth: "1000px", margin:"auto"}}>
                    { answers }
                </div>
                <div className={"marginBottom50px marginTop30px " + buttonClass} onClick={this.nextQuestion.bind(this)}>Next</div></div>
            }
            </div>
        );
    }


    render() {
        // all info about the current question to answer
        const questionInfo = this.props.questionInfo;

        // if user has never done a cognitive test before, show them the legalese stuff
        if (this.props.showIntro && !this.props.currentUser.agreedToSkillTerms) {
            return this.introPage(true);
        }

        // if the user has taken a cognitive test before
        else if (this.props.showIntro) { return this.introPage(false); }

        // if the question has not been loaded yet
        else if (!questionInfo) { return <CircularProgress color="secondary" />; }

        // the typical interface with the slider
        else if (questionInfo.rpm) { return this.createContent(); }

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
        evaluationState: state.users.evaluationState,
        questionInfo: state.users.evaluationState.componentInfo,
        showIntro: state.users.evaluationState.showIntro,
        loading: state.users.loadingSomething,
        png: state.users.png
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(CognitiveTest);
