"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postEmailInvites} from '../../actions/usersActions';
import {TextField, CircularProgress, RaisedButton, FlatButton, Dialog, DropDownMenu, MenuItem, Divider, Tab, Tabs } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import { browserHistory } from 'react-router';
import axios from 'axios';

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

class AddUserDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true,
            screen: 1,
            positions: [],
            position: "",
            // true if the business has no positions associated with it
            noPositions: false,
            tab: "Candidate",
            numCandidateEmails: 1,
            numEmployeeEmails: 1,
            numManagerEmails: 1,
            numAdminEmails: 1,
        }
    }

    componentDidMount() {
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
                    open: true,
                    screen: 1
                })
            } else {
                self.setState({
                    noPositions: true,
                    open: true,
                    screen: 1
                })
            }
        })
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

        // TODO: validate emails somehow
        // Get the email address out of the objects and store in an array
        let candidateEmails = [];
        let employeeEmails = [];
        let managerEmails = [];
        let adminEmails = [];

        console.log(candidateEmails);
        console.log(employeeEmails);

        for (let email in vals) {
            const emailAddr = vals[email];
            const emailString = email.replace(new RegExp("[0-9]", "g"),"");
            console.log(emailString);
            switch(emailString) {
                case "candidateEmail":
                    candidateEmails.push(emailAddr);
                    break;
                case "employeeEmail":
                    employeeEmails.push(emailAddr);
                    break;
                case "managerEmail":
                    managerEmails.push(emailAddr);
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
            companyId: currentUser.company.companyId,
            verificationToken: currentUser.verificationToken
        }
        console.log("before post");

        this.props.postEmailInvites(candidateEmails, employeeEmails, managerEmails, adminEmails, currentUserInfo);

        console.log("Done posting email invites");

        // const vals = this.props.formData.addUser.values;
        //
        // // Form validation before submit
        // let notValid = false;
        // const requiredFields = [
        //     'email',
        // ];
        // requiredFields.forEach(field => {
        //     if (!vals || !vals[field]) {
        //         this.props.touch(field);
        //         notValid = true;
        //     }
        // });
        // if (notValid) return;
        //
        // if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
        //     return;
        // }
        //
        // const email = this.props.formData.addUser.values.email;
        // const newUser = {
        //     email,
        //     userType: "employer",
        // };
        //
        // const currentUser = this.props.currentUser;
        // const currentUserInfo = {
        //     _id: currentUser._id,
        //     verificationToken: currentUser.verificationToken
        // }
        //
        //
        // this.props.postEmployer(newUser, currentUserInfo);
        //
        // this.setState({
        //     ...this.state,
        //     email
        // })
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
            case "Manager":
                const numManagerEmails = this.state.numManagerEmails + 1;
                this.setState({numManagerEmails});
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

    handleScreenNext() {
        const screen = this.state.screen + 1;
        if (screen >= 1 && screen <= 3) {
            this.setState({screen});
        }
    }

    handleScreenPrevious() {
        const screen = this.state.screen - 1;
        if (screen >= 1 && screen <= 3) {
            this.setState({screen});
        }
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
                className="whiteTextImportant"
            />,
        ];

        // TODO get companies from DB
        const positions = this.state.positions;
        const positionItems = positions.map(function (position) {
            return <MenuItem value={position.name} primaryText={position.name} key={position.name}/>
        });

        let candidateEmailSection = [];
        for (let i = 0; i < this.state.numCandidateEmails; i++) {
            candidateEmailSection.push(
                <div>
                    <Field
                        name={"candidateEmail" + i}
                        component={renderTextField}
                        label="Add Email"
                    /><br/>
                </div>
            );
        }

        let employeeEmailSection = [];
        for (let i = 0; i < this.state.numEmployeeEmails; i++) {
            employeeEmailSection.push(
                <div>
                    <Field
                        name={"employeeEmail" + i}
                        component={renderTextField}
                        label="Add Email"
                    /><br/>
                </div>
            );
        }

        let managerEmailSection = [];
        for (let i = 0; i < this.state.numManagerEmails; i++) {
            managerEmailSection.push(
                <div>
                    <Field
                        name={"managerEmail" + i}
                        component={renderTextField}
                        label="Add Email"
                    /><br/>
                </div>
            );
        }

        let adminEmailSection = [];
        for (let i = 0; i < this.state.numAdminEmails; i++) {
            adminEmailSection.push(
                <div>
                    <Field
                        name={"adminEmail" + i}
                        component={renderTextField}
                        label="Add Email"
                    /><br/>
                </div>
            );
        }

        const candidateSection = (
            <div className="center marginTop10px">
                <div>
                    {candidateEmailSection}
                </div>
                <div className="marginTop20px">
                    <i className="font14px underline clickable whiteText"
                        onClick={this.addAnotherEmail.bind(this)}>
                        Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable whiteText"
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
            <div className="center marginTop10px">
                <div>
                    {employeeEmailSection}
                </div>
                <div className="marginTop20px">
                    <i className="font14px underline clickable whiteText"
                        onClick={this.addAnotherEmail.bind(this)}>
                        Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable whiteText"
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

        const managerSection = (
            <div className="center marginTop10px">
                <div>
                    {managerEmailSection}
                </div>
                <div className="marginTop20px">
                    <i className="font14px underline clickable whiteText"
                        onClick={this.addAnotherEmail.bind(this)}>
                        Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable whiteText"
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

        const adminSection = (
            <div className="center marginTop10px">
                <div>
                    {adminEmailSection}
                </div>
                <div className="marginTop20px">
                    <i className="font14px underline clickable whiteText"
                        onClick={this.addAnotherEmail.bind(this)}>
                        Add Another Email
                        </i>
                </div>
                <div className="center marginTop10px">
                    <i className="font14px underline clickable whiteText"
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
                    <div className="whiteText font24px font20pxUnder500 marginTop20px">
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
                            className="whiteText font24px font20pxUnder500 marginTop10px">
                            Add
                        </div>
                        <Tabs
                            style={{marginTop:"10px"}}
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
                            <Tab label="Manager" value="Manager" style={style.tab}>
                                {managerSection}
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
                    <div className="whiteText font24px font20pxUnder500 marginTop10px">
                        Finish
                    </div>
                    <div className="whiteText font16px font12pxUnder500 marginTop20px">
                        Thanks for adding users for this position. Click <b className="blueTextHome font18px">Finish</b> to
                        send emails to your candidates, employees, and/or managers with links so that they can take
                        the evaluation.
                    </div>
                    <div className="center marginTop30px">
                        <i className="font14px underline clickable whiteText"
                            onClick={this.handleScreenPrevious.bind(this)}>
                            Back
                        </i>
                        <RaisedButton
                            label="Finish"
                            onClick={this.handleSubmit.bind(this)}
                            className="raisedButtonBusinessHome marginLeft40px"
                        />
                    </div>
                </Dialog>
            )
        }

        return (
            <div>
                {body}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        postEmailInvites,
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
})(AddUserDialog);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserDialog);
