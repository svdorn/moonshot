"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import { popGoBackStack, changeAutomateInvites } from '../../../../../actions/usersActions';

import SelectMethod from "./selectMethod";
import WhichATS from "./whichATS";
import ManualInvite from "./manualInvite";

class AutomateInvites extends Component {
    constructor(props) {
        super(props);

        this.state = { }
    }


    componentDidMount() {
        // check if there is NOT a populated stack of pages already
        if (!this.props.pageStack || this.props.pageStack.size() === 0) {
            // when on this step for the first time in the current redux state, add
            // the Select Method page to the page stack so it's the page we're on first
            this.props.changeAutomateInvites({ page: "Select Method" });
        }
    }


    nextButton() {
        console.log("making next button");
        // get the current user
        const user = this.props.currentUser;
        // get the STEP information
        const automationStep = this.props.automationStep;

        // by default, next button does nothing and looks disabled
        let next = () => { console.log("not moving on"); };
        let disabled = true;

        // whether the user has finished the automation step at some point in the past
        const stepFinishedInPast = user.onboarding.furthestStep > user.onboarding.step;

        // if no information is available, Next will move on to the next STEP
        if (typeof automationStep !== "object") {
            next = this.props.next;
            disabled = false;
        }
        // if there IS information about the STEP available
        else {
            // if there is a page to go to for the next SUB-STEP
            if (automationStep.nextPage) {
                // if the user has finished all required actions to move on to the
                // next SUB-STEP
                if (automationStep.nextCallable !== false || stepFinishedInPast) {
                    // make next button move you to the next SUB-STEP page
                    next = () => {
                        this.props.changeAutomateInvites({ page: automationStep.nextPage });
                    };
                    disabled = false;
                }
            }
            // if there is no defined function for going on to the next SUB-STEP
            else {
                // default makes it so you just can't move on, but if you've finished
                // this whole step in the past, allow the user to skip to the next STEP
                if (stepFinishedInPast) {
                    next = this.props.next;
                    disabled = false;
                }
            }
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
                // ... removes the top of the stack
                this.props.changeAutomateInvites({ goBack: true });
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

        // // the sequence of choices that have been made so far while following the
        // // automate-candidate-invites path
        // const automationStep = this.props.automationStep;

        const childProps = {
            previousNextArea: this.createPreviousNextArea()
        }

        // the header of the page that should currently be shown
        const currentPage = this.props.currentPage;

        // show the page associated with the string of the current page
        switch (currentPage) {
            case undefined:
            case "Select Method":
                return ( <SelectMethod {...childProps} /> );
                break;
            case "Which ATS?":
                return ( <WhichATS {...childProps} /> );
                break;
            case "Manual Invite":
                return ( <ManualInvite {...childProps} /> );
                break;
            default:
                return ( <SelectMethod {...childProps} /> );
                break;
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
        pageStack: typeof state.users.automateInvites === "object" ? state.users.automateInvites.pageStack : undefined,
        currentPage: typeof state.users.automateInvites === "object" ? state.users.automateInvites.currentPage : undefined,
        nextCallable: typeof state.users.automateInvites === "object" ? state.users.automateInvites.nextCallable : undefined,
        currentUser: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        popGoBackStack,
        changeAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AutomateInvites);
