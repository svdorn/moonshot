"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';

class LanguagePreference extends Component {
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
        // user can move on if they have given their preference for language
        const nextCallable = truthy(currentUser.onboarding) && truthy(currentUser.onboarding.languagePreference);
        this.setState({ stepFinishedInPast: nextCallable });
        self.props.changeAutomateInvites({
            header: "Integrating with Your Application Page",
            nextPage: "Manual Invite",
            nextCallable,
            lastSubStep: false,
            // add in extra function to submit the suggestion when Next clicked
            extraNextFunction: this.submitLanguagePreference.bind(self),
            extraNextFunctionPage: "Language Preference"
        });
    }


    submitLanguagePreference() {
        // if there is a suggestion and it's different than what was suggested before
        // TODO: if (this.state.suggestion && this.props.currentUser.onboarding.integrationSuggestion !== this.state.suggestion) {
            // save it
            axios.post("/api/accountAdmin/languagePreference", {
                // TODO: suggestion: this.state.suggestion,
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
        // }
    }


    // when typing into the custom client-side language input
    clientChange(e) {
        // get value from input box
        const value = e.target.value;
        // set the text in the input box to be what the user typed
        this.setState({ customClientSide: e.target.value });
        // // if there is a non-empty value in the text box and the button is not clickable ...
        // if (value && !this.props.automationStep.nextCallable) {
        //     // make the Next button clickable
        //     this.props.changeAutomateInvites({ nextCallable: true });
        // }
        // // if the text in the input box is deleted and the user has not completed
        // // this step in the past ...
        // if (!value && !this.state.stepFinishedInPast) {
        //     // don't let the user click the Next button
        //     this.props.changeAutomateInvites({ nextCallable: false });
        // }
    }


    // when typing into the custom server-side language input
    serverChange(e) {
        this.setState({ customServerSide: e.target.value });
    }


    render() {
        return (
            <div className="site-install">
                <div>
                    How would you prefer to integrate with your site?
                </div>
                <div>
                    <div>Client-Side</div>
                    <div className="language-boxes">
                        <div className="language-box">JavaScript</div>
                        <div className="language-box">
                            Don{"'"}t see yours?
                            <input
                                type="text"
                                name="customClientSide"
                                placeholder="Enter language"
                                className="blackInput"
                                value={this.state.customClientSide}
                                onChange={this.clientChange.bind(this)}
                            />
                        </div>
                    </div>
                </div>
                    <div>Server-Side</div>
                <div>
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


export default connect(mapStateToProps, mapDispatchToProps)(LanguagePreference);
