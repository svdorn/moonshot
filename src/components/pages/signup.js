"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postUser, onSignUpPage} from '../../actions/usersActions';
import {TextField, CircularProgress } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import { browserHistory } from 'react-router';

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

    componentWillMount() {
        // shouldn't be able to be on sign up page if logged in
        if (this.props.currentUser && this.props.currentUser != "no user") {
           this.goTo("/discover");
        }
    }

    componentDidMount() {
        this.props.onSignUpPage();
    }

    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.signup.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
            'email',
            'password',
            'password2',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

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

        this.props.postUser(user);

        this.setState({
            ...this.state,
            email
        })
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fullHeight greenToBlue formContainer">
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightWhiteForm">
                    {this.state.email != "" && this.props.userPosted ?
                        <div className="center">
                            <h1>Verify your email address</h1>
                            <p>We sent {this.state.email} a verification link. Check your junk folder if you can{"'"}t find our email.</p>
                        </div>
                        :
                        <div>
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                <h1 style={{marginTop:"15px"}}>Sign Up</h1>
                                <div className="inputContainer">
                                    <div className="fieldWhiteSpace"/>
                                    <Field
                                        name="name"
                                        component={renderTextField}
                                        label="Full Name"
                                        className="lightBlueInputText"
                                    /><br/>
                                </div>
                                <div className="inputContainer">
                                    <div className="fieldWhiteSpace"/>
                                    <Field
                                        name="email"
                                        component={renderTextField}
                                        label="Email"
                                        className="lightBlueInputText"
                                    /><br/>
                                </div>
                                <div className="inputContainer">
                                    <div className="fieldWhiteSpace"/>
                                    <Field
                                        name="password"
                                        component={renderPasswordField}
                                        label="Password"
                                        className="lightBlueInputText"
                                    /><br/>
                                </div>
                                <div className="inputContainer">
                                    <div className="fieldWhiteSpace"/>
                                    <Field
                                        name="password2"
                                        component={renderPasswordField}
                                        label="Confirm Password"
                                        className="lightBlueInputText"
                                    /><br/>
                                </div>
                                <button
                                    type="submit"
                                    className="formSubmitButton font24px font16pxUnder600"
                                >
                                    Sign Up
                                </button>
                            </form>
                            { this.props.loadingCreateUser ? <CircularProgress style={{marginTop:"20px"}}/> : "" }
                        </div>
                    }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postUser,
        onSignUpPage
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateUser: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        currentUser: state.users.currentUser
    };
}

Signup = reduxForm({
    form: 'signup',
    validate,
})(Signup);

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
