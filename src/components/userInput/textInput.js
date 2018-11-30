"use strict";
import React, { Component } from "react";
import { Field } from "redux-form";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

const styles = theme => ({});

const theme = createMuiTheme({
    palette: {
        primary: { main: "#76defe", dark: "#76defe", light: "#76defe" },
        secondary: { main: "#ff582d" },
        error: { main: "#eb394f", dark: "#eb394f", light: "#eb394f" },
        type: "dark"
    },
    typography: { fontFamily: "Muli,sans-serif" }
});

// default validation function - just makes the fields say This Field is Required
const defaultValidate = value => (value ? undefined : "This field is required.");

const renderField = ({
    input,
    label,
    placeholder,
    autoComplete,
    autoFocus,
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
        className={typeof className === "string" ? className : "text-field"}
        style={typeof style === "object" ? style : {}}
        autoComplete={typeof autoComplete === "string" ? autoComplete : "on"}
        autoFocus={typeof autoFocus === "boolean" ? autoFocus : false}
        InputLabelProps={{
            classes: { root: "input-label" },
            FormLabelClasses: {
                root: "root-cyan-label",
                error: "error-input-label",
                focused: "focused-input-label"
            }
        }}
        {...input}
        {...custom}
    />
);

class TextInput extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let { name, label, placeholder, required, validate, type, style, autoFocus } = this.props;

        return (
            <div>
                <MuiThemeProvider theme={theme}>
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
                    />
                </MuiThemeProvider>
            </div>
        );
    }
}

export default TextInput;
