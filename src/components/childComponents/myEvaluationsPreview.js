"use strict"
import React, {Component} from 'react';
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
import {browserHistory} from 'react-router';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import axios from 'axios';

class MyEvaluationsPreview extends Component {

    goTo(route) {
        console.log("route")
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {

        let positionSkills = null;
        // TODO: hook up skills to database
        let skills = ["Sales", "Finance", "Networking"];
        if (this.props.variation === 2) {
            skills = ["Python", "Javascript", "Computer Science"];
        } else if (this.props.variation === 3) {
            skills = ["Networking", "Sales", "Management"];
        }
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

        return(
            <div className="myEvalsBox aboutMeLi">
                <div className="aboutMeLiIconContainer">
                    <img alt="My Evals Company Logo" src={this.props.logo}/>
                </div>

                <div className="verticalDivider"/>

                <div className="myEvalsInfo" style={{display: 'inline-block'}}>
                    <div className="blueTextHome font16px center myEvalsInfoRight">
                        Time Allotted
                        <div className="whiteText marginBottom10px">{this.props.timeAllotted} Days</div>
                        Completions
                        <div className="whiteText marginBottom10px">{this.props.completions} Users</div>
                        In Progress
                        <div className="whiteText">{this.props.usersInProgress} Users</div>
                    </div>
                    <div className="font18px font16pxUnder800 blueTextHome">{this.props.name}</div>
                    <div className="grayText">{this.props.company} Evaluation</div>
                    <div className="whiteText font16px font14pxUnder800 font12pxUnder400 marginTop10px marginBottom20px">Estimated Length:
                        <div className="blueTextHome" style={{display:"inline-block"}}>&nbsp;{this.props.length} mins</div>
                    </div>
                    {positionSkills}
                    <div className="grayText font16px font14pxUnder800 marginTop10px">
                        <div className="clickable underline" style={{display: "inline-block"}}>
                            View Evaluation
                        </div>
                        <div className="clickable underline marginLeft20px" style={{display: "inline-block"}} onClick={this.goTo("/myCandidates")}>
                            See Results
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluationsPreview);
