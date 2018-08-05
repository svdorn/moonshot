"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import { popGoBackStack } from '../../../../../actions/usersActions';

import SelectMethod from "./selectMethod";
import WhichATS from "./whichATS";

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

        // if there is a non-empty stack of actions for going back to previous steps
        if (automationStep && automationStep.goBackStack && automationStep.goBackStack.size() > 0) {
            // make previous a function that ...
            previous = () => {
                // ... gets the action to go back to the previous step ...
                const goBackAction = automationStep.goBackStack.top();
                // ... ensures the action is defined ...
                if (typeof goBackAction === "function") {
                    // ... performs that action ...
                    goBackAction();
                    // ... then removes that action from the stack
                    this.props.popGoBackStack();
                }
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
        if (automationStep.method === "ats") {
            return ( <WhichATS {...childProps} /> );
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
        header: state.users.automateInvites ? state.users.automateInvites.header : undefined,
        currentUser: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        popGoBackStack
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AutomateInvites);
