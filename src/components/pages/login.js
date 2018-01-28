"use strict"
import React, { Component } from 'react';
import axios from 'axios';
import { TextField } from 'material-ui';
import { login, closeNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';


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
        'email',
        'password',
    ];
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required';
        }
    });

    return errors
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showErrors: true,
            keepMeLoggedIn: false
        };
    }

    componentDidMount() {
        let self = this;
        axios.get("/api/keepMeLoggedIn")
        .then(function(res) {
            let keepMeLoggedIn = res.data;
            if (typeof keepMeLoggedIn != "boolean") {
                keepMeLoggedIn = false;
            }
            self.setState({
                ...self.state,
                keepMeLoggedIn
            })
        })
        .catch(function(err) {
            console.log("error getting 'keep me logged in' option")
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.login.values;

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'email',
            'password',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;
        if (vals.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const user = {
            email: this.props.formData.login.values.email,
            password: this.props.formData.login.values.password
        };

        let saveSession = this.state.keepMeLoggedIn;

        let navigateBackUrl = undefined;
        let location = this.props.location;
        if (location.query && location.query.redirect) {
            navigateBackUrl = location.query.redirect;
        }

        this.props.login(user, saveSession, navigateBackUrl);
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // sets header to white
        // this.props.setHeaderBlue(false);
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleCheckMarkClick() {

        axios.post("/api/keepMeLoggedIn", { stayLoggedIn: !this.state.keepMeLoggedIn })
        .catch(function(err) {
            console.log("error posting 'keep me logged in' option: ", err);
        });
        this.setState({
            ...this.state,
            keepMeLoggedIn: !this.state.keepMeLoggedIn
        })
    }

    render() {
        return (
            <div className="fullHeight greenToBlue formContainer">
                <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 style={{marginTop:"15px"}}>Sign in</h1>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="Password"
                            /><br/><br/>
                        </div>
                        <div className="checkbox smallCheckbox blueCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                            <img
                                className={"checkMark" + this.state.keepMeLoggedIn}
                                src="/icons/CheckMark.png"
                            />
                        </div>
                        <div className="blueText" style={{display:"inline-block"}}>
                            Keep me signed in
                        </div><br/>
                        <button
                            type="submit"
                            className="formSubmitButton font24px font16pxUnder600"
                        >
                            Sign In
                        </button>
                        <div className="clickable blueText" onClick={() => this.goTo('/signup')}>Create account</div>
                        <div className="clickable blueText" onClick={() => this.goTo('/forgotPassword')}>Forgot Password?</div>
                    </form>
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        login,
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form
    };
}

Login = reduxForm({
    form:'login',
    validate,
})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
