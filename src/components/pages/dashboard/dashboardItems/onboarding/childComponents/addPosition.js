"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form";
import {
    startLoading,
    stopLoading,
    updateStore,
    updatePositionCount
} from "../../../../../../actions/usersActions";
import { fieldsAreEmpty } from "../../../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextInput from "../../../../../userInput/textInput";
import axios from "axios";

import "../../../dashboard.css";

class AddPosition extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // type of position for adding an evaluation
            positionType: "Position Type",
            // whether the new position to add is for a manager
            newPosIsManager: false,
            // list of position Types
            positionTypes: [
                "Position Type",
                "Developer",
                "Sales",
                "Support",
                "Marketing",
                "Product"
            ],
            // if user didn't select a position type when making a new position
            mustSelectTypeError: false,
            // error adding a position
            addPositionError: undefined,
            // which frame you're on ("name" or "type")
            frame: "name"
        };
    }

    handleClickIsManager = () => {
        const newState = { ...this.state, newPosIsManager: !this.state.newPosIsManager };
        this.setState(newState);
    };

    // create the dropdown for the different positions
    makeDropdown(position) {
        const positions = this.state.positionTypes.map(pos => {
            return (
                <MenuItem value={pos} key={`position${pos}`}>
                    {pos}
                </MenuItem>
            );
        });

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite font16px font14pxUnder500",
                    icon: "selectIconWhiteImportant selectIconMarginSmallText"
                }}
                value={position}
                onChange={this.handleChangePositionType(position)}
                key={`position`}
            >
                {positions}
            </Select>
        );
    }

    handleChangePositionType = position => event => {
        const positionType = event.target.value;
        let newState = { ...this.state, positionType };
        if (positionType !== "Position Type") {
            newState.mustSelectTypeError = false;
        }
        this.setState(newState);
    };

    handleSubmit = e => {
        try {
            // TODO: if the user is signed in, add like this, if not just put the data in redux state
            // TODO: need to be able to add multiple positions
            let self = this;
            e.preventDefault();

            const vals = this.props.formData.addPos.values;

            // validate that fields are all filled out
            if (fieldsAreEmpty(vals, ["position"], this.props.touch)) return;

            // if on the name frame, go to the type frame
            if (this.state.frame !== "type") {
                return this.setState({ frame: "type" });
            }

            // if the user didn't select a position type, don't let them move on
            if (this.state.positionType === "Position Type") {
                return this.setState({ mustSelectTypeError: true });
            } else {
                this.setState({ mustSelectTypeError: false });
            }

            // get all necessary params
            const user = this.props.currentUser;
            const name = vals.position;
            const positionType = this.state.positionType;
            const isManager = this.state.newPosIsManager;

            if (user) {
                const userId = user._id;
                const businessId = user.businessInfo.businessId;
                const verificationToken = user.verificationToken;

                this.props.startLoading();

                axios
                    .post("/api/business/addEvaluation", {
                        userId,
                        verificationToken,
                        businessId,
                        positionName: name,
                        positionType,
                        isManager
                    })
                    .then(res => {
                        self.props.stopLoading();
                        self.props.updatePositionCount(1);
                    })
                    .catch(error => {
                        self.props.stopLoading();
                        self.setState({ addPositionError: "Error adding position." });
                    });
            } else {
                const position = { name, positionType, isManager };
                const onboardingPositions = this.props.onboardingPositions;

                let positions = onboardingPositions ? onboardingPositions : [];

                positions.push(position);

                this.props.updateStore("onboardingPositions", positions);
                this.props.next();
            }
        } catch (error) {
            this.props.stopLoading();
            this.setState({ addPositionError: "Error adding position." });
            return;
        }
    };

    // get the name of the position
    getNameInfo = () => {
        return (
            <div>
                <TextInput name="position" label="Position Name" placeholder="iOS Developer" />
            </div>
        );
    };

    // get the type of the position
    getTypeInfo = () => {
        return (
            <div>
                <div styleName="add-position-select-type">
                    <div>Select a position type:</div>
                    <div>{this.makeDropdown(this.state.positionType)}</div>
                </div>
                <br />
                <div styleName="add-position-ismgr">
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
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
            </div>
        );
    };

    render() {
        return (
            <div>
                <form className="center" style={{ marginTop: "-10px" }}>
                    {this.state.mustSelectTypeError ? (
                        <div className="secondary-red font10px">Must select a position type.</div>
                    ) : null}
                    {this.state.frame === "name" ? this.getNameInfo() : this.getTypeInfo()}
                    <br />
                    {this.state.addPositionError ? (
                        <div className="secondary-red font10px">{this.state.addPositionError}</div>
                    ) : null}
                    <button
                        onClick={this.handleSubmit}
                        className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700"
                        styleName="onboarding-button"
                        style={{ padding: "5px 17px" }}
                    >
                        <span>Enter &#8594;</span>
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
        loading: state.users.loadingSomething,
        userPosted: state.users.positionPosted,
        userPostedFailed: state.users.positionPostedFailed,
        png: state.users.png,
        onboardingPositions: state.users.onboardingPositions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            startLoading,
            stopLoading,
            updateStore,
            updatePositionCount
        },
        dispatch
    );
}

AddPosition = reduxForm({
    form: "addPos"
})(AddPosition);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddPosition);
