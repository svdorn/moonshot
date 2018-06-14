"use strict"
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { submitFreeResponse } from "../../actions/usersActions";
import { CircularProgress } from "material-ui";
import ProgressBar from '../miscComponents/progressBar';
import MetaTags from "react-meta-tags";


class FreeResponse extends Component {
    constructor(props) {
        super(props);

        // check if the user has a current position in progress; they need one
        // in order to have any questions to answer
        const currentUser = props.currentUser;
        if (!currentUser ||
            !currentUser.currentPosition ||
             currentUser.currentPosition === false ||
            !currentUser.currentPosition.freeResponseQuestions ||
             currentUser.currentPosition.freeResponseQuestions.length === 0
        ) {
            this.goTo("/");
        }


        // the object that will hold all the responses
        let frqs = {};
        currentUser.currentPosition.freeResponseQuestions.forEach(frq => {
            frqs[frq.questionId] = {
                questionIndex: frq.questionIndex,
                body: frq.body,
                response: "",
                required: frq.required
            }
        });

        // not currently submitting the free response questions
        const submitting = false;

        this.state = { frqs, submitting, clickedBegin: false };
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleInputChange(e, questionId) {
        let newFrqs = Object.assign({}, this.state.frqs);
        newFrqs[questionId].response = e.target.value;

        this.setState({ newFrqs });
    }


    submit() {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        const self = this;
        // what will be sent to the back-end
        const frqsToSubmit = [];

        const frqsObject = this.state.frqs;
        for (let questionId in frqsObject) {
            if (frqsObject.hasOwnProperty(questionId)) {
                const question = frqsObject[questionId];
                frqsToSubmit.push({
                    questionId,
                    questionIndex: question.questionIndex,
                    response: question.response,
                    body: question.body
                });
            }
        }

        self.setState({submitting: true}, () => {
            self.props.submitFreeResponse(this.props.currentUser._id, this.props.currentUser.verificationToken, frqsToSubmit);
        });
    }


    // checks if all required skill tests are done
    skillTestsDone() {
        const currentPosition = this.props.currentUser.currentPosition;
        // if there are no skill tests, must be done with them
        if (!currentPosition || !currentPosition.skillTests) { return true; }
        // if the index of the current test is valid and in bounds, not done with tests
        return parseInt(currentPosition.testIndex, 10) >= currentPosition.skillTests.length;
    }


    // finds which skill tests still need to be done
    findNeededSkillTest() {
        const currentPosition = this.props.currentUser.currentPosition;
        // make sure there is a test that hasn't been taken
        if (!currentPosition.skillTests || parseInt(currentPosition.testIndex, 10) >= currentPosition.skillTests.length) {
            return "/freeResponse";
        }
        return `/skillTest/${currentPosition.skillTests[parseInt(currentPosition.testIndex, 10)]}`;
    }


    begin() {
        this.setState({ clickedBegin: true });
    }


    render() {
        const self = this;
        const currentUser = this.props.currentUser;

        let content = null;

        if (this.state.submitting) {
            content = (
                <div className="blackBackground fillScreen center">
                    <div className="extraHeaderSpace" />
                    <CircularProgress color="#FB553A" />
                </div>
            );
        }

        else if (currentUser.positionInProgress && (!currentUser.adminQuestions || !currentUser.adminQuestions.finished)) {
            content = (
                <div className="center">
                    You have to complete the administrative questions first!<br/>
                    <button onClick={() => this.goTo("/adminQuestions")} className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline">
                        Take me there!
                    </button>
                </div>
            );
        }

        else if (currentUser.positionInProgress && (!currentUser.psychometricTest || !currentUser.psychometricTest.endDate)) {
            content = (
                <div className="center">
                    You have to complete the psychometric analysis first!<br/>
                    <button onClick={() => this.goTo("/psychometricAnalysis")} className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline">
                        Take me there!
                    </button>
                </div>
            );
        }

        else if (currentUser.positionInProgress && !this.skillTestsDone()) {
            const skillTestUrl = this.findNeededSkillTest();
            content = (
                <div className="center">
                    You have to complete all the skill evaluations first!<br/>
                    <button onClick={() => this.goTo(skillTestUrl)} className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline">
                        Take me there!
                    </button>
                </div>
            );
        }

        // have the user read about the free response section before doing it
        else if (!this.state.clickedBegin) {
            content = (
                <div className="evalPortionIntro center">
                    <div/>
                    <div>
                        <p>This is the short answer portion of the evaluation. Follow the instructions carefully for each question.</p>
                        <p><span>DO NOT</span> exit this tab, go to another tab, or leave this window. Each time you do, your score will decrease.</p>
                    </div>
                    <br/>
                    <div style={{marginBottom: "40px", width: "initial"}} className={"skillContinueButton"} onClick={this.begin.bind(this)}>Begin</div>
                </div>
            )
        }

        else {
            // get the list of questions
            const frqList = this.props.currentUser.currentPosition.freeResponseQuestions;
            // make the questions that will show up and can be answered
            const freeResponseQuestions = frqList.map(frq => {
                return (
                    <div key={frq.questionId}>
                        {frq.body}
                        <textarea
                            type="text"
                            value={this.state.frqs[frq.questionId].response}
                            placeholder="Your answer here"
                            onChange={(e) => self.handleInputChange(e, frq.questionId)}
                        />
                    </div>
                );
            });

            content = (
                <div>
                    <div className="freeResponseQuestions">
                        { freeResponseQuestions }
                    </div>
                    <div className="center" style={{width: "100%"}}>
                        <div className="skillContinueButton"
                             onClick={this.submit.bind(this)}
                        >
                            Finish
                        </div>
                    </div>
                </div>
            );
        }



        return (
            <div className="blackBackground fillScreen whiteText" style={{paddingBottom: "60px"}}>
                <MetaTags>
                    <title>Free Response | Moonshot</title>
                    <meta name="description" content={"Answer some free response questions to finish your position evaluation."} />
                </MetaTags>
                <div className="employerHeader" />
                <ProgressBar />
                { content }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        submitFreeResponse
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(FreeResponse);
