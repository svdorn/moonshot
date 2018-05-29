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
        const positionInProgress = currentUser.positionInProgress;

        console.log("currentUser: ", currentUser);

        let numSteps = 1;
        if (positionInProgress.skillTests) {
            numSteps = positionInProgress.skillTests.length;
        }
        if (positionInProgress.freeResponseQuestions && positionInProgress.freeResponseQuestions.length) {
            numSteps++;
        }

        let stepNumber = 0;
        let stepName = "";
        // if user has not yet taken psych test or if they're currently taking it
        // they're on the first step
        if (!currentUser.psychometricTest || currentUser.psychometricTest.inProgress) {
            stepNumber = 1;
            stepName = "Psychometric Analysis";
        }
        // if they are on a skills test, add 2 to the current skill test index
        // (one because index 0 would be the first one and another one because of the psych test)
        else if (positionInProgress.skillTests && parseInt(positionInProgress.testIndex, 10) < positionInProgress.skillTests.length) {
            stepNumber = 2 + parseInt(positionInProgress.testIndex, 10);
            stepName = "Skill Evaluation";
        }
        // otherwise user must be on the free response portion
        else {
            stepNumber = numSteps;
            stepName = "Free Response";
        }

        const rAlways = 255;
        const gStart = 37;
        const gEnd = 84;
        const bStart = 110;
        const bEnd = 56;

        let stepCircles = [];
        let stepBars = [];
        for (let stepCounter = 1; stepCounter <= numSteps; stepCounter++) {
            let r = rAlways;
            let g = gStart + ((gEnd - gStart) * stepCounter / numSteps);
            let b = bStart + ((bEnd - bStart) * stepCounter / numSteps);
            stepCircles.push(
                <div className="progressStepCircle" style={{backgroundColor: `rgb(${r},${g},${b})`}}>
                    <div><div>{ stepCounter }</div></div>
                </div>
            );

            const interiorStyle = { width: "40%" };
            stepBars.push(
                <div className="progressStepBar">
                    <div className="progressStepBarInterior" style={interiorStyle} />
                </div>
            )
        }

        return (
            <div className="progressContainer">
                <div>
                    { stepNumber }. { stepName }
                </div>
                <div className="progressBar">
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
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
