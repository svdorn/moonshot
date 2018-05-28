"use strict"
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { submitFreeResponse } from "../../actions/usersActions";
import { CircularProgress } from "material-ui";


class FreeResponse extends Component {
    constructor(props) {
        super(props);

        // check if the user has a current position in progres; they need one
        // in order to have any questions to answer
        const currentUser = props.currentUser;
        if (!currentUser ||
            !currentUser.positionInProgress ||
            currentUser.positionInProgress === false ||
            !currentUser.positionInProgress.freeResponseQuestions ||
            currentUser.positionInProgress.freeResponseQuestions.length === 0
        ) {
            this.goTo("/");
        }


        // the object that will hold all the responses
        let frqs = {};
        currentUser.positionInProgress.freeResponseQuestions.forEach(frq => {
            frqs[frq.questionId] = {
                questionIndex: frq.questionIndex,
                body: frq.body,
                response: "",
                required: frq.required
            }
        });

        // not currently submitting the free response questions
        const submitting = false;

        this.state = { frqs, submitting };
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


    render() {
        const self = this;

        if (this.state.submitting) {
            return (
                <div className="blackBackground">
                    <div className="extraHeaderSpace" />
                    <CircularProgress />
                </div>
            );
        }

        // get the list of questions
        const frqList = this.props.currentUser.positionInProgress.freeResponseQuestions;
        // make the questions that will show up and can be answered
        const freeResponseQuestions = frqList.map(frq => {
            return (
                <div key={frq.questionId}>
                    {frq.body}
                    <textarea
                        type="text"
                        value={this.state.frqs[frq.questionId].response}
                        placeholder="Your answer here."
                        onChange={(e) => self.handleInputChange(e, frq.questionId)}
                    />
                </div>
            );
        });

        return (
            <div className="blackBackground">
                <div className="extraHeaderSpace" />
                { freeResponseQuestions }
                <div className="mediumButton getStarted blueToPurple"
                     onClick={this.submit.bind(this)}
                >
                    Submit application
                </div>
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
