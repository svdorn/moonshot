"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { postAdminInvites, generalAction, emailFailureExitPage, addNotification } from '../../actions/usersActions';
import { TextField, CircularProgress, RaisedButton, FlatButton, Dialog, DropDownMenu, MenuItem, Divider, Tab, Tabs } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import { browserHistory } from 'react-router';
import axios from 'axios';
import { isValidEmail } from "../../miscFunctions";
import { button } from "../../classes.js";


const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => {
    return (<TextField
        hintText={label}
        hintStyle={{color: '#72d6f5'}}
        inputStyle={{color: 'white'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />);
};

const emailValidate = (value) => (
    value && !isValidEmail(value) ? 'Invalid email address' : undefined
)

class AddAdminDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            numAdminEmails: 1,
            formErrors: false,
            duplicateEmails: false,
            loadingSendVerificationEmail: false
        }
    }


    handleClose = () => {
        this.props.reset();
        this.setState({
              numAdminEmails: 1,
              formErrors: false,
              duplicateEmails: false,
              loadingSendVerificationEmail: false
          });
        this.props.generalAction("CLOSE_ADD_ADMIN_MODAL");
    };


    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.addAdmin.values;

        // check for invalid emails
        if (this.props.formData.addAdmin.syncErrors) {
            return this.setState({ formErrors: true, duplicateEmails: false });
        }

        let adminEmails = [];

        // keeps track of emails to make sure none are duplicates
        let usedEmails = {};

        for (let email in vals) {
            const emailAddr = vals[email];

            if (emailAddr === "") { continue; } // ignore empty strings

            // if this email has already been seen, show an error message
            if (usedEmails[emailAddr] === true) {
                return this.setState({ duplicateEmails: true, formErrors: false });
            }
            // otherwise add this email to the list of emails already seen
            else { usedEmails[emailAddr] = true; }

            adminEmails.push(emailAddr);
        }

        const currentUser = this.props.currentUser;

        const currentUserInfo = {
            userId: currentUser._id,
            businessId: currentUser.businessInfo.businessId,
            verificationToken: currentUser.verificationToken
        }

        this.props.postAdminInvites(adminEmails, currentUserInfo);
    }


    handleFailureExit() {
        this.props.emailFailureExitPage();
    }


    addAnotherEmail() {
        const numAdminEmails = this.state.numAdminEmails + 1;
        this.setState({ numAdminEmails });
    }


    sendVerificationEmail() {
        if (this.state.loadingSendVerificationEmail) { return; }

        // set up the loading spinner
        this.setState({ loadingSendVerificationEmail: true });

        const user = this.props.currentUser;
        const credentials = {
            userId: user._id,
            verificationToken: user.verificationToken
        }
        axios.post("/api/accountAdmin/sendVerificationEmail", credentials)
        .then(response => {
            this.props.addNotification(`Verification email sent to ${user.email}!`, "info");
            this.handleClose();
        })
        .catch(error => {
            this.props.addNotification(`Error sending verification email. Refresh and try again.`, "error");
            this.handleClose();
        })
    }


    //name, email, password, confirm password, signup button
    render() {
        const style = {
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {

                fontSize: "18px",
                color: "rgba(255,255,255,.8)"
            },
            tab: {
                color: 'white',

            }
        };

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

        // if the user isn't verified, prompt them to verify their email
        if (!this.props.currentUser || !this.props.currentUser.verified) {
            return (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={typeof this.props.modalOpen === "boolean" ? this.props.modalOpen : false}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                >
                    <div className="primary-white">
                        Verify your email first! Need a new verification email?<br/>
                        If you{"'"}ve already verified your email, refresh the site.
                        <br/>
                        <div
                            className={this.state.loadingSendVerificationEmail ? button.disabled : button.purpleBlue}
                            onClick={this.sendVerificationEmail.bind(this)}
                            style={{margin: "20px"}}
                        >
                            Send Verification Email
                        </div><br/>
                        {this.state.loadingSendVerificationEmail ? <CircularProgress color="#76defe"/> : null}
                    </div>
                </Dialog>
            )
        }

        let adminEmailSection = [];
        for (let i = 0; i < this.state.numAdminEmails; i++) {
            adminEmailSection.push(
                <div key={`adminEmail${i}`}>
                    <Field
                        name={"adminEmail" + i}
                        component={renderTextField}
                        label="Add Admin Email"
                        type="email"
                        validate={emailValidate}
                        id={"adminEmail" + i}
                        autoComplete="new-password"
                    /><br/>
                </div>
            );
        }

        let body = <div></div>;
        // if the admin invites have successfully been sent
        if (this.props.userPosted) {
            body = (
                <div>
                    <div className="primary-cyan font24px font20pxUnder500 marginTop20px">
                        Success!
                    </div>
                    <div className="primary-white font16px font14pxUnder500" style={{width:"80%", margin:"20px auto"}}>
                            Account admin invitation emails have been sent!
                    </div>
                    <RaisedButton
                        label="Done"
                        onClick={this.handleClose}
                        className="raisedButtonBusinessHome marginTop10px"
                    />
                </div>
            );
        }
        // if the admin invites were NOT successfully sent
        else if (this.props.userPostedFailed) {
            // TODO make this button refresh the page
            body = (
                <div>
                    <div className="secondary-red font18px font16pxUnder500" style={{width:"90%", margin:"40px auto"}}>
                        Error! Couldn{"'"}t send account admin invite emails. Try refreshing.
                    </div>
                    <div className="center marginTop20px">
                        <i className="font14px underline clickable primary-white"
                            onClick={this.handleFailureExit.bind(this)}
                        >
                            Back
                        </i>
                    </div>
                </div>
            );
        }
        // if you haven't tried inviting anyone yet
        else {
            body = (
                <div>
                    <form className="center">
                        <div className="primary-cyan font24px font20pxUnder500 marginTop10px">
                            Invite Admins
                        </div>
                        { this.state.formErrors ?
                            <div
                                className="secondary-red font14px font10pxUnder500"
                                style={{width: "90%", margin:"10px auto"}}
                            >
                                Invalid email, please enter valid emails before continuing.
                            </div>
                            : null
                        }
                        { this.state.duplicateEmails ?
                            <div
                                className="secondary-red font14px font10pxUnder500"
                                style={{width: "90%", margin:"10px auto"}}
                            >
                                Remove duplicate emails please!
                            </div>
                            : null
                        }

                        <div className="center marginTop20px">
                            <div className="center font14px font12pxUnder500 primary-white marginBottom15px">
                                Administrators can add and remove users, grade employees, and view results.
                            </div>
                            <div>
                                { adminEmailSection }
                            </div>
                            <div className="marginTop15px">
                                <i className="font14px underline clickable primary-white"
                                    onClick={this.addAnotherEmail.bind(this)}>
                                    + Add Another Email
                                </i>
                            </div>
                            <div className="center marginTop10px">
                                { this.props.loading ?
                                    <CircularProgress color="white" style={{marginTop: "20px"}}/>
                                    :
                                    <RaisedButton
                                        label="Invite"
                                        onClick={this.handleSubmit.bind(this)}
                                        className="raisedButtonBusinessHome marginLeft40px"
                                    />
                                }
                            </div>
                        </div>
                    </form>
                </div>
            );
        }

        const open = this.props.modalOpen;

        return (
            <div>
                <Dialog
                    actions={actions}
                    modal={false}
                    open={typeof open === "boolean" ? open : false}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                >
                    { body }
                </Dialog>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postAdminInvites,
        generalAction,
        emailFailureExitPage,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loading: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        userPostedFailed: state.users.userPostedFailed,
        currentUser: state.users.currentUser,
        modalOpen: state.users.addAdminModalOpen
    };
}

AddAdminDialog = reduxForm({
    form: 'addAdmin',
})(AddAdminDialog);

export default connect(mapStateToProps, mapDispatchToProps)(AddAdminDialog);
