"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postUser, onSignUpPage, closeNotification, addNotification} from '../../actions/usersActions';
import {TextField, CircularProgress, FlatButton, Dialog} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';
import TermsOfUse from '../policies/termsOfUse';
import PrivacyPolicy from '../policies/privacyPolicy';
import MetaTags from 'react-meta-tags';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        floatingLabelStyle={styles.floatingLabelStyle}
        {...input}
        {...custom}
    />
);

const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        floatingLabelStyle={styles.floatingLabelStyle}
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
        'password2',
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
        this.props.onSignUpPage();
    }

    handleSubmit(e) {
        e.preventDefault();

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
            'password2',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }
        if (vals.password != vals.password2) {
            return;
        }

        // get referral code from cookie, if it exists
        const signUpReferralCode = this.getCode();
        const name = this.props.formData.signup.values.name;
        const password = this.props.formData.signup.values.password;
        const email = this.props.formData.signup.values.email;
        let user = [{
            name, password, email, signUpReferralCode,
            userType: "candidate"
        }];

        // if the user got here from a pathway landing page, add the pathway id
        // and url for redirect after onboarding completion
        let location = this.props.location;
        if (location.query) {
            if (location.query.pathway) {
                user.pathwayId = location.query.pathway;
                if (location.query.redirect) {
                    user.redirect = location.query.redirect;
                }
            }
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
            <div className="fillScreen greenToBlue formContainer">
                <MetaTags>
                    <title>Sign Up | Moonshot</title>
                    <meta name="description" content="Sign in or create account. Moonshot helps you find the perfect career - for free. Prove your skill to multiple companies with each pathway completion." />
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
                    <div className="form lightWhiteForm">
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
                                    <div><i>{"Don't panic, it's free."}</i></div>
                                    <div className="inputContainer">
                                        <div className="fieldWhiteSpace"/>
                                        <Field
                                            name="name"
                                            component={renderTextField}
                                            label="Full Name"
                                            className="lightBlueInputText"
                                        /><br/>
                                    </div>
                                    <div className="inputContainer">
                                        <div className="fieldWhiteSpace"/>
                                        <Field
                                            name="email"
                                            component={renderTextField}
                                            label="Email"
                                            className="lightBlueInputText"
                                        /><br/>
                                    </div>
                                    <div className="inputContainer">
                                        <div className="fieldWhiteSpace"/>
                                        <Field
                                            name="password"
                                            component={renderPasswordField}
                                            label="Password"
                                            className="lightBlueInputText"
                                        /><br/>
                                    </div>
                                    <div className="inputContainer">
                                        <div className="fieldWhiteSpace"/>
                                        <Field
                                            name="password2"
                                            component={renderPasswordField}
                                            label="Confirm Password"
                                            className="lightBlueInputText"
                                        /><br/>
                                    </div>

                                    <div style={{margin: "20px 20px 10px"}} className="darkBlueText">
                                        <div className="checkbox smallCheckbox blueCheckbox"
                                             onClick={this.handleCheckMarkClick.bind(this)}>
                                            <img
                                                alt=""
                                                className={"checkMark" + this.state.agreeingToTerms}
                                                src="/icons/CheckMarkBlue.png"
                                            />
                                        </div>
                                        I understand and agree to the <bdi className="clickable blueText" onClick={this.handleOpenPP}>Privacy
                                        Policy</bdi> and <bdi className="clickable blueText" onClick={this.handleOpenTOU}>Terms of Use</bdi>.
                                    </div>

                                    <button
                                        type="submit"
                                        className="formSubmitButton font24px font16pxUnder600"
                                    >
                                        Sign Up
                                    </button>
                                    <br/>
                                    <div className="clickable blueText"
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
