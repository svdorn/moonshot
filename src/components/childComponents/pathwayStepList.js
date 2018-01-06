import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Paper } from 'material-ui';
import { bindActionCreators } from 'redux';
import { updateCurrentSubStep } from '../../actions/usersActions';
//import PathwayStep from '../childComponents/pathwayStep';
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

        console.log("currentSubStep: ", currentSubStep);
        const currentSubStep = this.props.currentSubStep;
        if (currentSubStep) {
            subStepIndex = currentSubStep.order - 1;
            stepIndex = currentSubStep.superStepOrder - 1;
        }

        this.state = { stepIndex, subStepIndex };
    }

    updateStepInReduxState() {
        const userId = this.props.currentUserId;
        const pathwayId = this.props.pathwayId;
        const stepNumber = this.state.stepIndex + 1;
        const substep = this.props.steps[this.state.stepIndex].subSteps[this.state.subStepIndex]
        this.props.updateCurrentSubStep(userId, pathwayId, stepNumber, substep);
    }

    handleNextSub = () => {
        const {subStepIndex} = this.state;
        const {stepIndex} = this.state;
        if (subStepIndex < 1) {
            this.setState({
                subStepIndex: subStepIndex + 1
            }, function() {
                this.updateStepInReduxState();
            });
        } else if (stepIndex < 2) {
            this.setState({
                stepIndex: stepIndex + 1,
                subStepIndex: 0
            }, function() {
                this.updateStepInReduxState();
            });
        }
    };

    handlePrevSub = () => {
        const {subStepIndex} = this.state;
        const {stepIndex} = this.state;
        if (subStepIndex > 0) {
            this.setState({
                subStepIndex: subStepIndex - 1
            }, function() {
                this.updateStepInReduxState();
            });
        } else if (stepIndex > 0) {
            this.setState({
                stepIndex: stepIndex - 1,
                subStepIndex: 1
            }, function() {
                this.updateStepInReduxState();
            })
        }
    };

    renderSubStepActions(subStep, step) {
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

            }
        }

        const { stepIndex } = this.state;
        const { subStepIndex } = this.state;

        let self = this;
        const stepItems = this.props.steps.map(function(step) {
            const subStepItems = step.subSteps.map(function(subStep) {
                return (
                    <Step key={subStep.name}>
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
                <div style={{maxWidth: 380, maxHeight: 400, margin: 'auto'}}>
                    <Stepper
                      activeStep={subStepIndex}
                      linear={false}
                      orientation="vertical"
                    >
                        {subStepItems}
                    </Stepper>
                </div>
            )

            return (
                <Step key={step.name}>
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
            <Paper style={{...this.props.style, ...style.enclosingBox}} zDepth={1}>
                <div style={{maxWidth: 380, maxHeight: 400, margin: 'auto'}}>
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





    // <Step>
    //     <StepButton onClick={() => this.setState({stepIndex: 0})}>
    //         Select campaign settings
    //     </StepButton>
    //     <StepContent>
    //         <p>
    //             Description!
    //         </p>
    //         {this.renderStepActions(0)}
    //     </StepContent>
    // </Step>
    // <Step>
    // <StepButton onClick={() => this.setState({stepIndex: 1})}>
    //   Create an ad group
    // </StepButton>
    // <StepContent>
    //   <p>An ad group contains one or more ads which target a shared set of keywords.</p>
    //   {this.renderStepActions(1)}
    // </StepContent>
    // </Step>
    // <Step>
    //     <StepButton onClick={() => this.setState({stepIndex: 2})}>
    //         Create an ad
    //     </StepButton>
    //     <StepContent>
    //         <p>
    //             Another description!
    //         </p>
    //         {this.renderStepActions(2)}
    //     </StepContent>
    // </Step>





















    // render() {
    //     const style = {
    //         enclosingBox: {
    //
    //         }
    //     }
    //
    //     const steps = this.props.steps;
    //     console.log("steps are: ");
    //     console.log(steps);
    //
    //
    //     // const stepItems = steps ?
    //     //     steps.map(function(step) {
    //     //         return (
    //     //             <PathwayStep step={step} key={step.name} />
    //     //         )
    //     //     })
    //     //     : null;
    //
    //     return (
    //         <Paper style={{...this.props.style, ...style.enclosingBox}} zDepth={1}>
    //
    //         </Paper>
    //     )
    // }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateCurrentSubStep
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUserId: state.users.currentUser._id,
        currentSubStep: state.users.currentSubStep
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayStepList);
