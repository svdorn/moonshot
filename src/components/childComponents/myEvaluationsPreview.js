"use strict"
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
} from 'material-ui';
import { browserHistory } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { goTo } from "../../miscFunctions";
import { openAddUserModal } from "../../actions/usersActions";
import axios from "axios";

class MyEvaluationsPreview extends Component {

    // used for candidates and employees only
    continueEval = () => {
        if (["candidate", "employee"].includes(this.props.currentUser.userType) && !this.props.completedDate) {
            goTo(`/evaluation/${this.props.businessId}/${this.props.positionId}`);
        }
    }


    makeDatePretty(dateObjString) {
        if (typeof dateObjString === "string" && dateObjString.length >= 10) {
            const year = dateObjString.substring(0, 4);
            let month = dateObjString.substring(5, 7);
            let date = dateObjString.substring(8, 10);
            // get rid of leading 0s
            if (month.charAt(0) === "0") { month = month.charAt(1); }
            if (date.charAt(0) === "0") { date = date.charAt(1); }
            return `${month}/${date}/${year}`;
        } else {
            return "N/A";
        }
    }

    openAddUserModal() {
        this.props.openAddUserModal();
    }


    render() {
        // variations can be edit or take
        // user is a manager or account admin
        const editing = this.props.variation === "edit"

        let infoArea = null;
        let estimatedLength = null;
        let clickableArea = null;
        let businessButton = null;

        if (editing) {
            clickableArea = (
                <div className="secondary-gray font16px font14pxUnder800 marginTop10px">
                    <div>
                        <div onClick={() => goTo(`/myCandidates?position=${this.props.name}`)} className="underline clickable" style={{display: "inline-block"}}>
                            Candidate Results
                        </div>
                        <div onClick={() => goTo(`/myEmployees?position=${this.props.name}`)} className="underline marginLeft20px clickable" style={{display: "inline-block"}}>
                            Grade Employees
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
            businessButton = (
                <div style={{marginTop: "20px"}}>
                        <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white" onClick={this.openAddUserModal.bind(this)} style={{padding: "5px 17px"}}>
                            {"Invite Candidates"}
                        </button>
                </div>
            );
        } else {
            if (this.props.completedDate) {
                clickableArea = (
                    <div className="secondary-gray font16px font14pxUnder800 marginTop15px">
                        Complete - your results are being reviewed
                    </div>
                )
            } else {
                clickableArea = (
                    <div style={{marginTop: "20px"}}>
                            <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white" style={{padding: "5px 17px"}}>
                                {this.props.startDate ? "Continue" : "Start"}
                            </button>
                    </div>
                );
            }

            estimatedLength = this.props.completedDate ? null : (
                <div className="primary-white font16px font14pxUnder800 font12pxUnder400 marginTop20px marginBottom10px">Estimated Length:
                    <div className="primary-cyan" style={{display:"inline-block"}}>&nbsp;{this.props.length ? <div className="inlineBlock">{this.props.length} mins</div>:<div className="inlineBlock">25 mins</div>}</div>
                </div>
            );

            infoArea = (
                <div className="primary-cyan font16px center myEvalsInfoRight">
                    Assigned
                    <div className="primary-white marginBottom10px">{this.makeDatePretty(this.props.assignedDate)}</div>
                    Deadline
                    <div className="primary-white marginBottom10px">{this.makeDatePretty(this.props.deadline)}</div>
                    Completed
                    <div className="primary-white">{this.makeDatePretty(this.props.completedDate)}</div>
                </div>
            );
        }

        let positionKeyArea = null;
        if (editing && this.props.positionKey) {
            positionKeyArea = (
                <div className="primary-cyan font12px position-key">
                    Position Key: { this.props.positionKey }
                </div>
            );
        }

        const mainClass = (["candidate", "employee"].includes(this.props.currentUser.userType) && !this.props.completedDate) ? "pointer" : "";

        return(
            <div>
                <div onClick={this.continueEval} className={`myEvalsBox aboutMeLi ${mainClass}`} >
                    <div className="aboutMeLiIconContainer">
                        <img alt="My Evals Company Logo" src={`/logos/${this.props.logo}`}/>
                    </div>

                    <div className="verticalDivider"/>

                    <div className="myEvalsInfo" style={{display: 'inline-block'}}>
                        { infoArea }
                        <div className="font18px font16pxUnder800 primary-cyan">{this.props.name}</div>
                        <div className="secondary-gray">{this.props.company} Evaluation</div>
                        { estimatedLength }
                        { clickableArea }
                        { businessButton }
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        openAddUserModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluationsPreview);
