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
import {
    renderTextField,
    goTo
} from "../../../../../miscFunctions";
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

        this.state = {
            error: undefined
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        console.log("in submit");
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

        goTo("/apply");
    }

    render() {
        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                <form className="center" style={{ height: "100%" }}>
                        <div className="primary-cyan font24px font20pxUnder700 font16pxUnder500">
                            A Candidate Invite Page Just For You
                        </div>
                        <div className="marginTop20px">
                            One page that all of your candidates can visit to complete their evaluation.
                        </div>
                        <div className="inputContainer" styleName="signup-fields">
                            <Field name="company" component={renderTextField} label="Enter your company name" />
                            <br />
                        </div>
                        <button className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700 font14pxUnder500 marginTop20px" styleName="onboarding-button" style={{padding: "6px 20px"}}>
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
        loading: state.users.loadingSomething
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
