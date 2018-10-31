"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    createBusinessAndUser,
    closeNotification,
    closeClaimPageModal
} from "../../../../../../actions/usersActions";
import { TextField } from "material-ui";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Field, reduxForm } from "redux-form";
import MetaTags from "react-meta-tags";
import ReactGA from "react-ga";
import colors from "../../../../../../colors";
import { button } from "../../../../../../classes.js";
import {
    renderTextField,
    viewablePasswordField,
    isValidEmail,
    goTo,
    isValidPassword,
    propertyExists
} from "../../../../../../miscFunctions";
import ViewablePassword from "../../../../../miscComponents/viewablePassword";

import "../../../dashboard.css";

const validate = values => {
    const errors = {};
    const requiredFields = ["name", "company", "email", "password"];
    if (values.email && !isValidEmail(values.email)) {
        errors.email = "Invalid email address";
    }
    if (!isValidPassword(values.password)) {
        errors.password = "Password must be at least 8 characters long";
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = "This field is required";
        }
    });

    return errors;
};

class ClaimPageModal extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            agreeingToTerms: false,
            frame: 1,
            error: undefined
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener("keypress", self.bound_handleKeyPress);
    }

    close = () => {
        this.props.closeClaimPageModal();
    };

    componentWillUnmount() {
        // remove listener for keyboard enter key
        const self = this;
        document.removeEventListener("keypress", self.bound_handleKeyPress);
    }

    handleKeyPress(e) {
        const { frame } = this.state;

        var key = e.which || e.keyCode;
        if (key === 13) {
            // 13 is enter
            e.preventDefault();
            if (frame === 3) {
                this.handleSubmit(e);
            } else if (frame === 1 || frame === 2) {
                this.navFrames("next");
            }
        }
    }

    handleSubmit(e) {
        if (!this.state.agreeingToTerms) {
            return this.setState({
                error: "Must agree to Terms and Conditions and Privacy Policy."
            });
        }

        const vals = this.props.formData.businessSignup.values;

        if (vals && !vals.company && this.props.company) {
            vals.company = this.props.company;
        }

        // Form validation before submit
        let notValid = false;
        const requiredFields = ["email", "password", "name", "company"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return this.setState({ error: "Must fill out all fields." });

        // grab values we need from the form
        const { name, company, password, email } = vals;

        if (!isValidPassword(password)) {
            return this.setState({ error: "Password must be at least 8 characters." });
        }

        const positions = this.props.onboardingPositions;
        const onboard = this.props.onboard;
        const selectedJobsToBeDone = this.props.selectedJobsToBeDone;
        // get the positions here from the onboardingPositions

        if (this.props.welcomeToMoonshot) {
            var welcomeToMoonshot = true;
        }

        // combine all those things to be sent to server
        const args = {
            password,
            email,
            name,
            company,
            positions,
            onboard,
            selectedJobsToBeDone,
            welcomeToMoonshot
        };

        // mark a business signup in google analytics
        ReactGA.event({
            category: "Signup",
            action: "Business Signup"
        });

        // create the user
        this.props.createBusinessAndUser(args);
    }

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        });
    }

    // go forward or backward to a different frames question
    navFrames = direction => {
        let newIndex = this.state.frame;
        if (direction === "back") {
            newIndex--;
        } else {
            let requiredFields = [];
            const vals = this.props.formData.businessSignup.values;
            let checkEmail = false;
            if (newIndex === 1) {
                requiredFields.push("name");
            } else if (newIndex === 2) {
                requiredFields.push("email");
                checkEmail = true;
            }

            let notValid = false;
            requiredFields.forEach(field => {
                if (!vals || !vals[field]) {
                    this.props.touch(field);
                    notValid = true;
                }
            });
            if (notValid) {
                return;
            }
            if (checkEmail && !isValidEmail(vals.email)) {
                return this.setState({ error: "Invalid email." });
            }
            newIndex++;
        }

        this.setState({ frame: newIndex, error: undefined });
    };

    // navigate around by using the bottom nav circles
    circleNav = wantedFrame => () => {
        if (wantedFrame < this.state.frame) {
            this.setState({ frame: wantedFrame });
        }
    };

    makeFrame1() {
        return (
            <div className="center">
                <div className="inputContainer">
                    <Field name="name" component={renderTextField} label="Full Name" />
                    <br />
                </div>
                <div
                    className={
                        "primary-white font18px font16pxUnder700 marginTop10px " +
                        button.cyan
                    }
                    onClick={this.navFrames.bind(this, "next")}
                >
                    Next
                </div>
            </div>
        );
    }

    makeFrame2() {
        return (
            <div className="center">
                <div className="inputContainer">
                    <Field name="email" component={renderTextField} label="Email" />
                    <br />
                </div>
                <div
                    className={
                        "primary-white font18px font16pxUnder700 marginTop10px " +
                        button.cyan
                    }
                    onClick={this.navFrames.bind(this, "next")}
                >
                    Next
                </div>
            </div>
        );
    }

    makeFrame3() {
        let value = undefined;
        if (propertyExists(this, ["props", "formData", "businessSignup", "values", "password"])) {
            value = this.props.formData.businessSignup.values.password;
        }

        return (
            <div className="center">
                <ViewablePassword
                    name="password"
                    label="Password"
                    value={value}
                    className="signup-fields"
                />
                <div style={{ margin: "20px 20px 0px" }} className="font12px">
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={this.handleCheckMarkClick.bind(this)}
                    >
                        <img
                            alt=""
                            className={"checkMark" + this.state.agreeingToTerms}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            style={{ marginTop: "-18px" }}
                        />
                    </div>
                    I have read and agree to the Moonshot Insights<br />
                    <a
                        href="https://www.docdroid.net/X06Dj4O/privacy-policy.pdf"
                        target="_blank"
                        className="primary-cyan hover-primary-cyan"
                    >
                        privacy policy
                    </a>
                    {" and "}
                    <a
                        href="https://www.docdroid.net/pGBcFSh/moonshot-insights-agreement.pdf"
                        target="_blank"
                        className="primary-cyan hover-primary-cyan"
                    >
                        terms of service
                    </a>.
                </div>
                {this.props.loadingCreateBusiness ? (
                    <CircularProgress color="#72d6f5" />
                ) : (
                    <div
                        className={
                            "primary-white font18px font16pxUnder700 marginTop10px " +
                            button.cyan
                        }
                        onClick={this.handleSubmit}
                    >
                        Start
                    </div>
                )}
            </div>
        );
    }

    //name, email, password, confirm password, signup button
    render() {
        let navArea = [];
        const selectedStyle = {
            background: `linear-gradient(to bottom, ${colors.primaryWhite}, ${colors.primaryCyan})`
        };
        // add the circles you can navigate with
        for (let navCircleIdx = 0; navCircleIdx < 3; navCircleIdx++) {
            navArea.push(
                <div
                    styleName="signup-circle"
                    style={this.state.frame - 1 === navCircleIdx ? selectedStyle : {}}
                    key={`signup question ${navCircleIdx}`}
                    className={this.state.frame > navCircleIdx ? "pointer" : ""}
                    onClick={this.circleNav(navCircleIdx + 1)}
                />
            );
        }

        let frame = null;
        switch (this.state.frame) {
            case 1:
                frame = this.makeFrame1();
                break;
            case 2:
                frame = this.makeFrame2();
                break;
            case 3:
                frame = this.makeFrame3();
                break;
            default:
                frame = this.makeFrame1();
                break;
        }

        return (
            <Dialog open={!!this.props.open} maxWidth={false} onClose={this.close}>
                <form styleName="modal-signup" className="inline-block center">
                    <div>
                        <div className="primary-cyan font22px font20pxUnder500">
                            Secure Your Page
                        </div>
                        <div className="font14px">Fill this out so you can manage your page.</div>
                        {this.state.error ? (
                            <div className="font14px marginTop10px secondary-red">
                                {this.state.error}
                            </div>
                        ) : null}
                    </div>
                    <div>
                        <div>{frame}</div>
                        {navArea}
                    </div>
                </form>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            createBusinessAndUser,
            closeNotification,
            closeClaimPageModal
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateBusiness: state.users.loadingSomething,
        currentUser: state.users.currentUser,
        png: state.users.png,
        onboardingPositions: state.users.onboardingPositions,
        onboard: state.users.guestOnboard,
        selectedJobsToBeDone: state.users.selectedJobsToBeDone,
        open: state.users.claimPageModal,
        info: state.users.signupModalInfo,
        welcomeToMoonshot: state.users.welcomeToMoonshot
    };
}

ClaimPageModal = reduxForm({
    form: "businessSignup",
    validate
})(ClaimPageModal);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ClaimPageModal);
