"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import "./shiftArrow.css";

class ShiftArrow extends Component {
    render() {
        const name = ["cyan", "blue"].includes(this.props.color) ? "ArrowBlue" : "LineArrow";
        const style = typeof this.props.style === "object" ? this.props.style : {};
        const disabledStyle = this.props.disabled ? "disabled" : "";
        return (
            <img
                src={`/icons/${name}${this.props.png}`}
                styleName={`shift-arrow ${disabledStyle}`}
                style={style}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

export default connect(mapStateToProps)(ShiftArrow);
