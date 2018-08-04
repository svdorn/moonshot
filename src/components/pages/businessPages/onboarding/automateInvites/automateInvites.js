"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import { /* goingBackAutomateInvites */ } from '../../../../../actions/usersActions';

import SelectMethod from "./selectMethod";
import WhichATS from "./whichATS";

class AutomateInvites extends Component {
    // constructor(props) {
    //     super(props);
    //
    //     this.state = {}
    // }
    //
    //
    // createNextButton() {
    //     // the function that will be executed when the user clicks "next"
    //     let next = () => {};
    //     // if the next button should look disabled
    //     let disabled = true;
    //
    //     const invitesInfo = this.props.invitesInfo;
    //     const user = this.props.currentUser;
    //     // if there is nothing dealing with the automate invites step ...
    //     if (typeof invitesInfo !== "object") {
    //         // ... if the user has already completed this step in the past, move
    //         // on to the next onboarding step - otherwise, don't let them move
    //         // on until they complete the current frame's step
    //         if (user.onboarding.furthestStep > user.onboarding.step) {
    //             next = this.props.next;
    //             disabled = false;
    //         }
    //     }
    //     // if there is an action associated with the Next button, do that
    //     else if (typeof invitesInfo.nextAction === "function") {
    //         next = invitesInfo.nextAction;
    //         disabled = false;
    //     }
    //
    //     return (
    //         <div
    //             className={`button noselect round-4px inlineBlock ${disabled ? "disabled background-primary-black-light" : "background-primary-cyan"}`}
    //             onClick={next}
    //         >
    //             Next
    //         </div>
    //     )
    // }
    //
    //
    // createPreviousButton() {
    //     console.log("previous button");
    //     const self = this;
    //
    //     // the function that will be executed when the user clicks Previous
    //     let previous = this.props.previous;
    //
    //     const invitesInfo = this.props.invitesInfo;
    //     // if there is nothing dealing with the automate invites step ...
    //     if (typeof info === "object") {
    //         // ... and if there is a stack of options for going back ...
    //         if (invitesInfo.goBackStack && invitesInfo.goBackStack.size() > 0) {
    //             // ... create a function that performs that Back action and
    //             // removes that option from the stack
    //             previous = () => {
    //                 console.log("going back");
    //                 // get the Go Back action
    //                 const goBack = invitesInfo.goBackStack.top;
    //                 // doing the Back action
    //                 goBack();
    //                 // removing the Back action from the stack
    //                 self.props.goingBackAutomateInvites();
    //             };
    //         }
    //     }
    //
    //     return (
    //         <div
    //             className={"button noselect round-4px inlineBlock background-primary-cyan"}
    //             onClick={previous}
    //         >
    //             Previous
    //         </div>
    //     )
    // }
    //
    //
    // createPreviousNextArea() {
    //     return (
    //         <div className="previous-next-area primary-white font18px center marginTop20px">
    //             { this.createPreviousButton() }
    //             { this.createNextButton() }
    //         </div>
    //     );
    // }


    createBody() {
        let body = null;

        // the sequence of choices that have been made so far while following the
        // automate-candidate-invites path
        const invitesInfo = this.props.invitesInfo;

        console.log(invitesInfo);

        const childProps = {
            previousNextArea: <div>HEY</div>/* this.createPreviousNextArea() */
        }

        // if no initial method path is selected, show the screen that asks if you want
        // to integrate with an ATS, put a script on your own site, or suggest
        // some other integration
        if (typeof invitesInfo !== "object" || !invitesInfo.method) {
            return( <SelectMethod {...childProps} /> );
        }

        // if the user selected that they want to integrate with an ATS
        if (invitesInfo.method === "ats") {
            return ( <WhichATS {...childProps} /> );
        }
    }


    render() {
        console.log("rerender");
        return (
            <div className="automate-invites primary-white center">
                { this.createBody() }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        invitesInfo: state.users.automateInvites,
        currentUser: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        // goingBackAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AutomateInvites);
