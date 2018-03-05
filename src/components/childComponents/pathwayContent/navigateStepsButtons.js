import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateCurrentSubStep } from '../../../actions/usersActions';
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


    componentDidUpdate() {
        const currentSubStep = this.props.currentSubStep;
        if (this.state.subStepIndex !== currentSubStep.order - 1 || this.state.stepIndex !== currentSubStep.superStepOrder - 1) {
            this.setState({
                stepIndex: currentSubStep.superStepOrder - 1,
                subStepIndex: currentSubStep.order - 1
            })
        }
    }


    updateStepInReduxState() {
        const user = this.props.currentUser;
        const pathwayId = this.props.pathwayId;
        const stepNumber = this.state.stepIndex + 1;
        const substep = this.props.steps[this.state.stepIndex].subSteps[this.state.subStepIndex];
        this.props.updateCurrentSubStep(user, pathwayId, stepNumber, substep);

        // scroll up to content if the user is scrolled far down
        if (window.pageYOffset > 100) {
            window.scroll({
                top: 100,
                left: 0,
                behavior: 'smooth'
            });
        }
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
            {!(subStep == 0 && step == 0) && (
                <FlatButton
                    label="Back"
                    onClick={this.handlePrevSub}
                    style={{marginRight:"12px"}}
                />
            )}
            <RaisedButton
                label="Next"
                labelStyle={{color:"white"}}
                primary={true}
                onClick={this.handleNextSub}
            />
            </div>
        );
    }

    render() {
        const { stepIndex } = this.state;
        const { subStepIndex } = this.state;

        return (
            <div className={this.props.className} style={this.props.style}>
                {this.renderSubStepActions(subStepIndex, stepIndex)}
            </div>
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
        currentSubStep: state.users.currentSubStep,
        currentUser: state.users.currentUser,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayStepList);
