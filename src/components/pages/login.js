"use strict"
import React, { Component } from 'react';
import { TextField, RaisedButton, Paper } from 'material-ui';
import { login } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
        'username',
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
            username: this.props.formData.login.values.username,
            password: this.props.formData.login.values.password
        };

        console.log(user);

        this.props.login(user)
        // .then(function(response) {
        //     console.log(response);
        // });

        console.log("here");
        console.log("current user is" + this.props.currentUser);

        //console.log(this.state.currentUser);
    }

    render() {
        console.log("props are:", this.props);
        return (
            <div>
                {this.props.loginError ? <div>ERROR</div> : null}
                <Paper className="form" zDepth={2}>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Login</h1>
                            <Field
                                name="username"
                                component={renderTextField}
                                label="Username"
                            /><br/>
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="Password"
                            /><br/>
                        <RaisedButton type="submit"
                                      label="Login"
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
        login
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        formData: state.form,
        loginError: state.users.loginError
    };
}

Login = reduxForm({
    form:'login',
    validate,
})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
