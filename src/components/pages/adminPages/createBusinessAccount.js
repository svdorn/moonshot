"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, addNotification} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {Field, reduxForm} from 'redux-form';
import axios from 'axios';


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
        'businessName',
        'initialUserEmail',
        'initialUserName',
        'initialUserPassword',
        'initialUserPassword2',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.initialUserEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.initialUserEmail)) {
        errors.initialUserEmail = 'Invalid email address';
    }
    if (values.initialUserPassword && values.initialUserPassword2 && (values.initialUserPassword != values.initialUserPassword2)) {
        errors.initialUserPassword2 = 'Passwords must match';
    }
    return errors
};


class CreateBusinessAccount extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    handleSubmit(e) {
        e.preventDefault();

        if (!this.state.agreeingToTerms) {
            this.props.addNotification("Must agree to terms of use and privacy policy.", "error");
            return;
        }

        const vals = this.props.formData.createBusinessAccount.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'businessName',
            'initialUserEmail',
            'initialUserName',
            'initialUserPassword',
            'initialUserPassword2',
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

        const businessName = vals.businessName;
        const initialUserName = vals.initialUserName;
        const initialUserPassword = vals.initialUserPassword;
        const initialUserEmail = vals.initialUserEmail;
        let business = {
            businessName, initialUserName, initialUserPassword, initialUserEmail
        };

        axios.post("/api/business", business)
        .then(function(res) {
            console.log("res is: ", res);
            // TODO: redirect to edit business page
        })
        .catch(function(err) {
            console.log("error: ", err);
        })
        //this.props.postBusiness(business);

        // this.setState({
        //     ...this.state
        // })
    }


    render() {
        return (
            <div>
                {this.props.currentUser.admin === true ?
                    <div>
                        <div className="headerDiv greenToBlue" />

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

                    : null
                }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser
    };
}

CreateBusinessAccount = reduxForm({
    form: 'createBusinessAccount',
    validate,
})(CreateBusinessAccount);

export default connect(mapStateToProps, mapDispatchToProps)(CreateBusinessAccount);
