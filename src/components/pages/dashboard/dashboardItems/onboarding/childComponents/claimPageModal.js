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
import { reduxForm } from "redux-form";
import MetaTags from "react-meta-tags";
import ReactGA from "react-ga";
import colors from "../../../../../../colors";
import { button } from "../../../../../../classes.js";
import {
    isValidEmail,
    goTo,
    isValidPassword,
    propertyExists,
    fieldsAreEmpty
} from "../../../../../../miscFunctions";
import TextInput from "../../../../../userInput/textInput";
import NavCircles from "../../../../../miscComponents/navCircles";

import "./modalSignup.css";

const validate = values => {
    const errors = {};
    const requiredFields = ["name", "company", "email", "password"];
    if (values.email && !isValidEmail(values.email)) {
        errors.email = "Invalid email address";
    }
    if (!isValidPassword(values.password)) {
        errors.password = "Must be at least 8 characters";
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
            frame: 0,
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
            } else if (frame === 0 || frame === 1) {
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

        // form validation before submission
        const requiredFields = ["email", "password", "name", "company"];
        if (fieldsAreEmpty(vals, requiredFields, this.props.touch)) {
            return this.setState({ error: "Please fill out all fields." });
        }

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
        if (errorMessage.includes("email")) {
            this.setState({ frame: 2 });
        }
        this.setState({ error: errorMessage });
    };

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
            if (newIndex === 0) {
                requiredFields.push("name");
            } else if (newIndex === 1) {
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
            if (notValid) return;

            if (checkEmail && !isValidEmail(vals.email)) {
                return this.setState({ error: "Invalid email." });
            }
            newIndex++;
        }

        this.setState({ frame: newIndex, error: undefined });
    };

    // navigate around by using the bottom nav circles
    circleNav = wantedFrame => {
        if (wantedFrame == 0) {
            return this.setState({ frame: 0 });
        } else if (wantedFrame == 1) {
            if (this.frame0finished()) {
                return this.setState({ frame: 1 });
            } else return;
        } else if (wantedFrame == 2) {
            if (this.frame0finished() && this.frame1finished()) {
                return this.setState({ frame: 2 });
            } else return;
        }
    };

    makeFrame0() {
        return (
            <div className="center" style={{ marginTop: "15px" }}>
                <TextInput name="name" label="Full Name" />
            </div>
        );
    }

    makeFrame1() {
        return (
            <div className="center" style={{ marginTop: "15px" }}>
                <TextInput name="email" label="Work Email" />
            </div>
        );
    }

    makeFrame2() {
        let value = undefined;
        if (propertyExists(this, ["props", "formData", "businessSignup", "values", "password"])) {
            value = this.props.formData.businessSignup.values.password;
        }

        return (
            <div className="center" style={{ marginTop: "5px" }}>
                <TextInput
                    viewablePassword={true}
                    name="password"
                    label="Password"
                    value={value}
                    buttonColor="#b5b5b5"
                />
                <div styleName="agree-to-terms" className="font12px">
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
                    I have read and agree to the Moonshot Insights <br className="above500only" />
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
            </div>
        );
    }

    // true if input for frame 0 is valid
    frame0finished = () => {
        // values of input fields
        const vals = this.props.formData.businessSignup
            ? this.props.formData.businessSignup.values
            : undefined;

        return !!vals && !!vals.name;
    };

    // true if input for frame 1 is valid
    frame1finished = () => {
        // values of input fields
        const vals = this.props.formData.businessSignup
            ? this.props.formData.businessSignup.values
            : undefined;

        return !!vals.email && !!isValidEmail(vals.email);
    };

    // returns a list of which circles can be clicked
    inactiveFrames = () => {
        if (!this.frame0finished()) {
            // if there are no inputs or frame 0 hasn't been finished, 1 and 2 inactive
            return [1, 2];
        } else if (!this.frame1finished()) {
            // frame 0 and 1 active but if no valid email, 2 is not
            return [2];
        }

        return [];
    };

    //name, email, password, confirm password, signup button
    render() {
        const { frame, error } = this.state;
        const { loadingCreateBusiness, open } = this.props;

        return (
            <Dialog open={!!open} maxWidth={false} onClose={this.close}>
                <form className="modal-signup inline-block center" styleName="claim-page-modal">
                    <div>
                        <div
                            className="primary-cyan font22px font20pxUnder500"
                            style={{ marginBottom: "5px" }}
                        >
                            Claim Your Page
                        </div>
                        <div className="font14px">Fill this out so you can manage your page.</div>
                        {this.state.error ? (
                            <div className="font14px marginTop10px secondary-red">{error}</div>
                        ) : null}
                    </div>
                    <div>
                        <div>
                            {frame === 0 ? this.makeFrame0() : null}
                            {frame === 1 ? this.makeFrame1() : null}
                            {frame === 2 ? this.makeFrame2() : null}
                        </div>

                        <div styleName="button-and-nav">
                            {this.props.loadingCreateBusiness ? (
                                <CircularProgress color="#72d6f5" />
                            ) : (
                                <div
                                    className={"primary-white font16px " + button.cyan}
                                    style={{ marginBottom: "5px" }}
                                    onClick={
                                        frame === 2
                                            ? this.handleSubmit
                                            : this.navFrames.bind(this, "next")
                                    }
                                >
                                    {frame === 0 || frame === 1 ? "Next" : "Start"}
                                </div>
                            )}

                            <NavCircles
                                value={this.state.frame}
                                values={[0, 1, 2]}
                                onNavigate={this.circleNav}
                                inactive={this.inactiveFrames()}
                            />
                        </div>
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
