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
import NavCircles from "../../../../../miscComponents/navCircles";
import ShiftArrow from "../../../../../miscComponents/shiftArrow";
import HoverTip from "../../../../../miscComponents/hoverTip";
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
                    root: "select-no-focus-color selectRootWhite font16px font14pxUnder500",
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
            <div style={{ paddingTop: "10px" }}>
                <div styleName="add-position-select-type">
                    <div>Select a position type:</div>
                    <div>{this.makeDropdown(this.state.positionType)}</div>
                </div>
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
                    <div className="info-hoverable">i</div>
                    <HoverTip
                        className="font10px secondary-gray"
                        sourceTriangle={false}
                        style={{ margin: "25px 10px 0 -48px" }}
                        text="Three or more people will report to this person."
                    />
                </div>
            </div>
        );
    };

    // navigate to a new frame using the nav circles
    handleNav = (frame, event) => this.setState({ frame });

    render() {
        const { frame, addPositionError, mustSelectTypeError, positionType } = this.state;

        // the values that have been entered into the form
        const formValues = this.props.formData.addPos
            ? this.props.formData.addPos.values
            : undefined;
        // if the position name has been entered
        const hasPositionName = !!formValues && !!formValues.position;

        // if the current step is complete
        const canAdvance =
            (frame === "name" && hasPositionName) || positionType !== "Position Type";
        // button should be disabled if current step is not complete
        const buttonClass = canAdvance
            ? "background-primary-cyan"
            : "disabled background-secondary-gray";

        return (
            <div>
                <form className="center">
                    {mustSelectTypeError ? (
                        <div
                            style={{
                                position: "absolute",
                                left: "50%",
                                transform: "translate(-50%, -10px)"
                            }}
                            className="secondary-red font14px"
                        >
                            Please select a position type.
                        </div>
                    ) : null}
                    {frame === "name" ? this.getNameInfo() : this.getTypeInfo()}
                    <br />
                    {addPositionError ? (
                        <div className="secondary-red font10px">{this.state.addPositionError}</div>
                    ) : null}
                    <div styleName="add-position-button-container">
                        <button
                            onClick={this.handleSubmit}
                            className={
                                "button noselect round-6px primary-white font16px " + buttonClass
                            }
                            styleName="add-position-button"
                        >
                            {frame === "type" ? "Enter" : "Next"}{" "}
                            <ShiftArrow disabled={!canAdvance} />
                        </button>
                    </div>
                </form>
                <div styleName="add-position-nav">
                    <NavCircles
                        value={this.state.frame}
                        values={["name", "type"]}
                        onNavigate={this.handleNav}
                        disabled={!hasPositionName}
                    />
                </div>
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
