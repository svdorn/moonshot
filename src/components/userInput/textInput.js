"use strict";
import React, { Component } from "react";
import { Field } from "redux-form";
import { connect } from "react-redux";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

import "./textInput.css";

// default validation function - just makes the fields say This Field is Required
const defaultValidate = value => (value ? undefined : "This field is required.");

const renderField = ({
    input,
    label,
    placeholder,
    autoComplete,
    autoFocus,
    textFieldClassName,
    type,
    style,
    className,
    meta: { touched, error },
    ...custom
}) => (
    <TextField
        label={label}
        placeholder={typeof placeholder === "string" ? placeholder : label}
        helperText={touched && error ? error : undefined}
        required={typeof required === "boolean" ? required : false}
        error={touched && error ? true : false}
        type={typeof type === "string" ? type : "text"}
        variant="standard"
        className={typeof textFieldClassName === "string" ? textFieldClassName : "text-field"}
        style={typeof style === "object" ? style : {}}
        autoComplete={typeof autoComplete === "string" ? autoComplete : "on"}
        autoFocus={typeof autoFocus === "boolean" ? autoFocus : false}
        InputLabelProps={{
            classes: { root: "input-label" },
            FormLabelClasses: {
                // root: "root-cyan-label",
                // error: "error-input-label",
                // focused: "focused-input-label"
            }
        }}
        {...input}
        {...custom}
    />
);

class TextInput extends Component {
    constructor(props) {
        super(props);

        const { primaryColor, secondaryColor, textColor } = this.props;

        let color = secondaryColor ? secondaryColor : primaryColor ? primaryColor : "#76defe";
        let palette = {
            primary: { main: color, dark: color, light: color },
            secondary: { main: "#ff582d" },
            error: { main: "#eb394f", dark: "#eb394f", light: "#eb394f" }
        };

        // if the text color should be white, make it so
        if (
            !textColor ||
            textColor.toLowerCase() == "white" ||
            textColor.toLowerCase() == "#ffffff"
        ) {
            palette.type = "dark";
        }

        this.state = {
            showPassword: false,
            theme: createMuiTheme({
                palette,
                typography: { fontFamily: "Muli,sans-serif" }
            })
        };
    }

    toggleShowPassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    };

    render() {
        let {
            name,
            label,
            placeholder,
            required,
            validate,
            type,
            style,
            autoFocus,
            viewablePassword,
            value,
            className,
            textFieldClassName
        } = this.props;

        // if there should be a hide/show button to show/hide password
        if (viewablePassword) {
            if (!name) name = "password";
            if (!label) label = "Password";
            var place = typeof value === "string" && value.length > 12 ? "outside" : "inside";
            var hideShowStyle = this.props.buttonColor ? { color: this.props.buttonColor } : {};
            className = className ? `${className} relative inline-block` : "relative inline-block";
            var { showPassword } = this.state;
            type = showPassword ? "text" : "password";
        }

        return (
            <div>
                <div className={className ? className : ""}>
                    <MuiThemeProvider theme={this.state.theme}>
                        <Field
                            name={name}
                            component={renderField}
                            label={label}
                            required={required}
                            validate={Array.isArray(validate) ? validate : [defaultValidate]}
                            placeholder={placeholder}
                            type={type}
                            style={style}
                            autoFocus={autoFocus}
                            textFieldClassName={textFieldClassName}
                        />
                        {viewablePassword ? (
                            <div
                                styleName={"password-toggle-visibility " + place}
                                style={hideShowStyle}
                                onClick={this.toggleShowPassword}
                            >
                                {this.state.showPassword ? "hide" : "show"}
                            </div>
                        ) : null}
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        primaryColor: state.users.primaryColor,
        secondaryColor: state.users.secondaryColor,
        textColor: state.users.textColor
    };
}

export default connect(mapStateToProps)(TextInput);
