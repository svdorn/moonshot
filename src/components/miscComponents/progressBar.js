"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../actions/usersActions';


class ProgressBar extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const currentUser = this.props.currentUser;
        const currentPosition = currentUser.currentPosition;

        if (!currentPosition) {
            return null;
        }

        const ADMIN_QUESTIONS = "Administrative Questions";
        const PSYCH_ANALYSIS = "Psychometric Analysis";
        const SKILL_EVAL = this.props.skillName ? this.props.skillName + " Evaluation" : "Skill Evaluation";
        const FREE_RESPONSE = "Short Answer";

        // will always have admin questions and psych analysis
        let numSteps = 2;
        if (currentPosition.skillTests) {
            numSteps += currentPosition.skillTests.length;

        }
        if (currentPosition.freeResponseQuestions && currentPosition.freeResponseQuestions.length) {
            numSteps++;
        }

        let stepNumber = 0;
        let stepName = "";
        // if the user has not yet dont the admin questions, they're on the first step
        if (!currentUser.adminQuestions || !currentUser.adminQuestions.finished) {
            stepNumber = 1;
            stepName = ADMIN_QUESTIONS;
        }
        // if user has not yet taken psych test or if they're currently taking it
        // they're on the second step
        else if (!currentUser.psychometricTest || (currentUser.psychometricTest && !currentUser.psychometricTest.endDate)) {
            stepNumber = 2;
            stepName = PSYCH_ANALYSIS;
        }
        // if they are on a skills test, add 3 to the current skill test index
        // (one because index 0 would be the first one and another two because of the psych test and admin questions)
        else if (currentPosition.skillTests && parseInt(currentPosition.testIndex, 10) < currentPosition.skillTests.length) {
            stepNumber = 3 + parseInt(currentPosition.testIndex, 10);
            stepName = SKILL_EVAL;
        }
        // otherwise user must be on the free response portion
        else {
            stepNumber = numSteps;
            stepName = FREE_RESPONSE;
        }

        const rAlways = 255;
        const gStart = 37;
        const gEnd = 84;
        const bStart = 110;
        const bEnd = 56;

        let stepCircles = [];
        let stepBars = [];
        for (let stepCounter = 1; stepCounter <= numSteps; stepCounter++) {
            // all completed steps are 100% done
            let amountFinished = 100;
            // current step has to see how much it has done
            if (stepNumber === stepCounter) {
                // if (stepName === PSYCH_ANALYSIS) {
                //     const psychTest = currentUser.psychometricTest;
                //     amountFinished = (psychTest.numQuestionsAnswered / psychTest.numQuestions) * 100;
                // } else {
                //     // TODO: MAKE THIS A LEGIT PERCENTAGE OF HOW MUCH IS DONE (0 - 100)
                //     amountFinished = 0;
                // }
                console.log("evaluationState in progress bar: ", this.props.evaluationState);
                amountFinished = typeof this.props.evaluationState.stepProgress === "number" ? evaluationState.stepProgress : 0;
            }
            // incomplete steps are not done at all
            else if (stepNumber < stepCounter) { amountFinished = 0; }

            let r = rAlways;
            let g = gStart + ((gEnd - gStart) * stepCounter / (numSteps + 1));
            let b = bStart + ((bEnd - bStart) * stepCounter / (numSteps + 1));
            let gRight = gStart + ((gEnd - gStart) * (stepCounter + (amountFinished / 100)) / (numSteps + 1));
            let bRight = bStart + ((bEnd - bStart) * (stepCounter + (amountFinished / 100)) / (numSteps + 1));


            stepCircles.push(
                <div key={"circle" + stepCounter} className="progressStepCircle" style={{backgroundColor: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`}}>
                    <div><div>{ stepCounter }</div></div>
                </div>
            );

            const interiorStyle = { width: `${amountFinished}%`, background: `linear-gradient(to right, rgb(${Math.round(r)},${Math.round(g)}, ${Math.round(b)}), rgb(${Math.round(r)},${Math.round(gRight)}, ${Math.round(bRight)}))` };
            stepBars.push(
                <div key={"bar" + stepCounter} className="progressStepBar">
                    <div className="progressStepBarInterior" style={interiorStyle} />
                </div>
            )
        }

        stepCircles.push(
            <div key="endCircle" className="progressStepCircle" style={{backgroundColor: `rgb(${Math.round(rAlways)},${Math.round(gEnd)},${Math.round(bEnd)})`}}>
                <div></div>
            </div>
        );

        return (
            <div className="progressContainer">
                <div className="font26px font22pxUnder600">
                    { stepNumber }. { stepName }
                </div>
                <div className="progressBar font14px">
                    <div className="progressStepBars">
                        { stepBars }
                    </div>
                    <div className="progressStepCircles">
                        { stepCircles }
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        evaluationState: state.users.evaluationState,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
