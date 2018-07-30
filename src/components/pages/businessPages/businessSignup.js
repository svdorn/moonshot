"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { postUser, onSignUpPage, closeNotification, addNotification } from '../../../actions/usersActions';
import { TextField, CircularProgress, FlatButton, Dialog, RaisedButton } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import { renderTextField, renderPasswordField, isValidEmail, goTo } from "../../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'password',
        'password2'
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email address';
    }
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class BusinessSignup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            agreeingToTerms: false,
            openPP: false,
            openTOU:false,
        }
    }

    componentWillMount() {
        // TODO: do some verification that the user can be on this page
        // // shouldn't be able to be on sign up page if logged in
        // if (this.props.currentUser) {
        //     this.goTo("/myEvaluations");
        // }
    }

    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.handleKeyPress.bind(self));

        this.props.onSignUpPage();
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
        e.preventDefault();

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to Terms and Conditions and Privacy Policy.", "error");
            return;
        }

        const vals = this.props.formData.signup.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'email',
            'password',
            'password2'
        ];
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

        const values = this.props.formData.signup.values;
        const password = values.password;
        const email = values.email;
        let user = {
            password, email
        };

        // this.props.postUser(user);
        console.log("POSTING");

        this.setState({
            ...this.state,
            email
        })
    }

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        })
    }


    //name, email, password, confirm password, signup button
    render() {
        let urlQuery = {};
        try {
            urlQuery = this.props.location.query;
        } catch (e) { /* no query */ }

        return (
            <div className="fillScreen formContainer business-signup">
                <MetaTags>
                    <title>Sign Up | Moonshot</title>
                    <meta name="description" content="Create an account for your business. Moonshot helps you find the best candidates possible. Don't waste resources on any bad hires." />
                </MetaTags>
                <div>
                    <HomepageTriangles className="blurred" style={{pointerEvents: "none"}} variation="5"/>
                    <div className="form lightBlackForm">
                        {this.state.email != "" && this.props.userPosted ?
                            <div className="center">
                                <h1>Verify your email address</h1>
                                <p style={{margin: "20px"}}>We sent {this.state.email} a verification link. Check your junk folder if you
                                    can{"'"}t find our email.</p>
                            </div>
                            :
                            <div>
                                <form onSubmit={this.handleSubmit.bind(this)}>
                                    <h1 style={{marginTop: "15px"}}>{`Try us out for your ${"INSERT HERE"} position`}</h1>
                                    <h6>{"Your first hire is free • No credit card required"}</h6>
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
                                        /><br/>
                                    </div>
                                    <div className="inputContainer">
                                        <Field
                                            name="password2"
                                            component={renderPasswordField}
                                            label="Confirm Password"
                                        /><br/>
                                    </div>

                                    <div style={{margin: "20px 20px 10px"}}>
                                        <div className="checkbox smallCheckbox whiteCheckbox"
                                             onClick={this.handleCheckMarkClick.bind(this)}>
                                            <img
                                                alt=""
                                                className={"checkMark" + this.state.agreeingToTerms}
                                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                                            />
                                        </div>

                                        I have read and agree to the Moonshot Insights <a href="https://www.docdroid.net/X06Dj4O/privacy-policy.pdf" target="_blank" className="primary-cyan">Privacy Policy</a> and <a href="https://www.docdroid.net/YJ5bhq5/terms-and-conditions.pdf" target="_blank" className="primary-cyan">Terms and Conditions</a>.
                                    </div>
                                    <br/>
                                    <RaisedButton
                                        label="Continue →"
                                        type="submit"
                                        className="raisedButtonBusinessHome"
                                        style={{margin: '-10px 0 10px'}}
                                    />
                                </form>
                                {this.props.loadingCreateBusiness ? <CircularProgress color="#72d6f5" style={{marginTop: "8px"}}/> : ""}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postUser,
        onSignUpPage,
        addNotification,
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateBusiness: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

BusinessSignup = reduxForm({
    form: 'signup',
    validate,
})(BusinessSignup);

export default connect(mapStateToProps, mapDispatchToProps)(BusinessSignup);
