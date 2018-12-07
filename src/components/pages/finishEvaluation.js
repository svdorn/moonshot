"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, addEmailToUser } from "../../actions/usersActions";
import { Field, reduxForm } from "redux-form";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextInput from "../userInput/textInput";
import MetaTags from "react-meta-tags";
import { renderTextField, isValidEmail, goTo } from "../../miscFunctions";
import { Button } from "../miscComponents";
import axios from "axios";

import "./finishEvaluation.css";

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

const inputStyle = { marginBottom: "20px" };

class FinishEvaluation extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            company: "Moonshot Steve"
        };
    }

    componentDidMount() {
        // add listener for keyboard enter key
        document.addEventListener("keypress", this.bound_handleKeyPress);
    }

    componentWillUnmount() {
        // remove listener for keyboard enter key
        document.removeEventListener("keypress", this.bound_handleKeyPress);
    }

    handleKeyPress(e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            // 13 is enter
            this.handleSubmit();
        }
    }

    handleSubmit = e => {
        if (e) {
            e.preventDefault();
        }

        const vals = this.props.formData.finishEvaluation.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = ["email"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (!isValidEmail(vals.email)) {
            return this.props.addNotification("Invalid email.", "error");
        }
        if (notValid)
            return this.props.addNotification(
                "Must enter your email to finish evaluation.",
                "error"
            );

        const values = this.props.formData.finishEvaluation.values;
        const email = values.email;
        const { _id, verificationToken } = this.props.currentUser;
        // add email to user
        this.props.addEmailToUser(_id, verificationToken, email);
    };

    // create the main content of the page
    createContent() {
        let urlQuery = {};
        try {
            urlQuery = this.props.location.query;
        } catch (e) {
            /* no query */
        }

        return (
            <div>
                <div className="paddingTop50px marginBottom30px">
                    <div
                        className="font38px font30pxUnder700 font24pxUnder500"
                        style={{ color: this.props.primaryColor }}
                    >
                        {this.state.company} Evaluation
                    </div>
                    <div
                        className="font16px font14pxUnder700 font12pxUnder500"
                        styleName="powered-by"
                        style={{ opacity: 0.6 }}
                    >
                        Powered by Moonshot Insights
                    </div>
                </div>
                <div styleName="text">
                    <div>
                        To finish your evaluation, please enter the email you would like the hiring
                        manager to contact you at.
                    </div>
                </div>
                <div>
                    <TextInput name="email" label="Email" style={inputStyle} />
                    {this.props.loading ? (
                        <CircularProgress />
                    ) : (
                        <Button onClick={this.handleSubmit}>Finish</Button>
                    )}
                </div>
            </div>
        );
    }

    //name, email, password, confirm password, signup button
    render() {
        let content = this.createContent();

        return (
            <div className="fillScreen">
                <MetaTags>
                    <title>Evaluation | Moonshot</title>
                    <meta
                        name="description"
                        content="Finish your evaluation by providing an email the hiring manager can contact you at."
                    />
                </MetaTags>
                <div className="center">{content}</div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            addEmailToUser
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loading: state.users.loadingSomething,
        currentUser: state.users.currentUser,
        png: state.users.png,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor
    };
}

FinishEvaluation = reduxForm({
    form: "finishEvaluation",
    validate
})(FinishEvaluation);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FinishEvaluation);
