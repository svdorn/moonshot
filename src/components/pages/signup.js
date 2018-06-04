"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postUser, onSignUpPage, closeNotification, addNotification} from '../../actions/usersActions';
import {TextField, CircularProgress, FlatButton, Dialog, RaisedButton} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';
import TermsOfUse from '../policies/termsOfUse';
import PrivacyPolicy from '../policies/privacyPolicy';
import MetaTags from 'react-meta-tags';

const style = {
    // the hint that shows up when search bar is in focus
    searchHintStyle: { color: "rgba(255, 255, 255, .3)" },
    searchInputStyle: { color: "rgba(255, 255, 255, .8)" },

    searchFloatingLabelFocusStyle: { color: "rgb(114, 214, 245)" },
    searchFloatingLabelStyle: { color: "rgb(114, 214, 245)" },
    searchUnderlineFocusStyle: { color: "green" }
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle = {style.searchUnderlineFocusStyle}
        {...input}
        {...custom}
    />
);

const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        inputStyle={style.searchInputStyle}
        hintStyle={style.searchHintStyle}
        floatingLabelFocusStyle={style.searchFloatingLabelFocusStyle}
        floatingLabelStyle={style.searchFloatingLabelStyle}
        underlineFocusStyle = {style.searchUnderlineFocusStyle}
        {...input}
        {...custom}
        type="password"
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'name',
        'email',
        'password',
        'password2'
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class Signup extends Component {
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
        // shouldn't be able to be on sign up page if logged in
        if (this.props.currentUser && this.props.currentUser != "no user") {
            this.goTo("/discover");
        }
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

        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to Terms of Use and Privacy Policy.", "error");
            return;
        }

        const vals = this.props.formData.signup.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
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

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
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
        const employerCode = values.employerCode;
        let user = {
            name, password, email, signUpReferralCode, employerCode
        };

        // if the user got here from a link, add those links
        let location = this.props.location;
        if (location.query) {
            user.code = location.query.code;
            user.userCode = location.query.userCode;
        }

        this.props.postUser(user);

        this.setState({
            ...this.state,
            email
        })
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            agreeingToTerms: !this.state.agreeingToTerms
        })
    }

    handleOpenPP = () => {
        this.setState({openPP: true});
    };

    handleClosePP = () => {
        this.setState({openPP: false});
    };
    handleOpenTOU = () => {
        this.setState({openTOU: true});
    };

    handleCloseTOU = () => {
        this.setState({openTOU: false});
    };


    //name, email, password, confirm password, signup button
    render() {
        let location = this.props.location;
        if (location.query) {
            console.log(location.query);
            console.log(location.query.code);
            console.log(location.query.userCode);
        }
        let urlQuery = {};
        try {
            urlQuery = this.props.location.query;
        } catch (e) { /* no query */
        }

        const actionsPP = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClosePP}
            />,
        ];
        const actionsTOU = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleCloseTOU}
            />,
        ];
        let blurredClass = '';
        if (this.state.openTOU || this.state.openPP) {
            blurredClass = 'dialogForBizOverlay';
        }

        return (
            <div className="fillScreen blackBackground formContainer">
                <MetaTags>
                    <title>Sign Up | Moonshot</title>
                    <meta name="description" content="Log in or create account. Moonshot helps you find the perfect career - for free. Prove your skill to multiple companies with each pathway completion." />
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
                        <PrivacyPolicy/>
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
                        <TermsOfUse/>
                    </Dialog>
                    <HomepageTriangles className="blurred" style={{pointerEvents: "none"}} variation="5"/>
                    <div className="form lightBlackForm">
                        {this.state.email != "" && this.props.userPosted ?
                            <div className="center">
                                <h1>Verify your email address</h1>
                                <p>We sent {this.state.email} a verification link. Check your junk folder if you
                                    can{"'"}t find our email.</p>
                            </div>
                            :
                            <div>
                                <form onSubmit={this.handleSubmit.bind(this)}>
                                    <h1 style={{marginTop: "15px"}}>Sign Up</h1>
                                    <div className="inputContainer">
                                        <Field
                                            name="name"
                                            component={renderTextField}
                                            label="Full Name"
                                        /><br/>
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
                                    <div className="inputContainer">
                                        <Field
                                            name="employerCode"
                                            component={renderTextField}
                                            label="Employer Code"
                                        /><br/>
                                    </div>

                                    <div style={{margin: "20px 20px 10px"}}>
                                        <div className="checkbox smallCheckbox whiteCheckbox"
                                             onClick={this.handleCheckMarkClick.bind(this)}>
                                            <img
                                                alt=""
                                                className={"checkMark" + this.state.agreeingToTerms}
                                                src="/icons/CheckMarkRoundedWhite.png"
                                            />
                                        </div>
                                        I understand and agree to the <bdi className="clickable" onClick={this.handleOpenPP}>Privacy
                                        Policy</bdi> and <bdi className="clickable" onClick={this.handleOpenTOU}>Terms of Use</bdi>.
                                    </div>
                                    <br/>
                                    <RaisedButton
                                        label="Sign Up"
                                        type="submit"
                                        className="raisedButtonBusinessHome"
                                        style={{margin: '-10px 0 10px'}}
                                    />
                                    <br/>
                                    <div className="clickable"
                                         onClick={() => this.goTo({pathname: '/login', query: urlQuery})}
                                         style={{display: "inline-block"}}>Already have an account?
                                    </div>
                                </form>
                                {this.props.loadingCreateUser ? <CircularProgress style={{marginTop: "20px"}}/> : ""}
                            </div>
                        }
                    </div>
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
        let ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
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
        loadingCreateUser: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        currentUser: state.users.currentUser
    };
}

Signup = reduxForm({
    form: 'signup',
    validate,
})(Signup);

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
