"use strict"
import React, {Component} from 'react';
import {
    TextField,
    DropDownMenu,
    MenuItem,
    Divider,
    Toolbar,
    ToolbarGroup,
    Dialog,
    FlatButton,
    CircularProgress,
    RaisedButton,
    Paper
} from 'material-ui';
import {connect} from 'react-redux';
import { browserHistory } from "react-router";
import {bindActionCreators} from 'redux';
import { addNotification, startLoading, stopLoading, openAddUserModal } from '../../../actions/usersActions';
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import MyEvaluationsPreview from '../../childComponents/myEvaluationsPreview';
import AddUserDialog from '../../childComponents/addUserDialog';
import CreatingEvalProgress from '../../miscComponents/creatingEvalProgress';
import { goTo } from '../../../miscFunctions';

const required = value => (value ? undefined : 'This field is required.');

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

class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false,
            // logo of the company - doesn't apply for candidates
            logo: undefined,
            // name of the business the user works for - doesn't apply for candidates
            businessName: undefined,
            // type of position for adding an evaluation
            positionType: "Position Type",
            // whether the new position to add is for a manager
            newPosIsManager: false,
            // list of position Types
            positionTypes: ["Position Type", "Developer", "Sales", "Support", "Marketing", "Product"],
            // if user didn't select a position type when making a new position
            mustSelectTypeError: false,
            // error adding a position
            addPositionError: undefined,
            open: false,
            screen: 1
        }
    }

    handleOpen = () => { this.setState({ open: true }); };


    handleClose = () => {
        this.setState({
            open: false,
            screen: 1,
            addPositionError: undefined,
            mustSelectTypeError: false
        });
    };

    handleNextScreen = () => {
        const screen = this.state.screen + 1;
        if (screen > 0 && screen < 3) {
            this.setState({screen})
        }
    }

    handlePositionTypeChange = (event, index) => {
        const positionType = this.state.positionTypes[index];
        let newState = { ...this.state, positionType };
        if (positionType !== "Position Type") {
            newState.mustSelectTypeError = false;
        }
        this.setState(newState);
    };

    handleClickIsManager = () => {
        this.setState({ newPosIsManager: !this.state.newPosIsManager });
    }

    handleSubmit(e) {
        try {
            let self = this;
            e.preventDefault();
            const vals = this.props.formData.addEval.values;

            // Form validation before submit
            let notValid = false;
            const requiredFields = [ 'position' ];
            requiredFields.forEach(field => {
                if (!vals || !vals[field]) {
                    this.props.touch(field);
                    notValid = true;
                }
            });
            if (notValid) return;

            // if the user didn't select a position type, don't let them move on
            if (this.state.positionType === "Position Type") {
                return this.setState({ mustSelectTypeError: true });
            } else {
                this.setState({ mustSelectTypeError: false });
            }

            // get all necessary params
            const user = this.props.currentUser;
            const userId = user._id;
            const businessId = user.businessInfo.businessId;
            const verificationToken = user.verificationToken;
            const positionName = vals.position;
            const positionType = this.state.positionType;
            const isManager = this.state.newPosIsManager;

            this.props.startLoading();

            axios.post("api/business/addEvaluation", {userId, verificationToken, businessId, positionName, positionType, isManager})
            .then(res => {
                self.setState({ positionType: "Position Type", newPosIsManager: false });
                self.positionsUpdate(res.data);
                self.handleNextScreen();
                self.props.stopLoading();
                self.props.reset();
            })
            .catch(error => {
                self.props.stopLoading();
                self.setState({addPositionError: "Error adding position."})
            })
        }

        catch (error) {
            this.props.stopLoading();
            this.setState({addPositionError: "Error adding position."})
            return;
        }
    }

    componentDidMount() {
        if (this.props.location.query && this.props.location.query.open) {
            this.setState({open: true});
        }
        let self = this;
        const currentUser = this.props.currentUser;
        // if the user is here to go through an evaluation, get the positions
        // they are currently enrolled in
        if (["employee", "candidate"].includes(currentUser.userType)) {
            axios.get("/api/user/positions", {
                params: {
                    userId: currentUser._id,
                    verificationToken: currentUser.verificationToken
                }
            })
            .then(res => {
                self.positionsFound(res.data.positions);
            })
            .catch(error => {
                // console.log("error getting positions: ", error);
                // if (error.response) { console.log(error.response.data); }
            })
        }

        // if user is an employer, get all the positions they're evaluating for
        if (["accountAdmin", "manager"].includes(currentUser.userType)) {
            axios.get("/api/business/positions", {
                params: {
                    userId: this.props.currentUser._id,
                    verificationToken: this.props.currentUser.verificationToken
                }
            })
            .then(function (res) {
                self.positionsFound(res.data.positions, res.data.logo, res.data.businessName);
            })
            .catch(function (err) {
                // console.log("error getting positions: ", err);
                // if (err.response && err.response.data) { console.log(err.response.data); }
            });
        }
    }

    // call this after positions are found from back end
    positionsFound(positions, logo, businessName) {
        if (Array.isArray(positions) && positions.length > 0) {
            this.setState({ positions, logo, businessName });
        } else {
            this.setState({ noPositions: true });
        }
    }

    positionsUpdate(positions) {
        if (Array.isArray(positions) && positions.length > 0) {
            // add the position to the end of the list
            let position = positions[positions.length-1];
            let newPositions = this.state.positions;
            position.completions = 0;
            position.usersInProgress = 0;
            newPositions.push(position);
            this.setState({ positions: newPositions });
        } else {
            this.setState({ noPositions: true });
        }
    }

    inviteCandidates() {
        let self = this;
        this.setState({
            open: false
        }, () => {
            self.props.openAddUserModal();
        });
    }

    startPsychEval() {
        goTo("/psychometricAnalysis");
    }

    render() {
        const style = {
            separator: {
                width: "70%",
                margin: "25px auto 0",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorText: {
                padding: "0px 40px",
                backgroundColor: "#2e2e2e",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "white"
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {

                fontSize: "18px",
                color: "white"
            }
        }

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

        let evaluations = (
            <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                Loading evaluations...
            </div>
        );

        if (this.state.noPositions) {
            evaluations = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    No evaluations.
                </div>
            )
        }

        // create the evaluation previews
        let key = 0;
        let self = this;

        const currentUser = this.props.currentUser;

        if (currentUser && this.state.positions.length !== 0) {
            const userType = currentUser.userType;

            evaluations = this.state.positions.map(position => {
                key++;
                // make sure position is the right type
                if (position && typeof position === "object") {
                    let attributes = {};
                    attributes.company = position.businessName;

                    // if user is manager or account admin, preview will look editable
                    if (["accountAdmin", "manager"].includes(currentUser.userType)) {
                        attributes.variation = "edit";
                        attributes.name = position.name;
                        attributes.finalized = position.finalized;
                        attributes.logo = self.state.logo;
                        attributes.length = position.length;
                        attributes.positionKey = position._id;
                        attributes.skills = position.skillNames;
                        attributes.company = self.state.businessName;
                        attributes.completions = position.completions;
                        attributes.timeAllotted = position.timeAllotted;
                        attributes.usersInProgress = position.usersInProgress;
                    }

                    // otherwise the preview will look like you can take it
                    else {
                        try {
                            attributes.variation = "take";
                            attributes.skills = position.skills;
                            attributes.deadline = position.deadline;
                            attributes.logo = position.businessLogo;
                            attributes.name = position.positionName;
                            attributes.length = position.length;
                            attributes.company = position.businessName;
                            attributes.length = position.length;
                            attributes.assignedDate = position.assignedDate;
                            attributes.startDate = position.startDate;
                            attributes.completedDate = position.completedDate;
                            attributes.businessId = position.businessId.toString();
                            attributes.positionId = position.positionId.toString();
                        } catch (attributeError) {
                            this.props.addNotification("Something went wrong, try reloading.", "error");
                            return "";
                        }
                    }

                    return (
                        <li style={{marginTop: '35px', listStyleType:"none"}}
                            key={key}
                        >
                            <MyEvaluationsPreview {...attributes} />
                        </li>
                    );
                }
                // if position is not the right type, don't show a position preview
                else {
                    return null;
                }
            });

        }

        if (currentUser && currentUser.userType == "accountAdmin" && this.state.positions.length !== 0) {
            let attributes = {};
            attributes.variation = "edit";
            attributes.name = "Web Developer";
            attributes.logo = this.state.logo;
            attributes.length = 25;
            attributes.skills = ["HTML", "Javascript"];
            attributes.company = this.state.businessName;
            attributes.completions = 0;
            attributes.timeAllotted = 30;
            attributes.usersInProgress = 0;
            key++;

            evaluations.push (
                <li style={{marginTop: '35px', listStyleType:"none"}}
                    key={key}
                >
                    <div style={{filter:"blur(5px)"}}>
                        <MyEvaluationsPreview {...attributes} />
                    </div>
                    <div className="font28px font26pxUnder700 font22pxUnder500 secondary-gray underline clickable center addEval" onClick={this.handleOpen}>
                        + Add Evaluation
                    </div>
                </li>
            );
        }

        const positionTypeItems = this.state.positionTypes.map(function (positionType, index) {
            return <MenuItem value={positionType} primaryText={positionType} key={index}/>
        });

        // Dialog for adding evaluation
        const screen = this.state.screen;
        let dialogBody = <div></div>;
        if (screen === 1) {
            dialogBody = (
                <form onSubmit={this.handleSubmit.bind(this)} className="center">
                    {this.state.mustSelectTypeError ?
                        <div className="secondary-red" style={{marginBottom:"-23px"}}>Must select a position type.</div>
                        : null
                    }
                    <div className="primary-cyan font28px font24pxUnder700 font20pxUnder500 marginTop40px">
                        Add Evaluation
                    </div>
                    <div className="primary-white font16px font14pxUnder700 marginTop10px marginBottom10px">
                        Enter the details of your new position.
                    </div>
                    <Field
                        name="position"
                        component={renderTextField}
                        label="Position Name"
                        validate={[required]}
                    /><br/>
                    <div className="primary-cyan font16px marginTop10px">
                        <div style={{display:"inline-block", marginTop:"16px", verticalAlign:"top"}}>Select a position type:</div>
                        <DropDownMenu value={this.state.positionType}
                                  onChange={this.handlePositionTypeChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "16px"}}
                        >
                            {positionTypeItems}
                        </DropDownMenu>
                    </div><br/>
                    <div style={{margin:"-20px auto 10px"}} className="primary-white">
                        <div className="checkbox smallCheckbox whiteCheckbox"
                             onClick={this.handleClickIsManager.bind(this)}
                        >
                            <img
                                alt=""
                                className={"checkMark" + this.state.newPosIsManager}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        {"Position is a manager role"}
                    </div>
                    <RaisedButton
                        label="Continue"
                        type="submit"
                        className="raisedButtonBusinessHome marginTop10px"
                        /><br/>
                    {this.state.addPositionError ? <div className="secondary-red font16px marginTop10px">{this.state.addPositionError}</div> : null }
                    {this.props.loading ? <CircularProgress color="white" style={{marginTop: "8px"}}/> : null}
                </form>
            );
        } else if (screen === 2) {
                    dialogBody = (
                        <div>
                            <div className="primary-cyan font28px font24pxUnder700 font20pxUnder500" style={{width:"90%", margin:"30px auto"}}>
                                Evaluation Added
                            </div>
                            <div className="primary-white-important font16px font14pxUnder700 font12pxUnder400" style={{width:"90%", margin:"10px auto 0"}}>
                                Thanks for adding an evaluation, begin inviting candidates here:
                                <div className="marginTop20px">
                                        <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white" onClick={this.inviteCandidates.bind(this)} style={{padding: "5px 17px"}}>
                                            {"Invite Candidates"}
                                        </button>
                                </div>
                            </div>
                        </div>
                    );
        }

        const dialog = (
            <Dialog
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                {dialogBody}
            </Dialog>
        );

        return(
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myEvaluations'>
                {this.props.currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>My Evaluations | Moonshot</title>
                    <meta name="description" content="View the evaluations your company is running."/>
                </MetaTags>
                {dialog}
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                </div>
                <div className="center" style={{margin: "-42px auto 20px"}}>
                    <div style={style.separatorText}>
                        My Evaluations
                    </div>
                </div>
                <div className="marginBottom60px">
                    {evaluations}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        startLoading,
        stopLoading,
        openAddUserModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png
    };
}

MyEvaluations = reduxForm({
    form: 'addEval',
})(MyEvaluations);

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluations);
