import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Paper} from 'material-ui';

class PathwayPreview extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="candidatePreview">
                Name: { this.props.name }
            </div>
        )
    }
}

export default PathwayPreview;
