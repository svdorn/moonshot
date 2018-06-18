"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { addNotification, newCurrentUser, agreeToSkillTestTerms } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";
import { CircularProgress } from "material-ui";
import ProgressBar from '../../miscComponents/progressBar';

class SkillTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            question: undefined,
            finished: false,
            skillName: undefined,
            agreedToTerms: false,
            canContinue: true
        };
    }


    componentDidMount() {
        try {
            const skillUrl = this.props.params.skillUrl;
            this.resetPage(skillUrl);
        } catch (getSkillUrlError) {
            return this.goTo("/myEvaluations");
        }
    }


    // componentWillReceiveProps(newProps) {
    //     // new skill url means we have a new skill to test
    //     if (this.props.params.skillUrl !== newProps.params.skillUrl) {
    //         this.resetPage(newProps.params.skillUrl);
    //     }
    // }


    componentDidUpdate(prevProps, newState) {
        // new skill url means we have a new skill to test
        if (this.props.params.skillUrl !== prevProps.params.skillUrl) {
            this.resetPage(this.props.params.skillUrl);
        }
    }


    resetPage(skillUrl) {
        const currentUser = this.props.currentUser;
        // make sure a user is logged in
        if (!currentUser) {
            this.goTo("/login");
        }

        const params = {
            userId: currentUser._id,
            verificationToken: currentUser.verificationToken,
            skillUrl
        }

        axios.post("/api/skill/startOrContinueTest", params)
        .then(result => {
            this.setState({
                question: {
                    body: result.data.question.body,
                    options: this.shuffle(result.data.question.options),
                    multiSelect: result.data.question.multiSelect
                },
                skillName: result.data.skillName,
                selectedId: undefined,
                finished: false
            });
        })
        .catch(error => {
            // console.log("Error getting skill: ", error.response.data);
        });
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


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


    selectAnswer(selectedId) {
        this.setState({...this.state, selectedId});
    }


    nextQuestion() {
        if (typeof this.state.selectedId !== "undefined" && this.state.canContinue) {
            this.setState({
                canContinue: false
            }, () => {
                const currentUser = this.props.currentUser;
                // don't need to send the question id because the user
                // has the current question saved
                const params = {
                    userId: currentUser._id,
                    verificationToken: currentUser.verificationToken,
                    skillUrl: this.props.params.skillUrl,
                    // an array because maybe later we'll have multi select questions
                    answerIds: [ this.state.selectedId ]
                }
                axios.post("/api/skill/answerSkillQuestion", params)
                .then(result => {
                    this.props.newCurrentUser(result.data.updatedUser);
                    let question = undefined;
                    if (result.data.question) {
                        question = result.data.question;
                        //question.options = this.shuffle(question.options);
                    }
                    this.setState({
                        finished: result.data.finished,
                        selectedId: undefined,
                        question,
                        canContinue: true
                    });
                })
                .catch(error => {
                    // console.log("error saving answer: ", error);
                })
            });
        }
    }


    handleCheckMarkClick() {
        this.setState({ agreedToTerms: !this.state.agreedToTerms });
    }


    agreeToTerms() {
        if (this.state.agreedToTerms) {
            const currentUser = this.props.currentUser;
            this.props.agreeToSkillTestTerms(currentUser._id, currentUser.verificationToken);
        }
    }


    // rendered if the user is on the first skill test of an eval and hasn't agreed to the test terms
    userAgreement() {
        const buttonClass = this.state.agreedToTerms ? "skillContinueButton" : "disabled skillContinueButton";

        return (
            <div className="evalPortionIntro skillsUserAgreement center font16px font14pxUnder600 font12pxUnder450">
                <div className="font24px" style={{marginBottom: "20px"}}><span>Skills</span></div>
                <div>
                    <p>This is the skills portion of the evaluation. Here you will be tested on your aptitude in one or more skills.</p>
                    <p><span>TIME IS A FACTOR.</span> After 20 seconds for each question, your score for that question will decrease as time goes on.</p>
                    <p><span>DO NOT</span> exit this tab, go to another tab, or leave this window. Each time you do, your overall score will decrease.</p>
                    <p>The number of questions in the skills test will change as you go depending on a number of factors. It will end once a score has been determined, but each test should take no more than ten minutes.</p>
                </div>
                <br/>
                <div>
                    <div className="checkbox mediumCheckbox whiteCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                        <img
                            alt=""
                            className={"checkMark" + this.state.agreedToTerms}
                            src="/icons/CheckMarkRoundedWhite.png"
                        />
                    </div>
                    <p style={{padding: "0 40px"}}>By checking this box, I agree that I will answer the questions without help from anyone or any external resources and that if I were to be discovered doing so, at any point, all my results are void.</p>
                </div>
                <br/>
                {this.props.agreeingToTerms ?
                    <CircularProgress color="#FB553A" style={{marginBottom: "40px"}} />
                    :
                    <div style={{marginBottom: "40px", width: "initial"}} className={buttonClass} onClick={this.agreeToTerms.bind(this)}>Begin</div>
                }
            </div>
        );
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
            // TODO make it go to the actual results page
            this.goTo("/");
        }
    }


    render() {
        const currentUser = this.props.currentUser;
        // make sure user is logged in
        if (!currentUser) {
            this.goTo("/login");
        }
        // have to have completed the psych test and admin questionsbefore you
        // can take a skills - but only if you're taking an evaluation right now

        let self = this;
        const skillName = this.state.skillName ? this.state.skillName : "Skill";
        const additionalMetaText = this.state.skillName ? " in " + this.state.skillName.toLowerCase() : "";

        const question = this.state.question;
        let answers;
        if (question) {
            answers = question.options.map(option => {
                const isSelected = this.state.selectedId === option._id;
                const selectedClass = isSelected ? " selected" : "";
                return (
                    <div key={option.body}
                         onClick={() => self.selectAnswer(option._id)}
                         className={"skillMultipleChoiceAnswer" + selectedClass}
                    >
                        <div className={"skillMultipleChoiceCircle" + selectedClass}><div/></div>
                        <div className="skillMultipleChoiceOptionText">{option.body}</div>
                    </div>
                );
            });
        }

        const buttonClass = !this.state.canContinue || this.state.selectedId === undefined ? "disabled skillContinueButton" : "skillContinueButton"

        let content = <CircularProgress color="#FB553A" />;

        if (this.state.finished) {
            content = (
                <div>
                    Skill test complete!
                    <br/>
                    <div style={{marginTop:"20px"}} className="skillContinueButton" onClick={this.finishTest.bind(this)}>Continue</div>
                </div>
            );
        }
        else if (currentUser.positionInProgress && (!currentUser.adminQuestions || !currentUser.adminQuestions.finished)) {
            content = (
                <div className="blackBackground">
                    You have to complete the administrative questions first!<br/>
                    <button onClick={() => this.goTo("/adminQuestions")} className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline">
                        Take me there!
                    </button>
                </div>
            );
        } else if (currentUser.positionInProgress && (!currentUser.psychometricTest || !currentUser.psychometricTest.endDate)) {
            content = (
                <div>
                    You have to complete the psychometric analysis first!
                    <button onClick={() => this.goTo("/psychometricAnalysis")} className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline">
                        Take me there!
                    </button>
                </div>
            );
        }

        // if the user hasn't agreed to the terms, prompt them to
        else if (currentUser.currentPosition && !currentUser.currentPosition.agreedToSkillTestTerms) {
            content = this.userAgreement();
        }

        // otherwise, good to go - show them the question
        else if (question) {
            content = (
                <div className="font16px font14pxUnder600 font12pxUnder450">
                    <StyledContent contentArray={question.body} style={{marginBottom:"40px"}} />
                    { answers }
                    <div className={"marginBottom50px " + buttonClass} onClick={this.nextQuestion.bind(this)}>Next</div>
                </div>
            );
        }

        return (
            <div className="blackBackground fillScreen whiteText center">
                <MetaTags>
                    <title>{skillName} Test | Moonshot</title>
                    <meta name="description" content={"Prove your skills" + additionalMetaText + " to see how you stack up against your peers!"} />
                </MetaTags>
                <div className="employerHeader" />
                <ProgressBar skillName={skillName}/>
                { content }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification, newCurrentUser, agreeToSkillTestTerms
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        agreeingToTerms: state.users.loadingSomething
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(SkillTest);
