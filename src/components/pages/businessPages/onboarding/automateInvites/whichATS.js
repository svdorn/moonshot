"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../../childComponents/addUserDialog';
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";

class WhichATS extends Component {
    constructor(props) {
        super(props);

        const user = this.props.currentUser;

        this.state = {
            ats: user.onboarding && user.onboarding.ats ? user.onboarding.ats :  ""
        }
    }


    componentWillMount() {
        const currentUser = this.props.currentUser;
        const self = this;
        // user can move on if they have said what their ats is
        const nextCallable = !!currentUser.onboarding && !!currentUser.onboarding.ats;
        this.props.changeAutomateInvites({
            header: "What applicant tracking system do you use?",
            nextPage: "Manual Invite",
            nextCallable,
            lastSubStep: false,
            // add in extra function to submit the suggestion when Next clicked
            extraNextFunction: this.submitATS.bind(self),
            extraNextFunctionPage: "Which ATS?"
        });
    }


    submitATS() {
        // if there is a suggestion and it's different than what was suggested before
        if (this.state.ats && this.props.currentUser.onboarding.ats !== this.state.ats) {
            // save it
            axios.post("/api/accountAdmin/identifyATS", {
                ats: this.state.ats,
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            })
            .then(response => {
                this.props.updateUser(response.data.user);
            })
            .catch(error => {
                this.props.addNotification("Error, please refresh.", "error");
            });
        }
    }


    // when typing into the form asking which ats they use
    onChange(e) {
        // get value from input box
        const value = e.target.value;
        // set the text in the input box to be what the user typed
        this.setState({ ats: e.target.value });
        // if there is a non-empty value in the text box and the button is not clickable ...
        if (value && !this.props.automationStep.nextCallable) {
            // make the Next button clickable
            this.props.changeAutomateInvites({ nextCallable: true });
        }
        // if the text in the input box is deleted and the user has not completed
        // this step in the past ...
        if (!value && !this.props.currentUser.onboarding.ats) {
            // don't let the user click the Next button
            this.props.changeAutomateInvites({ nextCallable: false });
        }
    }


    render() {
        return (
            <div>
                <div>
                    Let us know and we{"'"}ll see if we can set up an integration.
                </div>
                <div className="buttonArea font16px font14pxUnder900" style={{justifyContent:"center"}}>
                    <input
                        type="text"
                        name="email"
                        placeholder="What's your ATS?"
                        className="blackInput getStarted"
                        value={this.state.ats}
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


export default connect(mapStateToProps, mapDispatchToProps)(WhichATS);
