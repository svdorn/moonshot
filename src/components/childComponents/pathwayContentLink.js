import React, { Component } from 'react';
import { Paper } from 'material-ui';
import { connect } from 'react-redux';

class PathwayContentLink extends Component {
    render() {
        return (
            <Paper style={{...this.props.style}} zDepth={1}>
                <div>
                    Link here
                </div>
            </Paper>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentStep: state.users.currentUser.currentStep
    };
}

export default connect(mapStateToProps)(PathwayContentLink);
