import React, {Component} from 'react';
import {Paper, Stepper, Step, StepButton, FlatButton, RaisedButton} from 'material-ui';
import axios from 'axios';

class CandidatePreview extends Component {
    constructor(props) {
        //TODO ONLY SHOW THE CANDIDATE PREVIEW WHEN A PATHWAY HAS BEEN SELECTED
        super(props);

        const hiringStageSteps = {
            "Not Contacted": 0,
            "Contacted": 1,
            "Interviewing": 2,
            "Hired": 3
        }

        let step = hiringStageSteps[props.initialHiringStage];

        if (!step) {
            step = 0;
        }

        let isDismissed = props.initialIsDismissed;
        if (isDismissed === undefined) {
            isDismissed = false;
        }

        if (props.initialIsDismissed) {
            step = step + 1;
        }

        this.state = {
            step: step,
            dismissed: isDismissed,
        }
    }

    // since some components will be rendered in the same place but be for
    // different people, need to update state when new props are received
    componentWillReceiveProps(nextProps) {
        const hiringStageSteps = {
            "Not Contacted": 0,
            "Contacted": 1,
            "Interviewing": 2,
            "Hired": 3
        }

        let step = hiringStageSteps[nextProps.initialHiringStage];

        if (!step) {
            step = 0;
        }

        let isDismissed = nextProps.initialIsDismissed;
        if (isDismissed === undefined) {
            isDismissed = false;
        }

        if (nextProps.initialIsDismissed) {
            step = step + 1;
        }

        this.setState({
            step: step,
            dismissed: isDismissed,
        });
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
            const stages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];

            const currentUser = this.props.currentUser;
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
            // do nothing on success
            .then(result => {})
            .catch(err => {
                console.log("error updating hiring stage: ", err);
            });
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

        console.log("this.props: ", this.props);
        const location = this.props.location ? this.props.location : "No location given";

        return (
            <div className="candidatePreview center">
                <div className="candidateName font24px center">
                    {this.props.name.toUpperCase()}
                </div>
                <div className="candidateLocation">
                    {location}
                </div>
                <br/>
                {/*<a href={"/results?user=" + this.props.profileUrl}>See Results</a>*/}
                <a href={"/results?user=Stephen-Dorn-2-9f66bf7eeac18994"}>See Results</a>

                <div className="candidatePreviewLiInfo" style={{display: 'inline-block'}}>
                    {/*<Stepper activeStep={this.state.step}>
                        <Step disabled={((0 - this.state.step) > 1) || this.state.dismissed || this.props.disabled}>
                            <StepButton onClick={() => this.handleHiringStageChange(0)}>Not Contacted</StepButton>
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
                    </Stepper>*/}
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
            </div>
        )
    }
}


export default CandidatePreview;
