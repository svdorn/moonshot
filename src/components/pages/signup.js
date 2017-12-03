"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postUser, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper} from 'material-ui';
import {Field, reduxForm} from 'redux-form';

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
        'name',
        'username',
        'email',
        'password',
        'password2',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address'
    }
    return errors
};

class Signup extends Component {

    handleSubmit() {
        const user = [{
            name: this.props.formData.signup.values.name,
            username: this.props.formData.signup.values.username,
            userType: "student",
            password: this.props.formData.signup.values.password,
            email: this.props.formData.signup.values.email,
        }];

        console.log(user);

        this.props.postUser(user);

        console.log("posted");
    }

    //name, username, email, password, confirm password, signup button
    render() {
        return (
            <Paper className="form" zDepth={2}>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h1>Sign Up</h1>
                    <Field
                        name="name"
                        component={renderTextField}
                        label="Full Name"
                    /><br/>
                    <Field
                        name="username"
                        component={renderTextField}
                        label="Username"
                    /><br/>
                    <Field
                        name="email"
                        component={renderTextField}
                        label="Email"
                    /><br/>
                    <Field
                        name="password"
                        component={renderPasswordField}
                        label="Password"
                    /><br/>
                    <Field
                        name="password2"
                        component={renderPasswordField}
                        label="Confirm Password"
                    /><br/>
                    <RaisedButton type="submit"
                                  label="Sign up"
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
        postUser,
        getUsers
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form
    };
}

Signup = reduxForm({
    form:'signup',
    validate,
})(Signup);

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
