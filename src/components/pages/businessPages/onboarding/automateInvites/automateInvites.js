"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import { popGoBackStack } from '../../../../../actions/usersActions';

import SelectMethod from "./selectMethod";
import WhichATS from "./whichATS";
import ManualInvite from "./manualInvite";

class AutomateInvites extends Component {
    constructor(props) {
        super(props);

        this.state = { }
    }


    nextButton() {
        // get the current user
        const user = this.props.currentUser;

        // by default, next button does nothing and looks disabled
        let next = () => { console.log("not moving on"); };
        let disabled = true;

        // if the user has already advanced past this step in the past, let them go on
        if (user.onboarding.furthestStep > user.onboarding.step) {
            next = this.props.next;
            disabled = false;
        }

        return (
            <div
                className={`button noselect round-4px inlineBlock ${disabled ? "disabled background-primary-black-light" : "background-primary-cyan"}`}
                onClick={next}
            >
                Next
            </div>
        );
    }


    previousButton() {
        // by default, previous button goes back to last step
        let previous = this.props.previous;

        // get info about the path that has been followed so far
        const automationStep = this.props.automationStep;

        // if there is a stack of pages we've been to that has more than the
        // current page in it ...
        if (automationStep && automationStep.pageStack && automationStep.pageStack.size() > 1) {
            // ... make previous a function that ...
            previous = () => {
                // TODO: ... removes the top of the stack ...

                // TODO: ... then gets the new top ...

                // TODO: ... and navigates there
            }
        }

        return (
            <div
                className="previous noselect clickable underline inlineBlock"
                onClick={previous}
            >
                Previous
            </div>
        );
    }


    createPreviousNextArea() {
        return (
            <div className="previous-next-area primary-white font18px center marginTop20px">
                { this.previousButton() }
                { this.nextButton() }
            </div>
        );
    }


    createBody() {
        let body = null;

        // the sequence of choices that have been made so far while following the
        // automate-candidate-invites path
        const automationStep = this.props.automationStep;

        const childProps = {
            previousNextArea: this.createPreviousNextArea()
        }

        // if no initial method path is selected, show the screen that asks if you want
        // to integrate with an ATS, put a script on your own site, or suggest
        // some other integration
        if (typeof automationStep !== "object" || !automationStep.method) {
            return( <SelectMethod {...childProps} /> );
        }

        // if the user selected that they want to integrate with an ATS
        else if (automationStep.method === "ats") {
            return ( <WhichATS {...childProps} /> );
        }

        // if the user is at the end of any path, show them how to invite manually
        else if (automationStep.finishedPath === true) {
            return ( <ManualInvite {...childProps} /> );
        }
    }


    render() {
        return (
            <div className="automate-invites primary-white center">
                { this.createBody() }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        automationStep: state.users.automateInvites,
        method: state.users.automateInvites ? state.users.automateInvites.method : undefined,
        currentUser: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        popGoBackStack
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AutomateInvites);
