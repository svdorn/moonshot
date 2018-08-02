"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createBusinessAndUser, closeNotification, addNotification } from '../../../actions/usersActions';
import { TextField, CircularProgress, FlatButton, Dialog, RaisedButton } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import { renderTextField, renderPasswordField, isValidEmail, goTo, isValidPassword } from "../../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'password',
        'password2'
    ];
    if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email address';
    }
    if (!isValidPassword(values.password)) {
        errors.password = 'Password must be at least 8 characters long';
    }
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });

    return errors;
};

class BusinessSignup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            positionTitle: "",
            agreeingToTerms: false
        }
    }


    componentDidMount() {
        // add listener for keyboard enter key
        const self = this;
        document.addEventListener('keypress', self.handleKeyPress.bind(self));

        try {
            // get the parameters from the url
            let urlQuery = this.props.location.query;
            var { email, name, company, positionTitle, positionType } = urlQuery;
            // if the needed parameters don't exist, get the user to go through
            // the chatbot
            if (!email || !name || !company || !positionTitle || !positionType) { return goTo("/chatbot"); }
        } catch (e) { return goTo("/chatbot"); } // go to chatbot on error

        // save the values receieved in the url into state - will be used during
        // api call later
        this.setState({ name, company, positionTitle, positionType });

        // set the email value in the form
        const initialValues = { email, password: "", password2: "" };
        this.props.initialize(initialValues);
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
            return this.props.addNotification("Must agree to Terms and Conditions and Privacy Policy.", "error");
        }

        const vals = this.props.formData.businessSignup.values;

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

        // grab values we need from the form
        const { password, email } = vals;

        if (!isValidEmail(email)) {
            return this.props.addNotification("Invalid email.", "error");
        }
        if (!isValidPassword(password)) {
            return this.props.addNotification("Password must be at least 8 characters long", "error");
        }
        if (password != vals.password2) {
            return this.props.addNotification("Passwords must match.", "error");
        }

        // grab values we need from state (which got its values from the url)
        const { name, company, positionTitle, positionType } = this.state;
        // combine all those things to be sent to server
        const args = { password, email, name, company, positionTitle, positionType };

        // create the user
        this.props.createBusinessAndUser(args);
    }

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        });
    }


    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fillScreen formContainer business-signup">
                <MetaTags>
                    <title>Sign Up | Moonshot</title>
                    <meta name="description" content="Create an account for your business. Moonshot helps you find the best candidates possible. Don't waste resources on any bad hires." />
                </MetaTags>
                <div>
                    <HomepageTriangles className="blurred" style={{pointerEvents: "none"}} variation="5"/>
                    <div className="form lightBlackForm" style={{marginTop: "10px"}}>
                        {this.state.email != "" && this.props.userPosted ?
                            <div className="center">
                                <h1>Verify your email address</h1>
                                <p style={{margin: "20px"}}>We sent {this.state.email} a verification link. Check your junk folder if you
                                    can{"'"}t find our email.</p>
                            </div>
                            :
                            <div>
                                <form onSubmit={this.handleSubmit.bind(this)}>
                                    <div style={{marginTop: "15px"}} className="primary-cyan font28px font24pxUnder500">
                                        Try us out for your <br/>{`${this.state.positionTitle} position`}
                                    </div>
                                    <div className="font14px">
                                        Your first hire is free&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;No credit card required
                                    </div>
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

                                    <div style={{margin: "20px 20px 10px"}} className="font12px">
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
                                        <a href="https://www.docdroid.net/X06Dj4O/privacy-policy.pdf" target="_blank" className="primary-cyan">privacy policy</a> and <a href="https://www.docdroid.net/YJ5bhq5/terms-and-conditions.pdf" target="_blank" className="primary-cyan">terms and conditions</a>.
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
        createBusinessAndUser,
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
    form: 'businessSignup',
    validate
})(BusinessSignup);

export default connect(mapStateToProps, mapDispatchToProps)(BusinessSignup);
