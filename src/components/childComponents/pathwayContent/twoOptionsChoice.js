import React, {Component} from 'react';
import {Paper} from 'material-ui';

class TwoOptionsChoice extends Component {
    constructor(props){
        super(props);
        if (props.selected) {
            this.state = { shadow: 4, hovering: false }
        } else {
            this.state = { shadow: 2, hovering: false }
        }
    }


    onMouseOver = () => {
        this.setState({ shadow: 4, hovering: true });
    }
    onMouseOut = () => {
        if (!this.props.selected) {
            this.setState({ shadow: 2, hovering: false });
        } else {
            this.setState({ ...this.state, hovering: false })
        }
    }

    componentDidUpdate() {
        if (!this.props.selected && !this.state.hovering && this.state.shadow === 4) {
            this.setState({ ...this.state, shadow: 2 });
        }
    }

    render() {
        const selectedClass = this.props.selected ? "selected" : "notSelected";
        const color = this.props.selected ? "white" : "black";
        return (
            <Paper className={"clickableNoUnderline twoOptionsBox " + selectedClass}
                   onMouseOver={this.onMouseOver}
                   onMouseOut={this.onMouseOut}
                   zDepth={this.state.shadow}
                   style={{color}}
                   onClick={() => this.props.onClick(this.props.choice)}
            >
                <div className="flex-center">
                    <p>{this.props.text}</p>
                </div>
            </Paper>
        );
    }
}

export default TwoOptionsChoice;
