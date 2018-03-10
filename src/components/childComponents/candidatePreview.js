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
                <Paper className="candidatePreviewPaper aboutMeLi font20px font font16pxUnder700 font14pxUnder400" zDepth={2}>
                    <div className="candidatePreviewLiLeftContainer">{this.props.name}</div>

                    <div className="verticalDividerCandidatePreview"/>

                    <div className="candidatePreviewLiInfo" style={{display: 'inline-block'}}>
                        Here
                    </div>
                </Paper>

            </div>
        )
    }
}

export default PathwayPreview;
