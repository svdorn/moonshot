"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";
import { viewablePasswordField } from "../../miscFunctions";
import { Field } from "redux-form";

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

        const style =
            typeof value === "string" && value.length > 12
                ? { left: "calc(100% - 20px)" }
                : { right: "36px" };

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
                    className="password-toggle-visibility"
                    style={style}
                    onClick={this.toggleShowPassword}
                >
                    {showPassword ? "hide" : "show"}
                </div>
                <br />
            </div>
        );
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
)(ViewablePassword);
