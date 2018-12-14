"use strict";
import React, { Component } from "react";
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
    Paper
} from "material-ui";
import { browserHistory } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { goTo } from "../../miscFunctions";
import HoverTip from "../miscComponents/hoverTip";
import { Button } from "../miscComponents";
import {
    openAddUserModal,
    generalAction,
    addNotification,
    updateStore,
    updateUser,
    updateEvaluationActive,
    openDeleteEvalModal,
    updateEvaluationName
} from "../../actions/usersActions";
import axios from "axios";

import "./myEvaluationsAdminPreview.css";

class MyEvaluationsAdminPreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // whether the user is editing or not
            edit: false,
            // name of the position
            name: props.name,
            // whether the position is active or not
            inactive: props.inactive
        };
    }

    edit = () => {
        if (this.state.edit) {
            // changing back to original name
            name = this.props.name;
            this.setState({ edit: false, name: this.props.name });
        } else {
            this.setState({ edit: true });
        }
    };

    saveChanges = () => {
        const { currentUser } = this.props;
        // save the new name to db
        this.props.updateEvaluationName(
            currentUser._id,
            currentUser.verificationToken,
            currentUser.businessInfo.businessId,
            this.props.id,
            this.state.name
        );
        // close edit
        this.setState({ edit: false });
    };

    deleteEval = () => {
        this.props.openDeleteEvalModal(this.state.name, this.props.id);
        this.props.updateStore("blurMenu", false);
    };

    updateActive = () => {
        const { currentUser } = this.props;

        this.props.updateEvaluationActive(
            currentUser._id,
            currentUser.verificationToken,
            currentUser.businessInfo.businessId,
            this.props.id
        );

        this.setState({ inactive: !this.state.inactive });
    };

    nameChange = event => {
        const name = event.target.value;

        this.setState({ name });
    };

    makeDatePretty(dateObjString) {
        if (typeof dateObjString === "string" && dateObjString.length >= 10) {
            const year = dateObjString.substring(0, 4);
            let month = dateObjString.substring(5, 7);
            let date = dateObjString.substring(8, 10);
            // get rid of leading 0s
            if (month.charAt(0) === "0") {
                month = month.charAt(1);
            }
            if (date.charAt(0) === "0") {
                date = date.charAt(1);
            }
            return `${month}/${date}/${year}`;
        } else {
            return "N/A";
        }
    }

    openAddUserModal() {
        this.props.openAddUserModal();
    }

    render() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return null;
        }

        let infoArea = null;
        let estimatedLength = null;
        let clickableArea = null;
        let businessButton = null;
        let blurClickableArea = "";

        let candidateResultsOnClick = () => goTo(`/myCandidates?position=${this.props.name}`);
        let businessButtonOnClick = this.openAddUserModal.bind(this);
        let inviteEmployeesOnClick = this.openAddUserModal.bind(this);
        if (this.props.buttonsNotClickable || this.state.edit) {
            candidateResultsOnClick = null;
            businessButtonOnClick = null;
            inviteEmployeesOnClick = null;
            blurClickableArea = "blurClickableArea";
        }
        clickableArea = (
            <div
                className="secondary-gray font16px font14pxUnder800 marginTop10px"
                styleName={blurClickableArea}
            >
                <div>
                    <div
                        onClick={candidateResultsOnClick}
                        className="underline clickable"
                        style={{ display: "inline-block" }}
                    >
                        Candidate Results
                    </div>
                    <div
                        onClick={inviteEmployeesOnClick}
                        className="underline marginLeft20px clickable"
                        style={{ display: "inline-block" }}
                    >
                        Invite Employees
                        <div className="info-hoverable">i</div>
                        <HoverTip
                            className="font10px secondary-gray"
                            style={{ marginTop: "18px", marginLeft: "-6px" }}
                            text="Employees complete a 22-minute evaluation and their manager completes a two-minute evaluation of the employee to customize predictions."
                        />
                    </div>
                </div>
            </div>
        );

        infoArea = (
            <div className="primary-cyan font16px center myEvalsInfoRight marginTop15px">
                Completions
                <div className="primary-white marginBottom10px">{this.props.completions} Users</div>
                In Progress
                <div className="primary-white">{this.props.usersInProgress} Users</div>
            </div>
        );

        if (this.state.edit) {
            businessButton = (
                <div style={{ marginTop: "20px" }}>
                    <Button onClick={this.saveChanges} style={{ display: "inlineBlock" }}>
                        Save Changes
                    </Button>
                    <div
                        onClick={this.deleteEval}
                        className="marginLeft20px inlineBlock clickable underline font16px font14pxUnder700"
                        style={{ color: "#fd3a57" }}
                    >
                        Delete Evaluation
                    </div>
                </div>
            );
        } else {
            businessButton = (
                <Button onClick={businessButtonOnClick} style={{ marginTop: "20px" }}>
                    Invite Candidates
                </Button>
            );
        }

        let positionKeyArea = null;
        if (this.props.positionKey) {
            positionKeyArea = (
                <div className="primary-cyan font12px position-key">
                    Position Key: {this.props.positionKey}
                </div>
            );
        }

        const style = typeof this.props.style === "object" ? this.props.style : {};
        const className = typeof this.props.className === "string" ? this.props.className : "";

        let logo = this.props.logo;
        if (this.props.textColor === "#000000") {
            logo = "hr-Black.png";
        }

        const edit = this.state.edit ? "edit" : "";
        const eyeImg = !this.state.inactive ? "Show" : "Hide";

        return (
            <div style={style} className={className}>
                <div
                    className={`myEvalsBox aboutMeLi`}
                    style={{
                        backgroundColor: this.props.backgroundColor,
                        color: this.props.textColor
                    }}
                >
                    <div className="aboutMeLiIconContainer">
                        <img alt="My Evals Company Logo" src={`/logos/${logo}`} />
                    </div>

                    <div className="verticalDivider" />

                    <div className="myEvalsInfo" style={{ display: "inline-block" }}>
                        {infoArea}
                        <div
                            styleName={"header " + edit}
                            className="font18px font16pxUnder800"
                            style={{ color: this.props.primaryColor }}
                        >
                            {this.state.edit ? (
                                <textarea
                                    placeholder={"Enter a name"}
                                    value={this.state.name}
                                    onChange={e => this.nameChange(e)}
                                />
                            ) : (
                                <div>{this.state.name}</div>
                            )}

                            <div>
                                <div>
                                    <img
                                        onClick={this.edit}
                                        style={{ marginLeft: "8px" }}
                                        height={15}
                                        src={`/icons/Pencil-White${this.props.png}`}
                                    />
                                </div>
                                <HoverTip
                                    className="font12px secondary-gray"
                                    style={{ marginTop: "5px", marginLeft: "14px" }}
                                    text="Edit this evaluation."
                                />
                            </div>
                            <div>
                                <div>
                                    <img
                                        onClick={this.updateActive}
                                        style={{ marginLeft: "8px" }}
                                        height={15}
                                        src={`/icons/${eyeImg}${this.props.png}`}
                                    />
                                </div>
                                <HoverTip
                                    className="font12px secondary-gray"
                                    style={{ marginTop: "5px", marginLeft: "18px" }}
                                    text="Hide this evaluation on your candidate invite page."
                                />
                            </div>
                        </div>
                        <div style={{ opacity: "0.6" }}>
                            {this.props.company} Evaluation{" "}
                            <div className="inlineBlock">| {this.props.length} min</div>
                        </div>
                        {estimatedLength}
                        {clickableArea}
                        {businessButton}
                    </div>
                    <div
                        className="myEvalsSide"
                        style={{ backgroundColor: this.props.primaryColor }}
                    />
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            openAddUserModal,
            generalAction,
            addNotification,
            updateUser,
            updateEvaluationActive,
            openDeleteEvalModal,
            updateStore,
            updateEvaluationName
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor,
        backgroundColor: state.users.backgroundColor,
        png: state.users.png
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyEvaluationsAdminPreview);
