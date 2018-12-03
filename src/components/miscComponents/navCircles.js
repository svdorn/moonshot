"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";
import { noop } from "../../miscFunctions";

import "./navCircles.css";

class NavCircles extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    handleCircleClick = event => {
        const { onNavigate, disabled } = this.props;
        if (disabled || typeof onNavigate !== "function") return;

        onNavigate(event.currentTarget.dataset.value, event);
    };

    render() {
        const { value, values, onNavigate, disabled, className, inactive } = this.props;

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
                    data-value={v}
                    onClick={this.handleCircleClick}
                    key={"nav-circle" + v}
                />
            );
        });

        return <div className={typeof className === "string" ? className : ""}>{navCircles}</div>;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NavCircles);
