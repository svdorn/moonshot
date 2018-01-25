"use strict"
import React, {Component} from 'react';
import {TextField, CircularProgress} from 'material-ui';
import {contactUs, formError} from '../../actions/usersActions';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Field, reduxForm} from 'redux-form';


const styles = {
    hintStyle: {
        color: '#00c3ff',
    },
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        errorText={touched && error}
        multiLine={true}
        hintStyle={styles.hintStyle}
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

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'message'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

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
                <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />

                <div className="form lightWhiteForm">
                    <h1>Contact Us</h1>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <div className="inputContainer">
                            <Field
                                name="message"
                                component={renderTextField}
                                label="Message"
                            /><br/>
                        </div>
                        <button
                            type="submit"
                            className="formSubmitButton font24px font16pxUnder600"
                        >
                            Contact Us
                        </button>
                    </form>
                    {this.props.loading ? <CircularProgress style={{marginTop: "20px"}}/> : ""}
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
    form: 'contactUs',
    validate,
})(ContactUs);

export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);
