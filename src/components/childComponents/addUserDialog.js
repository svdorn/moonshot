"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {postEmployer} from '../../actions/usersActions';
import {TextField, CircularProgress, RaisedButton, FlatButton, Dialog, DropDownMenu, MenuItem, Divider } from 'material-ui';
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
            console.log(positions)
            if (Array.isArray(positions) && positions.length > 0) {
                self.setState({
                    positions,
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

    handlePositionChange = (event, index, positon) => {
        this.setState({position})
    };

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
                color: "rgba(255,255,255,.8)"
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
                <DropDownMenu value={this.state.position}
                              onChange={this.handlePositionChange}
                              labelStyle={style.menuLabelStyle}
                              anchorOrigin={style.anchorOrigin}
                              style={{fontSize: "20px", marginTop: "11px"}}
                >
                    <MenuItem value={""} primaryText="Position"/>
                    <Divider/>
                    {positionItems}
                </DropDownMenu>
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
