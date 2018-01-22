"use strict"
import React, {Component} from 'react';
import {TextField, CircularProgress, RaisedButton} from 'material-ui';
import {closeNotification, comingSoon} from '../../actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import {Field, reduxForm} from 'redux-form';


const styles = {
    hintStyle: {
        color: '#00c3ff',
    },

};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={styles.hintStyle}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'name',
    ];
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required';
        }
    });

    return errors
};

class ComingSoonForm extends Component {
    constructor(props) {
        super(props);
        this.state = {showErrors: true};
    }


    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.comingSoon.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
            'email',
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
            name: vals.name,
            email: vals.email,
            pathway: this.props.pathway,
        };

        this.props.comingSoon(user);
    }


    render() {
        return (
            <div>
                {this.props.loadingEmailSend ?
                    <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                    : < form onSubmit={this.handleSubmit.bind(this)} className="center">
                        <div className="blueTextImportant mediumTextDoubleShrink">
                            Contact Us
                        </div>
                        <Field
                            name="name"
                            component={renderTextField}
                            label="Full Name"
                        /> < br/>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Email"
                        /><br/>
                        <RaisedButton
                            label="Send"
                            type="submit"
                            primary={true}
                            className="raisedButtonWhiteText"
                            style={{marginTop:'20px'}}
                        />
                    </form>
                }
            </div>

        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        comingSoon,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loadingEmailSend: state.users.loadingSomething,
    };
}

ComingSoonForm = reduxForm({
    form: 'comingSoon',
    validate,
})(ComingSoonForm);

export default connect(mapStateToProps, mapDispatchToProps)(ComingSoonForm);
