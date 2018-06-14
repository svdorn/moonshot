"use strict"
import React, { Component } from 'react';
import axios from 'axios';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { login, closeNotification, addPathwayAndLogin, addNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';

const style = {
    // the hint that shows up when search bar is in focus
    searchHintStyle: { color: "rgba(255, 255, 255, .3)" },
    searchInputStyle: { color: "rgba(255, 255, 255, .8)" },

    searchFloatingLabelFocusStyle: { color: "rgb(114, 214, 245)" },
    searchFloatingLabelStyle: { color: "rgb(114, 214, 245)" },
    searchUnderlineFocusStyle: { color: "green" }
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle = {style.searchUnderlineFocusStyle}
        {...input}
        {...custom}
    />
);

const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle = {style.searchUnderlineFocusStyle}
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

class EmployerLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showErrors: true,
            keepMeLoggedIn: false,
            agreeingToTerms: false
        };
    }

    componentWillMount() {
        // set listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.handleKeyPress.bind(self));

        // shouldn't be able to be on sign up page if logged in
        if (this.props.currentUser && this.props.currentUser != "no user") {
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
        if (key === 13) { // 13 is enter
            this.handleSubmit();
        }
    }


    handleSubmit(e) {
        if (e) {
            e.preventDefault();
        }
        const vals = this.props.formData.login.values;

        if (!this.state.agreeingToTerms) {
            return this.props.addNotification("Must agree to terms.", "error");
        }

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
        let pathwayId = undefined;
        let pathwayName = undefined;

        if (location.query) {
            if (location.query.pathway) {
                pathwayId = location.query.pathway;
                pathwayName = location.query.redirect;
            }
            if (location.query.redirect) {
                // brings a user to wherever they were trying to go before
                navigateBackUrl = location.query.redirect;
            }
        }

        this.props.login(user, saveSession, navigateBackUrl, pathwayId, pathwayName, true);

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


    handleAgreementClick() {
        this.setState({
            agreeingToTerms: !this.state.agreeingToTerms,
            error: ''
        })
    };


    render() {
        // the query that will be passed to "sign up" if that is clicked
        let location = this.props.location;
        const pathway = location.query.pathway;
        const redirect = location.query.redirect;
        let signUpQuery = {};
        if (pathway) { signUpQuery.pathway = pathway; }
        if (redirect) { signUpQuery.redirect = redirect; }

        return (
            <div className="fillScreen blackBackground formContainer">
                <MetaTags>
                    <title>Activate Account | Moonshot</title>
                    <meta name="description" content="Log in or create account. Moonshot helps you find the perfect career - for free. Prove your skill to multiple companies with each pathway completion." />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 style={{marginTop:"15px"}}>Activate Account</h1>
                        <div className="inputContainer">
                            {/* <!-- <div className="fieldWhiteSpace"/> --> */}
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            {/* <!-- <div className="fieldWhiteSpace"/> --> */}
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="Password"
                            /><br/><br/>
                        </div>
                        <div style={{margin: "10px 60px 10px"}} className="whiteText font14px">
                            <div className="checkbox smallCheckbox whiteCheckbox"
                                 onClick={this.handleAgreementClick.bind(this)}>
                                <img
                                    alt=""
                                    className={"checkMark" + this.state.agreeingToTerms}
                                    src="/icons/CheckMarkRoundedWhite.png"
                                />
                            </div>
                            I have read and agree to the Moonshot Insights <a className="blueTextHome" href="/privacyPolicy" target="_blank">Privacy
                            Policy</a>, <a className="blueTextHome" href="/termsOfUse" target="_blank">Terms of Use</a>, and <a className="blueTextHome" href="/serviceLevelAgreement" target="_blank">Service Level Agreement</a>.
                        </div>
                        <br/>
                        <div className="checkbox smallCheckbox whiteCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                            <img
                                alt="Checkmark icon"
                                className={"checkMark" + this.state.keepMeLoggedIn}
                                src="/icons/CheckMarkRoundedWhite.png"
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
        addPathwayAndLogin,
        closeNotification,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loadingLogin: state.users.loadingSomething
    };
}

EmployerLogin = reduxForm({
    form:'login',
    validate,
})(EmployerLogin);

export default connect(mapStateToProps, mapDispatchToProps)(EmployerLogin);
