"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changeTempPassword} from '../../actions/usersActions';
import {TextField} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import axios from 'axios';

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

const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        floatingLabelStyle={styles.floatingLabelStyle}
        {...input}
        {...custom}
        type="password"
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'password',
        'password2',
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

class ChangeTempPassword extends Component {

    constructor(props) {
        super(props);

        this.state = {
            keepMeLoggedIn: false
        }
    }

    componentWillMount() {
        let self = this;
        axios.get("/api/keepMeLoggedIn")
        .then(function (res) {
            let keepMeLoggedIn = res.data;
            if (typeof keepMeLoggedIn != "boolean") {
                keepMeLoggedIn = false;
            }
            self.setState({keepMeLoggedIn});
        })
        .catch(function (err) {
            console.log("error getting 'keep me logged in' option")
        });
    }

    handleCheckMarkClick() {
        axios.post("/api/keepMeLoggedIn", { stayLoggedIn: !this.state.keepMeLoggedIn })
        .catch(function(err) {
            console.log("error posting 'keep me logged in' option: ", err);
        });
        this.setState({ keepMeLoggedIn: !this.state.keepMeLoggedIn });
    }

    handleSubmit(e) {
        e.preventDefault();

        const email = this.props.location.query.email;
        if (!email) return;

        // Check if valid
        const vals = this.props.formData.changeTempPass.values;
        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'oldPassword',
            'password',
            'password2',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;
        if (vals.password != vals.password2) return;

        const user = {
            email: email,
            oldPassword: vals.oldPassword,
            password: vals.password,
        };

        this.props.changeTempPassword(user, this.state.keepMeLoggedIn);
    }

    render() {
        return (
            <div className="fullHeight greenToBlue formContainer">
                <HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>
                <div className="form lightWhiteForm">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1>Change Password</h1>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="oldPassword"
                                component={renderTextField}
                                label="Old Password"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password"
                                component={renderPasswordField}
                                label="New Password"
                            /><br/>
                        </div>
                        <div className="inputContainer">
                            <div className="fieldWhiteSpace"/>
                            <Field
                                name="password2"
                                component={renderPasswordField}
                                label="Confirm New Password"
                            /><br/>
                        </div>
                        <div className="checkbox smallCheckbox blueCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                            <img
                                className={"checkMark" + this.state.keepMeLoggedIn}
                                src="/icons/CheckMark.png"
                            />
                        </div>
                        <div className="blueText" style={{display:"inline-block"}}>
                            Keep me signed in
                        </div><br/>
                        <button
                            type="submit"
                            className="formSubmitButton font24px font16pxUnder600"
                        >
                            Change Password
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeTempPassword,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
    };
}

ChangeTempPassword = reduxForm({
    form: 'changeTempPass',
    validate,
})(ChangeTempPassword);

export default connect(mapStateToProps, mapDispatchToProps)(ChangeTempPassword);
