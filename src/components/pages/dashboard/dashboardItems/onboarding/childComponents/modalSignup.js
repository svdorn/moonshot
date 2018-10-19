"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createBusinessAndUser, closeNotification, addNotification, closeSignupModal } from '../../../../../../actions/usersActions';
import { TextField } from 'material-ui';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Field, reduxForm } from 'redux-form';
import MetaTags from 'react-meta-tags';
import ReactGA from 'react-ga';
import colors from "../../../../../../colors";
import { renderTextField, renderPasswordField, isValidEmail, goTo, isValidPassword } from "../../../../../../miscFunctions";

import "../../../dashboard.css";

const validate = values => {
    const errors = {};
    const requiredFields = [
        'name',
        'company',
        'email',
        'password',
    ];
    if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email address';
    }
    if (!isValidPassword(values.password)) {
        errors.password = 'Password must be at least 8 characters long';
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });

    return errors;
};

const defaultInfo = {
    header1: "Add Your Info",
    body1: "We need this to setup your account.",
    header2: "Secure Your Login",
    body2: "Fill this out so you can log back in.",
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
            name: undefined
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFrameChange = this.handleFrameChange.bind(this);
    }


    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.bound_handleKeyPress);
    }

    componentDidUpdate() {
        if (this.state.open != this.props.open) {
            const open = this.props.open;
            if (!open) {
                this.setState({ info: defaultInfo, open })
            }
            const info = this.props.info;

            if (!info) {
                return;
            }

            if (info.type === "menu") {
                switch(info.name) {
                    case "Button":
                        this.setState({ open });
                        break;
                    case "Candidates":
                    case "Employees":
                    case "Evaluations":
                        const infoContent = {
                            header1: `${info.name} Page Info`,
                            body1: "We need this so we can set up the page for your company.",
                            header2: "Info Successfully Added",
                            body2: "Fill this out so you can log back in and freely access your page."
                        };
                        this.setState({ info: infoContent, type: info.type, name: info.name, open })
                    default:
                        this.setState({ open });
                        break;
                }
            } else {
                switch(info.name.toLowerCase()) {
                    case "candidates":
                        break;
                    case "employees":
                        break;
                    case "evaluations":
                        break;
                    default:
                        this.setState({ open });
                        break;
                }
            }
        }
    }

    closeSignupModal = () => {
        this.props.closeSignupModal();
    }


    componentWillUnmount() {
        // remove listener for keyboard enter key
        const self = this;
        document.removeEventListener('keypress', self.bound_handleKeyPress);
    }

    handleKeyPress(e) {
        var key = e.which || e.keyCode;
        if (key === 13) { // 13 is enter
            this.handleSubmit();
        }
    }


    handleSubmit(e) {
        e.preventDefault();
        if (!this.state.agreeingToTerms) {
            return this.props.addNotification("Must agree to Terms and Conditions and Privacy Policy.", "error");
        }

        const vals = this.props.formData.businessSignup.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'email',
            'password',
            'name',
            'company'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return this.props.addNotification("Must fill out all fields.", "error");

        // grab values we need from the form
        const { name, company, password, email } = vals;

        if (!isValidEmail(email)) {
            return this.props.addNotification("Invalid email.", "error");
        }
        if (!isValidPassword(password)) {
            return this.props.addNotification("Password must be at least 8 characters long", "error");
        }
        console.log("here")
        console.log("vals: ", vals);
        console.log("onboardingpositions: ", this.props.onboardingPositions);
        console.log("onboard:", this.props.onboard);
        const positions = this.props.onboardingPositions;
        const onboard = this.props.onboard;
        const selectedJobsToBeDone = this.props.selectedJobsToBeDone;

        // get the positions here from the onboardingPositions

        // combine all those things to be sent to server
        const args = { password, email, name, company, positions, onboard, selectedJobsToBeDone };

        // mark a business signup in google analytics
        ReactGA.event({
            category: 'Signup',
            action: 'Business Signup'
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

    handleFrameChange(e){
        e.preventDefault();
        const vals = this.props.formData.businessSignup.values;
        let notValid = false;
        const requiredFields = [
            'name',
            'company'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return this.props.addNotification("Must fill out all fields.", "error");
        else this.setState({ frame: 2 })
    }

    makeFrame1() {
        return(
            <div className="center">
                <div className="primary-cyan font22px font20pxUnder500">
                    { this.state.info.header1 }
                </div>
                <div className="font14px">
                    { this.state.info.body1 }
                </div>
                <div className="inputContainer" styleName="signup-fields">
                    <Field
                        name="name"
                        component={renderTextField}
                        label="Full Name"
                    /><br/>
                </div>
                <div className="inputContainer" styleName="signup-fields">
                    <Field
                        name="company"
                        component={renderTextField}
                        label="Company"
                    /><br/>
                </div>
                <button className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px font14pxUnder900 font12pxUnder500 primary-white marginTop20px" onClick={this.handleFrameChange} style={{padding: "2px 4px"}}>
                    Onward &#8594;
                </button>
            </div>
        )
    }

    makeFrame2() {
        return(
            <div className="center">
                <div className="primary-cyan font22px font20pxUnder500">
                    { this.state.info.header2 }
                </div>
                <div className="font14px" style={{marginTop:"-7px"}}>
                    { this.state.info.body2 }
                </div>
                <div className="inputContainer" styleName="signup-fields">
                    <Field
                        name="email"
                        component={renderTextField}
                        label="Email"
                    /><br/>
                </div>
                <div className="inputContainer" styleName="signup-fields">
                    <Field
                        name="password"
                        component={renderPasswordField}
                        label="Password"
                    /><br/>
                </div>
                <div style={{margin: "20px 20px 0px"}} className="font12px">
                    <div className="checkbox smallCheckbox whiteCheckbox"
                         onClick={this.handleCheckMarkClick.bind(this)}>
                        <img
                            alt=""
                            className={"checkMark" + this.state.agreeingToTerms}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            style={{marginTop:"-18px"}}
                        />
                    </div>
                    I have read and agree to the Moonshot Insights<br/>
                    <a  href="https://www.docdroid.net/X06Dj4O/privacy-policy.pdf"
                        target="_blank"
                        className="primary-cyan hover-primary-cyan"
                    >privacy policy</a>
                    {" and "}
                    <a  href="https://www.docdroid.net/pGBcFSh/moonshot-insights-agreement.pdf"
                        target="_blank"
                        className="primary-cyan hover-primary-cyan"
                    >terms of service</a>.
                </div>
                {this.props.loadingCreateBusiness ? <CircularProgress color="#72d6f5"/> :
                    <button className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px font14pxUnder900 font12pxUnder500 primary-white" onClick={this.handleSubmit} style={{padding: "2px 4px"}}>
                        Enter &#8594;
                    </button>
                }
            </div>
        )
    }

    //name, email, password, confirm password, signup button
    render() {

        let navArea = [];
        const selectedStyle = {
            background: `linear-gradient(to bottom, ${colors.primaryWhite}, ${colors.primaryCyan})`
        };
        // add the circles you can navigate with
        for (let navCircleIdx = 0; navCircleIdx < 2; navCircleIdx++) {
            navArea.push(
                <div
                    styleName="signup-circle"
                    style={(this.state.frame - 1) === navCircleIdx ? selectedStyle : {}}
                    key={`signup modal ${navCircleIdx}`}
                />
            );
        }

        return (
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
                onClose={this.closeSignupModal}
            >
                <form styleName="modal-signup">
                    {this.state.frame === 1 ? <div>{ this.makeFrame1() }</div> : <div>{ this.makeFrame2() }</div>}
                    <div className="center">
                        { navArea }
                    </div>
                </form>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        createBusinessAndUser,
        addNotification,
        closeNotification,
        closeSignupModal
    }, dispatch);
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
        open: state.users.signupModalOpen,
        info: state.users.signupModalInfo,
    };
}

ModalSignup = reduxForm({
    form: 'businessSignup',
    validate
})(ModalSignup);

export default connect(mapStateToProps, mapDispatchToProps)(ModalSignup);
