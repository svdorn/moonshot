"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';
import { truthy } from "../../../../../miscFunctions";


class LanguagePreference extends Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestion: props.currentUser.onboarding.integrationSuggestion ? props.currentUser.onboarding.integrationSuggestion : "",
            stepFinishedInPast: false,
            // the language that the user selected
            selectedBox: undefined,
            clientCustom: "",
            serverCustom: ""
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
        const user = this.props.currentUser;
        // if there is a suggestion and it's different than what was suggested before
        const selectedBox = this.state.selectedBox;
        // selected a custom input box
        const isCustom = selectedBox && selectedBox.includes("Custom");
        // the response the user gave to a custom box - undefined if a normal box chosen
        const customLanguage = isCustom ? (selectedBox === "clientCustom" ? this.state.clientCustom : this.state.serverCustom) : undefined;
        // have selected a box, and if a custom box, have entered text in the right boxClick
        console.log("hai");
        const optionSelected =
            truthy(selectedBox) &&
            (
                !isCustom ||
                (truthy(this.state.clientCustom) && selectedBox === "clientCustom") ||
                (truthy(this.state.serverCustom) && selectedBox === "serverCustom")
            );
        // do nothing if no good input
        if (!optionSelected) { return; }
        // whether the user answered something different than what they did in the past
        let isDifferentAnswer;
        // if currently on a custom answer, check that the old custom answer is
        // different than the new one and that they're not the same type (client vs server)
        if (isCustom) {
            if (user.onboarding.languagePreference !== selectedBox) { isDifferentAnswer = true; }
            else { isDifferentAnswer = user.onboarding.customLanguage !== customLanguage; }
        }
        // if not on a custom answer, check that the old answer text is different
        // than the current answer text
        else { isDifferentAnswer = user.onboarding.languagePreference !== selectedBox; }

        // if what was selected is different than what was selected before, save it
        if (isDifferentAnswer) {
            // // save it
            // axios.post("/api/accountAdmin/languagePreference", {
            //     languagePreference: selectedBox,
            //     customLanguage,
            //     userId: this.props.currentUser._id,
            //     verificationToken: this.props.currentUser.verificationToken
            // })
            // .then(response => { this.props.updateUser(response.data.user); })
            // .catch(error => {
            //     console.log("error: ", error);
            //     this.props.addNotification("Error, please refresh.", "error");
            // });
            console.log("was a different answer");
        }
    }


    // when typing into the custom client-side language input
    inputChange(e, type) {
        // get value from input box
        const value = e.target.value;
        // set the text in the input box to be what the user typed
        let newArgs = {};
        newArgs[`${type}Custom`] = value;
        this.setState(newArgs);
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


    // select a box with a language
    selectBox(selectedBox) { this.setState({ selectedBox }); }


    // create selectable boxes with language names
    // type = "client" or "server"
    createBoxes(languages, type) {
        // the language boxes
        let boxes = languages.map(language => {
            return (
                <div
                    className={`language-box${this.state.selectedBox === language ? " selected" : ""}`}
                    onClick={() => this.selectBox(language)}
                    key={language}
                >
                    {language}
                </div>
            );
        });

        // add a box for input
        boxes.push(
            <div
                className={`language-box${this.state.selectedBox === `${type}Custom` ? " selected" : ""}`}
                onClick={() => this.selectBox(`${type}Custom`)}
                key={`${type}Custom`}
            >
                Don{"'"}t see yours?<br/>
                <input
                    type="text"
                    name={`custom${type}Side`}
                    placeholder="Enter language"
                    className="blackInput"
                    value={this.state[`${type}Custom`]}
                    onChange={(e) => this.inputChange(e, type)}
                />
            </div>
        );

        return boxes;
    }


    render() {
        // languages that can be selected
        const clientSideLanguages = ["JavaScript"];
        const serverSideLanguages = ["Node.js", "Java", "Python", "cURL", "PHP", "Ruby"];

        // create array boxes for client- and server-side
        const clientSideBoxes = this.createBoxes(clientSideLanguages, "client");
        const serverSideBoxes = this.createBoxes(serverSideLanguages, "server");

        return (
            <div className="language-preference">
                <div>
                    How would you prefer to integrate with your site?
                </div>
                <div>
                    <div>Client-Side</div>
                    <div className="language-boxes">
                        { clientSideBoxes }
                    </div>
                </div>
                    <div>Server-Side</div>
                    <div className="language-boxes">
                        { serverSideBoxes }
                    </div>
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
