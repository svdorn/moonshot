"use strict"
import React, {Component} from 'react';
import {TextField, RaisedButton, Paper} from 'material-ui';
import {login} from '../../actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
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

    handleSubmit() {
        console.log("username is " + this.props.formData.login.values.username);
        const user = {
            username: this.props.formData.login.values.username,
            password: this.props.formData.login.values.password
        };

        console.log(user);

        this.props.login(user);
        console.log("here");
        console.log("current user is" + this.props.currentUser);

        //console.log(this.state.currentUser);
    }

    render() {
        console.log(this.props);
        return (
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
                            component={renderTextField}
                            label="Password"
                        /><br/>
                    <RaisedButton type="submit"
                                  label="Login"
                                  primary={true}
                                  className="button"/>
                </form>
            </Paper>
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
        formData: state.form
    };
}

Login = reduxForm({
    form:'login',
    validate,
})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);