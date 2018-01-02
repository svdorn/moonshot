"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';

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

const renderMultilineTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        multiLine={true}
        rows={2}
        hintText={label}
        floatingLabelText={label}
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
        'company',
        'title',
        'phone'
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

class ForBusiness extends Component {

    handleSubmit(e) {
        e.preventDefault();

        // Check if valid
        const vals = this.props.formData.forBusiness.values;

        // check if all fields have a value
        // let valsCounter = 0;
        // for (let i in vals) {
        //     valsCounter++;
        // }
        //
        // if (!vals || valsCounter !== 5) {
        //     return;
        // }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const user = {
            name: this.props.formData.forBusiness.values.name,
            company: this.props.formData.forBusiness.values.company,
            title: this.props.formData.forBusiness.values.title,
            email: this.props.formData.forBusiness.values.email,
            message: this.props.formData.forBusiness.values.message,
            phone: this.props.formData.forBusiness.values.phone,
        };

        console.log("SENDING EMAIL: ", user);

        this.props.forBusiness(user);

        console.log("email sent");
    }

    //name, username, email, password, confirm password, signup button
    render() {
        return (
            <div>
                <div className="form" zDepth={2}>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Businesses</h1>
                        <h3>
                            Work with us to create pathways to<br/>
                            help you source specialized talent, for less.
                        </h3>
                        <Field
                            name="name"
                            component={renderTextField}
                            label="Full Name"
                        /><br/>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Email"
                        /><br/>
                        <Field
                            name="phone"
                            component={renderTextField}
                            label="Phone Number"
                        /><br/>
                        <Field
                            name="company"
                            component={renderTextField}
                            label="Company"
                        /><br/>
                        <Field
                            name="title"
                            component={renderTextField}
                            label="Title"
                        /><br/>
                        <Field
                            name="message"
                            component={renderMultilineTextField}
                            label="Message"
                        /><br/>
                        <RaisedButton type="submit"
                                      label="Contact Us"
                                      primary={true}
                                      className="button"
                        />
                    </form>
                    { this.props.loadingCreateUser ? <CircularProgress /> : "" }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        forBusiness,
        getUsers
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateUser: state.users.loadingSomething,
    };
}

ForBusiness = reduxForm({
    form: 'forBusiness',
    validate,
})(ForBusiness);

export default connect(mapStateToProps, mapDispatchToProps)(ForBusiness);
