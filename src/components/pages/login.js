"use strict"
import React, { Component } from 'react';
import axios from 'axios';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { login, closeNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import { renderTextField, renderPasswordField } from "../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'password',
    ];
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
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
        this.state = {
            showErrors: true,
            keepMeLoggedIn: false
        };
    }

    componentWillMount() {
        // set listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.handleKeyPress.bind(self));

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
            // get the setting for if the user wants to stay logged in from the cookie
            axios.get("/api/user/keepMeLoggedIn")
            .then(function (res) {
                let keepMeLoggedIn = res.data;
                if (typeof keepMeLoggedIn != "boolean") {
                    keepMeLoggedIn = false;
                }
                self.setState({
                    ...self.state,
                    keepMeLoggedIn
                })
            })
            .catch(function (err) {
                // console.log("error getting 'keep me logged in' option")
            });
        }
    }


    componentWillUnmount() {
        // remove listener for keyboard enter key
        const self = this;
        document.removeEventListener('keypress', self.handleKeyPress.bind(self));
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
        if (vals.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const user = {
            email: this.props.formData.login.values.email,
            password: this.props.formData.login.values.password
        };

        let saveSession = this.state.keepMeLoggedIn;

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

        axios.post("/api/user/keepMeLoggedIn", { stayLoggedIn: !this.state.keepMeLoggedIn })
        .catch(function(err) {
            // console.log("error posting 'keep me logged in' option: ", err);
        });
        this.setState({
            ...this.state,
            keepMeLoggedIn: !this.state.keepMeLoggedIn
        })
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
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />
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
                                className={"checkMark" + this.state.keepMeLoggedIn}
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
