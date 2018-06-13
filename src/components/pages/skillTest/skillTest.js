"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { addNotification, newCurrentUser } from "../../../actions/usersActions";
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
            skillName: undefined
        };
    }


    componentDidMount() {
        try {
            const skillUrl = this.props.params.skillUrl;
            this.resetPage(skillUrl);
        } catch (getSkillUrlError) {
            console.log(getSkillUrlError);
            return this.goTo("/myEvaluations");
        }
    }


    componentWillReceiveProps(newProps) {
        // new skill url means we have a new skill to test
        if (this.props.params.skillUrl !== newProps.params.skillUrl) {
            this.resetPage(newProps.params.skillUrl)
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
            console.log("Error getting skill: ", error.response.data);
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
        if (typeof this.state.selectedId !== "undefined") {
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
                    selectedId: undefined,
                    finished: result.data.finished,
                    question
                });
            })
            .catch(error => {
                console.log("error saving answer: ", error);
            })
        }
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

        const buttonClass = this.state.selectedId === undefined ? "disabled skillContinueButton" : "skillContinueButton"

        let content = <CircularProgress color="#FB553A" />;

        if (this.state.finished) {
            content = (
                <div>
                    Test Complete!
                    <br/>
                    <div style={{marginTop:"20px"}} className="skillContinueButton" onClick={this.finishTest.bind(this)}>Finish</div>
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
        else if (question) {
            content = (
                <div>
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
                <ProgressBar />
                { content }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification, newCurrentUser
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(SkillTest);
