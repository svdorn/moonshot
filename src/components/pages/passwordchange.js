"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { changePassword} from '../../actions/usersActions';
import { TextField, RaisedButton, Paper } from 'material-ui';
import { Field, reduxForm } from 'redux-form';

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

        // Check if valid
        const vals = this.props.formData.settings.values;

        if (!(vals.oldpass && vals.password && vals.password2)) {
            return;
        }
        if (vals.password != vals.password2) {
            return;
        }
        const user = {
            _id: this.props.currentUser._id,
            oldpass: this.props.formData.settings.values.oldpass,
            password: this.props.formData.settings.values.password,
        };
        this.props.changePassword(user);
    }

    //name, username, email, password, confirm password, signup button
    render() {
        console.log(this.props);
        return (
            <Paper className="formOther">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h1>Change Password</h1>
                    <Field
                        name="oldpass"
                        component={renderTextField}
                        label="Old Password"
                    /><br/>
                    <Field
                        name="password"
                        component={renderPasswordField}
                        label="New Password"
                    /><br/>
                    <Field
                        name="password2"
                        component={renderPasswordField}
                        label="Confirm New Password"
                    /><br/>
                    <RaisedButton type="submit"
                                  label="Change Password"
                                  primary={true}
                                  className="button"
                    />
                </form>
            </Paper>
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
    form: 'settings',
    validate,
})(PasswordChange);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange);
