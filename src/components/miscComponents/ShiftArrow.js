"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { isWhite } from "../../miscFunctions";
import { getContrastText } from "@material-ui/core/styles";
import "./ShiftArrow.css";

class ShiftArrow extends Component {
    getImageName = () => {
        const { color, buttonTextColor, primaryColor, secondaryColor } = this.props;

        if (["cyan", "blue"].includes(color)) {
            return "ArrowBlue";
        } else if (color == "white") {
            return "LineArrow";
        } else if (color == "black") {
            return "LineArrow-Black";
        } else if (buttonTextColor) {
            if (isWhite(this.props.buttonTextColor)) {
                return "LineArrow";
            } else {
                return "LineArrow-Black";
            }
        } else if (primaryColor || secondaryColor) {
            const buttonColor = secondaryColor || primaryColor;
            if (isWhite(getContrastText(buttonColor))) {
                return "LineArrow";
            } else {
                return "LineArrow-Black";
            }
        } else {
            return "LineArrow-Black";
        }
    };

    render() {
        const name = this.getImageName();
        const style = typeof this.props.style === "object" ? this.props.style : {};
        const disabledStyle = this.props.disabled ? "disabled" : "";
        const widthStyle =
            "width-" + (typeof this.props.width === "string" ? this.props.width : "10px");
        return (
            <img
                src={`/icons/${name}${this.props.png}`}
                styleName={`shift-arrow ${disabledStyle} ${widthStyle}`}
                style={style}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        png: state.users.png,
        secondaryColor: state.users.secondaryColor,
        primaryColor: state.users.primaryColor,
        buttonTextColor: state.users.buttonTextColor
    };
}

export default connect(mapStateToProps)(ShiftArrow);
