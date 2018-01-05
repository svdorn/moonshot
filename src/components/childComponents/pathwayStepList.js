import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Paper } from 'material-ui';
import { bindActionCreators } from 'redux';
import PathwayStep from '../childComponents/pathwayStep';

class PathwayStepList extends Component {
    constructor(props){
        super(props);

        this.state = {};
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        const style = {
            enclosingBox: {

            }
        }

        const steps = this.props.steps;
        console.log("steps are: ");
        console.log(steps);


        const stepItems = steps ?
            steps.map(function(step) {
                return (
                    <PathwayStep step={step} key={step.name} />
                )
            })
            : null;

        return (
            <Paper style={{...this.props.style, ...style.enclosingBox}} zDepth={1}>
                { stepItems }
            </Paper>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}

function mapStateToProps(state) {
    return {
        //currentStep: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayStepList);
