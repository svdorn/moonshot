"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postEmployer} from '../../actions/usersActions';
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
            screen: 1,
            positions: [],
            position: "",
            // true if the business has no positions associated with it
            noPositions: false,
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

    handlePositionChange = (event, index) => {
        const position = this.state.positions[index].name;
        this.setState({position})
    };

    handleScreenNext() {
        const screen = this.state.screen + 1;
        if (sceen >= 1 && screen <= 3) {
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
        })


        return (
            <div>
            {this.state.screen === 1 ?
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
                :
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
                            className="whiteText font24px font20pxUnder500 marginTop10px">
                            Add
                        </div>
                        <Tabs
                            style={{marginTop:"10px"}}
                            inkBarStyle={{background: 'white'}}
                            className="addUserTabs"
                        >
                            <Tab label="Candidate" style={style.tab}>
                            <div className="center">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                            <RaisedButton
                                label="Next"
                                onClick={this.handleScreenNext.bind(this)}
                                className="raisedButtonBusinessHome"
                                style={{marginTop: '20px'}}
                            />
                            </div>
                            </Tab>
                            <Tab label="Employee" style={style.tab}>
                            <div className="center">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                            <RaisedButton
                                label="Next"
                                onClick={this.handleScreenNext.bind(this)}
                                className="raisedButtonBusinessHome"
                                style={{marginTop: '20px'}}
                            />
                            </div>
                            </Tab>
                            <Tab label="Manager" style={style.tab}>
                            <div className="center">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                            <RaisedButton
                                label="Next"
                                onClick={this.handleScreenNext.bind(this)}
                                className="raisedButtonBusinessHome"
                                style={{marginTop: '20px'}}
                            />
                            </div>
                            </Tab>
                            <Tab label="Admin" style={style.tab}>
                            <div className="center">
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Email"
                            /><br/>
                            <RaisedButton
                                label="Next"
                                onClick={this.handleScreenNext.bind(this)}
                                className="raisedButtonBusinessHome"
                                style={{marginTop: '20px'}}
                            />
                            </div>
                            </Tab>
                        </Tabs>
                    </form>
                </Dialog>
            }
            </div>
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
