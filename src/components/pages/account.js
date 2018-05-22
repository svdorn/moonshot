"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateUser} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress} from 'material-ui';
import {Field, reduxForm, change} from 'redux-form';
import axios from 'axios';

const styles = {
    floatingLabelStyle: {
        color: '#00c3ff',
    },
};

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

const validate = values => {
    const errors = {};
    const requiredFields = [
        'name',
        'email',
        'password'
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    return errors
};

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hideProfile: props.currentUser.hideProfile === true
        };
    }


    handleHideProfileClick() {
        this.setState({ hideProfile: !this.state.hideProfile });
    }


    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.settings.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
            'email',
            'password'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) return;

        const user = {
            name: this.props.formData.settings.values.name,
            email: this.props.formData.settings.values.email,
            password: this.props.formData.settings.values.password,
            _id: this.props.currentUser._id,
            hideProfile: this.state.hideProfile
        };

        this.props.updateUser(user);

        // reset password field
        this.props.change("password", "");
        this.props.untouch("password");
    }

    signUpForPsych() {
        console.log("currentUser: ", this.props.currentUser);
        axios.post("/api/user/startPsychEval", {userId: this.props.currentUser._id, verificationToken: this.props.currentUser.verificationToken})
        .then(result => {
            console.log("result: ", result);
        })
        .catch(error => {
            console.log("error: ", error);
        });
    }

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="formContainer" style={{display:'inline-block'}}>
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Settings</h1>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="name"
                                component={renderTextField}
                                label="Full Name"
                                className="lightBlueInputText"
                            /></div>
                        <br/>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                                className="lightBlueInputText"
                            /></div>
                        <br/>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="Verify Password"
                                className="lightBlueInputText"
                                autoComplete="new-password"
                            /></div>
                        <br/>
                        <div className="checkbox smallCheckbox blueCheckbox" onClick={this.handleHideProfileClick.bind(this)}>
                            <img
                                alt=""
                                className={"checkMark" + this.state.hideProfile}
                                src="/icons/CheckMarkBlue.png"
                            />
                        </div>
                        <div className="blueText" style={{display:"inline-block"}}>
                            Hide Profile From Employers
                        </div><br/>
                        <button
                            type="submit"
                            className="formSubmitButton font24px font16pxUnder600"
                        >
                            Update Settings
                        </button><br/>
                        {this.props.loadingUpdateSettings ? <CircularProgress style={{marginTop: "10px"}}/> : null}
                    </form>
                </div>
                <div className="clickable" onClick={this.signUpForPsych.bind(this)}>Sign up for psychometric exam</div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateUser,
        change
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        initialValues: state.users.currentUser,
        formData: state.form,
        currentUser: state.users.currentUser,
        loadingUpdateSettings: state.users.loadingSomething
    };
}

Account = reduxForm({
    form: 'settings',
    validate,
})(Account);

export default connect(mapStateToProps, mapDispatchToProps)(Account);
