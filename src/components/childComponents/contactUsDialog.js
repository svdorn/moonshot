"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CircularProgress, Dialog, DialogActions } from "@material-ui/core";
import { closeContactUsModal, contactUsEmail } from "../../actions/usersActions";
import { reduxForm } from "redux-form";
import { isValidEmail } from "../../miscFunctions";
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
        const phoneNumber = "";
        const company = "";
        const message = "";

        const initialValues = { email, name, phoneNumber, company, message };
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
        let notValid = false;
        const requiredFields = ["name", "email"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!isValidEmail(vals.email)) return;

        const user = {
            name: vals.name,
            email: vals.email,
            company: vals.company,
            phoneNumber: vals.phoneNumber,
            message: vals.message
        };

        this.props.contactUsEmail(user, this.resetValues.bind(this));
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
                    name="company"
                    label="Company"
                    required={false}
                    style={{ marginTop: "5px" }}
                />
                <TextInput
                    name="phoneNumber"
                    label="Phone Number"
                    required={false}
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
            <Dialog open={!!this.state.open} maxWith={false} onClose={this.handleClose}>
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
        message: state.users.message
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
