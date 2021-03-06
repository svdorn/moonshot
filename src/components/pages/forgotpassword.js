"use strict";
import React, { Component } from "react";
import { TextField, CircularProgress, RaisedButton } from "material-ui";
import { forgotPassword } from "../../actions/usersActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form";
import MetaTags from "react-meta-tags";
import { renderTextField, isValidEmail } from "../../miscFunctions";

const validate = values => {
    const errors = {};
    const requiredFields = ["email"];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = "This field is required";
        }
    });
    if (values.email && !isValidEmail(values.email)) {
        errors.email = "Invalid email address";
    }

    return errors;
};

class ForgotPassword extends Component {
    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.forgot.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = ["email"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!isValidEmail(vals.email)) {
            return;
        }

        this.props.forgotPassword(vals);
    }

    render() {
        return (
            <div className="fillScreen blackBackground formContainer">
                <MetaTags>
                    <title>Forgot Password | Moonshot Insights</title>
                    <meta
                        name="description"
                        content="Reset your Moonshot password. It's okay - we all forget things sometimes."
                    />
                </MetaTags>
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Forgot Password</h1>
                        <div className="inputContainer">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                                className="lightBlueInputText"
                            />
                            <br />
                        </div>
                        <RaisedButton
                            label="Send Email"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{ margin: "30px 0" }}
                        />
                    </form>
                    {this.props.loading ? (
                        <CircularProgress color="white" style={{ marginTop: "20px" }} />
                    ) : (
                        ""
                    )}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            forgotPassword
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loading: state.users.loadingSomething
    };
}

ForgotPassword = reduxForm({
    form: "forgot",
    validate
})(ForgotPassword);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ForgotPassword);
