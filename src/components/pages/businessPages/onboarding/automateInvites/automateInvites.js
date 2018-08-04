"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import { } from '../../../../../actions/usersActions';

import SelectMethod from "./selectMethod";
import WhichATS from "./whichATS";

class AutomateInvites extends Component {
    constructor(props) {
        super(props);

        this.state = { }
    }


    handleNext = () => {
        this.props.next();
    }


    handlePrevious = () => {
        this.props.previous();
    }


    nextButton() {
        // by default, next button does nothing and looks disabled
        let next = () => { console.log("not moving on"); };
        let disabled = true;

        //

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
        return (
            <div
                className="previous noselect clickable underline inlineBlock"
                onClick={this.handlePrevious}
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
        automationStep: state.users.automateInvites
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AutomateInvites);
