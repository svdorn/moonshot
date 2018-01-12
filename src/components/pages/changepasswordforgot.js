"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { changePasswordForgot } from '../../actions/usersActions';
import { TextField, RaisedButton, Paper } from 'material-ui';
import { Field, reduxForm } from 'redux-form';

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
        const vals = this.props.formData.forgotPassChange.values;

        if (vals.password != vals.password2) {
            return;
        }
        const token = this.props.location.search.substr(1);
        const user = {
            token: token,
            password: vals.password,
        };
        console.log("changing password");
        this.props.changePasswordForgot(user);
    }

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fullHeight greenToBlue">
                <Paper className="form">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Change Password</h1>
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
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changePasswordForgot,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser
    };
}

PasswordChange = reduxForm({
    form: 'forgotPassChange',
    validate,
})(PasswordChange);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange);
