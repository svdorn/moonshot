"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";
import { noop } from "../../miscFunctions";

import "./navCircles.css";

class CheckBox extends Component {
    handleClick = event => {
        console.log("here");
        const { onClick, disabled, checked } = this.props;
        if (disabled || typeof onClick !== "function") return;

        onClick(!checked, event);
    };

    render() {
        const { checked, disabled } = this.props;

        return (
            <div
                className={`checkbox smallCheckbox whiteCheckbox ${disabled ? "not-allowed" : ""}`}
                onClick={this.handleClick}
            >
                <img
                    alt="checkbox"
                    className={"checkMark" + checked}
                    src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

export default connect(mapStateToProps)(CheckBox);
