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

class WhichATS extends Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestion: ""
        }
    }


    componentWillMount() {
        const currentUser = this.props.currentUser;
        // user can move on if they have given an integration suggestion
        const nextCallable = truthy(currentUser.onboarding) && truthy(currentUser.onboarding.suggestion);
        this.props.changeAutomateInvites({
            header: "Suggest Another Method",
            nextPage: "Manual Invite",
            nextCallable,
            lastSubStep: false
        });
    }


    submitSuggestion() {
        axios.post("/api/accountAdmin/integrationSuggestion", {
            suggestion: this.state.suggestion,
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken
        })
        .then(response => {
            this.props.updateUser(response.data.user);
            this.props.changeAutomateInvites({ nextCallable: true });
        })
        .catch(error => {
            this.props.addNotification("Error, refresh and try again.", "error");
        });
    }


    // when typing into the form asking which ats they use
    onChange(e) { this.setState({ suggestion: e.target.value }); }


    render() {
        return (
            <div>
                <div>
                    Suggest another integration to automate applicant invites or a method for us to collect your applicants{"'"}s email addresses.
                </div>
                <div className="buttonArea font18px font14pxUnder900" style={{justifyContent:"center"}}>
                    <input
                        type="textarea"
                        name="suggestion"
                        placeholder="Type your suggestion here"
                        className="blackInput"
                        value={this.state.suggestion}
                        onChange={this.onChange.bind(this)}
                    />
                    <div
                        className="button round-10px gradient-transition gradient-1-purple-light gradient-2-cyan"
                        onClick={this.submitATS.bind(this)}
                        style={{
                            marginLeft: "20px",
                            padding: "0 14px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center"
                        }}
                    >Enter</div>
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


export default connect(mapStateToProps, mapDispatchToProps)(WhichATS);
