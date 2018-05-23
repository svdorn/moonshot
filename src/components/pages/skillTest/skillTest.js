"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import {  } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import StyledContent from "../../childComponents/styledContent";

class PsychAnalysis extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: undefined,
            question: undefined,
            finished: false
        };
    }


    componentDidMount() {
        const currentUser = this.props.currentUser;
        // make sure a user is logged in
        if (!currentUser) {
            this.goTo("/login");
        }
        // if the user already took the test, can't do it again
        else if (!currentUser.psychometricTest) {
            console.log("Have to have started the psych test first!");
            // TODO: make this go to the psych analysis landing page instead of home
            this.goTo("/");
        }
        // if the user already took the test, can't do it again
        else if (!currentUser.psychometricTest.inProgress) {
            console.log("Can only take the psych test once!");
            // TODO: make this go to the psych analysis landing page instead of home
            this.goTo("/");
        }

        let skillUrl = "";
        try {
            skillUrl = this.props.params.skillUrl;
        } catch (getSkillUrlError) {
            console.log("error getting skill url: ", getSkillUrlError);
            // TODO: go to discover skills page or somesuch
            this.goTo("/");
            return;
        }

        axios.get("/api/skill/skillByUrl", {params: {userId: currentUser._id, verificationToken: currentUser.verificationToken, skillUrl}})
        .then(result => {
            console.log("result is: ", result);
            this.setState({...this.state, skill: result.data});
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


    saveQuestion() {
        if (typeof this.state.selectedId !== "undefined") {
            const currentUser = this.props.currentUser;
            // don't need to send the question id because the user
            // has the current question saved
            const params = {
                userId: currentUser._id,
                verificationToken: currentUser.verificationToken,
                skillUrl: this.props.params.skillUrl,
                answerId: this.state.selectedId
            }
            axios.post("/user/saveSkillAnswer", params)
            .then(result => {
                this.setState({
                    selectedId: undefined,
                    finished: result.data.finished,
                    question: result.data.newQuestion
                });
            })
            .catch(error => {
                console.log("error saving answer: ", error);
            })
        }
    }


    render() {
        let self = this;
        const skillName = this.state.skill ? this.state.skill.name : "Skill";
        const additionalMetaText = this.state.skill ? " in " + this.state.skill.name.toLowerCase() : "";

        const question = this.state.question;

        const answers = question.options.map(answer => {
            const isSelected = this.state.selectedId === answer._id;
            const selectedClass = isSelected ? " selected" : "";
            <div onClick={() => self.selectAnswer(answer._id)}
                 className={"skillMultipleChoiceAnswer" + selectedClass}
            >
                {answer.body}
            </div>
        });

        return (
            <div className="blackBackground fillScreen whiteText center">
                <MetaTags>
                    <title>{skillName} Test | Moonshot</title>
                    <meta name="description" content={"Prove your skills" + additionalMetaText + " to see how you stack up against your peers!"} />
                </MetaTags>
                <StyledContent contentArray={question.body} />
                { answers }
                <div className="nextSkillQuestion" onClick={this.saveQuestion.bind(this)}>Next</div>
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
