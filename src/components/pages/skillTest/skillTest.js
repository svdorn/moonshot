"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import {  } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";
import { CircularProgress } from "material-ui";

class PsychAnalysis extends Component {
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
        const currentUser = this.props.currentUser;
        // make sure a user is logged in
        if (!currentUser) {
            this.goTo("/login");
        }

        let skillUrl = "";
        try {
            skillUrl = this.props.params.skillUrl;
        } catch (getSkillUrlError) {
            // TODO: go to discover skills page or somesuch
            return this.goTo("/");
        }

        axios.post("/api/skill/startOrContinueTest", {userId: currentUser._id, verificationToken: currentUser.verificationToken, skillUrl})
        .then(result => {
            this.setState({
                ...this.state,
                question: {
                    body: result.data.question.body,
                    options: this.shuffle(result.data.question.options),
                    multiSelect: result.data.question.multiSelect
                },
                skillName: result.data.skillName
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
                let question = undefined;
                if (result.data.question) {
                    question = result.data.question;
                    question.options = this.shuffle(question.options);
                }
                this.setState({
                    selectedId: undefined,
                    finished: result.data.finished,
                    question
                }, () => console.log("state is: ", this.state));
            })
            .catch(error => {
                console.log("error saving answer: ", error);
            })
        }
    }


    finishTest() {
        // TODO make it go to the actual results page
        this.goTo("/");
    }


    render() {
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
                        {option.body}
                    </div>
                );
            });
        }

        const buttonClass = this.state.selectedId === undefined ? "disabled mediumButton inlineBlock" : "mediumButton getStarted blueToPurple inlineBlock"

        let content = <CircularProgress/>;
        if (question) {
            content = (
                <div>
                    <StyledContent contentArray={question.body} />
                    { answers }
                    <div className={buttonClass} onClick={this.nextQuestion.bind(this)}>Next</div>
                </div>
            );
        }

        if (this.state.finished) {
            content = (
                <div>
                    Test Complete! Click submit to see your results.
                    <div className="mediumButton getStarted blueToPurple inlineBlock" onClick={this.finishTest.bind(this)}>Finish</div>
                </div>
            );
        }

        return (
            <div className="blackBackground fillScreen whiteText center">
                <MetaTags>
                    <title>{skillName} Test | Moonshot</title>
                    <meta name="description" content={"Prove your skills" + additionalMetaText + " to see how you stack up against your peers!"} />
                </MetaTags>
                <div className="extraHeaderSpace" />

                { content }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        //answerSkillQuestion
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(PsychAnalysis);
