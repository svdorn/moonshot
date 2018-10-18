"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from 'redux-form';
import { addNotification, startLoading, stopLoading, updateStore } from "../../../../../../actions/usersActions";
import {  } from "../../../../../../miscFunctions";
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
import axios from 'axios';

import "../../../dashboard.css";

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

class AddPosition extends Component {
    constructor(props) {
        super(props);

        this.state = {
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
        }

        this.intercomMsg = this.intercomMsg.bind(this);
    }

    intercomMsg = () => {
        const { _id, verificationToken } = this.props.currentUser;
        // trigger intercom event
        this.props.intercomEvent('onboarding-step-4', _id, verificationToken, null);
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
        const newState = { ...this.state, newPosIsManager: !this.state.newPosIsManager }
        this.setState(newState);
    }

    handleSubmit(e, addAnotherPosition) {
        try {
            // TODO: if the user is signed in, add like this, if not just put the data in redux state
            // TODO: need to be able to add multiple positions
            let self = this;
            e.preventDefault();
            const vals = this.props.formData.addPos.values;

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
            const positionName = vals.position;
            const positionType = this.state.positionType;
            const isManager = this.state.newPosIsManager;

            if (user) {
                const userId = user._id;
                const businessId = user.businessInfo.businessId;
                const verificationToken = user.verificationToken;

                this.props.startLoading();

                axios.post("api/business/addEvaluation", {userId, verificationToken, businessId, positionName, positionType, isManager})
                .then(res => {
                    self.setState({ positionType: "Position Type", newPosIsManager: false });
                    self.props.stopLoading();
                    if (addAnotherPosition) {
                        self.props.reset();
                    } else {
                        self.propt.next();
                    }
                })
                .catch(error => {
                    self.props.stopLoading();
                    self.setState({addPositionError: "Error adding position."})
                })
            } else {
                const position = { positionName, positionType, isManager };
                console.log(position);
                const onboardingPositions = this.props.onboardingPositions;

                let positions = onboardingPositions ? onboardingPositions : [];

                positions.push(position);

                console.log("positions: ", positions);
                this.props.updateStore("onboardingPositions", positions);
                if (addAnotherPosition) {
                    console.log("here")
                    this.setState({ positionType: "Position Type", newPosIsManager: false });
                    this.props.reset();
                } else {
                    this.props.next();
                }
            }
        }

        catch (error) {
            this.props.stopLoading();
            this.setState({addPositionError: "Error adding position."})
            return;
        }
    }

    render() {
        const style = {
            separator: {
                width: "70%",
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
                fontSize: "14px",
                color: "white",
                marginTop: "3px"
            }
        }
        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

        const positionTypeItems = this.state.positionTypes.map(function (positionType, index) {
            return <MenuItem value={positionType} primaryText={positionType} key={index}/>
        });

        console.log("onboarding positions: ", this.props.onboardingPositions);

        return (
            <div>
                <form className="center" style={{marginTop:"-10px"}}>
                    {this.state.mustSelectTypeError ?
                        <div className="secondary-red font10px">Must select a position type.</div>
                        : null
                    }
                    <Field
                        name="position"
                        component={renderTextField}
                        label="Position Name"
                        validate={[required]}
                    /><br/>
                    <div className="primary-cyan font16px" style={{marginTop: "5px"}}>
                        <div style={{display:"inline-block", verticalAlign:"top"}}>Select a position type:</div>
                        <DropDownMenu value={this.state.positionType}
                                  onChange={this.handlePositionTypeChange}
                                  labelStyle={style.menuLabelStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  style={{fontSize: "14px", marginTop: "-20px"}}
                        >
                            {positionTypeItems}
                        </DropDownMenu>
                    </div><br/>
                    <div style={{margin:"-30px auto 7px"}} className="primary-white">
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
                    <button className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px font14pxUnder900 font12pxUnder500 primary-white" onClick={e => this.handleSubmit(e, true)} style={{padding: "2px 4px", marginBottom:"5px"}}>
                        Add Another Position &#8594;
                    </button>
                    {this.state.addPositionError ? <div className="secondary-red font10px">{this.state.addPositionError}</div> : null }
                    <div styleName="emoji-buttons-full">
                        <div onClick={e => this.handleSubmit(e, false)}>
                            <img
                                src={`/icons/emojis/ThumbsUp${this.props.png}`}
                            />
                            <div style={{paddingTop: "5px"}}>All set</div>
                        </div>
                        <div onClick={this.intercomMsg}>
                            <img
                                src={`/icons/emojis/Face${this.props.png}`}
                            />
                            <div style={{paddingTop: "5px"}}>More info</div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loading: state.users.loadingSomething,
        userPosted: state.users.positionPosted,
        userPostedFailed: state.users.positionPostedFailed,
        png: state.users.png,
        onboardingPositions: state.users.onboardingPositions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        startLoading,
        stopLoading,
        updateStore
    }, dispatch);
}

AddPosition = reduxForm({
    form: 'addPos',
})(AddPosition);

export default connect(mapStateToProps, mapDispatchToProps)(AddPosition);
