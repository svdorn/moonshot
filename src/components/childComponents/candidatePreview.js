import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Paper, Stepper, Step, StepLabel, StepButton, FlatButton, RaisedButton} from 'material-ui';

class PathwayPreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 0,
            dismissed: false,
        }
    }

    handleClick() {
        if (this.state.dismissed) {
            this.setState({dismissed: false, step: this.state.step - 1});
        } else {
            this.setState({dismissed: true, step: this.state.step + 1});
        }
    }

    render() {
        return (
            <div className="candidatePreview">
                <Paper
                    className="candidatePreviewPaper candidatePreviewLi font16px font font14pxUnder700 font12pxUnder400"
                    zDepth={2}>
                    <div className="candidatePreviewLiLeftContainer">{this.props.name}</div>

                    <div className="verticalDividerCandidatePreview"/>

                    <div className="candidatePreviewLiInfo" style={{display: 'inline-block'}}>
                        <Stepper activeStep={this.state.step}>
                            <Step disabled={((0 - this.state.step) > 1) || this.state.dismissed}>
                                <StepButton onClick={() => this.setState({step: 0})}>Not Yet Contacted</StepButton>
                            </Step>
                            <Step disabled={((1 - this.state.step) > 1) || this.state.dismissed}>
                                <StepButton onClick={() => this.setState({step: 1})}>Contacted</StepButton>
                            </Step>
                            <Step disabled={((2 - this.state.step) > 1) || this.state.dismissed}>
                                <StepButton onClick={() => this.setState({step: 2})}>Interviewing</StepButton>
                            </Step>
                            <Step disabled={((3 - this.state.step) > 1) || this.state.dismissed}>
                                <StepButton onClick={() => this.setState({step: 4})}>Hired</StepButton>
                            </Step>
                        </Stepper>
                        <div className="center">
                            {this.state.dismissed ?
                                <RaisedButton label="Dismissed"
                                              primary={true}
                                              labelStyle={{color:"white"}}
                                              onClick={this.handleClick.bind(this)}
                                />
                                :
                                <FlatButton label="Dismiss"
                                            primary={true}
                                            onClick={this.handleClick.bind(this)}
                                />
                            }
                        </div>
                    </div>
                </Paper>

            </div>
        )
    }
}

export default PathwayPreview;
