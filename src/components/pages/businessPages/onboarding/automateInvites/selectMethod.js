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
    // set the header of the onboarding page
    componentWillMount() {
        this.props.changeAutomateInvites({ header: pageHeader });
    }


    // when the user clicks a box marking which type of integration they want to do
    boxClick(method) {
        // console.log("here");
        // const self = this;
        // // the action to come back to this page
        // const backAction = () => {
        //     self.props.changeAutomateInvites({ method: undefined, header: pageHeader });
        // }
        // // object to add the method of choice and back action to redux state
        // const updates = { method, pushToGoBackStack: backAction };
        // // switch to the page that contains the path of the selected option
        // self.props.changeAutomateInvites(updates);
        this.props.changeAutomateInvites({ method });
    }


    render() {
        // the different paths you can choose to go down
        const integrationOptions = [
            {
                title: "Applicant Tracking System",
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
                    onClick={() => this.boxClick(option.method)}
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


// the header for the current page
const pageHeader = "Automate Applicant Invites";


function mapStateToProps(state) {
    return {

    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(SelectMethod);
