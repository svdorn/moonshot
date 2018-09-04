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
            timeouts: []
        };
    }

    componentDidMount() {
        if (this.props.questionInfo && !(this.props.questionInfo.questionId === this.state.questionId)) {
            this.setState({ questionId: this.props.questionInfo.questionId },() => {
                this.getTimer();
            })
        }
    }

    componentDidUpdate() {
        if (this.props.questionInfo && !(this.props.questionInfo.questionId === this.state.questionId)) {
            this.setState({ questionId: this.props.questionInfo.questionId },() => {
                this.getTimer();
            })
        }
    }

    // shuffles a general array, used for shuffling questions around
    shuffle(arr) {
        let array = arr.slice();
        let currentIndex = array.length,
            temporaryValue,
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }


    // when any answer is clicked
    selectAnswer(selectedId) { this.setState({...this.state, selectedId}); }


    // move on to the next question (or start/finish the test)
    nextQuestion() {
        if ((typeof this.state.selectedId !== "undefined" || this.state.outOfTime) && !this.props.loading) {
            this.resetTimer(() => {
                this.props.answerEvaluationQuestion("Cognitive", {
                    ...this.props.credentials,
                    selectedId: this.state.selectedId
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


    handleCheckMarkClick() {
        this.setState({ agreedToTerms: !this.state.agreedToTerms });
    }

    // generic error
    errorPage() { return <div>Something is wrong. Try refreshing.</div>; }

    // rendered if the user is on the first skill test of an eval and hasn't agreed to the test terms
    userAgreementPage() {
        const buttonClass = "noselect skillContinueButton" + (this.state.agreedToTerms ? "" : " disabled");

        return (
            <div className="evalPortionIntro skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450">
                <div className="font24px"><span>Cognitive Test</span></div>
                <div>
                    <p>This is the cognitive portion of the evaluation. Here you will be tested on your aptitude in general cognition.</p>
                    <p><span>TIME IS A FACTOR.</span> You have 45 seconds to complete each question. After this, whatever answer you have will be saved and if you have no answer the question will be marked wrong.</p>
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
                        onClick={this.startTest.bind(this)}
                    >
                        Begin
                    </div>
                }
            </div>
        );
    }

    getTimer() {
        if (!this.state.timer) {
            const questionInfo = this.props.questionInfo;
            const time = (new Date()).getTime() - new Date(questionInfo.startDate).getTime();
            var seconds = 45 - Math.floor(time / 1000);
        } else {
            var seconds = this.state.timer - 1;
        }

        // If there is no time left, set outOfTime to be true and don't continue counting down
        if (seconds <= 0) {
            this.setState({ outOfTime: true })
        } else {
            let self = this;
            this.setState({
                timer: seconds,
                outOfTime: false
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
            outOfTime: false
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
            const imgSrc = "/images/cognitiveTest/" + option.body;
            return (
                <div key={option.body}
                     onClick={this.state.outOfTime? null : () => self.selectAnswer(option._id)}
                     className={"cognitiveMultipleChoiceAnswer" + selectedClass + outOfTimeClass}
                >
                    <div className={"skillMultipleChoiceCircle" + selectedClass}><div/></div>
                    <div styleName="answersImg"><img src={imgSrc + this.props.png} /></div>
                </div>
            );
        });

        const canContinue = !this.props.loading && (this.state.selectedId || this.state.outOfTime);
        const buttonClass = "skillContinueButton" + (!canContinue ? " disabled" : "");

        const rpmImg = "/images/cognitiveTest/" + questionInfo.rpm;

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
                {this.state.outOfTime ? <div styleName="error-red">Out of time - please advance to the next question.</div> : <div className="secondary-gray">0:{timer}</div> }
                <div className="marginBottom40px"><img styleName="rpmImg" src={rpmImg + this.props.png} /></div>
                <div className="center" style={{maxWidth: "800px", margin:"auto"}}>
                    { answers }
                </div>
                <div className={"marginBottom50px marginTop40px " + buttonClass} onClick={this.nextQuestion.bind(this)}>Next</div>
            </div>
        );
    }


    render() {

        // all info about the current question to answer
        const questionInfo = this.props.questionInfo;

        // if user has never done a skill test before, show them the legalese stuff
        if (this.props.showIntro && !this.props.currentUser.agreedToSkillTerms) {
            return this.userAgreementPage();
        }

        // if the user has taken a skill test before
        else if (this.props.showIntro) { return this.introPage(); }

        // if the question has not been loaded yet
        else if (!questionInfo) { return <CircularProgress color="secondary" />; }

        // the typical interface with the slider
        else if (questionInfo.rpm) {
            return this.createContent();
        }

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
