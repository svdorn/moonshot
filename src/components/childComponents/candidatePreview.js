import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Paper, Stepper, Step, StepLabel} from 'material-ui';

class PathwayPreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 1,
        }
    }

    render() {
        return (
            <div className="candidatePreview">
                <Paper className="candidatePreviewPaper candidatePreviewLi font16px font font14pxUnder700 font12pxUnder400" zDepth={2}>
                    <div className="candidatePreviewLiLeftContainer">{this.props.name}</div>

                    <div className="verticalDividerCandidatePreview"/>

                    <div className="candidatePreviewLiInfo" style={{display: 'inline-block'}}>
                        <Stepper activeStep={this.state.step}>
                            <Step>
                                <StepLabel>Not Yet Contacted</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Contacted</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Interviewing</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>Done</StepLabel>
                            </Step>
                        </Stepper>
                    </div>
                </Paper>

            </div>
        )
    }
}

export default PathwayPreview;
