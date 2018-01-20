import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Paper } from 'material-ui';
import { bindActionCreators } from 'redux';
import { updateCurrentSubStep } from '../../actions/usersActions';
import {
  Step,
  Stepper,
  StepButton,
  StepContent,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

class PathwayStepList extends Component {
    constructor(props){
        super(props);

        let stepIndex = 0;
        let subStepIndex = 0;

        const currentSubStep = this.props.currentSubStep;
        if (currentSubStep) {
            subStepIndex = currentSubStep.order - 1;
            stepIndex = currentSubStep.superStepOrder - 1;
        }

        this.state = { stepIndex, subStepIndex };
    }

    updateStepInReduxState() {
        const user = this.props.currentUser;
        const pathwayId = this.props.pathwayId;
        const stepNumber = this.state.stepIndex + 1;
        const substep = this.props.steps[this.state.stepIndex].subSteps[this.state.subStepIndex];
        this.props.updateCurrentSubStep(user, pathwayId, stepNumber, substep);
    }

    handleNextSub = () => {
        const steps = this.props.steps;
        const {subStepIndex} = this.state;
        const {stepIndex} = this.state;

        // if it is not the next substep, go to next substep
        if (subStepIndex < steps[stepIndex].subSteps.length - 1) {
            this.setState({
                subStepIndex: subStepIndex + 1
            }, function() {
                this.updateStepInReduxState();
            });
        }
        // if it is the last substep but not last step, advance to first subStep
        // of next step
        else if (stepIndex < steps.length - 1) {
            this.setState({
                stepIndex: stepIndex + 1,
                subStepIndex: 0
            }, function() {
                this.updateStepInReduxState();
            });
        }
    };

    handlePrevSub = () => {
        const steps = this.props.steps;
        const {subStepIndex} = this.state;
        const {stepIndex} = this.state;

        // if it is not the first substep, go back to the previous substep
        if (subStepIndex > 0 && steps[stepIndex].subSteps.length != 1) {
            this.setState({
                subStepIndex: subStepIndex - 1
            }, function() {
                this.updateStepInReduxState();
            });
        }
        // if it is the first substep, but not the first step, go back to the
        // last substep of the previous step
        else if (stepIndex > 0) {
            this.setState({
                stepIndex: stepIndex - 1,
                subStepIndex: steps[stepIndex - 1].subSteps.length - 1
            }, function() {
                this.updateStepInReduxState();
            })
        }
    };

    renderSubStepActions(subStep, step) {
        // make a next and previous button
        return (
            <div style={{margin: '12px 0'}}>
            <RaisedButton
                label="Next"
                labelStyle={{color:"white"}}
                disableTouchRipple={true}
                disableFocusRipple={true}
                primary={true}
                onClick={this.handleNextSub}
                style={{marginRight: 12}}
            />
            {!(subStep == 0 && step == 0) && (
                <FlatButton
                    label="Back"
                    disableTouchRipple={true}
                    disableFocusRipple={true}
                    onClick={this.handlePrevSub}
                />
            )}
            </div>
        );
    }

    render() {
        const style = {
            enclosingBox: {
                overflow: "scroll"
            }
        }

        const { stepIndex } = this.state;
        const { subStepIndex } = this.state;

        let self = this;
        const stepItems = this.props.steps.map(function(step) {
            const subStepItems = step.subSteps.map(function(subStep) {
                return (
                    <Step key={"" + step.order + ", " + subStep.order}>
                        <StepButton onClick={() => self.setState({
                            subStepIndex: (subStep.order - 1),
                            stepIndex: (step.order - 1)
                        }, function() {
                            self.updateStepInReduxState();
                        })}>
                            {subStep.name}
                        </StepButton>
                        <StepContent>
                            {self.renderSubStepActions(subStep.order - 1, step.order - 1)}
                        </StepContent>
                    </Step>
                )
            })

            let subStepper = (
                <div style={{maxWidth: 380, margin: 'auto', ...bottomMargin}}>
                    <Stepper
                      activeStep={subStepIndex}
                      linear={false}
                      orientation="vertical"
                    >
                        {subStepItems}
                    </Stepper>
                </div>
            )

            // give the last step a margin at the bottom
            const bottomMargin = (step.order == self.props.steps.length) ? {marginBottom: "20px"} : {};

            return (
                <Step key={step.order + ", " + step.name} style={bottomMargin}>
                    <StepButton onClick={() => self.setState({
                        stepIndex: (step.order - 1),
                        subStepIndex: 0
                    }, function() {
                        self.updateStepInReduxState();
                    })}>
                        {step.name}
                    </StepButton>
                    <StepContent>
                        {subStepper}
                    </StepContent>
                </Step>
            );
        })


        return (
            <Paper className={this.props.className} style={{...this.props.style, ...style.enclosingBox}} zDepth={1}>
                <div style={{maxWidth: 380, margin: 'auto'}}>
                    <Stepper
                      activeStep={stepIndex}
                      linear={false}
                      orientation="vertical"
                    >
                        {stepItems}
                    </Stepper>
                </div>
            </Paper>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateCurrentSubStep
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        currentSubStep: state.users.currentSubStep
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayStepList);
