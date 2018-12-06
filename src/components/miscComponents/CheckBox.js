"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import "./checkBox.css";

class CheckBox extends Component {
    handleClick = event => {
        const { onClick, disabled, checked } = this.props;
        if (disabled || typeof onClick !== "function") return;

        onClick(!checked, event);
    };

    render() {
        let { checked, disabled, style, size, color, textColor } = this.props;

        // only white and black allowed, default is white
        let boxColor = color ? color : textColor ? textColor : "white";
        if (boxColor == "white" || boxColor.toLowerCase() == "#ffffff") boxColor = "White";
        else boxColor = "Black";

        // default size is small, only "medium" and "small" are allowed
        if (size !== "medium") size = "small";

        if (typeof style !== "object") style = {};

        return (
            <div
                className={`${disabled ? "not-allowed" : ""}`}
                styleName={`checkbox ${size} `}
                style={{ borderColor: boxColor.toLowerCase(), ...style }}
                onClick={this.handleClick}
            >
                <img
                    alt="checkbox"
                    style={{ visibility: checked ? "visible" : "hidden" }}
                    src={`/icons/CheckMarkRounded${boxColor}${this.props.png}`}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        png: state.users.png,
        textColor: state.users.textColor
    };
}

export default connect(mapStateToProps)(CheckBox);
