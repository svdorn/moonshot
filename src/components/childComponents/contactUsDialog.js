"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CircularProgress, Dialog, DialogActions } from "@material-ui/core";
import { closeContactUsModal, contactUsEmail } from "../../actions/usersActions";
import { reduxForm } from "redux-form";
import { isValidEmail, fieldsAreEmpty, isWhiteOrUndefined } from "../../miscFunctions";
import TextInput from "../userInput/textInput";
import { Button } from "../miscComponents";

const emailValidate = value =>
    value && !isValidEmail(value) ? "Invalid email address" : undefined;

const required = value => (value ? undefined : "This field is required.");

class ContactUsDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open || false
        };
    }

    componentDidMount() {
        this.resetValues();
    }

    resetValues() {
        const user = this.props.currentUser;

        // set initial values
        const email = user ? user.email : "";
        const name = user ? user.name : "";
        const message = "";

        const initialValues = { email, name, message };
        this.props.initialize(initialValues);
    }

    componentDidUpdate(prevProps, prevState) {
        // make sure the props defining whether the modal is open matches the state for that
        if (this.props.open != this.state.open && this.props.open != undefined) {
            const open = this.props.open;
            this.setState({ open });
        }

        // if logged-in status changed
        if (!prevProps.currentUser !== !this.props.currentUser) {
            this.resetValues();
        }
    }

    handleSubmitForm(e) {
        e.preventDefault();
        const vals = this.props.formData.contactUsModal.values;

        // Form validation before submit
        if (fieldsAreEmpty(vals, ["name", "email"], this.props.touch)) return;

        if (!isValidEmail(vals.email)) return;

        const args = {
            name: vals.name,
            email: vals.email,
            message: vals.message
        };

        this.props.contactUsEmail(args, this.resetValues.bind(this));
    }

    handleClose = () => {
        this.props.closeContactUsModal();
    };

    render() {
        let dialogBody = (
            <form onSubmit={this.handleSubmitForm.bind(this)} className="center">
                <div className="font18px font16pxUnder700 marginTop10px">
                    Our team will be in touch shortly
                </div>
                <TextInput
                    name="name"
                    label="Full Name*"
                    validate={[required]}
                    style={{ marginTop: "5px" }}
                />
                <TextInput
                    name="email"
                    label="Email*"
                    validate={[required, emailValidate]}
                    style={{ marginTop: "5px" }}
                />
                <TextInput
                    name="message"
                    label="Message"
                    required={false}
                    style={{ marginTop: "5px" }}
                />
                <Button type="submit" style={{ marginTop: "15px" }}>
                    SUBMIT
                </Button>
                <div>
                    {this.props.loading ? (
                        <div className="marginTop10px">
                            <CircularProgress color="primary" />
                        </div>
                    ) : null}
                </div>
                <div>
                    {this.props.message ? (
                        <div className="marginTop10px font16px font14pxUnder700">
                            {this.props.message}
                        </div>
                    ) : null}
                </div>
            </form>
        );

        return (
            <Dialog
                open={!!this.state.open}
                maxWidth={false}
                onClose={this.handleClose}
                classes={{
                    paper: isWhiteOrUndefined(this.props.textColor)
                        ? "background-primary-black-dark-important"
                        : ""
                }}
            >
                <div className="dialog-margins">{dialogBody}</div>
                <DialogActions>
                    <Button variant="text" onClick={this.handleClose}>
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        open: state.users.contactUsModal,
        loading: state.users.loadingSomething,
        message: state.users.message,
        textColor: state.users.textColor
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeContactUsModal,
            contactUsEmail
        },
        dispatch
    );
}

ContactUsDialog = reduxForm({
    form: "contactUsModal"
})(ContactUsDialog);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContactUsDialog);
