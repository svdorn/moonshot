"use strict"
import React, { Component } from 'react';
import { TextField, CircularProgress } from 'material-ui';
import { contactUs, formError } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form';


const styles = {
    hintStyle: {
        color: '#00c3ff',
    },
    style: {
        width: '500px',
    }
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        errorText={touched && error}
        multiLine={true}
        hintStyle={styles.hintStyle}
        style={styles.style}
        hintText={label}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'message',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });

    return errors
};

class ContactUs extends Component {
    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.contactUs.values;

        let valsCounter = 0;
        for (let i in vals) {
            valsCounter++;
        }

        if (!vals || valsCounter !== 1) {
            this.props.formError();
            return;
        }

        const user = {
            message: vals.message,
            name: this.props.currentUser.name,
            email: this.props.currentUser.email,
        };

        this.props.contactUs(user);

    }

    render() {
        return (
            <div className="fullHeight greenToBlue center">
                <div className="form lightWhiteForm">
                    <h1>Contact Us</h1>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <div className="inputContainer messageInputContainer">
                            <div className="messageFieldWhiteSpace"/>
                            <Field
                                name="message"
                                component={renderTextField}
                                label="Message"
                            /><br/>
                        </div>
                        <button
                            type="submit"
                            className="semiOpaqueWhiteBlueButton"
                        >
                            Contact Us
                        </button>
                    </form>
                    { this.props.loading ? <CircularProgress style={{marginTop:"20px"}}/> : "" }
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        contactUs,
        formError
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loading: state.users.loadingSomething,
    };
}

ContactUs = reduxForm({
    form:'contactUs',
    validate,
})(ContactUs);

export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);
