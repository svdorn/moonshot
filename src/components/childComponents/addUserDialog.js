"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postEmployer} from '../../actions/usersActions';
import {TextField, CircularProgress, RaisedButton, FlatButton, Dialog } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import { browserHistory } from 'react-router';

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: 'white'}}
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
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
    return errors
};

class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emails: [],
            open: true,
        }
    }

    componentDidMount() {

    }

    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.addUser.values;

        // Form validation before submit
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

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const email = this.props.formData.addUser.values.email;
        const newUser = {
            email,
            userType: "employer",
        };

        const currentUser = this.props.currentUser;
        const currentUserInfo = {
            _id: currentUser._id,
            verificationToken: currentUser.verificationToken
        }


        this.props.postEmployer(newUser, currentUserInfo);

        this.setState({
            ...this.state,
            email
        })
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    //name, email, password, confirm password, signup button
    render() {

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="whiteTextImportant"
            />,
        ];


        return (
            <Dialog
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                <form onSubmit={this.handleSubmit.bind(this)} className="center">
                    <div
                        className="whiteTextImportant font28px font24pxUnder700 font20pxUnder500 marginTop10px">
                        Predict Candidate Success
                    </div>
                    <Field
                        name="name"
                        component={renderTextField}
                        label="Full Name*"
                        style={{marginTop: '1px'}}
                    /> <br/>
                    <Field
                        name="email"
                        component={renderTextField}
                        label="Email*"
                    /><br/>
                    <Field
                        name="company"
                        component={renderTextField}
                        label="Company"
                    /><br/>
                    <Field
                        name="phone"
                        component={renderTextField}
                        label="Phone Number"
                    /><br/>
                    <RaisedButton
                        label="Send"
                        type="submit"
                        className="raisedButtonBusinessHome"
                        style={{marginTop: '20px'}}
                    />
                    <br/>
                    <div className="infoText i flex font12px whiteText center"
                        style={{margin: '10px auto', width: '250px'}}>
                        <div>Free for First Position</div>
                        <div>•</div>
                        <div>Unlimited Evaluations</div>
                    </div>
                </form>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postEmployer,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingCreateUser: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        currentUser: state.users.currentUser
    };
}

AddUserDialog = reduxForm({
    form: 'addUser',
    validate,
})(AddUserDialog);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserDialog);
