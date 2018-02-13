import React, {Component} from 'react';
import {Paper} from 'material-ui';

class TwoOptionsChoice extends Component {
    constructor(props){
        super(props);
        this.state = { shadow: 2 }
    }


    onMouseOver = () => this.setState({ shadow: 4 });
    onMouseOut = () => this.setState({ shadow: 2 });


    render() {
        const selectedClass = this.props.selected ? " selected" : "";
        return (
            <Paper className={"clickableNoUnderline twoOptionsBox" + selectedClass}
                   onMouseOver={this.onMouseOver}
                   onMouseOut={this.onMouseOut}
                   zDepth={this.state.shadow}
            >
                {this.props.text}
            </Paper>
        );
    }
}

export default TwoOptionsChoice;
