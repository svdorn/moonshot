"use strict"
import React, {Component} from 'react';

class UpDownArrows extends Component {
    render() {
        // show both arrows if this item is not selected but only the top arrow
        // if sorting in ascending order and the bottom otherwise
        const showUpArrow = !this.props.selected || this.props.sortAscending;
        const showDownArrow = !this.props.selected || !this.props.sortAscending;

        const upArrowClass = showUpArrow ? "" : " hidden";
        const downArrowClass = showDownArrow ? "" : " hidden";

        const additionalClasses = this.props.className ? " " + this.props.className : "";

        return (
            <div className={"upDownArrows" + additionalClasses} style={this.props.style}>
                <div className={"sortArrow" + upArrowClass} />
                <div className={"down sortArrow" + downArrowClass} />
            </div>
        );
    }
}

export default UpDownArrows;
