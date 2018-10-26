"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createBusinessAndUser, closeNotification, addNotification, closeClaimPageModal } from '../../../../../../actions/usersActions';
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

class ClaimPageModal extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            agreeingToTerms: false,
            frame: 1,
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }


    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.bound_handleKeyPress);
    }

    close = () => {
        this.props.closeClaimPageModal();
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

        const positions = this.props.onboardingPositions;
        const onboard = this.props.onboard;
        const selectedJobsToBeDone = this.props.selectedJobsToBeDone;
        if (this.props.info && this.props.info.type === "menu" && this.props.info.name !== "Button") {
            var showVerifyEmailBanner = true;
        }
        else if (this.props.info && this.props.info.type === "boxes") {
            var showVerifyEmailBanner = true;
            var verificationModal = true;
        }

        // get the positions here from the onboardingPositions

        // combine all those things to be sent to server
        const args = { password, email, name, company, positions, onboard, selectedJobsToBeDone, showVerifyEmailBanner, verificationModal };

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

    // go forward or backward to a different frames question
    navFrames = direction => {
        let newIndex = this.state.frame;
        if (direction === "back") {
            newIndex--;
        } else {
            newIndex++;
        }

        this.setState({ frame: newIndex });
    };

    makeFrame1() {
        return(
            <div className="center">
                <div className="inputContainer">
                    <Field
                        name="name"
                        component={renderTextField}
                        label="Full Name"
                    /><br/>
                </div>
                <button className="button disabled gradient-transition inlineBlock round-4px font16px font14pxUnder900 font12pxUnder500 primary-white marginTop10px" style={{padding: "4px 8px"}}>
                    Start
                </button>
            </div>
        );
    }

    makeFrame2() {
        return(
            <div className="center">
                <div className="inputContainer">
                    <Field
                        name="email"
                        component={renderTextField}
                        label="Email"
                    /><br/>
                </div>
                <button className="button disabled gradient-transition inlineBlock round-4px font16px font14pxUnder900 font12pxUnder500 primary-white marginTop10px" style={{padding: "4px 8px"}}>
                    Start
                </button>
            </div>
        );
    }

    makeFrame3() {
        return(
            <div className="center">
                <div className="inputContainer">
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
                    <button className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px font14pxUnder900 font12pxUnder500 primary-white marginTop10px" onClick={this.handleSubmit} style={{padding: "4px 8px"}}>
                        Start
                    </button>
                }
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
                    style={(this.state.frame - 1) === navCircleIdx ? selectedStyle : {}}
                    key={`signup question ${navCircleIdx}`}
                />
            );
        }
        let arrowArea = [];
        // add the left and right arrows
        const arrowStyle = {
            width: "20px",
            height: "20px",
        };
        if (this.state.frame !== 1) {
            arrowArea.unshift(
                <div
                    className="left circleArrowIcon"
                    style={arrowStyle}
                    onClick={this.navFrames.bind(this, "back")}
                    key="back arrow"
                />
            );
        }
        if (this.state.frame !== 3) {
            arrowArea.push(
                <div
                    className="right circleArrowIcon"
                    style={arrowStyle}
                    onClick={this.navFrames.bind(this, "next")}
                    key="next arrow"
                />
            );
        }

        let frame = null;
        switch(this.state.frame) {
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
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
                onClose={this.close}
            >
                    <form styleName="modal-signup" className="inline-block center">
                        <div>
                            <div className="primary-cyan font22px font20pxUnder500">
                                Secure Your Page
                            </div>
                            <div className="font14px">
                                Fill this out so you can manage your page.
                            </div>
                        </div>
                        <div>
                            <div className="carousel">
                                <div style={{paddingRight:"30px", paddingLeft:"30px"}}>
                                    { frame }
                                </div>
                                { arrowArea }
                            </div>
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
        closeClaimPageModal
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
        open: state.users.claimPageModal,
        info: state.users.signupModalInfo,
    };
}

ClaimPageModal = reduxForm({
    form: 'businessSignup',
    validate
})(ClaimPageModal);

export default connect(mapStateToProps, mapDispatchToProps)(ClaimPageModal);
