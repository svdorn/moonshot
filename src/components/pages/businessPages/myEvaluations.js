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
import { browserHistory } from "react-router";
import {bindActionCreators} from 'redux';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import MyEvaluationsPreview from '../../childComponents/myEvaluationsPreview';
import AddUserDialog from '../../childComponents/addUserDialog';

class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false,
            // logo of the company - doesn't apply for candidates
            logo: undefined,
            // name of the business the user works for - doesn't apply for candidates
            businessName: undefined
        }
    }

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    componentDidMount() {
        let self = this;
        const currentUser = this.props.currentUser;
        // if the user is here to go through an evaluation, get the positions
        // they are currently enrolled in
        if (["employee", "candidate"].includes(currentUser.userType)) {
            axios.get("/api/user/positions", {
                params: {
                    userId: currentUser._id,
                    verificationToken: currentUser.verificationToken
                }
            })
            .then(res => {
                self.positionsFound(res.data.positions);
            })
            .catch(error => {
                // console.log("error getting positions: ", error);
                // if (error.response) { console.log(error.response.data); }
            })
        }

        // if user is an employer, get all the positions they're evaluating for
        if (["accountAdmin", "manager"].includes(currentUser.userType)) {
            axios.get("/api/business/positions", {
                params: {
                    userId: this.props.currentUser._id,
                    verificationToken: this.props.currentUser.verificationToken
                }
            })
            .then(function (res) {
                self.positionsFound(res.data.positions, res.data.logo, res.data.businessName);
            })
            .catch(function (err) {
                // console.log("error getting positions: ", err);
                // if (err.response && err.response.data) { console.log(err.response.data); }
            });
        }
    }


    // call this after positions are found from back end
    positionsFound(positions, logo, businessName) {
        if (Array.isArray(positions) && positions.length > 0) {
            this.setState({ positions, logo, businessName });
        } else {
            this.setState({ noPositions: true });
        }
    }

    startPsychEval() {
        this.goTo("/psychometricAnalysis");
    }

    render() {
        const style = {
            separator: {
                width: "70%",
                margin: "25px auto 25px",
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

        let evaluations = (
            <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                Loading evaluations...
            </div>
        );

        if (this.state.noPositions) {
            evaluations = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    No evaluations.
                </div>
            )
        }

        // create the evaluation previews
        let key = 0;
        let self = this;

        const currentUser = this.props.currentUser;

        if (currentUser && this.state.positions.length !== 0) {
            const userType = currentUser.userType;

            evaluations = this.state.positions.map(position => {
                key++;
                // make sure position is the right type
                if (position && typeof position === "object") {
                    let attributes = {};
                    attributes.company = position.businessName;

                    // if user is manager or account admin, preview will look editable
                    if (["accountAdmin", "manager"].includes(currentUser.userType)) {
                        attributes.variation = "edit";
                        attributes.name = position.name;
                        attributes.logo = self.state.logo;
                        attributes.length = position.length;
                        attributes.skills = position.skillNames;
                        attributes.company = self.state.businessName;
                        attributes.completions = position.completions;
                        attributes.timeAllotted = position.timeAllotted;
                        attributes.usersInProgress = position.usersInProgress;
                    }

                    // otherwise the preview will look like you can take it
                    else {
                        attributes.variation = "take";
                        attributes.skills = position.skills;
                        attributes.deadline = position.deadline;
                        attributes.logo = position.businessLogo;
                        attributes.name = position.positionName;
                        attributes.company = position.businessName;
                        attributes.assignedDate = position.assignedDate;
                        attributes.completedDate = position.completedDate;
                        try {
                            attributes.businessId = position.businessId.toString();
                            attributes.positionId = position.positionId.toString();
                        } catch (attributeError) {
                            console.log(attributeError);
                        }
                    }

                    return (
                        <li style={{marginTop: '25px', listStyleType:"none"}}
                            key={key}
                        >
                            <MyEvaluationsPreview {...attributes} />
                        </li>
                    );
                }
                // if position is not the right type, don't show a position preview
                else {
                    return null;
                }
            });

        }

        console.log("evaluations: ", evaluations);

        if (currentUser && currentUser.userType == "accountAdmin" && this.state.positions.length !== 0) {
            let attributes = {};
            attributes.variation = "edit";
            attributes.name = "Web Developer";
            attributes.logo = this.state.logo;
            attributes.length = 25;
            attributes.skills = ["HTML", "Javascript"];
            attributes.company = this.state.businessName;
            attributes.completions = 0;
            attributes.timeAllotted = 30;
            attributes.usersInProgress = 0;

            evaluations.push (
                <li style={{marginTop: '25px', listStyleType:"none"}}
                    key={key}
                >
                    <div style={{filter:"blur(5px)"}}>
                        <MyEvaluationsPreview {...attributes} />
                    </div>
                    <div className="font28px font26pxUnder700 font22pxUnder500 whiteText underline clickable center addEval">
                        + Add Evaluation
                    </div>
                </li>
            );
        }

        console.log(evaluations);


        // The section for the account admin to take the psych test if they haven't already
        let accountAdminTakePsychTest = null;
        if (currentUser && currentUser.userType == "accountAdmin" && !currentUser.psychometricTest.endDate && (this.state.positions.length !== 0 || this.state.noPositions)) {
            accountAdminTakePsychTest = (
                <div className="marginBottom30px center">
                    <div className="whiteText font16px font14pxUnder800 font12pxUnder600 font10pxUnder450 inlineBlock">
                        All admins must take a 10 minute psychometric quiz. Take it here!
                    </div>
                    <div className="inlineBlock marginLeft10px">
                            <button className="veryRoundedButton smallMediumButton font16px font14pxUnder800 font12pxUnder600 font10pxUnder450 purpleToBlueAnimate whiteText" onClick={this.startPsychEval.bind(this)} style={{padding: "4px 15px"}}>
                                Quiz
                            </button>
                    </div>
                </div>
            );
        }

        return(
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myEvaluations'>
                {this.props.currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>My Evaluations | Moonshot</title>
                    <meta name="description" content="View the evaluations your company is running."/>
                </MetaTags>
                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                    <div style={style.separatorText}>
                        My Evaluations
                    </div>
                </div>
                {accountAdminTakePsychTest}
                <div className="marginBottom60px">
                    {evaluations}
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
        currentUser: state.users.currentUser,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluations);
