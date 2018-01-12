"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postUser, getUsers, onSignUpPage} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress } from 'material-ui';
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
        errors.email = 'Invalid email address';
    }
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class Signup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: ""
        }
    }

    componentDidMount() {
        this.props.onSignUpPage();
    }

    handleSubmit(e) {
        e.preventDefault();

        console.log("signing up")

        // Check if valid
        const vals = this.props.formData.signup.values;

        // check if all fields have a value
        let valsCounter = 0;
        for (let i in vals) {
            valsCounter++;
        }

        if (!vals || valsCounter !== 4) {
            return;
        }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }
        if (vals.password != vals.password2) {
            return;
        }

        const name = this.props.formData.signup.values.name;
        const password = this.props.formData.signup.values.password;
        const email = this.props.formData.signup.values.email;
        const user = [{
            name, password, email,
            userType: "student",
        }];

        console.log("POSTING USER: ", user);

        this.props.postUser(user);

        this.setState({
            ...this.state,
            email
        })

        console.log("posted");
    }

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fullHeight greenToBlue">
                <Paper className="form" zDepth={2}>
                    {this.state.email != "" && this.props.userPosted ?
                        <div className="center">
                            <h1>Verify your email address</h1>
                            <p>We sent {this.state.email} a verification link. Check your junk folder if you can{"'"}t find our email.</p>
                        </div>
                        :
                        <div>
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                <h1>Sign Up</h1>
                                <Field
                                    name="name"
                                    component={renderTextField}
                                    label="Full Name"
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
                            { this.props.loadingCreateUser ? <CircularProgress style={{marginTop:"20px"}}/> : "" }
                        </div>
                    }
                </Paper>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postUser,
        getUsers,
        onSignUpPage
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateUser: state.users.loadingSomething,
        userPosted: state.users.userPosted
    };
}

Signup = reduxForm({
    form: 'signup',
    validate,
})(Signup);

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
