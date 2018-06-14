"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, postBusiness} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {Field, reduxForm} from 'redux-form';
import axios from 'axios';
import {TextField, CircularProgress} from 'material-ui';


const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
};


const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        floatingLabelStyle={styles.floatingLabelStyle}
        {...input}
        {...custom}
    />
);


const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        floatingLabelStyle={styles.floatingLabelStyle}
        {...input}
        {...custom}
        type="password"
    />
);


const validate = values => {
    const errors = {};
    const requiredFields = [
        'businessName',
        'initialUserEmail',
        'initialUserName',
        'initialUserPassword',
        'initialUserPassword2',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.initialUserEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.initialUserEmail)) {
        errors.initialUserEmail = 'Invalid email address';
    }
    if (values.initialUserPassword && values.initialUserPassword2 && (values.initialUserPassword != values.initialUserPassword2)) {
        errors.initialUserPassword2 = 'Passwords must match';
    }
    return errors
};


class CreateBusinessAccount extends Component {
    constructor(props) {
        super(props);

        this.state = {showLoading: false};
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleSubmit(e) {
        e.preventDefault();

        const vals = this.props.formData.createBusinessAccount.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'businessName',
            'initialUserEmail',
            'initialUserName',
            'initialUserPassword',
            'initialUserPassword2',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.initialUserEmail)) {
            return;
        }
        if (vals.initialUserPassword != vals.initialUserPassword2) {
            return;
        }

        // must be an admin to post a new businesses
        const currentUser = this.props.currentUser;
        if (!currentUser || !currentUser.admin) {
            return;
        }

        const userId = currentUser._id;
        const verificationToken = currentUser.verificationToken;
        const businessName = vals.businessName;
        const initialUserName = vals.initialUserName;
        const initialUserPassword = vals.initialUserPassword;
        const initialUserEmail = vals.initialUserEmail;
        let business = {
            userId,
            verificationToken,
            businessName,
            initialUserName,
            initialUserPassword,
            initialUserEmail
        };

        this.setState({showLoading: true});

        this.props.postBusiness(business);
    }


    render() {
        if (!this.props.currentUser.admin === true) {
            return null;
        }

        return (
            <div className="fillScreen greenToBlue formContainer">
                <div className="form lightWhiteForm">
                    <div>
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <h1 style={{marginTop: "15px"}}>Create Business Account</h1>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="businessName"
                                    component={renderTextField}
                                    label="Business Name"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="initialUserName"
                                    component={renderTextField}
                                    label="Initial User's Name"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="initialUserEmail"
                                    component={renderTextField}
                                    label="Initial User's Email"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="initialUserPassword"
                                    component={renderPasswordField}
                                    label="Initial User's Password"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="initialUserPassword2"
                                    component={renderPasswordField}
                                    label="Confirm Password"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>

                            <button
                                type="submit"
                                className="formSubmitButton font24px font16pxUnder600"
                            >
                                Create
                            </button>
                            <br/>
                        </form>
                        {this.props.loadingCreateBusiness ? <CircularProgress style={{marginTop: "20px"}}/> : ""}
                    </div>
                </div>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        postBusiness
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        loadingCreateBusiness: state.users.loadingSomething
    };
}

CreateBusinessAccount = reduxForm({
    form: 'createBusinessAccount',
    validate,
})(CreateBusinessAccount);

export default connect(mapStateToProps, mapDispatchToProps)(CreateBusinessAccount);
