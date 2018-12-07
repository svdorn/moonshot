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
    RaisedButton,
    Paper
} from "material-ui";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import {
    addNotification,
    startLoading,
    stopLoading,
    updateUser
} from "../../../actions/usersActions";
import MetaTags from "react-meta-tags";
import axios from "axios";
import MyEvaluationsPreview from "../../childComponents/myEvaluationsPreview";
import { Button } from "../../miscComponents";
import { goTo } from "../../../miscFunctions";

import "./candidateEvaluations.css";

class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: []
        };
    }

    componentDidMount() {
        let self = this;
        const { currentUser } = this.props;
        if (currentUser) {
            // if the user is here to go through an evaluation, get the positions
            // they are currently enrolled in
            axios
                .get("/api/user/positions", {
                    params: {
                        userId: currentUser._id,
                        verificationToken: currentUser.verificationToken
                    }
                })
                .then(res => {
                    self.positionsFound(res.data.positions);
                })
                .catch(error => {
                    console.log("error getting positions: ", error);
                    self.props.addNotification(
                        "Error getting evaluations, try refreshing.",
                        "error"
                    );
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

    reSendVerification() {
        const { currentUser } = this.props;
        if (currentUser) {
            const { _id: userId, verificationToken, email } = currentUser;
            axios
                .post("/api/user/reSendVerificationEmail", { userId, verificationToken })
                .then(response => {
                    if (response.data.alreadyVerified) {
                        if (response.data.user) {
                            this.props.updateUser(response.data.user);
                        }
                        this.props.addNotification(
                            "Email already verified, take your evaluation whenever you're ready!",
                            "info"
                        );
                    } else if (response.data.emailSent) {
                        const usedEmail = response.data.email ? response.data.email : email;
                        this.props.addNotification(
                            `Email sent to ${usedEmail} - if this is the wrong email, change it in Settings.`,
                            "info"
                        );
                    }
                })
                .catch(error => {
                    this.props.addNotification(
                        "Error sending verification email, try refreshing the page.",
                        "error"
                    );
                    console.log(error);
                });
        } else {
            this.props.addNotification("You aren't logged in! Try refreshing the page.", "error");
        }
    }

    render() {
        const style = {
            separator: {
                width: "70%",
                margin: "25px auto 0",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorText: {
                padding: "0px 40px",
                backgroundColor: this.props.backgroundColor,
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: this.props.primaryColor
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: this.props.primaryColor,
                position: "absolute",
                top: "12px"
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {
                fontSize: "18px",
                color: this.props.primaryColor
            }
        };

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />
        ];

        let evaluations = (
            <div className="center" style={{ color: this.props.primaryColor }}>
                Loading evaluations...
            </div>
        );

        if (this.state.noPositions) {
            evaluations = (
                <div className="center" style={{ color: this.props.primaryColor }}>
                    No evaluations.
                </div>
            );
        }

        // create the evaluation previews
        let key = 0;
        let self = this;

        const { currentUser } = this.props;

        if (currentUser && this.state.positions.length !== 0) {
            const userType = currentUser.userType;

            evaluations = this.state.positions.map(position => {
                key++;
                // make sure position is the right type
                if (position && typeof position === "object") {
                    let attributes = {};

                    try {
                        attributes.company = position.businessName;
                        attributes.variation = "take";
                        attributes.skills = position.skills;
                        attributes.deadline = position.deadline;
                        attributes.logo = position.businessLogo;
                        attributes.name = position.positionName;
                        attributes.length = position.length;
                        attributes.company = position.businessName;
                        attributes.length = position.length;
                        attributes.assignedDate = position.assignedDate;
                        attributes.startDate = position.startDate;
                        attributes.completedDate = position.completedDate;
                        attributes.businessId = position.businessId.toString();
                        attributes.positionId = position.positionId.toString();
                    } catch (attributeError) {
                        this.props.addNotification("Something went wrong, try reloading.", "error");
                        return "";
                    }

                    return (
                        <li style={{ marginTop: "35px", listStyleType: "none" }} key={key}>
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

        let verifyBanner = null;
        if (currentUser && !currentUser.verified) {
            verifyBanner = (
                <div styleName="unverified-email-banner">
                    A verification email was sent to {currentUser.email} - verify it to take your
                    evaluation!
                    <br />
                    <span className="primary-cyan clickable" onClick={() => goTo("/settings")}>
                        Change email address
                    </span>
                    {" or "}
                    <span
                        className="primary-cyan clickable"
                        onClick={this.reSendVerification.bind(this)}
                    >
                        Re-send verification email
                    </span>
                </div>
            );
        }

        return (
            <div
                className="jsxWrapper fillScreen"
                style={{ paddingBottom: "20px" }}
                ref="myEvaluations"
            >
                <MetaTags>
                    <title>My Evaluations | Moonshot</title>
                    <meta name="description" content="See and take your active evaluations!" />
                </MetaTags>

                <div style={style.separator}>
                    <div style={style.separatorLine} />
                </div>
                <div className="center" style={{ margin: "-42px auto 20px" }}>
                    <div style={style.separatorText}>My Evaluations</div>
                </div>

                {verifyBanner}

                <div className="marginBottom20px">{evaluations}</div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            startLoading,
            stopLoading,
            updateUser
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        updateUser,
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor,
        backgroundColor: state.users.backgroundColor
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyEvaluations);
