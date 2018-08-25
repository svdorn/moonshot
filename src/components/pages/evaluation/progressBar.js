"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class ProgressBar extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const evaluationState = this.props.evaluationState;

        let numSteps = evaluationState.completedSteps.length + evaluationState.incompleteSteps.length;
        let stepNumber = evaluationState.completedSteps.length + 1;
        // add in a step for the current step, except when finished
        if (evaluationState.component !== "Finished") { numSteps++; }

        const rAlways = 255;
        const gStart = 37;
        const gEnd = 84;
        const bStart = 110;
        const bEnd = 56;

        let stepCircles = [];
        let stepBars = [];
        for (let stepCounter = 1; stepCounter <= numSteps; stepCounter++) {
            let amountFinished = 100;
            if (stepNumber === stepCounter) {
                if (evaluationState.component === "Psychometrics") {
                    // TODO: HI STEVE, sorry about this being so nasty
                    // make it so that the entire psych test is NOT passed to the front end
                    // and then also change how this works to fit that
                    // thanks bb <3
                    // ps also if you want to make it so progress is shown within
                    // the other steps that would be dope too but not necessary (mostly Admin Questions)
                    const psychTest = this.props.currentUser.psychometricTest;
                    try { amountFinished = (psychTest.numQuestionsAnswered / ((psychTest.incompleteFacets.length * psychTest.questionsPerFacet) + psychTest.numQuestionsAnswered)) * 100; }
                    catch (e) { amountFinished = 0; }
                } else {
                    // TODO: MAKE THIS A LEGIT PERCENTAGE OF HOW MUCH IS DONE (0 - 100)
                    amountFinished = 0;
                }
            }
            else if (stepNumber < stepCounter) {
                amountFinished = 0;
            }
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
                <div className="progressBar font14px">
                    <div className="progressStepBars">{ stepBars }</div>
                    <div className="progressStepCircles">{ stepCircles }</div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        evaluationState: state.users.evaluationState
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
