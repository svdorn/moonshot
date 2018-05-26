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
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import axios from 'axios';

class MyEvaluationsPreview extends Component {

    render() {

        let positionSkills = null;
        const skills = ["Python", "Javascript", "Machine Learning"];
        if (skills) {
            positionSkills = skills.map(function (skill, index) {
                let margin = "marginLeft10px";
                if (index === 0) {
                    margin = "";
                }

                if (index >= 4) {
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
            <Paper className="myEvalsBox aboutMeLi" zDepth={2}>
                <div className="aboutMeLiIconContainer">
                    <img alt="My Evals Company Logo" src={"/logos/CurateLogoWhite.png"}/>
                </div>

                <div className="verticalDivider"/>

                <div className="aboutMeLiInfo" style={{display: 'inline-block'}}>
                    <b className="font18px blueTextHome">Full Stack Developer</b>
                    <b style={{float:"right"}} className="blueTextHome font16px center">
                        Time Allotted
                        <div className="whiteText marginBottom10px">30 Days</div>
                        Completions
                        <div className="whiteText marginBottom10px">114 Users</div>
                        In Progress
                        <div className="whiteText">34 Users</div>
                    </b>
                    <br/>
                    <p className="grayText">Curate Evaluation</p>
                    <p className="whiteText">Estimated Length: <b className="blueTextHome">45 mins</b></p>
                    {positionSkills}
                    <div className="grayText font14px font12pxUnder500 marginTop10px">
                        <div className="clickable underline" style={{display: "inline-block"}}>
                            View Evaluation
                        </div>
                        <div className="clickable underline marginLeft20px" style={{display: "inline-block"}}>
                            See Results
                        </div>
                    </div>
                </div>
            </Paper>
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
