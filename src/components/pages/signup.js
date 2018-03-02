"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postUser, onSignUpPage, closeNotification, addNotification} from '../../actions/usersActions';
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
            email: "",
            agreeingToTerms: false
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

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to terms of use and privacy policy.", "error");
            return;
        }

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
        let user = [{
            name, password, email,
            userType: "student",
        }];

        // if the user got here from a pathway landing page, add the pathway id
        // and url for redirect after onboarding completion
        let location = this.props.location;
        if (location.query) {
            if (location.query.pathway) {
                user[0].pathwayId = location.query.pathway;
                if (location.query.redirect) {
                    user[0].redirect = location.query.redirect;
                }
            }
        }

        this.props.postUser(user);

        this.setState({
            ...this.state,
            email
        })
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        })
    }


    //name, email, password, confirm password, signup button
    render() {
        let urlQuery = {};
        try {
            urlQuery = this.props.location.query;
        } catch(e) { /* no query */ }

        return (
            <div className="fillScreen greenToBlue formContainer">
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="5" />
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

                                <div style={{margin:"20px 20px 10px"}}>
                                    <div className="checkbox smallCheckbox blueCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                                        <img
                                            className={"checkMark" + this.state.agreeingToTerms}
                                            src="/icons/CheckMarkBlue.png"
                                        />
                                    </div>
                                    I understand and agree to the <a href="https://moonshotlearning.org/privacyPolicy" target="_blank">Privacy Policy</a> and <a href="https://moonshotlearning.org/termsOfUse" target="_blank">Terms of Use</a>.
                                </div>

                                <button
                                    type="submit"
                                    className="formSubmitButton font24px font16pxUnder600"
                                >
                                    Sign Up
                                </button>
                                <br/>
                                <div className="clickable blueText" onClick={() => this.goTo({pathname: '/login', query: urlQuery})} style={{display:"inline-block"}}>Already have an account?</div>
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
        onSignUpPage,
        addNotification,
        closeNotification
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
