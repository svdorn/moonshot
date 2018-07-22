"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetApiKey } from '../../../actions/usersActions';
import { TextField, RaisedButton, Paper, CircularProgress } from 'material-ui';
import axios from "axios";
import { Field, reduxForm } from 'redux-form';
import { renderPasswordField } from "../../../miscFunctions";


const validate = values => {
    const errors = {};
    const requiredFields = [
        'password'
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.password && values.password2 && (values.password != values.password2)) {
        errors.password2 = 'Passwords must match';
    }
    return errors
};

class PasswordChange extends Component {
    constructor(props) {
        super(props);

        this.state = {
            apiKeyVisible: false
        }
    }


    // get the api key when this page opened
    componentDidMount() {
        // credentials for getting the api key
        const credentials = {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken
        }
        // error that will be shown if the api key cannot be retrieved
        const getApiKeyError = "Error getting API Key.";
        // get the api key from the back end
        axios.get("/api/business/apiKey", {params: credentials})
        // on success, get the api key from the response
        .then(response => {
            // if the response contains the api key as requested, add the api key
            // to state so it can be displayed
            if (response && typeof response.data === "string") {
                this.setState({apiKey: response.data});
            }
            // if the response did not contain the api key, set an error message
            else {
                this.setState({
                    apiKey: getApiKeyError,
                    apiKeyVisible: true
                });
                console.log("Response did not contain API Key.");
            }
        })
        // if there is some error getting the api key from the backend
        .catch(error => {
            // set an error where the api key goes in the UI
            this.setState({
                apiKey: getApiKeyError,
                apiKeyVisible: true
            })
            console.log(error);
        });
    }


    // handle user pressing "Reset API Key"
    handleSubmit(e) {
        e.preventDefault();
        // values that were entered in the form
        const vals = this.props.formData.resetApiKey.values;
        // Form validation before submit
        let notValid = false;
        // user required to enter all three fields
        const requiredFields = [
            'password'
        ];
        // if nothing is entered in one of the required fields, touch it to
        // bring up the warning that says you have to enter something
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        // if a required field is empty, do not reset api key
        if (notValid) return;

        // info the server needs to reset the api key
        const user = {
            userId: this.props.currentUser._id,
            password: this.props.formData.resetApiKey.values.password
        };

        // reset the api key
        this.props.resetApiKey(user);
    }


    // turn on/off visiblity of the api key
    toggleVisibility() {
        this.setState({apiKeyVisible: !this.state.apiKeyVisible});
    }


    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                <div className="inputContainer" style={{marginTop:"30px"}}>
                    <div
                        className="inlineBlock pointer"
                        onClick={this.toggleVisibility.bind(this)}
                        style={{position:"absolute", right:"0"}}
                    >
                        {this.state.apiKeyVisible ? "hide" : "show"}
                    </div>
                    <input
                        name="apiKey"
                        type={this.state.apiKeyVisible ? "text" : "password"}
                        label="API Key"
                        className="fake-input primary-cyan"
                        value={this.state.apiKey}
                        disabled
                    />
                </div><br/>
                <div className="inputContainer">
                    <Field
                        name="password"
                        component={renderPasswordField}
                        label="Password"
                        className="lightBlueInputText"
                    />
                </div><br/>
                <div className="center">
                    <RaisedButton
                        label="Reset API Key"
                        type="submit"
                        className="raisedButtonBusinessHome"
                        style={{margin: '30px auto 0px'}}
                    />
                </div>
                {this.props.loadingResetApiKey ? <div className="center"><CircularProgress color="white" style={{marginTop: "10px"}}/></div> : null}
            </form>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetApiKey,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        loadingResetApiKey: state.users.loadingSomething
    };
}

PasswordChange = reduxForm({
    form: 'resetApiKey',
    validate,
})(PasswordChange);

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange);
