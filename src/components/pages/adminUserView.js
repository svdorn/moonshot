"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';

class AdminUserView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: undefined,
            pathways: [],
            completedPathways: []
        };
    }


    componentDidMount() {
        const user = this.props.currentUser;
        let profileUrl = "";
        try {
            profileUrl = this.props.location.query.user;
        } catch(e) {
            this.goTo("/admin");
        }

        if (user.admin !== true) {
            this.goTo("/");
            return;
        }

        let self = this;

        axios.get("/api/userForAdmin", {params: {
            adminUserId: user._id,
            verificationToken: user.verificationToken,
            profileUrl
        }})
        .then(function(response) {
            const user = response.data.user;
            const pathways = response.data.pathways;
            const completedPathways = response.data.completedPathways;
            const quizzes = response.data.quizzes;
            self.setState({
                ...self.state,
                user, pathways, completedPathways, quizzes
            });
        })
        .catch(function(err) {
            console.log("error with getting info for admin");
        })
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    makePathwayLis(pathways, answers) {
        let self = this;
        let pathwayLis = null;

        if (pathways && Array.isArray(pathways) && pathways.length > 0) {
            pathwayLis = pathways.map(function(pathway) {
                if (!pathway) {
                    return null;
                }

                // create the steps that will be displayed under the pathway
                let steps = pathway.steps.map(function(step) {
                    let subSteps = step.subSteps.map(function(subStep) {
                        let content = "..."

                        if (subStep.contentType === "quiz") {
                            let answer = "";
                            // the current question
                            let question = self.state.quizzes[subStep.contentID];
                            let questionType = question.questionType;
                            // could take various forms depending on the question type
                            let answerValue = answers[subStep.contentID];

                            if (answerValue) {
                                switch (questionType) {
                                    case "twoOptions":
                                        const choices = question.twoOptionsChoices;
                                        if (answerValue.value == 1) {
                                            answer = choices.choice1;
                                        } else {
                                            answer = choices.choice2;
                                        }
                                        // take out a question mark if that's the last character
                                        if (answer.charAt(answer.length - 1) === '?') {
                                            answer = answer.substring(0, answer.length - 1);
                                        }
                                        break;
                                    case "multiSelect":
                                        answerValue.value.forEach(function(subAnswer) {
                                            answer = answer + question.multiSelectAnswers.find(function(option) {
                                                return option.answerNumber.toString() === subAnswer.toString();
                                            }).body + ", ";
                                        });
                                        if (answerValue.optionalCustomAnswer) {
                                            answer = answer + answerValue.optionalCustomAnswer;
                                        }
                                        break;
                                    case "multipleChoice":
                                        // if it's a custom value, the text of the answer will be within answerValue.value
                                        if (answerValue.isCustomAnswer) {
                                            answer = answerValue.value;
                                        }
                                        // otherwise find the answer corresponding to the value they picked
                                        else {
                                            answer = question.multipleChoiceAnswers.find(function(option) {
                                                return option.answerNumber.toString() === answerValue.value.toString();
                                            }).body;
                                        }
                                        break;
                                    case "slider":
                                        answer = answerValue.value;
                                        break;
                                    case "datePicker":
                                        const dateString = answerValue.value;
                                        answer = dateString.substring(5, 7) + "/" +
                                                dateString.substring(8, 10) + "/" +
                                                dateString.substring(0, 4);
                                        break;
                                    case "freeResponse":
                                        answer = answerValue.value;
                                    default:
                                        break;
                                }
                            } else {
                                answer = "(not answered)"
                            }

                            let questionName = "";
                            question.question.forEach(function(questionPart) {
                                questionPart.content.forEach(function(miniPart) {
                                    questionName = questionName + " " + miniPart;
                                })
                            });

                            content = (
                                <div>
                                    <span>{questionName}</span>
                                    <br/>
                                    <span className="blueText">Answer: {answer}</span>
                                </div>
                            );
                        }

                        return (
                            <li key={"subStep" + subStep.order}>{content}</li>
                        );
                    });

                    return (
                        <li key={"step" + step.order}>
                            Step {step.order}
                            <br/>
                            <ol>{subSteps}</ol>
                        </li>
                    );
                });

                return (
                    <li key={pathway.url}>
                        Pathway name: {pathway.name}
                        <br/>
                        Steps:
                        <ol>{steps}</ol>
                    </li>
                );
            });
        }

        return pathwayLis;
    }


    render() {
        const user = this.state.user;
        const pathways = this.state.pathways;
        const completedPathways = this.state.completedPathways;
        const quizzes = this.state.quizzes;

        let completedPathwayLis = null;
        let pathwayLis = null;
        if (user) {
            completedPathwayLis = this.makePathwayLis(completedPathways, user.answers);
            pathwayLis = this.makePathwayLis(pathways, user.answers);
        }

        const pathwaysHtml = (
            <ul>
                <li key={"completedPathways"}>COMPLETED PATHWAYS:</li>
                {completedPathwayLis}
                <li key={"incompletePathways"}>INCOMPLETE PATHWAYS:</li>
                {pathwayLis}
            </ul>
        );

        return (
            <div>
                {this.props.currentUser.admin === true ?
                    <div>
                        <div className="headerDiv greenToBlue" />
                        {user ?
                            <div>
                                {user.name}
                                <br/>
                                {pathwaysHtml}
                            </div>
                            : null
                        }
                    </div>

                    : null
                }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminUserView);
