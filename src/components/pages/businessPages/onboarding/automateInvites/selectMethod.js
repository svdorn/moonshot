"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../../childComponents/addUserDialog';
import { changeAutomateInvites } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";

class SelectMethod extends Component {
    boxClick(option) {
        this.props.changeAutomateInvites(option);
    }


    render() {
        // the different paths you can choose to go down
        const integrationOptions = [
            {
                title: "Applicant Tracking System",
                header: "What applicant tracking system do you use?",
                method: "ats"
            },
            {
                title: "Application Page Hosted on Your Site",
                header: "Creating a Webhook for your Application Page",
                method: "site"
            },
            {
                title: "Suggest Another Integration or Method",
                header: "Suggest Another Method",
                method: "suggest"
            }
        ];

        // the boxes that link you to the first step of that method
        const integrationBoxes = integrationOptions.map(option => {
            return (
                <div
                    className="method-box transitionAll"
                    onClick={() => this.boxClick(option)}
                    key={option.method}
                >
                    { option.title }
                </div>
            );
        });

        return (
            <div>
                <div style={{textAlign: "left"}}>
                    We are actively creating integrations to automate applicant
                    invites and save you hours of manual entry. Select what
                    integration would be most valuable to you.
                </div>
                <div className="method-boxes">
                    { integrationBoxes }
                </div>
                { this.props.previousNextArea }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        sequence: state.users.automateInvites
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(SelectMethod);
