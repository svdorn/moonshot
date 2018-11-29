"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { reduxForm } from "redux-form";
import { updateStore } from "../../../../../../actions/usersActions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import axios from "axios";
import HoverTip from "../../../../../miscComponents/hoverTip";

import TextInput from "../../../../../userInput/textInput";

import "../../../dashboard.css";

const required = value => (value ? undefined : "This field is required.");

class AddPositionModal extends Component {
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
            // if they clicked that they want to update
            update: undefined,
            // title and role from props
            title: this.props.title,
            role: this.props.role
        };
    }

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

    handleClickIsManager = () => {
        const newState = { ...this.state, newPosIsManager: !this.state.newPosIsManager };
        this.setState(newState);
    };

    handleUpdate = () => {
        this.setState({ update: true, title: undefined, role: undefined });
    };

    handleSubmit = e => {
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
            const requiredFields = ["position"];
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
            this.setState({ addPositionError: "Error adding position." });
            return;
        }
    };

    render() {
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
                        {header}
                        {!update ? (
                            <div
                                className="inlineBlock clickable"
                                style={{ marginLeft: "10px" }}
                                onClick={this.handleUpdate}
                            >
                                <img
                                    src={"/icons/Pencil" + this.props.png}
                                    alt="Edit"
                                    height={15}
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className="font14px" style={{ margin: "5px auto 8px" }}>
                        Complete the details for this position.
                    </div>
                    {this.state.mustSelectTypeError ? (
                        <div className="secondary-red font10px">Please select a position type</div>
                    ) : null}
                    {!title || update ? (
                        <div>
                            <TextInput
                                name="position"
                                label="Position Name"
                                validate={[required]}
                                placeholder="iOS Developer"
                            />
                        </div>
                    ) : null}
                    {!role || update ? (
                        <div>
                            <div styleName="add-position-select-type-in-modal">
                                <div className="primary-cyan">Select a position type:</div>
                                <div>{this.makeDropdown(this.state.positionType)}</div>
                            </div>
                        </div>
                    ) : null}
                    <div
                        style={{ margin: "24px -30px 14px" }}
                        className="primary-white font14pxUnder400 font12pxUnder350"
                    >
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
                        <span style={{ paddingLeft: "5px" }}>Position is a manager role</span>
                        <div className="info-hoverable">i</div>
                        <HoverTip
                            className="font10px secondary-gray"
                            sourceTriangle={false}
                            style={{ margin: "25px 10px 0 -48px" }}
                            text="Three or more people will report to this person."
                        />
                    </div>
                    {this.state.addPositionError ? (
                        <div className="secondary-red font10px">{this.state.addPositionError}</div>
                    ) : null}
                    <button
                        onClick={this.handleSubmit}
                        className="button noselect round-6px background-primary-cyan primary-white font18px font16pxUnder700 font14pxUnder500 marginTop10px"
                        style={{ padding: "6px 20px" }}
                    >
                        <span>Continue</span>
                    </button>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        userPosted: state.users.positionPosted,
        userPostedFailed: state.users.positionPostedFailed,
        png: state.users.png,
        onboardingPositions: state.users.onboardingPositions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            updateStore
        },
        dispatch
    );
}

AddPositionModal = reduxForm({
    form: "addPos"
})(AddPositionModal);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddPositionModal);
