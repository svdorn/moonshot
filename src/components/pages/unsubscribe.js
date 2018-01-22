"use strict"
import React, { Component } from 'react';
import { TextField, CircularProgress } from 'material-ui';
import { unsubscribe, closeNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';


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

class Unsubscribe extends Component {
    constructor(props) {
        super(props);
        this.state = {showErrors: true};
    }

    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.unsubscribe.values;

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'email',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;
        if (vals.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const user = {
            email: this.props.formData.unsubscribe.values.email,
        };

        this.props.unsubscribe(user);
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // sets header to white
        // this.props.setHeaderBlue(false);
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div className="fullHeight greenToBlue formContainer">
                <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Unsubscribe</h1>
                        <div className="smallText2 font20pxUnder500 blueText">Enter your email to unsubscribe.</div>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                        </div>
                        <button
                            type="submit"
                            className="formSubmitButton"
                        >
                            Submit
                        </button>
                        { this.props.loadingSomething ? <div className="center"><CircularProgress style={{marginTop:"20px"}}/></div> : "" }
                    </form>
                </div>

            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        unsubscribe,
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loadingSomething: state.users.loadingSomething,
    };
}

Unsubscribe = reduxForm({
    form:'unsubscribe',
    validate,
})(Unsubscribe);

export default connect(mapStateToProps, mapDispatchToProps)(Unsubscribe);
