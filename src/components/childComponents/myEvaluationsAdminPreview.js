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
import { openAddUserModal, addNotification, updateUser } from "../../actions/usersActions";
import axios from "axios";

import "./myEvaluationsAdminPreview";

class MyEvaluationsAdminPreview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // whether the user is editing or not
            edit: false,
            // name of the position
            name: props.name
        };
    }

    edit = () => {
        this.setState({ edit: !this.state.edit })
    }

    nameChange = (e) => {
        const name = event.target.value;

        console.log("updating name: ", name);
        this.setState({ name });
    }

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
            <Button onClick={businessButtonOnClick} style={{ marginTop: "20px" }}>
                Invite Candidates
            </Button>
        );

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

        return (
            <div style={style} className={className}>
                <div className={`myEvalsBox aboutMeLi`} style={{ backgroundColor: this.props.backgroundColor, color: this.props.textColor }}>
                    <div className="aboutMeLiIconContainer">
                        <img alt="My Evals Company Logo" src={`/logos/${logo}`} />
                    </div>

                    <div className="verticalDivider" />

                    <div className="myEvalsInfo" style={{ display: "inline-block" }}>
                        {infoArea}
                        <div className="font18px font16pxUnder800" style={{ color: this.props.primaryColor }}>
                            {this.state.edit ?
                                <textarea
                                placeholder={"Enter a name"}
                                value={this.state.name}
                                onChange={e => this.nameChange(e)}
                                    />
                                :
                                <div className="inlineBlock">{this.state.name}</div>
                            }

                            <img onClick={this.edit} className="inlineBlock clickable" style={{ marginLeft: "8px" }} height={15} src={`/icons/Pencil-White${this.props.png}`} />
                            <img className="inlineBlock clickable" style={{ marginLeft: "6px" }} height={15} src={`/icons/Hide${this.props.png}`} />
                        </div>
                        <div style={{ opacity: "0.6" }}>
                            {this.props.company} Evaluation{" "}
                            <div className="inlineBlock">| {this.props.length} min</div>
                        </div>
                        {estimatedLength}
                        {clickableArea}
                        {businessButton}
                    </div>
                    <div className="myEvalsSide" style={{ backgroundColor: this.props.primaryColor }} />
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
        currentUser: state.users.currentUser,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor,
        backgroundColor: state.users.backgroundColor,
        png: state.users.png,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyEvaluationsAdminPreview);
