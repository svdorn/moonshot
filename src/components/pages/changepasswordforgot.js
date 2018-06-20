"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changePasswordForgot} from '../../actions/usersActions';
import {TextField, CircularProgress, RaisedButton} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';

const style = {
    // the hint that shows up when search bar is in focus
    searchHintStyle: { color: "rgba(255, 255, 255, .3)" },
    searchInputStyle: { color: "rgba(255, 255, 255, .8)" },

    searchFloatingLabelFocusStyle: { color: "rgb(114, 214, 245)" },
    searchFloatingLabelStyle: { color: "rgb(114, 214, 245)" },
    searchUnderlineFocusStyle: { color: "green" }
};

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
        'password',
        'password2',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class PasswordChange extends Component {

    handleSubmit(e) {
        e.preventDefault();

        // Check if valid
        const vals = this.props.formData.forgotPassChange.values;
        // Form validation before submit
        let notValid = false;
        const requiredFields = [
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
        if (vals.password != vals.password2) return;

        const token = this.props.location.query.token;
        const user = {
            token: token,
            password: vals.password,
        };
        this.props.changePasswordForgot(user);
    }

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                    <title>New Password | Moonshot</title>
                    <meta name="description" content="Reset your Moonshot password. It's okay - we all forget things sometimes." />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 style={{marginTop:"15px"}}>Change Password</h1>
                        <div className="inputContainer">
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="New Password"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <Field
                                name="password2"
                                component={renderPasswordField}
                                label="Confirm New Password"
                            /><br/>
                        </div>
                        <RaisedButton
                            label="Change Password"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{margin: '10px 0'}}
                        />
                        <br/>
                        {this.props.loadingChangePassword ?
                            <CircularProgress />
                            : null
                        }
                    </form>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changePasswordForgot,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        loadingChangePassword: state.users.loadingSomething
    };
}

PasswordChange = reduxForm({
    form: 'forgotPassChange',
    validate,
})(PasswordChange);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange);
