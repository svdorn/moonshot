"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form";
import {
    addNotification,
    postBusinessInterests,
    updateStore
} from "../../../../../actions/usersActions";
import { renderTextField, goTo, fieldsAreEmpty } from "../../../../../miscFunctions";
import { button } from "../../../../../classes";
import TextInput from "../../../../userInput/textInput";
import ShiftArrow from "../../../../miscComponents/shiftArrow";

import "../../dashboard.css";

const validate = values => {
    const errors = {};
    const requiredFields = ["company"];
    // return errors immediately so only one shows up at a time
    for (let fieldIdx = 0; fieldIdx < requiredFields.length; fieldIdx++) {
        const field = requiredFields[fieldIdx];
        if (!values[field]) {
            errors[field] = "Enter your company's name to continue.";
            return errors;
        }
    }

    return errors;
};

class InvitePage extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();

        // form validation before submit
        const vals = this.props.formData.businessSignup.values;
        if (fieldsAreEmpty(vals, ["company"], this.props.touch)) return;

        goTo("/apply/" + vals.company + "?onboarding=true");
    }

    render() {
        const vals = this.props.formData.businessSignup.values;
        const canAdvance = !!vals && !!vals.company;

        const buttonClass = canAdvance
            ? "background-primary-cyan"
            : "disabled background-secondary-gray";

        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <form
                        className="center"
                        onSubmit={this.handleSubmit}
                        style={{ height: "100%" }}
                    >
                        <div className="primary-cyan font24px font20pxUnder700 font18pxUnder600">
                            <div styleName="not-small-mobile add-position-header">
                                See Your Candidate Invite Page
                            </div>
                            <div styleName="small-mobile-only add-position-header">
                                Your Candidate Invite Page
                            </div>
                        </div>
                        <div styleName="non-desktop-activation-space" className="marginTop20px">
                            One page that all of your candidates can visit to complete their
                            evaluation.
                        </div>
                        <div className="inputContainer signup-fields">
                            <Field
                                name="company"
                                component={renderTextField}
                                label="Enter company name"
                            />
                            <br />
                        </div>

                        <div styleName="add-position-button-container">
                            <button
                                className={
                                    "button noselect round-6px primary-white font16px " +
                                    buttonClass
                                }
                                style={{ padding: "5px 17px" }}
                                onClick={this.handleSubmit}
                            >
                                See Your Page <ShiftArrow disabled={!canAdvance} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loading: state.users.loadingSomething,
        formData: state.form
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            postBusinessInterests,
            updateStore
        },
        dispatch
    );
}

InvitePage = reduxForm({
    form: "businessSignup",
    validate
})(InvitePage);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InvitePage);
