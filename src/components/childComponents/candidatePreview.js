import React, {Component} from 'react';
import {Paper, Stepper, Step, StepButton, FlatButton, RaisedButton} from 'material-ui';
import axios from 'axios';

class CandidatePreview extends Component {
    constructor(props) {
        //TODO ONLY SHOW THE CANDIDATE PREVIEW WHEN A PATHWAY HAS BEEN SELECTED
        super(props);

        const hiringStageSteps = {
            "Not Yet Contacted": 0,
            "Contacted": 1,
            "Interviewing": 2,
            "Hired": 3
        }

        let step = hiringStageSteps[this.props.initialHiringStage];

        if (this.props.initialIsDismissed) {
            step = step + 1;
        }

        this.state = {
            step: step,
            dismissed: this.props.initialIsDismissed,
        }
    }

    handleClick() {
        if (this.state.dismissed) {
            this.updateHiringStageInDB(this.state.step - 1, false);
            this.setState({dismissed: false, step: this.state.step - 1});
        } else {
            this.updateHiringStageInDB(this.state.step, true);
            this.setState({dismissed: true, step: this.state.step + 1});
        }
    }


    handleHiringStageChange(step) {
        this.setState({step});
        this.updateHiringStageInDB(step, this.state.dismissed);
    }


    updateHiringStageInDB(step, dismissed) {
        if (step <= 3 && step >= 0 && typeof dismissed === "boolean") {
            const stages = ["Not Yet Contacted", "Contacted", "Interviewing", "Hired"];

            const currentUser = this.props.currentUser;
            console.log("pathwayId: ", this.props.pathwayId)
            const hiringStageInfo = {
                userId: this.props.employerUserId,
                verificationToken: this.props.employerVerificationToken,
                companyId: this.props.companyId,
                candidateId: this.props.candidateId,
                hiringStage: stages[step],
                isDismissed: dismissed,
                pathwayId: this.props.pathwayId
            }
            axios.post("/api/business/updateHiringStage", hiringStageInfo)
            .then(result => {
                console.log("result is: ", result);
            })
            .catch(err => {
                console.log("error updating hiring stage: ", err);
            })
        }
    }


    render() {
        const style = {
            imgContainer: {
                height: "40px",
                width: "40px",
                borderRadius: '50%',
                border: "3px solid #00c3ff",
                display: "inline-block",
                overflow: "hidden"
            },
            img: {
                height: "34px",
                marginTop: "5px"
            },
        };

        return (
            <div className="candidatePreview">
                <Paper
                    className="candidatePreviewPaper candidatePreviewLi font16px font font14pxUnder700 font12pxUnder400"
                    zDepth={2}>
                    <div className="candidatePreviewLiLeftContainer">
                        {this.props.name}
                    </div>

                    <div className="verticalDividerCandidatePreview"/>

                    <div className="candidatePreviewLiInfo" style={{display: 'inline-block'}}>
                        <Stepper activeStep={this.state.step}>
                            <Step disabled={((0 - this.state.step) > 1) || this.state.dismissed || this.props.disabled}>
                                <StepButton onClick={() => this.handleHiringStageChange(0)}>Not Yet Contacted</StepButton>
                            </Step>
                            <Step disabled={((1 - this.state.step) > 1) || this.state.dismissed || this.props.disabled}>
                                <StepButton onClick={() => this.handleHiringStageChange(1)}>Contacted</StepButton>
                            </Step>
                            <Step disabled={((2 - this.state.step) > 1) || this.state.dismissed || this.props.disabled}>
                                <StepButton onClick={() => this.handleHiringStageChange(2)}>Interviewing</StepButton>
                            </Step>
                            <Step disabled={((3 - this.state.step) > 1) || this.state.dismissed || this.props.disabled}>
                                <StepButton onClick={() => this.handleHiringStageChange(3)}>Hired</StepButton>
                            </Step>
                        </Stepper>
                        <div className="center">
                            {this.state.dismissed ?
                                <RaisedButton label="Dismissed"
                                              primary={true}
                                              labelStyle={{color:"white"}}
                                              onClick={this.handleClick.bind(this)}
                                              disabled={this.props.disabled}
                                />
                                :
                                <FlatButton label="Dismiss"
                                            primary={true}
                                            onClick={this.handleClick.bind(this)}
                                            disabled={this.props.disabled}
                                />
                            }
                        </div>
                    </div>
                </Paper>

            </div>
        )
    }
}


export default CandidatePreview;
