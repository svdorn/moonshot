"use strict"
import React, { Component } from 'react';
import { TextField, CircularProgress } from 'material-ui';
import { closeNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
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

const validate = values => {
    const errors = {};
    const requiredFields = [
        'email',
        'name'
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

class ReferralCode extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showErrors: true,
            loading: false,
            error: undefined,
            referralCode: undefined
        };
    }


    handleSubmit(e) {
        e.preventDefault();

        let self = this;
        const vals = this.props.formData.referralCode.values;

        // Check if the form is valid
        let notValid = false;
        const requiredFields = [
            'email',
            'name'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                self.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;
        if (vals.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const email = self.props.formData.referralCode.values.email;
        const name = self.props.formData.referralCode.values.name;

        // make the loading bar show up
        self.setState({...this.state, loading: true});
        axios.post("api/createReferralCode", {name, email})
        .then(function(response) {
            // stop the loading bar, show the referral code
            const referralCode = response.data;
            self.setState({...self.state, loading: false, referralCode})
        })
        .catch(function(error) {
            // stop the loading bar, show error
            self.setState({...self.state, loading: false, error: error.response.data})
        })
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
            <div className="fillScreen greenToBlue formContainer">
                <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightWhiteForm" style={{padding: "10px 20px"}}>
                    {this.state.referralCode ?
                        <div>
                            <span className="font20px">Your referral code is:</span>
                            <br/>
                            <span className="font32px">{this.state.referralCode}</span>
                            <br/>
                            <span className="font16px">
                                Have your friend enter this code when they
                                finish a pathway. If they get the job, we{"'"}ll
                                send you $300 through PayPal. We sent you an
                                email with your code and some extra info.
                            </span>
                        </div>
                        :
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <span className="font24px">Earn $300 for every friend that gets a job through Moonshot.</span>
                            <br/>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="name"
                                    component={renderTextField}
                                    label="Name"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>
                            <div className="inputContainer">
                                <div className="fieldWhiteSpace"/>
                                <Field
                                    name="email"
                                    component={renderTextField}
                                    label="Email"
                                    className="lightBlueInputText"
                                /><br/>
                            </div>
                            <button
                                type="submit"
                                className="formSubmitButton font24px font16pxUnder600"
                                style={{marginTop: "20px"}}
                            >
                                Get Referral Code
                            </button>
                            { this.state.loading ? <div className="center"><CircularProgress style={{marginTop:"20px"}}/></div> : "" }
                            { this.state.error ? <div>{this.state.error}</div> : null }
                        </form>
                    }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form
    };
}

ReferralCode = reduxForm({
    form:'referralCode',
    validate,
})(ReferralCode);

export default connect(mapStateToProps, mapDispatchToProps)(ReferralCode);
