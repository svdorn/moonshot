"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../../childComponents/addUserDialog';
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";
import { truthy } from "../../../../../miscFunctions";

class SuggestMethod extends Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestion: ""
        }
    }


    componentWillMount() {
        const self = this;
        const currentUser = this.props.currentUser;
        // user can move on if they have given an integration suggestion
        const nextCallable = truthy(currentUser.onboarding) && truthy(currentUser.onboarding.suggestion);
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
    onChange(e) { this.setState({ suggestion: e.target.value }); }


    render() {
        return (
            <div>
                <div>
                    Suggest another integration to automate applicant invites or a method for us to collect your applicants{"'"}s email addresses.
                </div>
                <div className="buttonArea font18px font14pxUnder900" style={{justifyContent:"center"}}>
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
