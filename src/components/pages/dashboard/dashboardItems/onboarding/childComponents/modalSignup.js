"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    createBusinessAndUser,
    closeNotification,
    closeSignupModal
} from "../../../../../../actions/usersActions";
import { TextField } from "material-ui";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Field, reduxForm } from "redux-form";
import MetaTags from "react-meta-tags";
import ReactGA from "react-ga";
import colors from "../../../../../../colors";
import {
    renderTextField,
    isValidEmail,
    goTo,
    isValidPassword,
    propertyExists
} from "../../../../../../miscFunctions";
import TextInput from "../../../../../userInput/textInput";

import "../../../dashboard.css";

const validate = values => {
    const errors = {};
    const requiredFields = ["name", "company", "email", "password"];
    if (values.email && !isValidEmail(values.email)) {
        errors.email = "Invalid email address";
    }
    if (!isValidPassword(values.password)) {
        errors.password = "Must be 8+ characters";
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = "This field is required";
        }
    });

    return errors;
};

const defaultInfo = {
    header1: null,
    body1: null,
    header2: "Add Your Info",
    body2: "We need this to set up your account.",
    header3: "Set Up Your Login",
    body3: "Fill this out so you can log back in."
};

class ModalSignup extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            open: false,
            agreeingToTerms: false,
            frame: 1,
            info: defaultInfo,
            type: undefined,
            name: undefined,
            error: undefined
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFrameChange = this.handleFrameChange.bind(this);
    }

    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener("keypress", self.bound_handleKeyPress);
    }

    componentDidUpdate() {
        if (this.state.open != this.props.open) {
            const open = this.props.open;
            if (!open) {
                this.setState({ info: defaultInfo, open, error: undefined });
            }
            const info = this.props.info;

            if (!info) {
                return;
            }

            if (info.type === "menu") {
                switch (info.name) {
                    case "Button":
                        this.setState({ open, frame: 2, error: undefined });
                        break;
                    case "Candidates":
                    case "Employees":
                    case "Evaluations":
                        const infoContent = {
                            header1: `Set Up Your ${info.name} Page`,
                            body1: `Continue to add some info so we can start populating your ${info.name.toLowerCase()} page.`,
                            header2: `${info.name} Page Info`,
                            body2: "We need this so we can set up the page for your company.",
                            header3: "Info Successfully Added",
                            body3:
                                "Fill this out so you can log back in and freely access your page."
                        };
                        this.setState({
                            info: infoContent,
                            type: info.type,
                            name: info.name,
                            open,
                            frame: 1,
                            error: undefined
                        });
                        break;
                    default:
                        this.setState({ open, frame: 1, error: undefined });
                        break;
                }
            } else {
                switch (info.name) {
                    case "Candidate":
                    case "Employee":
                        const infoContent = {
                            header1: `Activate ${info.name} Invites`,
                            body1: `Continue to add some info so we can activate invites for your company.`,
                            header2: `Info to Activate Invites`,
                            body2: `We need this to activate ${info.name.toLowerCase()} invites for your company.`,
                            header3: "Info Successfully Added",
                            body3:
                                "Fill this out so you can log back in and freely manage your invites."
                        };
                        this.setState({
                            info: infoContent,
                            type: info.type,
                            name: info.name,
                            open,
                            frame: 1,
                            error: undefined
                        });
                        break;
                    case "Evaluations":
                        this.setState({ open, frame: 2, error: undefined, info: defaultInfo });
                        break;
                    default:
                        this.setState({ open, frame: 1, error: undefined });
                        break;
                }
            }
        }
    }

    closeSignupModal = () => {
        this.props.closeSignupModal();
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
                this.handleFrameChange();
            }
        }
    }

    handleSubmit(e) {
        if (e) e.preventDefault();
        if (!this.state.agreeingToTerms) {
            return this.setState({
                error: "Must agree to Terms of Service and Privacy Policy."
            });
        }

        const vals = this.props.formData.businessSignup.values;

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

        if (!isValidEmail(email)) {
            return this.setState({ error: "Invalid email." });
        }
        if (!isValidPassword(password)) {
            return this.setState({ error: "Password must be at least 8 characters." });
        }

        const positions = this.props.onboardingPositions;
        const onboard = this.props.onboard;
        const selectedJobsToBeDone = this.props.selectedJobsToBeDone;
        if (
            this.props.info &&
            this.props.info.type === "menu" &&
            this.props.info.name !== "Button"
        ) {
            var showVerifyEmailBanner = true;
        } else if (this.props.info && this.props.info.type === "boxes") {
            var showVerifyEmailBanner = true;
            var verificationModal = true;
        }

        if (this.props.welcomeToMoonshot) {
            var welcomeToMoonshot = true;
        }

        // get the positions here from the onboardingPositions

        // combine all those things to be sent to server
        const args = {
            password,
            email,
            name,
            company,
            positions,
            onboard,
            selectedJobsToBeDone,
            welcomeToMoonshot,
            showVerifyEmailBanner,
            verificationModal
        };

        // mark a business signup in google analytics
        ReactGA.event({
            category: "Signup",
            action: "Business Signup"
        });

        // create the user
        this.props.createBusinessAndUser(args, this.onSignupError);
    }

    onSignupError = errorObject => {
        let errorMessage = "Error signing up, try refreshing.";
        console.log("errorObject: ", errorObject);
        if (propertyExists(errorObject, ["response", "data"])) {
            const errData = errorObject.response.data;
            if (typeof errData === "object" && errData.message === "string") {
                errorMessage = errData.message;
            } else if (typeof errData === "string") {
                errorMessage = errData;
            }
        }
        this.setState({ error: errorMessage });
    };

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        });
    }

    handleFrameChange(e) {
        if (e) e.preventDefault();
        if (this.state.info.header1 && this.state.frame === 1) {
            this.setState({ frame: 2 });
            return;
        }
        const vals = this.props.formData.businessSignup.values;
        let notValid = false;
        const requiredFields = ["name", "company"];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) {
            this.setState({ error: "Must fill out all fields to continue." });
            return;
        } else this.setState({ frame: 3, error: undefined });
    }

    makeFrame2() {
        const { error, info } = this.state;

        return (
            <div className="center">
                <div className="primary-cyan font22px font20pxUnder500">{info.header2}</div>
                <div className="font14px">{info.body2}</div>
                {error ? <div className="secondary-red font16px">{error}</div> : null}
                <div className="inputContainer signup-fields">
                    <Field name="name" component={renderTextField} label="Full Name" />
                    <br />
                </div>
                <div className="inputContainer signup-fields">
                    <Field name="company" component={renderTextField} label="Company" />
                    <br />
                </div>
                <button
                    className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white marginTop20px"
                    onClick={this.handleFrameChange}
                    style={{ padding: "2px 4px" }}
                >
                    Onward &#8594;
                </button>
            </div>
        );
    }

    makeFrame3() {
        const { info, error, agreeingToTerms } = this.state;

        // value of the password entered
        let value = undefined;
        if (propertyExists(this, ["props", "formData", "businessSignup", "values", "password"])) {
            value = this.props.formData.businessSignup.values.password;
        }

        return (
            <div className="center">
                <div className="primary-cyan font22px font20pxUnder500">{info.header3}</div>
                <div className="font14px" style={{ marginTop: "-7px" }}>
                    {info.body3}
                </div>
                {error ? <div className="font14px marginTop10px secondary-red">{error}</div> : null}

                <div className="input-separator" />
                <TextInput name="email" label="Work Email" />
                <div className="input-separator" />
                <TextInput name="password" label="Password" value={value} viewablePassword={true} />
                <div className="input-separator" />

                <div style={{ margin: "20px 20px 0px" }} className="font12px">
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={this.handleCheckMarkClick.bind(this)}
                    >
                        <img
                            alt=""
                            className={"checkMark" + agreeingToTerms}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
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
                    <button
                        className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white"
                        onClick={this.handleSubmit}
                        style={{ padding: "2px 4px" }}
                    >
                        Enter &#8594;
                    </button>
                )}
            </div>
        );
    }

    // navigate around by using the bottom nav circles
    circleNav = wantedFrame => () => {
        if (wantedFrame < this.state.frame) {
            this.setState({ frame: wantedFrame });
        }
    };

    //name, email, password, confirm password, signup button
    render() {
        const { frame, info } = this.state;

        let navArea = [];
        const selectedStyle = {
            background: `linear-gradient(to bottom, ${colors.primaryWhite}, ${colors.primaryCyan})`
        };
        // add the circles you can navigate with
        for (let navCircleIdx = 0; navCircleIdx < 2; navCircleIdx++) {
            navArea.push(
                <div
                    styleName="signup-circle"
                    style={frame - 2 === navCircleIdx ? selectedStyle : {}}
                    className={frame - 2 >= navCircleIdx ? "pointer" : ""}
                    key={`signup modal ${navCircleIdx}`}
                    onClick={this.circleNav(navCircleIdx + 2)}
                />
            );
        }

        return (
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
                onClose={this.closeSignupModal}
                classes={{ paper: "background-primary-black-dark-important" }}
            >
                {frame === 1 && info.header1 ? (
                    <div className="modal-signup">
                        <div className="primary-cyan font22px font20pxUnder500">{info.header1}</div>
                        <div
                            className="font16px"
                            style={{ maxWidth: "400px", margin: "20px auto" }}
                        >
                            {info.body1}
                        </div>
                        <div
                            key={"continue signup modal"}
                            className="menuItem pointer font16px noWrap primary-cyan wideScreenMenuItem"
                            onClick={this.handleFrameChange}
                        >
                            <span className="primary-cyan" style={{ marginRight: "7px" }}>
                                Continue
                            </span>{" "}
                            <img
                                className="hover-move-arrow"
                                style={{ height: "8px" }}
                                src={`/icons/ArrowBlue${this.props.png}`}
                            />
                        </div>
                    </div>
                ) : (
                    <form className="modal-signup">
                        {frame === 2 ? (
                            <div>{this.makeFrame2()}</div>
                        ) : (
                            <div>{this.makeFrame3()}</div>
                        )}
                        <div className="center">{navArea}</div>
                    </form>
                )}
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            createBusinessAndUser,
            closeNotification,
            closeSignupModal
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateBusiness: state.users.loadingSomething,
        png: state.users.png,
        onboardingPositions: state.users.onboardingPositions,
        onboard: state.users.guestOnboard,
        selectedJobsToBeDone: state.users.selectedJobsToBeDone,
        open: state.users.signupModalOpen,
        info: state.users.signupModalInfo,
        welcomeToMoonshot: state.users.welcomeToMoonshot
    };
}

ModalSignup = reduxForm({
    form: "businessSignup",
    validate
})(ModalSignup);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalSignup);
