"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { closeNotification, answerPsychQuestion } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import PsychSlider from './psychSlider';

class PsychAnalysis extends Component {
    constructor(props) {
        super(props);

        // start out with the slider in the middle
        this.state = { answer: 0 };
    }


    componentDidMount() {
        // make sure a user is logged in
        if (!this.props.currentUser) {
            goTo("/");
        }
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
        this.props.answerPsychQuestion(this.props.currentUser._id, this.props.currentUser.verificationToken, this.state.answer);
    }


    updateAnswer(newAnswer) {
        this.setState({
            ...this.state,
            answer: newAnswer
        })
    }


    render() {
        // get the current user and question
        let currentUser = undefined;
        let question = "";
        try {
            currentUser = this.props.currentUser;
            console.log("currentUser: ", currentUser);
            const psychometricTest = currentUser.psychometricTest;
            // if the user already took the test, can't do it again
            if (!psychometricTest.inProgress) {
                console.log("Can only take the psych test once!");
                // TODO: make this go to the psych analysis landing page instead of home
                this.goTo("/");
                return null;
            }
            question = currentUser.psychometricTest.currentQuestion.body;
        } catch (getQuestionError) {
            // TODO: make this go to the psych analysis landing page instead of home
            console.log("getQuestionError: ", getQuestionError);
            console.log("Need to have started the test to see the questions!");
            this.goTo("/");
            return null;
        }

        return (
            <div className="blackBackground fillScreen whiteText">
                <MetaTags>
                    <title>Psychometric Analysis | Moonshot</title>
                    <meta name="description" content={"Find out what personality type you have! This will let us know how to best help you in getting the perfect job."} />
                </MetaTags>
                <div className="employerHeader" />
                <div>
                    {question}
                </div>
                <PsychSlider
                    width="350px"
                    height="200px"
                    style={{marginLeft:"200px"}}
                    updateAnswer={this.updateAnswer.bind(this)}
                />
                <div className="clickable" onClick={this.nextQuestion.bind(this)}>
                    Next
                </div>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        answerPsychQuestion
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(PsychAnalysis);
