"use strict"
import React, { Component } from 'react';
import { TextField, CircularProgress, RaisedButton } from 'material-ui';
import { unsubscribe, closeNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import { renderTextField, isValidEmail } from "../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
    ];
    if (values.email && !isValidEmail(values.email)) {
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

        let email = "";
        let unsubscribedViaUrl = false;
        try {
            email = props.location.query.email;
        } catch(e) { /* no email provided, ask them to submit one */ }

        if (isValidEmail(email)) {
            unsubscribedViaUrl = true;
        }

        this.state = {showErrors: true, unsubscribedViaUrl};
    }


    componentDidMount() {
        if (this.state.unsubscribedViaUrl) {
            const user = { email: this.props.location.query.email };
            const showNotification = false;
            this.props.unsubscribe(user, showNotification);
        }
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
        if (vals.email && !isValidEmail(vals.email)) {
            return;
        }

        const user = {
            email: this.props.formData.unsubscribe.values.email,
        };

        const showNotification = true;
        this.props.unsubscribe(user, showNotification);
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div className="fillScreen formContainer">
                <MetaTags>
                    <title>Unsubscribe | Moonshot</title>
                    <meta name="description" content="Unsubscribe from all Moonshot emails. Sorry to see you go!" />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightBlackForm noBlur">
                    {this.state.unsubscribedViaUrl ?
                        <div style={{padding:"10px"}}>{this.props.location.query.email} was successfully unsubscribed.</div>
                    :
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <h1 style={{marginTop:"15px"}}>Unsubscribe</h1>
                            <div className="font20px font14pxUnder700 font10pxUnder400 font20pxUnder500 primary-white">Enter your email to unsubscribe.</div>
                            <div className="inputContainer">
                                <Field
                                    name="email"
                                    component={renderTextField}
                                    label="Email"
                                /><br/>
                            </div>
                            <RaisedButton
                                label="Submit"
                                type="submit"
                                className="raisedButtonBusinessHome"
                                style={{margin: '10px 0'}}
                            />
                            <br/>
                            {this.props.loadingUnsubscribe ? <CircularProgress color="white" style={{marginTop: "10px"}}/> : null}
                        </form>
                    }
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
        loadingUnsubscribe: state.users.loadingSomething,
    };
}

Unsubscribe = reduxForm({
    form:'unsubscribe',
    validate,
})(Unsubscribe);

export default connect(mapStateToProps, mapDispatchToProps)(Unsubscribe);
