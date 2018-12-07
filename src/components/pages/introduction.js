"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    postCandidate,
    onSignUpPage,
    closeNotification,
    addNotification,
    setUserPosted,
    getColorsFromBusiness
} from "../../actions/usersActions";
import { Field, reduxForm } from "redux-form";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextInput from "../userInput/textInput";
import MetaTags from "react-meta-tags";
import { renderTextField, isValidEmail, goTo } from "../../miscFunctions";
import { Button, CheckBox } from "../miscComponents";
import axios from "axios";

import "./introduction.css";

const validate = values => {
    const errors = {};
    const requiredFields = ["name"];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = "This field is required";
        }
    });
    return errors;
};

const inputStyle = { marginBottom: "10px" };

class Introduction extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            agreeingToTerms: false,
            company: undefined,
            uniqueName: undefined
        };
    }

    componentWillMount() {
        const { currentUser, location } = this.props;
        // get the company name from the url
        if (location.query && location.query.uniqueName) {
            var uniqueName = location.query.uniqueName;
        }

        if (!currentUser && uniqueName) {
            this.props.getColorsFromBusiness(uniqueName);
        }
    }

    componentDidMount() {
        // shouldn't be able to be on sign up page if logged in
        const { currentUser, location } = this.props;
        if (currentUser) {
            if (currentUser.userType === "accountAdmin") {
                return goTo("/dashboard");
            } else {
                return goTo("/myEvaluations");
            }
        }
        if (location.query) {
            if (location.query.company) {
                var company = location.query.company;
            }
            if (location.query.uniqueName) {
                var uniqueName = location.query.uniqueName;
            }
            this.setState({ company, uniqueName });
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

    handleSubmit = e => {
        if (e) {
            e.preventDefault();
        }

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to Terms of Use and Privacy Policy.", "error");
            return;
        }

        const vals = this.props.formData.introduction.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = ["name"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid)
            return this.props.addNotification("Must enter your name to continue.", "error");

        // get referral code from cookie, if it exists
        const signUpReferralCode = this.getCode();
        const values = this.props.formData.introduction.values;
        const name = values.name;
        let user = {
            name,
            signUpReferralCode
        };

        // if the user got here from a link, add those links
        let location = this.props.location;
        if (location.query) {
            user.code = location.query.code;
        }

        if (!user.code) {
            return this.props.addNotification(
                "Must have a unique employer-provided link to begin evaluation.",
                "error"
            );
        }

        this.props.postCandidate(user);
    };

    handleCheckMarkClick = () => {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        });
    }

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
                <div className="paddingTop50px marginBottom15px">
                    <div className="font38px font30pxUnder700 font24pxUnder500" style={{ color: this.props.primaryColor }}>
                        {this.state.company} Evaluation
                    </div>
                    <div
                        className="font16px font14pxUnder700 font12pxUnder500"
                        styleName="powered-by"
                        style={{ opacity: "0.6" }}
                    >
                        Powered by Moonshot Insights
                    </div>
                </div>
                <div styleName="text">
                    <div>
                        This evaluation consists of some quick administrative questions, a
                        personality evaluation, and a pattern recognition test. Set aside at least 22 minutes to complete the evaluation.
                    </div>
                    <div>Please enter your name below to begin the evaluation.</div>
                </div>
                <div>
                    <TextInput name="name" label="Full Name" style={inputStyle} />
                    <div className="marginTop10px marginBottom20px font12px" style={{ marginLeft: "-20px" }}>
                        <CheckBox
                            checked={this.state.agreeingToTerms}
                            onClick={this.handleCheckMarkClick}
                            size="small"
                            style={{ margin: "0px 5px 0" }}
                        />
                        I have read and agree to the Moonshot Insights
                        <br />
                        <a
                            href="https://www.docdroid.net/X06Dj4O/privacy-policy.pdf"
                            target="_blank"
                            style={{ color: this.props.primaryColor }}
                        >
                            privacy policy
                        </a>
                        {" and "}
                        <a
                            href="https://www.docdroid.net/YJ5bhq5/terms-and-conditions.pdf"
                            target="_blank"
                            style={{ color: this.props.primaryColor }}
                        >
                            terms of use
                        </a>.
                    </div>
                    {this.props.loadingCreateUser ? (
                        <CircularProgress />
                    ) : (
                        <Button onClick={this.handleSubmit} color="primary">
                            Begin
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    //name, email, password, confirm password, signup button
    render() {
        let content = this.createContent();

        return (
            <div className="fillScreen">
                <MetaTags>
                    <title>Introduction | Moonshot</title>
                    <meta
                        name="description"
                        content="Log in or create account. Moonshot Insights helps candidates and employers find their perfect matches."
                    />
                </MetaTags>
                <div className="center">{content}</div>
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
            postCandidate,
            onSignUpPage,
            addNotification,
            closeNotification,
            setUserPosted,
            getColorsFromBusiness
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
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor
    };
}

Introduction = reduxForm({
    form: "introduction",
    validate
})(Introduction);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Introduction);
