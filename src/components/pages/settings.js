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
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {value: 1};
    }

    handleChange = (event, index) => {
        this.setState({value: index})
    };

    handleSubmit(e) {
        e.preventDefault();

        // Check if valid
        const vals = this.props.formData.settings.values;

        if (this.state.value === 1) {
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
            delete user.oldpass;
            delete user.password;
            delete user.password2;

            console.log("UPDATING USER: ", user);

            this.props.updateUser(user);

            console.log("updated");
        } else {
            if (!(vals.oldpass && vals.password && vals.password2)) {
                return;
            }
            if (vals.password != vals.password2) {
                return;
            }
            const user = {
                _id: this.props.formData.settings.values._id,
                oldpass: this.props.formData.settings.values.oldpass,
                password: this.props.formData.settings.values.password,
            };
            this.props.changePassword(user);
        }
    }

    //name, username, email, password, confirm password, signup button
    render() {
        console.log(this.props);
        return (
            <div className="container">
                {this.props.changePasswordError !== undefined ?
                    <Paper className="messageHeader errorHeader">
                        {this.props.changePasswordError}
                    </Paper>
                    :
                    null
                }
                <Paper className="boxStyle">
                    <Menu value={this.state.value} onChange={this.handleChange}>
                        <MenuItem primaryText="Account" disabled={true}/>
                        <Divider/>
                        <MenuItem value={1} primaryText="Settings"/>
                        <MenuItem value={2} primaryText="Change Password"/>
                    </Menu>
                </Paper>
                {this.state.value === 1 ?
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
                    :
                    <Paper className="formOther">
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <h1>Change Password</h1>
                            <Field
                                name="oldpass"
                                component={renderTextField}
                                label="Old Password"
                            /><br/>
                            <Field
                                name="password"
                                component={renderTextField}
                                label="New Password"
                            /><br/>
                            <Field
                                name="password2"
                                component={renderTextField}
                                label="Confirm New Password"
                            /><br/>
                            <RaisedButton type="submit"
                                          label="Change Password"
                                          primary={true}
                                          className="button"
                            />
                        </form>
                    </Paper>
                }
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateUser,
        changePassword,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        initialValues: state.users.currentUser,
        formData: state.form,
        currentUser: state.users.currentUser,
        changePasswordError: state.users.changePasswordError,
    };
}

Settings = reduxForm({
    form: 'settings',
    validate,
})(Settings);

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
