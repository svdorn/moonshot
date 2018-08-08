"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { changeAutomateInvites } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";

class SelectMethod extends Component {
    componentWillMount() {
        this.props.changeAutomateInvites({
            header: "Automate Applicant Invites",
            lastSubStep: false,
            nextPage: null
        });
    }


    // when the user clicks the box identifying which integration type they want to do
    boxClick(page) {
        // add the page corresponding to the button pressed to the page stack
        this.props.changeAutomateInvites({ page });
    }


    render() {
        // the different paths you can choose to go down
        const integrationOptions = [
            {
                title: "Applicant Tracking System",
                page: "Which ATS?"
            },
            {
                title: "Application Page Hosted on Your Site",
                page: "Language Preference"
            },
            {
                title: "Suggest Another Integration or Method",
                page: "Suggest Method"
            }
        ];

        // the boxes that link you to the first step of that method
        const integrationBoxes = integrationOptions.map(option => {
            return (
                <div
                    className="method-box transitionAll"
                    onClick={() => this.boxClick(option.page)}
                    key={option.page}
                >
                    { option.title }
                </div>
            );
        });

        return (
            <div>
                <div style={{textAlign: "left", width: "80%", minWidth: "200px", margin: "0 auto 10px"}}>
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


// the header for the current page
const pageHeader = "Automate Applicant Invites";


function mapStateToProps(state) {
    return {
        automationStep: state.users.automateInvites
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(SelectMethod);
