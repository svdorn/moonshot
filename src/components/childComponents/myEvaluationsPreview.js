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
import { continueEval } from "../../actions/usersActions";
import axios from "axios";

class MyEvaluationsPreview extends Component {

    goTo(route) {
        console.log("route")
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    // used for candidates and employees only
    continueEval = () => {
        const currentUser = this.props.currentUser;
        this.props.continueEval(currentUser._id, currentUser.verificationToken, this.props.positionId, this.props.businessId);
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


    render() {

        let positionSkills = null;
        // TODO: hook up skills to database
        let skills = ["Sales", "Finance", "Networking"];
        // let skills = ["Sales", "Finance", "Networking"];
        // if (this.props.variation === 2) {
        //     skills = ["Python", "Javascript", "Computer Science"];
        // } else if (this.props.variation === 3) {
        //     skills = ["Networking", "Sales", "Management"];
        // }

        // variations can be edit or take
        // user is a manager or account admin
        const editing = this.props.variation === "edit"

        if (skills) {
            positionSkills = skills.map(function (skill, index) {
                let margin = "marginLeft10px";
                if (index === 0) {
                    margin = "";
                }

                if (index >= 3) {
                    return null;
                }

                return (
                    <div key={skill + "Surrounder"} style={{display: 'inline-block'}} className={margin}>
                        <div key={skill}
                             className="myEvalsSkillChip font14px font12pxUnder500"
                        >
                            {skill}
                        </div>
                    </div>
                );
            });
        }

        let infoArea = null;
        let clickableArea = null;
        let estimatedLength = null;

        if (editing) {
            clickableArea = (
                <div className="grayText font16px font14pxUnder800 marginTop10px">
                    <div className="clickable underline" style={{display: "inline-block"}}>
                        View Evaluation
                    </div>
                    <div onClick={() => this.goTo(`/myCandidates?position=${this.props.name}`)} className="clickable underline marginLeft20px" style={{display: "inline-block"}}>
                        Candidate Results
                    </div>
                    <div onClick={() => this.goTo("/myEmployees")} className="clickable underline marginLeft20px" style={{display: "inline-block"}}>
                        Grade Employees
                    </div>
                </div>
            );

            infoArea = (
                <div className="blueTextHome font16px center myEvalsInfoRight">
                    Time Allotted
                    <div className="whiteText marginBottom10px">{this.props.timeAllotted} Days</div>
                    Completions
                    <div className="whiteText marginBottom10px">{this.props.completions} Users</div>
                    In Progress
                    <div className="whiteText">{this.props.usersInProgress} Users</div>
                </div>
            );

            estimatedLength = (
                <div className="whiteText font16px font14pxUnder800 font12pxUnder400 marginTop10px marginBottom20px">Estimated Length:
                    <div className="blueTextHome" style={{display:"inline-block"}}>&nbsp;{this.props.length} mins</div>
                </div>
            );
        } else {
            if (this.props.completedDate) {
                clickableArea = (
                    <div className="grayText font16px font14pxUnder800 marginTop10px">
                        Complete
                    </div>
                )
            } else {
                clickableArea = (
                    <div className="grayText font16px font14pxUnder800 marginTop10px">
                        <div onClick={this.continueEval} className="clickable underline" style={{display: "inline-block"}}>
                            Start/Continue
                        </div>
                    </div>
                );
            }

            infoArea = (
                <div className="blueTextHome font16px center myEvalsInfoRight">
                    Assigned
                    <div className="whiteText marginBottom10px">{this.makeDatePretty(this.props.assignedDate)}</div>
                    Deadline
                    <div className="whiteText marginBottom10px">{this.makeDatePretty(this.props.deadline)}</div>
                    Completed
                    <div className="whiteText">{this.makeDatePretty(this.props.completedDate)}</div>
                </div>
            );
        }

        return(
            <div className="myEvalsBox aboutMeLi">
                <div className="aboutMeLiIconContainer">
                    <img alt="My Evals Company Logo" src={`/logos/${this.props.logo}`}/>
                </div>

                <div className="verticalDivider"/>

                <div className="myEvalsInfo" style={{display: 'inline-block'}}>
                    {infoArea}
                    <div className="font18px font16pxUnder800 blueTextHome">{this.props.name}</div>
                    <div className="grayText">{this.props.company} Evaluation</div>
                    {editing ? estimatedLength : null}
                    {editing ? positionSkills : null}
                    {clickableArea}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        continueEval
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluationsPreview);
