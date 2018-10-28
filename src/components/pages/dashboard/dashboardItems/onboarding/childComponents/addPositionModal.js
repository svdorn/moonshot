"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from 'redux-form';
import { updateStore } from "../../../../../../actions/usersActions";
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

class AddPositionModal extends Component {
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
            // if they clicked that they want to update
            update: undefined,
            // title and role from props
            title: this.props.title,
            role: this.props.role
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
        const newState = { ...this.state, newPosIsManager: !this.state.newPosIsManager }
        this.setState(newState);
    }

    handleUpdate = () => {
        this.setState({ update: true, title: undefined, role: undefined });
    }

    handleSubmit = (e) => {
        try {
            let self = this;
            e.preventDefault();
            if (this.state.title) {
                var vals = {};
                vals.position = this.state.title;
            } else {
                var vals = this.props.formData.addPos.values;
            }
            let positionType = this.state.positionType;
            if (this.state.role) {
                positionType = this.state.role;
            }

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
            if (positionType === "Position Type") {
                return this.setState({ mustSelectTypeError: true });
            } else {
                this.setState({ mustSelectTypeError: false });
            }

            // get all necessary params
            const name = vals.position;
            const isManager = this.state.newPosIsManager;

            const position = { name, positionType, isManager };
            const onboardingPositions = this.props.onboardingPositions;

            let positions = onboardingPositions ? onboardingPositions : [];

            positions.push(position);

            this.props.updateStore("onboardingPositions", positions);
            this.props.close();
        } catch (error) {
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
                fontSize: "16px",
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

        const { update, title, role } = this.state;

        let header = "Update Position";
        if (update) {
            header = "Update Position";
        } else if (title) {
            header = title;
        } else if (role) {
            header = role + " Position";
        }

        return (
            <div>
                <form className="center">
                    <div className="font22px font20pxUnder700 font16pxUnder500 primary-cyan">
                        { header }
                        {!update ?
                            <div className="inlineBlock clickable" style={{marginLeft: "10px"}} onClick={this.handleUpdate}>
                                <img
                                    src={"/icons/Pencil" + this.props.png}
                                    alt="Edit"
                                    height={15}
                                />
                            </div>
                            : null
                        }
                    </div>
                    <div className="font14px" style={{margin: "5px auto 8px"}}>
                        Complete the details for this position.
                    </div>
                    {this.state.mustSelectTypeError ?
                        <div className="secondary-red font10px">Must select a position type.</div>
                        : null
                    }
                    { !title || update ?
                        <div>
                            <Field
                                name="position"
                                component={renderTextField}
                                label="Position Name"
                                validate={[required]}
                            />
                        </div>
                        : null
                    }
                    { !role || update ?
                        <div>
                            <div className="primary-cyan font16px" style={{marginTop: "5px"}}>
                                <div style={{display:"inline-block", verticalAlign:"top"}}>Select a position type:</div>
                                <DropDownMenu value={this.state.positionType}
                                          onChange={this.handlePositionTypeChange}
                                          labelStyle={style.menuLabelStyle}
                                          anchorOrigin={style.anchorOrigin}
                                          style={{fontSize: "16px", marginTop: "-20px"}}
                                >
                                    {positionTypeItems}
                                </DropDownMenu>
                            </div>
                        </div>
                        : null
                    }
                    <div style={{margin:"5px auto 7px"}} className="primary-white">
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
                    {this.state.addPositionError ? <div className="secondary-red font10px">{this.state.addPositionError}</div> : null }
                    <button onClick={this.handleSubmit} className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700 font14pxUnder500 marginTop10px" styleName="onboarding-button" style={{padding: "6px 20px"}}>
                        <span>Continue</span>
                    </button>
                </form>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        userPosted: state.users.positionPosted,
        userPostedFailed: state.users.positionPostedFailed,
        png: state.users.png,
        onboardingPositions: state.users.onboardingPositions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateStore
    }, dispatch);
}

AddPositionModal = reduxForm({
    form: 'addPos',
})(AddPositionModal);

export default connect(mapStateToProps, mapDispatchToProps)(AddPositionModal);
