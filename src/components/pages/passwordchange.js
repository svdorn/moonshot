"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changePassword} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper} from 'material-ui';
import {Field, reduxForm} from 'redux-form';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
};

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
        'oldpass',
        'password',
        'password2',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class PasswordChange extends Component {

    handleSubmit(e) {
        e.preventDefault();
        // values that were entered in the form
        const vals = this.props.formData.changePassword.values;
        // Form validation before submit
        let notValid = false;
        // user required to enter all three fields
        const requiredFields = [
            'oldpass',
            'password',
            'password2',
        ];
        // if nothing is entered in one of the required fields, touch it to
        // bring up the warning that says you have to enter something
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        // if a required field is empty, do not save password
        if (notValid) return;
        // first and second new password have to match
        if (vals.password != vals.password2) return;

        // info the server needs to change the password
        const user = {
            _id: this.props.currentUser._id,
            oldpass: this.props.formData.changePassword.values.oldpass,
            password: this.props.formData.changePassword.values.password
        };

        // change the password in the backend
        this.props.changePassword(user);
    }


    render() {
        return (
            <div className="formContainer" style={{display:'inline-block'}}>
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Change Password</h1>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                        <Field
                            name="oldpass"
                            component={renderPasswordField}
                            label="Old Password"
                            className="lightBlueInputText"
                        /></div><br/>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                        <Field
                            name="password"
                            component={renderPasswordField}
                            label="New Password"
                            className="lightBlueInputText"
                        /></div><br/>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                        <Field
                            name="password2"
                            component={renderPasswordField}
                            label="Confirm New Password"
                            className="lightBlueInputText"
                        /></div><br/>
                        <button
                            type="submit"
                            className="formSubmitButton font24px font16pxUnder600"
                        >
                            Change Password
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changePassword,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
    };
}

PasswordChange = reduxForm({
    form: 'changePassword',
    validate,
})(PasswordChange);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange);
