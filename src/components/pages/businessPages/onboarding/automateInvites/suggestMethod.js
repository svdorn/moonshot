"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';
import { truthy } from "../../../../../miscFunctions";

class SuggestMethod extends Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestion: props.currentUser.onboarding.integrationSuggestion ? props.currentUser.onboarding.integrationSuggestion : "",
            stepFinishedInPast: false
        }
    }


    componentWillMount() {
        const self = this;
        const currentUser = this.props.currentUser;
        // user can move on if they have given an integration suggestion
        const nextCallable = truthy(currentUser.onboarding) && truthy(currentUser.onboarding.suggestion);
        this.setState({ stepFinishedInPast: nextCallable });
        self.props.changeAutomateInvites({
            header: "Suggest Another Method",
            nextPage: "Manual Invite",
            nextCallable,
            lastSubStep: false,
            // add in extra function to submit the suggestion when Next clicked
            extraNextFunction: this.submitSuggestion.bind(self),
            extraNextFunctionPage: "Suggest Method"
        });
    }


    submitSuggestion() {
        // if there is a suggestion and it's different than what was suggested before
        if (this.state.suggestion && this.props.currentUser.onboarding.integrationSuggestion !== this.state.suggestion) {
            // save it
            axios.post("/api/accountAdmin/integrationSuggestion", {
                suggestion: this.state.suggestion,
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            })
            .then(response => {
                this.props.updateUser(response.data.user);
            })
            .catch(error => {
                console.log("error: ", error);
                this.props.addNotification("Error, please refresh.", "error");
            });
        }
    }


    // when typing into the form asking for an integration suggestion
    onChange(e) {
        // get value from input box
        const value = e.target.value;
        // set the text in the input box to be what the user typed
        this.setState({ suggestion: e.target.value });
        // if there is a non-empty value in the text box and the button is not clickable ...
        if (value && !this.props.automationStep.nextCallable) {
            // make the Next button clickable
            this.props.changeAutomateInvites({ nextCallable: true });
        }
        // if the text in the input box is deleted and the user has not completed
        // this step in the past ...
        if (!value && !this.state.stepFinishedInPast) {
            // don't let the user click the Next button
            this.props.changeAutomateInvites({ nextCallable: false });
        }
    }


    render() {
        return (
            <div className="suggest-integration">
                <div style={{textAlign: "left", width: "80%", minWidth: "200px", margin: "0 auto 10px"}}>
                    Suggest another integration to automate applicant invites or a method for us to collect your applicants{"'"}s email addresses.
                </div>
                <div className="buttonArea font16px" style={{justifyContent:"center"}}>
                    <textarea
                        name="suggestion"
                        placeholder="Type your suggestion here"
                        className="blackInput"
                        value={this.state.suggestion}
                        onChange={this.onChange.bind(this)}
                    />
                </div>
                { this.props.previousNextArea }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        automationStep: state.users.automateInvites,
        currentUser: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites,
        updateUser,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(SuggestMethod);
