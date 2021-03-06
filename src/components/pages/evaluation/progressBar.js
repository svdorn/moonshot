"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import "./progressBar.css";

class ProgressBar extends Component {
    render() {
        const evaluationState = this.props.evaluationState;

        let numSteps =
            evaluationState.completedSteps.length + evaluationState.incompleteSteps.length;
        let stepNumber = evaluationState.completedSteps.length + 1;
        // add in a step for the current step, except when finished
        if (evaluationState.component !== "Finished") {
            numSteps++;
        }

        const { primaryColor } = this.props;

        // const rStart = 255;
        // const rEnd = 255;
        // const gStart = 37;
        // const gEnd = 84;
        // const bStart = 110;
        // const bEnd = 56;

        let stepCircles = [];
        let stepBars = [];
        for (let stepCounter = 1; stepCounter <= numSteps; stepCounter++) {
            // all completed steps are 100% done
            let amountFinished = 100;
            // current step has to see how much it has done
            if (stepNumber === stepCounter) {
                amountFinished =
                    typeof this.props.evaluationState.stepProgress === "number"
                        ? evaluationState.stepProgress
                        : 0;
            }
            // incomplete steps are not done at all
            else if (stepNumber < stepCounter) {
                amountFinished = 0;
            }

            // let r = rStart + ((rEnd - rStart) * stepCounter) / (numSteps + 1);
            // let g = gStart + ((gEnd - gStart) * stepCounter) / (numSteps + 1);
            // let b = bStart + ((bEnd - bStart) * stepCounter) / (numSteps + 1);
            // let rRight =
            //     rStart + ((rEnd - rStart) * (stepCounter + amountFinished / 100)) / (numSteps + 1);
            // let gRight =
            //     gStart + ((gEnd - gStart) * (stepCounter + amountFinished / 100)) / (numSteps + 1);
            // let bRight =
            //     bStart + ((bEnd - bStart) * (stepCounter + amountFinished / 100)) / (numSteps + 1);

            stepCircles.push(
                <div
                    key={"circle" + stepCounter}
                    styleName="progress-step-circle"
                    style={{
                        // backgroundColor: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
                        backgroundColor: this.props.primaryColor
                    }}
                >
                    <div style={{ backgroundColor: this.props.backgroundColor }}>
                        <div>{stepCounter}</div>
                    </div>
                </div>
            );

            // const color1 = `rgb(${Math.round(r)},${Math.round(g)}, ${Math.round(b)})`;
            // const color2 = `rgb(${Math.round(rRight)},${Math.round(gRight)}, ${Math.round(
            //     bRight
            // )})`;

            const interiorStyle = {
                width: `${amountFinished}%`,
                // background: `linear-gradient(to right, ${color1}, ${color2})`
                background: this.props.primaryColor
            };
            stepBars.push(
                <div key={"bar" + stepCounter} styleName="progress-step-bar">
                    <div styleName="progress-step-bar-interior" style={interiorStyle} />
                </div>
            );
        }

        stepCircles.push(
            <div
                key="endCircle"
                styleName="progress-step-circle"
                style={{
                    // backgroundColor: `rgb(${Math.round(rEnd)},${Math.round(gEnd)},${Math.round(
                    //     bEnd
                    // )})`
                    backgroundColor: this.props.primaryColor
                }}
            >
                <div style={{ backgroundColor: this.props.backgroundColor }} />
            </div>
        );

        return (
            <div style={{ textAlign: "center", color: this.props.primaryColor }}>
                <div className="font14px" style={styles.progressBar}>
                    <div style={styles.progressStepBars}>{stepBars}</div>
                    <div styleName="progress-step-circles">{stepCircles}</div>
                </div>
            </div>
        );
    }
}

const styles = {
    progressBar: {
        width: "60%",
        margin: "30px 0 40px 20%",
        height: "10px",
        position: "relative",
        backgroundColor: "#cbcbcb"
    },
    progressStepBars: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        height: "100%"
    }
};

function mapStateToProps(state) {
    return {
        evaluationState: state.users.evaluationState,
        backgroundColor: state.users.backgroundColor,
        primaryColor: state.users.primaryColor
    };
}

export default connect(mapStateToProps)(ProgressBar);
