"use strict"
import React, { Component } from 'react';
import axios from 'axios';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { login, closeNotification, addNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import { renderTextField, renderPasswordField, isValidEmail } from "../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'password',
    ];
    if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email address';
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required';
        }
    });

    return errors
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.bound_handleKeyPress = this.handleKeyPress.bind(this);
        this.state = {
            showErrors: true,
            stayLoggedIn: false
        };
    }

    componentWillMount() {
        // set listener for keyboard enter key
        document.addEventListener('keypress', this.bound_handleKeyPress);

        // shouldn't be able to be on login page if logged in
        if (this.props.currentUser) {
            // check if there is a redirect link and redirect there if already logged in
            const location = this.props.location;
            if (location.query) {
                if (location.query.redirect) {
                    // brings a user to wherever they were trying to go before
                    const redirectUrl = location.query.redirect;
                    browserHistory.push(redirectUrl);
                    return;
                }
            }

            // otherwise go home
            this.props.router.push("/");
            return;
        }


        else {
            const self = this;
            // get the setting for if the user wants to stay logged in from the cookie
            axios.get("/api/user/stayLoggedIn")
            .then(res => {
                const setting = res.data.stayLoggedIn;
                // stay logged in by default
                const stayLoggedIn = typeof setting === "boolean" ? setting : true;
                self.setState({ stayLoggedIn });
            })
            // if there's an error getting this setting, don't do anything,
            // as that will keep the setting as false
            .catch(error => {});
        }
    }


    componentWillUnmount() {
        // remove listener for keyboard enter key
        document.removeEventListener('keypress', this.bound_handleKeyPress);
    }


    handleKeyPress(e) {
        var key = e.which || e.keyCode;
        if (key === 13 && this.props.router.location.pathname === "/login") { // 13 is enter
            this.handleSubmit();
        }
    }


    handleSubmit(e) {
        if (e) {
            e.preventDefault();
        }
        const vals = this.props.formData.login.values;

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'email',
            'password',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;
        if (vals.email && !isValidEmail(vals.email)) {
            return;
        }

        const user = {
            email: this.props.formData.login.values.email,
            password: this.props.formData.login.values.password
        };

        let saveSession = this.state.stayLoggedIn;

        let navigateBackUrl = undefined;
        let location = this.props.location;

        if (location.query && location.query.redirect) {
            // brings a user to wherever they were trying to go before
            navigateBackUrl = location.query.redirect;
        }

        this.props.login(user, saveSession, navigateBackUrl)

    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleCheckMarkClick() {
        const stayLoggedIn = !this.state.stayLoggedIn;
        // save the setting in the session
        axios.post("/api/user/stayLoggedIn", { stayLoggedIn: stayLoggedIn })
        // won't be seeing this page until logging in again, and at that point
        // user can just re-check the checkmark, so not a big deal if this
        // setting doesn't save
        .catch(function(err) {});
        // uncheck the checkmark
        this.setState({ ...this.state, stayLoggedIn });
    }

    render() {
        // the query that will be passed to "sign up" if that is clicked
        let location = this.props.location;
        const pathway = location.query.pathway;
        const redirect = location.query.redirect;
        let signUpQuery = {};
        if (pathway) { signUpQuery.pathway = pathway; }
        if (redirect) { signUpQuery.redirect = redirect; }

        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                    <title>Log In | Moonshot</title>
                    <meta name="description" content="Log in or create account. Moonshot helps you find the perfect career - for free. Prove your skill to multiple companies with each pathway completion." />
                </MetaTags>
                {/*<HomepageTriangles className="slightly-blurred" style={{pointerEvents:"none"}} variation="1" />*/}
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 style={{marginTop:"15px"}}>Log In</h1>
                        <div className="inputContainer">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="Password"
                            /><br/><br/>
                        </div>
                        <div className="checkbox smallCheckbox whiteCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                            <img
                                alt="Checkmark icon"
                                className={"checkMark" + this.state.stayLoggedIn}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        <div style={{display:"inline-block"}}>
                            Keep me signed in
                        </div><br/>
                        <RaisedButton
                            label="Log In"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{margin: '10px 0'}}
                        />
                        <br/>
                        <div className="clickable underline" onClick={() => this.goTo({pathname: '/signup', query: signUpQuery})} style={{display:"inline-block"}}>Create Account</div>
                        <br/>
                        <div className="clickable" onClick={() => this.goTo('/forgotPassword')} style={{display:"inline-block", marginLeft:"7px"}}>Forgot Password?</div>
                        <br/>
                        {this.props.loadingLogin ? <CircularProgress color="white" style={{marginTop: "10px"}}/> : null}
                    </form>
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        login,
        closeNotification,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loadingLogin: state.users.loadingSomething,
        png: state.users.png
    };
}

Login = reduxForm({
    form:'login',
    validate,
})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
