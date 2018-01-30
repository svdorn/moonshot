"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changePasswordForgot} from '../../actions/usersActions';
import {TextField} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

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

        const token = this.props.location.search.substr(1);
        const user = {
            token: token,
            password: vals.password,
        };
        this.props.changePasswordForgot(user);
    }

    //name, email, password, confirm password, signup button
    render() {
        return (
            <div className="fullHeight greenToBlue formContainer">
                <HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Change Password</h1>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="New Password"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password2"
                                component={renderPasswordField}
                                label="Confirm New Password"
                            /><br/>
                        </div>
                        <button
                            type="submit"
                            className="formSubmitButton font24px font16pxUnder600"
                        >
                            Change Password
                        </button>
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
        currentUser: state.users.currentUser
    };
}

PasswordChange = reduxForm({
    form: 'forgotPassChange',
    validate,
})(PasswordChange);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange);
