"use strict"
import React, {Component} from 'react';

class UpDownArrows extends Component {
    render() {
        // show both arrows if this item is not selected but only the top arrow
        // if sorting in ascending order and the bottom otherwise
        const showUpArrow = !this.props.selected || this.props.sortAscending;
        const showDownArrow = !this.props.selected || !this.props.sortDescending;

        return (
            <div className="upDownArrows">
                {showUpArrow ?
                    <div className="sortArrow" />
                    : null
                }
                {showDownArrow ?
                    <div className="down sortArrow" />
                    : null
                }
            </div>
        );
    }
}

export default UpDownArrows;
