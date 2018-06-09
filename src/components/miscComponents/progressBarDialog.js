"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ProgressBarDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {

        let numSteps = 4;
        let stepNumber = this.props.stepNumber;

        const rStart = 114;
        const rEnd = 177;
        const gStart = 214;
        const gEnd = 125;
        const bStart = 245;
        const bEnd = 254;

        let stepCircles = [];
        let stepBars = [];
        for (let stepCounter = 1; stepCounter <= numSteps; stepCounter++) {
            let amountFinished = 100;
            if (stepNumber === stepCounter) {
                // TODO: MAKE THIS A LEGIT PERCENTAGE OF HOW MUCH IS DONE (0 - 100)
                amountFinished = 0;
            }
            else if (stepNumber < stepCounter) {
                amountFinished = 0;
            }
            let r = rStart + ((rEnd - rStart) * stepCounter / (numSteps + 1));
            let g = gStart + ((gEnd - gStart) * stepCounter / (numSteps + 1));
            let b = bStart + ((bEnd - bStart) * stepCounter / (numSteps + 1));
            let rRight = rStart + ((rEnd - rStart) * (stepCounter + (amountFinished / 100)) / (numSteps + 1));;
            let gRight = gStart + ((gEnd - gStart) * (stepCounter + (amountFinished / 100)) / (numSteps + 1));
            let bRight = bStart + ((bEnd - bStart) * (stepCounter + (amountFinished / 100)) / (numSteps + 1));


            stepCircles.push(
                <div key={"circle" + stepCounter} className="progressStepCircle" style={{backgroundColor: `rgb(${r},${g},${b})`}}>
                    {stepNumber >= stepCounter ? null : <div></div>}
                </div>
            );

            const interiorStyle = { width: `${amountFinished}%`, background: `linear-gradient(to right, rgb(${r},${g}, ${b}), rgb(${rRight},${gRight}, ${bRight}))` };
            stepBars.push(
                <div key={"bar" + stepCounter} className="progressStepBar">
                    <div className="progressStepBarInterior" style={interiorStyle} />
                </div>
            )
        }

        stepCircles.push(
            <div key="endCircle" className="progressStepCircle" style={{backgroundColor: `rgb(${rEnd},${gEnd},${bEnd})`}}>
                {stepNumber >= 5 ? null : <div></div>}
            </div>
        );

        return (
            <div className="progressContainer">
                <div className="progressBarDialog font14px">
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


export default connect(mapStateToProps, mapDispatchToProps)(ProgressBarDialog);
