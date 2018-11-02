"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Dialog, TextField, FlatButton, RaisedButton, CircularProgress } from 'material-ui';
import { closeContactUsModal, contactUsEmail } from "../../actions/usersActions";
import { Field, reduxForm } from 'redux-form';
import { isValidEmail } from "../../miscFunctions";

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: 'white'}}
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const renderBlueTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: '#72d6f5'}}
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const emailValidate = value => value && !isValidEmail(value) ? 'Invalid email address' : undefined;

const required = value => (value ? undefined : 'This field is required.');

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
            this.setState({open});
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
        const requiredFields = [
            'name',
            'email'
        ];
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

    handleClose() {
        this.props.closeContactUsModal();
    }

    render() {
        let dialogBody = (
            <form onSubmit={this.handleSubmitForm.bind(this)} className="center">
                <div className="primary-white font18px font16pxUnder700 marginTop10px">
                    Our team will be in touch shortly
                </div>
                <Field
                    name="name"
                    component={renderTextField}
                    label="Full Name*"
                    validate={[required]}
                    style={{marginTop: "5px"}}
                /><br/>
                <Field
                    name="email"
                    component={renderTextField}
                    label="Email*"
                    validate={[required, emailValidate]}
                    style={{marginTop: "5px"}}
                /><br/>
                <Field
                    name="company"
                    component={renderTextField}
                    label="Company"
                    style={{marginTop: "5px"}}
                /><br/>
                <Field
                    name="phoneNumber"
                    component={renderTextField}
                    label="Phone Number"
                    style={{marginTop: "5px"}}
                /><br/>
                <Field
                    name="message"
                    component={renderTextField}
                    label="Message"
                    style={{marginTop: "5px"}}
                /><br/>
                <RaisedButton
                    label="Submit"
                    type="submit"
                    className="raisedButtonBusinessHome marginTop15px"
                    />
                <div>
                    {this.props.loading ?
                        <div className="marginTop10px">
                            <CircularProgress color="white"/>
                        </div>
                        : null}
                </div>
                <div>
                    {this.props.message ?
                        <div className="marginTop10px primary-white font16px font14pxUnder700">
                            {this.props.message}
                        </div>
                        : null}
                </div>

            </form>
        );

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose.bind(this)}
                className="primary-white-important"
            />,
        ];

        const dialog = (
            <Dialog
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose.bind(this)}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                {dialogBody}
            </Dialog>
        );
        return (
            <div>
                {dialog}
            </div>
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
    return bindActionCreators({
        closeContactUsModal,
        contactUsEmail
    }, dispatch);
}

ContactUsDialog = reduxForm({
    form: 'contactUsModal',
})(ContactUsDialog);

export default connect(mapStateToProps, mapDispatchToProps)(ContactUsDialog);
