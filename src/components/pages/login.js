"use strict"
import React, { Component } from 'react';
import { TextField, RaisedButton, Paper, Snackbar } from 'material-ui';
import { login } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';


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
        'email',
        'password',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });

    return errors
};

class Login extends Component {
    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.login.values;

        // check if all fields have a value
        let valsCounter = 0;
        for (let i in vals) {
            valsCounter++;
        }

        if (!vals || valsCounter !== 2) {
            return;
        }
        const user = {
            email: this.props.formData.login.values.email,
            password: this.props.formData.login.values.password
        };

        let saveSession = true;

        this.props.login(user, saveSession);
    }

    render() {
        return (
            <div className="fullHeight greenToBlue formContainer">
                <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Sign in</h1>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="Password"
                            /><br/><br/>
                        </div>
                        <a href="/signup">Create account</a><br/>
                        <a href="/forgotPassword">Forgot Password?</a><br/>
                        <button
                            type="submit"
                            className="formSubmitButton"
                        >
                            Sign In
                        </button>
                    </form>
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        login
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
    };
}

Login = reduxForm({
    form:'login',
    validate,
})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
