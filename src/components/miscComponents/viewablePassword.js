"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";
import { viewablePasswordField } from "../../miscFunctions";
import { Field } from "redux-form";

import "./viewablePassword.css";

class ViewablePassword extends Component {
    constructor(props) {
        super(props);

        this.state = { showPassword: false };
    }

    toggleShowPassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    };

    render() {
        const name = this.props.name ? this.props.name : "password";
        const label = this.props.label ? this.props.label : "Password";
        const value = this.props.value ? this.props.value : undefined;
        const { showPassword } = this.state;

        const place = typeof value === "string" && value.length > 12 ? "outside" : "inside";

        return (
            <div className="inputContainer signup-fields">
                <Field
                    name={name}
                    component={viewablePasswordField}
                    label={label}
                    type={showPassword ? "text" : "password"}
                    autofill="new-password"
                />
                <div
                    styleName={"password-toggle-visibility " + place}
                    onClick={this.toggleShowPassword}
                >
                    {showPassword ? "hide" : "show"}
                </div>
                <br />
            </div>
        );
    }
}

export default ViewablePassword;
