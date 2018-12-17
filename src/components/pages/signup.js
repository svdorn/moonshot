"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    postUser,
    onSignUpPage,
    closeNotification,
    addNotification,
    setUserPosted
} from "../../actions/usersActions";
import { TextField, CircularProgress, FlatButton, Dialog, RaisedButton } from "material-ui";
import { Field, reduxForm } from "redux-form";
import TextInput from "../userInput/textInput";
import HomepageTriangles from "../miscComponents/HomepageTriangles";
import { browserHistory } from "react-router";
import TermsOfUse from "../policies/termsOfUse";
import PrivacyPolicy from "../policies/privacyPolicy";
import MetaTags from "react-meta-tags";
import { renderTextField, renderPasswordField, isValidEmail, goTo } from "../../miscFunctions";
import { button } from "../../classes";
import axios from "axios";

const validate = values => {
    const errors = {};
    const requiredFields = ["name", "email", "password", "password2"];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = "This field is required";
        }
    });
    if (values.email && !isValidEmail(values.email)) {
        errors.email = "Invalid email address";
    }
    if (values.password && values.password2 && values.password != values.password2) {
        errors.password2 = "Passwords must match";
    }
    return errors;
};

const inputStyle = { marginBottom: "10px" };

class Signup extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            email: "",
            agreeingToTerms: false,
            openPP: false,
            openTOU: false,
            sendingVerificationEmail: false,
            contactSupport: false,
            keepMeLoggedIn: true
        };
    }

    componentDidMount() {
        // shouldn't be able to be on sign up page if logged in
        const { currentUser } = this.props;
        if (currentUser) {
            if (currentUser.userType === "accountAdmin") {
                return goTo("/dashboard");
            } else {
                return goTo("/myEvaluations");
            }
        }

        // add listener for keyboard enter key
        document.addEventListener("keypress", this.bound_handleKeyPress);

        this.props.onSignUpPage();
    }

    componentWillUnmount() {
        // remove listener for keyboard enter key
        document.removeEventListener("keypress", this.bound_handleKeyPress);
    }

    handleKeyPress(e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            // 13 is enter
            this.handleSubmit();
        }
    }

    handleSubmit(e) {
        if (e) {
            e.preventDefault();
        }

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to Terms of Use and Privacy Policy.", "error");
            return;
        }

        const vals = this.props.formData.signup.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = ["name", "email", "password", "password2"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return this.props.addNotification("Must fill out all fields.", "error");

        if (!isValidEmail(vals.email)) {
            return this.props.addNotification("Invalid email.", "error");
        }
        if (vals.password != vals.password2) {
            return this.props.addNotification("Passwords must match.", "error");
        }

        // get referral code from cookie, if it exists
        const signUpReferralCode = this.getCode();
        const values = this.props.formData.signup.values;
        const name = values.name;
        const password = values.password;
        const email = values.email;
        const { keepMeLoggedIn } = this.state;
        let user = {
            name,
            password,
            email,
            signUpReferralCode,
            keepMeLoggedIn
        };

        // if the user got here from a link, add those links
        let location = this.props.location;
        if (location.query) {
            user.code = location.query.code;
        }

        if (!user.code) {
            return this.props.addNotification(
                "Must have a unique employer-provided link to sign up.",
                "error"
            );
        }

        this.props.postUser(user);

        this.setState({
            ...this.state,
            email
        });
    }

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        });
    }

    keepMeLoggedInClick() {
        this.setState({
            ...this.state,
            keepMeLoggedIn: !this.state.keepMeLoggedIn
        });
    }

    handleOpenPP = () => {
        this.setState({ openPP: true });
    };

    handleClosePP = () => {
        this.setState({ openPP: false });
    };
    handleOpenTOU = () => {
        this.setState({ openTOU: true });
    };

    handleCloseTOU = () => {
        this.setState({ openTOU: false });
    };

    // create the main content of the page
    createContent() {
        let urlQuery = {};
        try {
            urlQuery = this.props.location.query;
        } catch (e) {
            /* no query */
        }

        return (
            <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h1 style={{ margin: "15px auto 20px" }}>Sign Up</h1>

                    <TextInput name="name" label="Full Name" style={inputStyle} />
                    <TextInput name="email" label="Email" style={inputStyle} />
                    <TextInput
                        name="password"
                        label="Password"
                        type="password"
                        style={inputStyle}
                    />
                    <TextInput
                        name="password2"
                        label="Confirm Password"
                        type="password"
                        style={inputStyle}
                    />

                    <div style={{ margin: "20px 20px 0" }}>
                        <div
                            className="checkbox smallCheckbox whiteCheckbox"
                            onClick={this.keepMeLoggedInClick.bind(this)}
                        >
                            <img
                                alt=""
                                className={"checkMark" + this.state.keepMeLoggedIn}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        Keep me logged in
                    </div>
                    <div style={{ margin: "5px 20px 10px" }}>
                        <div
                            className="checkbox smallCheckbox whiteCheckbox"
                            onClick={this.handleCheckMarkClick.bind(this)}
                        >
                            <img
                                alt=""
                                className={"checkMark" + this.state.agreeingToTerms}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        I have read and agree to the Moonshot Insights
                        <br />
                        <span className="clickable primary-cyan" onClick={this.handleOpenPP}>
                            Privacy Policy
                        </span>
                        {" and "}
                        <span className="clickable primary-cyan" onClick={this.handleOpenTOU}>
                            Terms of Use
                        </span>.
                    </div>
                    <br />
                    <RaisedButton
                        label="Sign Up"
                        type="submit"
                        className="raisedButtonBusinessHome"
                        style={{ margin: "-10px 0 10px" }}
                    />
                    <br />
                    <div
                        className="clickable"
                        onClick={() => goTo({ pathname: "/login", query: urlQuery })}
                        style={{ display: "inline-block" }}
                    >
                        Already have an account?
                    </div>
                </form>
                {this.props.loadingCreateUser ? (
                    <CircularProgress color="#72d6f5" style={{ marginTop: "8px" }} />
                ) : (
                    ""
                )}
            </div>
        );
    }

    //name, email, password, confirm password, signup button
    render() {
        let content = this.createContent();

        const actionsPP = [
            <FlatButton label="Close" primary={true} onClick={this.handleClosePP} />
        ];
        const actionsTOU = [
            <FlatButton label="Close" primary={true} onClick={this.handleCloseTOU} />
        ];
        let blurredClass = "";
        if (this.state.openTOU || this.state.openPP) {
            blurredClass = "dialogForBizOverlay";
        }

        // scroll to the top if user posted
        if (this.state.email != "" && this.props.userPosted) {
            window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth"
            });
        }

        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                    <title>Sign Up | Moonshot Insights</title>
                    <meta
                        name="description"
                        content="Log in or create account. Moonshot Insights helps candidates and employers find their perfect matches."
                    />
                </MetaTags>
                <div className={blurredClass}>
                    <Dialog
                        actions={actionsPP}
                        modal={false}
                        open={this.state.openPP}
                        onRequestClose={this.handleClosePP}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForSignup"
                        overlayClassName="dialogOverlay"
                    >
                        <PrivacyPolicy />
                    </Dialog>
                    <Dialog
                        actions={actionsTOU}
                        modal={false}
                        open={this.state.openTOU}
                        onRequestClose={this.handleCloseTOU}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForSignup"
                        overlayClassName="dialogOverlay"
                    >
                        <TermsOfUse />
                    </Dialog>
                    {/*<HomepageTriangles className="slightly-blurred" style={{pointerEvents: "none"}} variation="5"/>*/}
                    <div className="form lightBlackForm">{content}</div>
                </div>
            </div>
        );
    }

    /************************ REFERRAL COOKIE FUNCTIONS *******************************/
    //this is the name of the cookie on the users machine
    cookieName = "ReferralCodeCookie";
    //the name of the url paramater you are expecting that holds the code you wish to capture
    //for example, http://www.test.com?couponCode=BIGDISCOUNT your URL Parameter would be
    //couponCode and the cookie value that will be stored is BIGDISCOUNT
    URLParameterName = "referralCode";

    // This will return the stored cookie value
    getCode() {
        return this.readCookie(this.cookieName);
    }

    readCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            postUser,
            onSignUpPage,
            addNotification,
            closeNotification,
            setUserPosted
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateUser: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        currentUser: state.users.currentUser,
        png: state.users.png,
        sendVerifyEmailTo: state.users.sendVerifyEmailTo
    };
}

Signup = reduxForm({
    form: "signup",
    validate
})(Signup);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Signup);
