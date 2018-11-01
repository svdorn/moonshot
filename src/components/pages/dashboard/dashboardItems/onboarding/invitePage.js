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
import { renderTextField, goTo } from "../../../../../miscFunctions";
import { button } from "../../../../../classes";

import "../../dashboard.css";

const validate = values => {
    const errors = {};
    const requiredFields = ["company"];
    // return errors immediately so only one shows up at a time
    for (let fieldIdx = 0; fieldIdx < requiredFields.length; fieldIdx++) {
        const field = requiredFields[fieldIdx];
        if (!values[field]) {
            errors[field] = "Must enter company name to continue.";
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

        const vals = this.props.formData.businessSignup.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = ["company"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) {
            return;
        }

        goTo("/apply/" + vals.company + "?onboarding=true");
    }

    render() {
        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <form
                        className="center"
                        onSubmit={this.handleSubmit}
                        style={{ height: "100%" }}
                    >
                        <div className="primary-cyan font24px font20pxUnder700 font18pxUnder500 marginTop20px">
                            <div styleName="not-small-mobile">A Candidate Invite Page Just For You</div>
                            <div styleName="small-mobile-only">Your Candidate Invite Page</div>
                        </div>
                        <div className="marginTop10px">
                            One page that all of your candidates can visit to complete their
                            evaluation.
                        </div>
                        <div className="inputContainer signup-fields" styleName="not-small-mobile">
                            <Field
                                name="company"
                                component={renderTextField}
                                label="Enter your company name"
                            />
                            <br />
                        </div>
                        <div className="inputContainer signup-fields" styleName="small-mobile-only">
                            <Field
                                name="company"
                                component={renderTextField}
                                label="Company name"
                            />
                            <br />
                        </div>
                        <button
                            className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700 font14pxUnder500 marginTop20px"
                            styleName="onboarding-button"
                            style={{ padding: "5px 17px" }}
                            onClick={this.handleSubmit}
                        >
                            <span>See Your Page &#8594;</span>
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
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
