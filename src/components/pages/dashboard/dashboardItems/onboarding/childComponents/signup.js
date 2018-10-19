"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createBusinessAndUser, closeNotification, addNotification } from '../../../../../../actions/usersActions';
import { TextField, CircularProgress, FlatButton, Dialog, RaisedButton } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import MetaTags from 'react-meta-tags';
import ReactGA from 'react-ga';
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

class Signup extends Component {
    constructor(props) {
        super(props);

        this.bound_handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            agreeingToTerms: false,
            frame: 1
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFrameChange = this.handleFrameChange.bind(this);
    }


    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.bound_handleKeyPress);
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
                    Add Your Info
                </div>
                <div className="font14px">
                    We need this to setup your positions.
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
                    Save Your Progress
                </div>
                <div className="font14px" style={{marginTop:"-7px"}}>
                    Fill this out so you can log back in.
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

        return (
            <div>
                <form>
                    {this.state.frame === 1 ? <div>{ this.makeFrame1() }</div> : <div>{ this.makeFrame2() }</div>}
                </form>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        createBusinessAndUser,
        addNotification,
        closeNotification
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
        selectedJobsToBeDone: state.users.selectedJobsToBeDone
    };
}

Signup = reduxForm({
    form: 'businessSignup',
    validate
})(Signup);

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
