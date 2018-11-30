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

        onNavigate(event, event.currentTarget.dataset.value);
    };

    render() {
        const { value, values, onNavigate, disabled } = this.props;

        // need at least one navigation circle to show anything
        if (!Array.isArray(values) || values.length < 1) return null;

        let navCircles = values.map((v, valueIdx) => {
            return (
                <div
                    styleName={`nav-circle ${v === value ? "selected" : ""} ${
                        disabled ? "disabled" : ""
                    }`}
                    data-value={v}
                    onClick={this.handleCircleClick}
                    key={"nav-circle" + v}
                />
            );
        });

        return <div>{navCircles}</div>;
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
