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

        this.state = {};
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    render() {
        // ensure current user is admin
        const currentUser = this.props.currentUser;
        if (!this.props.currentUser || !this.props.currentUser.admin) {
            return null;
        }

        return (
            <div className="fillScreen greenToBlue formContainer">
                <div className="form lightWhiteForm">
                    Edit Business
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
        currentUser: state.users.currentUser
    };
}

CreateBusinessAccount = reduxForm({
    form: 'createBusinessAccount',
    validate,
})(CreateBusinessAccount);

export default connect(mapStateToProps, mapDispatchToProps)(CreateBusinessAccount);
