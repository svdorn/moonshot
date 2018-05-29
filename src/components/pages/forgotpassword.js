"use strict"
import React, {Component} from 'react';
import {TextField, CircularProgress, RaisedButton} from 'material-ui';
import {forgotPassword} from '../../actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
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

const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
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

class ForgotPassword extends Component {
    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.forgot.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'email'
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

        this.props.forgotPassword(vals);
    }

    render() {
        return (
            <div className="fillScreen blackBackground formContainer">
                <MetaTags>
                    <title>Forgot Password | Moonshot</title>
                    <meta name="description" content="Reset your Moonshot password. It's okay - we all forget things sometimes." />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightBlackForm noBlur">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Forgot Password</h1>
                        <div className="inputContainer">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                                className="lightBlueInputText"
                            /><br/>
                        </div>
                        <RaisedButton
                            label="Send Email"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{margin: '30px 0'}}
                        />
                    </form>
                    {this.props.loading ? <CircularProgress color="white" style={{marginTop: "20px"}}/> : ""}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        forgotPassword,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loading: state.users.loadingSomething
    };
}

ForgotPassword = reduxForm({
    form: 'forgot',
    validate,
})(ForgotPassword);

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
