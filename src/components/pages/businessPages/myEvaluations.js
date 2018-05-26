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
import MetaTags from 'react-meta-tags';
import axios from 'axios';

class MyEvaluations extends Component {

    render() {
        const style = {
            separator: {
                width: "70%",
                margin: "25px auto 0px",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorText: {
                padding: "0px 40px",
                backgroundColor: "#2e2e2e",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "white"
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            }
        }

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
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myEvaluations'>
                <MetaTags>
                    <title>My Evaluations | Moonshot</title>
                    <meta name="description" content="View the evaluations your company is running."/>
                </MetaTags>
                <div className="employerHeader"/>
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                    <div style={style.separatorText}>
                        My Evalutions
                    </div>
                </div>
                <Paper className="myEvalsBox aboutMeLi" zDepth={2}>
                    <div className="aboutMeLiIconContainer">
                        <img alt="My Evals Company Logo" src={"/logos/CurateLogoWhite.png"}/>
                    </div>

                    <div className="verticalDivider"/>

                    <div className="aboutMeLiInfo" style={{display: 'inline-block'}}>
                        <b className="font18px blueTextHome">Full Stack Developer</b>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluations);
