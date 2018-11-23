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
import { openAddUserModal, addNotification, updateUser } from "../../actions/usersActions";
import axios from "axios";

class MyEvaluationsPreview extends Component {
    // used for candidates and employees only
    continueEval = () => {
        const self = this;
        const user = this.props.currentUser;

        if (!user) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        if (["candidate", "employee"].includes(user.userType) && !this.props.completedDate) {
            // if user is verified, go right to the eval
            if (user.verified) {
                goTo(`/evaluation/${this.props.businessId}/${this.props.positionId}`);
            }
            // otherwise have to check if they have verified, and if not, tell
            // them to verify themselves
            else {
                const query = {
                    params: { userId: user._id, verificationToken: user.verificationToken }
                };
                axios
                    .get("/api/user/checkEmailVerified", query)
                    .then(response => {
                        self.props.updateUser(response.data);
                        goTo(`/evaluation/${self.props.businessId}/${self.props.positionId}`);
                    })
                    .catch(error => {
                        if (error.response && error.response.status === 403) {
                            return self.props.addNotification("Verify your email first!", "error");
                        } else {
                            return self.props.addNotification(
                                "Error starting evaluation, try refreshing.",
                                "error"
                            );
                        }
                    });
            }
        }
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

        // variations can be edit or take
        // user is a manager or account admin
        const editing = this.props.variation === "edit";

        let infoArea = null;
        let estimatedLength = null;
        let clickableArea = null;
        let businessButton = null;

        if (editing) {
            let candidateResultsOnClick = () => goTo(`/myCandidates?position=${this.props.name}`);
            let businessButtonOnClick = this.openAddUserModal.bind(this);
            let inviteEmployeesOnClick = this.openAddUserModal.bind(this);
            if (this.props.buttonsNotClickable) {
                candidateResultsOnClick = null;
                businessButtonOnClick = null;
                inviteEmployeesOnClick = null;
            }
            clickableArea = (
                <div className="secondary-gray font16px font14pxUnder800 marginTop10px">
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
                    <div className="primary-white marginBottom10px">
                        {this.props.completions} Users
                    </div>
                    In Progress
                    <div className="primary-white">{this.props.usersInProgress} Users</div>
                </div>
            );
            businessButton = (
                <div style={{ marginTop: "20px" }}>
                    <button
                        className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white"
                        onClick={businessButtonOnClick}
                        style={{ padding: "5px 17px" }}
                    >
                        {"Invite Candidates"}
                    </button>
                </div>
            );
        } else {
            if (this.props.completedDate) {
                clickableArea = (
                    <div className="secondary-gray font16px font14pxUnder800 marginTop15px">
                        You{"'"}re done! Your results are being reviewed. You can now safely exit
                        this tab.
                    </div>
                );
            } else {
                clickableArea = (
                    <div style={{ marginTop: "20px" }}>
                        <button
                            className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white"
                            style={{ padding: "5px 17px" }}
                        >
                            {this.props.startDate ? "Continue" : "Start"}
                        </button>
                    </div>
                );
            }

            estimatedLength = this.props.completedDate ? null : (
                <div className="primary-white font16px font14pxUnder800 font12pxUnder400 marginTop20px marginBottom10px">
                    Estimated Length:
                    <div className="primary-cyan" style={{ display: "inline-block" }}>
                        &nbsp;{this.props.length ? (
                            <div className="inlineBlock">{this.props.length} mins</div>
                        ) : (
                            <div className="inlineBlock">25 mins</div>
                        )}
                    </div>
                </div>
            );

            infoArea = (
                <div className="primary-cyan font16px center myEvalsInfoRight">
                    Assigned
                    <div className="primary-white marginBottom10px">
                        {this.makeDatePretty(this.props.assignedDate)}
                    </div>
                    Deadline
                    <div className="primary-white marginBottom10px">
                        {this.makeDatePretty(this.props.deadline)}
                    </div>
                    Completed
                    <div className="primary-white">
                        {this.makeDatePretty(this.props.completedDate)}
                    </div>
                </div>
            );
        }

        let positionKeyArea = null;
        if (editing && this.props.positionKey) {
            positionKeyArea = (
                <div className="primary-cyan font12px position-key">
                    Position Key: {this.props.positionKey}
                </div>
            );
        }

        const mainClass =
            ["candidate", "employee"].includes(currentUser.userType) && !this.props.completedDate
                ? "pointer"
                : "";

        const style = typeof this.props.style === "object" ? this.props.style : {};
        const className = typeof this.props.className === "string" ? this.props.className : "";

        return (
            <div style={style} className={className}>
                <div onClick={this.continueEval} className={`myEvalsBox aboutMeLi ${mainClass}`}>
                    <div className="aboutMeLiIconContainer">
                        <img alt="My Evals Company Logo" src={`/logos/${this.props.logo}`} />
                    </div>

                    <div className="verticalDivider" />

                    <div className="myEvalsInfo" style={{ display: "inline-block" }}>
                        {infoArea}
                        <div className="font18px font16pxUnder800 primary-cyan">
                            {this.props.name}
                        </div>
                        <div className="secondary-gray">
                            {this.props.company} Evaluation{" "}
                            {currentUser.userType === "accountAdmin" ? (
                                <div className="inlineBlock">| 22 min</div>
                            ) : null}
                        </div>
                        {estimatedLength}
                        {clickableArea}
                        {businessButton}
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            openAddUserModal,
            addNotification,
            updateUser
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyEvaluationsPreview);
