"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { postEmailInvites, closeAddUserModal, emailFailureExitPage, postCreateLink, addNotification } from '../../actions/usersActions';
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
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />);
};

const emailValidate = (value) => (
    value && !isValidEmail(value) ? 'Invalid email address' : undefined
)

class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.modalOpen || false,
            screen: 1,
            linkScreen: false,
            positions: [],
            position: "",
            // true if the business has no positions associated with it
            noPositions: false,
            tab: "Candidate",
            numCandidateEmails: 1,
            numEmployeeEmails: 1,
            //numManagerEmails: 1,
            numAdminEmails: 1,
            formErrors: false,
            duplicateEmails: false,
            loadingSendVerificationEmail: false
        }
    }


    componentDidMount() {
        this.getPositions();
    }

    getPositions() {
        let self = this;
        axios.get("/api/business/positions", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            let positions = res.data.positions;
            if (Array.isArray(positions) && positions.length > 0) {
                const firstPositionName = positions[0].name;
                self.setState({
                    positions,
                    position: firstPositionName,
                    screen: 1
                })
            } else {
                self.setState({
                    noPositions: true,
                    screen: 1
                })
            }
        })
    }

    componentDidUpdate() {
        let newState = {};
        let shouldSetState = false;
        // make sure the props defining whether the modal is open matches the state for that
        if (this.props.modalOpen != this.state.open && this.props.modalOpen != undefined) {
            shouldSetState = true;
            newState.open = this.props.modalOpen;
        }
        // if the user sets a position - such as in My Candidates - default to adding that position
        if (!this.props.modalOpen && this.props.position && this.state.position != this.props.position) {
            shouldSetState = true;
            newState.position = this.props.position;
        }
        // if the user sets a tab - Candidate or Employee or Admin - default to adding that user
        if (!this.props.modalOpen && this.props.tab && this.state.tab !== this.props.tab) {
            shouldSetState = true;
            newState.tab = this.props.tab;
        }
        // set the state if needed
        if (shouldSetState) {
            // TODO: Austin look at this when you get back (is needed cuz now can add positions in the middle of being on a page, might need positions in redux for account admins now)
            if (this.props.modalOpen) {
                this.getPositions();
            }
            this.setState(newState);
        }
    }

    handleClose = () => {
        this.props.reset();
        let position = "";
        if (this.state.positions) {
            position = this.state.positions[0].name;
        }
        this.setState({
              screen: 1,
              tab: "Candidate",
              position: position,
              numCandidateEmails: 1,
              numEmployeeEmails: 1,
              //numManagerEmails: 1,
              numAdminEmails: 1,
              formErrors: false,
              duplicateEmails: false,
              loadingSendVerificationEmail: false
          });
        this.props.closeAddUserModal();
    };




    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.addUser.values;

        // TODO: validate emails somehow
        // Get the email address out of the objects and store in an array
        let candidateEmails = [];
        let employeeEmails = [];
        //let managerEmails = [];
        let adminEmails = [];

        // Find position in positions array
        const positions = this.state.positions;
        let position = {};
        for (let i = 0; i < positions.length; i++) {
            if (positions[i].name == this.state.position) {
                position = positions[i];
                break;
            }
        }

        // keeps track of emails to make sure none are duplicates
        let usedEmails = {};

        for (let email in vals) {
            const emailAddr = vals[email];
            const emailString = email.replace(new RegExp("[0-9]", "g"),"");

            // if this email has already been seen, show an error message
            if (usedEmails[emailAddr] === true) { return; }
            // otherwise add this email to the list of emails already seen
            else { usedEmails[emailAddr] = true; }

            switch(emailString) {
                case "candidateEmail":
                    candidateEmails.push(emailAddr);
                    break;
                case "employeeEmail":
                    employeeEmails.push(emailAddr);
                    break;
                case "adminEmail":
                    adminEmails.push(emailAddr);
                    break;
                default:
                    break;
            }
        }

        const currentUser = this.props.currentUser;

        const currentUserInfo = {
            userId: currentUser._id,
            userName: currentUser.name,
            businessId: currentUser.businessInfo.businessId,
            verificationToken: currentUser.verificationToken,
            positionId: position._id,
            positionName: position.name
        }

        this.props.postEmailInvites(candidateEmails, employeeEmails, adminEmails, currentUserInfo);
    }

    addAnotherEmail() {
        switch(this.state.tab) {
            case "Candidate":
                const numCandidateEmails = this.state.numCandidateEmails + 1;
                this.setState({numCandidateEmails})
                break;
            case "Employee":
                const numEmployeeEmails = this.state.numEmployeeEmails + 1;
                this.setState({numEmployeeEmails})
                break;
            case "Admin":
                const numAdminEmails = this.state.numAdminEmails + 1;
                break;
        }
    }

    handlePositionChange = (event, index) => {
        const position = this.state.positions[index].name;
        this.setState({position})
    };


    duplicatesExist() {
        const vals = this.props.formData.addUser.values;
        // keeps track of emails to make sure none are duplicates
        let usedEmails = {};

        for (let email in vals) {
            const emailAddr = vals[email];

            // if this email has already been seen, show an error message
            if (usedEmails[emailAddr] === true) {
                return true;
            }
            // otherwise add this email to the list of emails already seen
            else { usedEmails[emailAddr] = true; }
        }

        return false;
    }

    handleCreateLink(e) {
        e.preventDefault();
        const currentUser = this.props.currentUser;

        // Find position in positions array
        const positions = this.state.positions;
        let position = {};
        for (let i = 0; i < positions.length; i++) {
            if (positions[i].name == this.state.position) {
                position = positions[i];
                break;
            }
        }

        const currentUserInfo = {
            userId: currentUser._id,
            userName: currentUser.name,
            businessId: currentUser.businessInfo.businessId,
            verificationToken: currentUser.verificationToken,
            positionId: position._id,
            positionName: position.name
        }
        console.log("creating link");

        this.props.postCreateLink(currentUserInfo);
        this.handleScreenLinkNext();
    }

    handleScreenLinkNext() {
        this.setState({linkScreen:true, formErrors: false})
    }

    handleScreenLinkPrevious() {
        this.setState({linkScreen:false, screen: 2})
    }

    handleScreenNext() {
        let advanceScreen = true;
        if (this.state.screen === 2) {
            // check for duplicates
            if (this.duplicatesExist()) {
                advanceScreen = false;
                this.setState({duplicateEmails: true});
                return;
            } else {
                this.setState({duplicateEmails: false});
            }

            // check for invalid emails
            if (this.props.formData.addUser.syncErrors) {
                advanceScreen = false;
                this.setState({formErrors: true});
            }
        }
        if (advanceScreen) {
            const screen = this.state.screen + 1;
            if (screen >= 1 && screen <= 3) {
                this.setState({screen, formErrors: false});
            }
        }
    }

    handleScreenPrevious() {
        const screen = this.state.screen - 1;
        if (screen >= 1 && screen <= 3) {
            this.setState({screen});
        }
    }

    handleFailureExit() {
        this.props.emailFailureExitPage();
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleTabChange = (tab) => {
        this.setState({tab})
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
        if (!this.props.currentUser.verified) {
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
                    <div className="primary-white">
                        Verify your email first! Need a new verification email?
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

        const positions = this.state.positions;

        const positionItems = positions.map(function (position, index) {
            return <MenuItem value={position.name} primaryText={position.name} key={index}/>
        });

        let candidateEmailSection = [];
        for (let i = 0; i < this.state.numCandidateEmails; i++) {
            candidateEmailSection.push(
                <div key={`candidateEmail${i}`}>
                    <Field
                        name={"candidateEmail" + i}
                        component={renderTextField}
                        label="Add Candidate Email"
                        type="email"
                        validate={emailValidate}
                        id={"candidateEmail" + i}
                        autoComplete="new-password"
                    /><br/>
                </div>
            );
        }

        let employeeEmailSection = [];
        for (let i = 0; i < this.state.numEmployeeEmails; i++) {
            employeeEmailSection.push(
                <div key={`employeeEmail${i}`}>
                    <Field
                        name={"employeeEmail" + i}
                        component={renderTextField}
                        label="Add Employee Email"
                        type="email"
                        validate={emailValidate}
                        id={"employeeEmail" + i}
                        autoComplete="new-password"
                    /><br/>
                </div>
            );
        }

        // let managerEmailSection = [];
        // for (let i = 0; i < this.state.numManagerEmails; i++) {
        //     managerEmailSection.push(
        //         <div>
        //             <Field
        //                 name={"managerEmail" + i}
        //                 component={renderTextField}
        //                 label="Add Manager Email"
        //                 type="email"
        //                 validate={emailValidate}
        //                 id={"managerEmail" + i}
        //                 autoComplete="new-password"
        //             /><br/>
        //         </div>
        //     );
        // }

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

        const candidateSection = (
            <div className="center marginTop20px">
                <div className="center marginTop10px marginBottom10px">
                    <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px font14pxUnder600 primary-white" onClick={this.handleCreateLink.bind(this)}>
                        Create Link
                    </button>
                </div>
                <div className="center font14px font12pxUnder500 primary-white marginBottom15px">
                    Candidates are incoming applicants that undergo predictive evaluations.
                </div>
                <div>
                    {candidateEmailSection}
                </div>
                <div className="marginTop15px">
                    <i className="font14px underline clickable primary-white"
                        onClick={this.addAnotherEmail.bind(this)}>
                        + Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable primary-white"
                        onClick={this.handleScreenPrevious.bind(this)}>
                        Back
                    </i>
                    <RaisedButton
                        label="Next"
                        onClick={this.handleScreenNext.bind(this)}
                        className="raisedButtonBusinessHome marginLeft40px"
                    />
                </div>
            </div>
        );

        const employeeSection = (
            <div className="center marginTop20px">
                <div className="center font14px font12pxUnder500 primary-white marginBottom15px">
                    Employees undergo psychometric and skill evaluations to create a baseline for candidate predictions.
                </div>
                <div>
                    {employeeEmailSection}
                </div>
                <div className="marginTop15px">
                    <i className="font14px underline clickable primary-white"
                        onClick={this.addAnotherEmail.bind(this)}>
                        + Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable primary-white"
                        onClick={this.handleScreenPrevious.bind(this)}>
                        Back
                    </i>
                    <RaisedButton
                        label="Next"
                        onClick={this.handleScreenNext.bind(this)}
                        className="raisedButtonBusinessHome marginLeft40px"
                    />
                </div>
            </div>
        );

        // const managerSection = (
        //     <div className="center marginTop10px">
        //         <div>
        //             {managerEmailSection}
        //         </div>
        //         <div className="marginTop20px">
        //             <i className="font14px underline clickable primary-white
        //                 onClick={this.addAnotherEmail.bind(this)}>
        //                 +Add Another Email
        //                 </i>
        //         </div>
        //         <div className="center marginTop10px">
        //             <i className="font14px underline clickable primary-white
        //                 onClick={this.handleScreenPrevious.bind(this)}>
        //                 Back
        //             </i>
        //             <RaisedButton
        //                 label="Next"
        //                 onClick={this.handleScreenNext.bind(this)}
        //                 className="raisedButtonBusinessHome marginLeft40px"
        //             />
        //         </div>
        //     </div>
        // );

        const adminSection = (
            <div className="center marginTop20px">
                <div className="center font14px font12pxUnder500 primary-white marginBottom15px">
                    Administrators can add and remove users, grade employees, and view results.
                </div>
                <div>
                    {adminEmailSection}
                </div>
                <div className="marginTop15px">
                    <i className="font14px underline clickable primary-white"
                        onClick={this.addAnotherEmail.bind(this)}>
                        + Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable primary-white"
                        onClick={this.handleScreenPrevious.bind(this)}>
                        Back
                    </i>
                    <RaisedButton
                        label="Next"
                        onClick={this.handleScreenNext.bind(this)}
                        className="raisedButtonBusinessHome marginLeft40px"
                    />
                </div>
            </div>
        );

        const screen = this.state.screen;
        let body = <div></div>;
        if (this.state.noPositions) {
            body = (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                >
                    <div className="primary-white font20px font16pxUnder500 marginTop20px">
                        Cannot Add Users because you have no current positions.
                    </div>
                </Dialog>
            );
        } else if (this.props.userPosted) {
            body = (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                    >
                        <div className="primary-cyan font24px font20pxUnder500 marginTop20px">
                            Success
                        </div>
                        <div className="primary-white font16px font14pxUnder500" style={{width:"80%", margin:"20px auto"}}>
                            {this.props.waitingForFinalization ?
                                `Success! As soon as your evaluation is ready, your invites will be sent to the users' emails with sign-up instructions for the ${this.state.position} position.`
                                : `Success! Your invites have been sent to the users' emails with sign-up instructions for the ${this.state.position} position.`
                            }
                        </div>
                        <RaisedButton
                            label="Done"
                            onClick={this.handleClose}
                            className="raisedButtonBusinessHome marginTop10px"
                        />
                </Dialog>
            );
        } else if (this.props.userPostedFailed) {
            body = (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                    >
                        <div className="secondary-red font18px font16pxUnder500" style={{width:"90%", margin:"40px auto"}}>
                            Emails failed to send to users for the {this.state.position} position. Please fix emails and retry.
                        </div>
                        <div className="center marginTop20px">
                            <i className="font14px underline clickable primary-white"
                                onClick={this.handleFailureExit.bind(this)}>
                                Back
                            </i>
                        </div>
                </Dialog>
            );
        } else if (this.state.linkScreen) {
            body = (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                    >
                        <div className="primary-white font16px font14pxUnder500" style={{width:"98%", margin:"40px auto"}}>
                            Candidates can sign up for a Moonshot account and complete your evaluation by going to the link below:
                        </div>
                        <div className="primary-cyan font16px font14pxUnder500" style={{margin:"40px auto"}}>
                            {this.props.link ?
                                <div>
                                    {"https://moonshotinsights.io/signup?code=" + this.props.link}
                                </div>
                                :
                                <CircularProgress color="#76defe"/>
                            }

                        </div>
                        <div className="center marginTop20px">
                            <i className="font14px underline clickable primary-white"
                                onClick={this.handleScreenLinkPrevious.bind(this)}>
                                Back
                            </i>
                        </div>
                </Dialog>
            );
        } else {
        if (screen === 1) {
            body = (

                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                >

                    <div className="primary-cyan font24px font20pxUnder500 marginTop20px">
                        Select a position
                    </div>
                    <DropDownMenu value={this.state.position}
                              onChange={this.handlePositionChange}
                              labelStyle={style.menuLabelStyle}
                              anchorOrigin={style.anchorOrigin}
                              style={{fontSize: "16px"}}
                    >
                        {positionItems}
                    </DropDownMenu>
                    <br/>
                    <RaisedButton
                        label="Next"
                        onClick={this.handleScreenNext.bind(this)}
                        className="raisedButtonBusinessHome"
                        style={{marginTop: '20px'}}
                    />
                </Dialog>
            );
        } else if (screen === 2) {
            body = (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                >

                    <form className="center">
                        <div
                            className="primary-cyan font24px font20pxUnder500 marginTop10px">
                            Add
                        </div>
                        {this.state.formErrors ?
                        <div
                            className="secondary-red font14px font10pxUnder500" style={{width: "90%", margin:"10px auto"}}>
                            Invalid email, please enter valid emails before continuing.
                        </div>
                        : null}
                        {this.state.duplicateEmails ?
                        <div
                            className="secondary-red font14px font10pxUnder500" style={{width: "90%", margin:"10px auto"}}>
                            Duplicate emails not allowed.
                        </div>
                        : null}
                        <Tabs
                            inkBarStyle={{background: 'white'}}
                            className="addUserTabs"
                            value={this.state.tab}
                            onChange={this.handleTabChange}
                        >
                            <Tab label="Candidate" value="Candidate" style={style.tab}>
                                {candidateSection}
                            </Tab>
                            <Tab label="Employee" value="Employee" style={style.tab}>
                                {employeeSection}
                            </Tab>
                            <Tab label="Admin" value="Admin" style={style.tab}>
                                {adminSection}
                            </Tab>
                        </Tabs>
                    </form>
                </Dialog>
            );
        } else {
            body = (
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                >
                    <div className="primary-cyan font24px font20pxUnder500 marginTop10px">
                        Last Step
                    </div>
                    <div className="primary-white font16px font12pxUnder500" style={{margin:"20px auto", width:"85%"}}>
                        Wait! You have one more step. Click Finish to send the invites to your candidates, employees and/or admins so they can begin.
                    </div>
                    <div className="center marginTop40px">
                        <i className="font14px underline clickable primary-white"
                            onClick={this.handleScreenPrevious.bind(this)}>
                            Back
                        </i>
                        <RaisedButton
                            label="Finish"
                            onClick={this.handleSubmit.bind(this)}
                            className="raisedButtonBusinessHome marginLeft40px"
                        />
                    </div>
                    {this.props.loading ? <CircularProgress color="white" style={{marginTop: "20px"}}/> : ""}
                </Dialog>
            )
        }
        }

        return (
            <div>{ body }</div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postEmailInvites,
        closeAddUserModal,
        emailFailureExitPage,
        postCreateLink,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loading: state.users.loadingSomething,
        userPosted: state.users.userPosted,
        userPostedFailed: state.users.userPostedFailed,
        waitingForFinalization: state.users.waitingForFinalization,
        currentUser: state.users.currentUser,
        link: state.users.link,
        modalOpen: state.users.userModalOpen
    };
}

AddUserDialog = reduxForm({
    form: 'addUser',
})(AddUserDialog);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserDialog);
