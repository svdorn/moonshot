"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
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

const renderField = ({
    input,
    label,
    placeholder,
    autoComplete,
    meta: { touched, error },
    ...custom
}) => (
    <TextField
        label={label}
        placeholder={typeof placeholder === "string" ? placeholder : label}
        helperText={touched && error ? error : undefined}
        required={typeof required === "boolean" ? required : false}
        error={touched && error ? true : false}
        variant="standard"
        autoComplete={typeof autoComplete === "string" ? autoComplete : "on"}
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
        let { name, label, placeholder, required, validate } = this.props;

        return (
            <div>
                <MuiThemeProvider theme={theme}>
                    <Field
                        name={name}
                        component={renderField}
                        label={label}
                        required={required}
                        validate={validate}
                        placeholder={placeholder}
                    />
                </MuiThemeProvider>
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

export default TextInput;
