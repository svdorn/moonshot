"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateUser, changePassword} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, Menu, MenuItem, Divider} from 'material-ui';
import {Field, reduxForm} from 'redux-form';

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
        'name',
        'username',
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

class Account extends Component {

    handleSubmit(e) {
        e.preventDefault();

        // Check if valid
        const vals = this.props.formData.settings.values;

        // check if all fields have a value
        let valsCounter = 0;
        for (let i in vals) {
            valsCounter++;
        }

        if (!vals || valsCounter < 3) {
            return;
        }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }
        const user = this.props.formData.settings.values;

        console.log("UPDATING USER: ", user);

        this.props.updateUser(user);

        console.log("updated");
    }

    //name, username, email, password, confirm password, signup button
    render() {
        console.log(this.props);
        return (
            <Paper className="formOther">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h1>Settings</h1>
                    <Field
                        name="name"
                        component={renderTextField}
                        label="Full Name"
                    /><br/>
                    <Field
                        name="username"
                        component={renderTextField}
                        label="Username"
                    /><br/>
                    <Field
                        name="email"
                        component={renderTextField}
                        label="Email"
                    /><br/>
                    <RaisedButton type="submit"
                                  label="Update User"
                                  primary={true}
                                  className="button"
                    />
                </form>
            </Paper>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateUser,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        initialValues: state.users.currentUser,
        formData: state.form,
        currentUser: state.users.currentUser,
    };
}

Account = reduxForm({
    form: 'settings',
    validate,
})(Account);

export default connect(mapStateToProps, mapDispatchToProps)(Account);
