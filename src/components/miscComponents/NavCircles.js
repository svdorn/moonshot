"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";
import { noop } from "../../miscFunctions";

import "./NavCircles.css";

class NavCircles extends Component {
    handleCircleClick = event => {
        const { onNavigate, disabled } = this.props;
        if (disabled || typeof onNavigate !== "function") return;

        onNavigate(event.currentTarget.dataset.value, event);
    };

    render() {
        const { value, values, onNavigate, disabled, className, inactive, dotStyle } = this.props;

        // need at least one navigation circle to show anything
        if (!Array.isArray(values) || values.length < 1) return null;

        // whether there are inactive circles to check for
        const inactiveExist = Array.isArray(inactive);

        let navCircles = values.map((v, valueIdx) => {
            return (
                <div
                    styleName={`nav-circle ${v === value ? "selected" : ""} ${
                        disabled || (inactiveExist && inactive.includes(v)) ? "disabled" : ""
                    }`}
                    style={typeof dotStyle === "object" ? dotStyle : {}}
                    data-value={v}
                    onClick={this.handleCircleClick}
                    key={"nav-circle" + v}
                />
            );
        });

        return <div className={typeof className === "string" ? className : ""}>{navCircles}</div>;
    }
}

export default NavCircles;
