"use strict"
import React, { Component } from 'react';
import { TextField, RaisedButton, Paper, Snackbar, CircularProgress } from 'material-ui';
import { forgotPassword } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form';


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

        // check if all fields have a value
        let valsCounter = 0;
        for (let i in vals) {
            valsCounter++;
        }

        if (!vals || valsCounter !== 1) {
            return;
        }

        this.props.forgotPassword(vals);

        console.log("here");
        console.log("current user is" + this.props.currentUser);
    }

    render() {
        console.log("props are:", this.props);
        return (
            <div>
                {this.props.forgotPassSuccess ?
                    <Paper className="messageHeader infoHeader">
                        {this.props.forgotPassSuccess}
                    </Paper>
                    :
                    null
                }
                {this.props.forgotPassFailure ?
                    <Paper className="messageHeader errorHeader">
                        {this.props.forgotPassFailure.response.data}
                    </Paper>
                    :
                    null
                }
                <Paper className="form" zDepth={2}>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Forgot Password</h1>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Email"
                        /><br/>
                        <RaisedButton type="submit"
                                      label="Send Email"
                                      primary={true}
                                      className="button"
                        />
                    </form>
                    { this.props.loading ? <CircularProgress /> : "" }
                </Paper>
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
        forgotPassSuccess: state.users.forgotPassSuccess,
        forgotPassFailure: state.users.forgotPassFailure,
        loading: state.users.loadingSomething
    };
}

ForgotPassword = reduxForm({
    form:'forgot',
    validate,
})(ForgotPassword);

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
