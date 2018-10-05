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
    RaisedButton,
    Paper
} from 'material-ui';
import {connect} from 'react-redux';
import { browserHistory } from "react-router";
import {bindActionCreators} from 'redux';
import { addNotification, startLoading, stopLoading } from '../../actions/usersActions';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import MyEvaluationsPreview from '../childComponents/myEvaluationsPreview';
import { goTo } from '../../miscFunctions';
import { button } from "../../classes";


class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: []
        }
    }


    componentDidMount() {
        let self = this;
        const currentUser = this.props.currentUser;
        // if the user is here to go through an evaluation, get the positions
        // they are currently enrolled in
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
            // TODO test error
            console.log("error getting positions: ", error);
            self.addNotification("Error getting evaluations, try refreshing.", "error");
        });
    }

    // call this after positions are found from back end
    positionsFound(positions, logo, businessName, uniqueName) {
        if (Array.isArray(positions) && positions.length > 0) {
            this.setState({ positions, logo, businessName, uniqueName });
        } else {
            this.setState({ noPositions: true });
        }
    }


    reSendVerification() {
        console.log("re sending");
    }


    checkStatus() {
        console.log("checking status");
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
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {

                fontSize: "18px",
                color: "white"
            }
        }

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

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
                        <li style={{marginTop: '35px', listStyleType:"none"}}
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

        let verifyBanner = null;
        if (!currentUser.verified) {
            verifyBanner = (
                <div>
                    Verify your email to take your eval! A verification email
                    was sent to { currentUser.email } -
                    Wrong email? <div className={button.purpleBlue} onClick={() => goTo("/settings")}>Change email</div>
                    Didn{"'"}t get our email? <div className={button.purpleBlue} onClick={this.reSendVerification.bind(this)}>Re-send it</div>
                    Already verified? <div className={button.purpleBlue} onClick={this.reSendVerification.bind(this)}>Check status</div>
                </div>
            )
        }

        return(
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myEvaluations'>
                <MetaTags>
                    <title>My Evaluations | Moonshot</title>
                    <meta name="description" content="See and take your active evaluations!"/>
                </MetaTags>

                <div style={style.separator}>
                    <div style={style.separatorLine}/>
                </div>
                <div className="center" style={{margin: "-42px auto 20px"}}>
                    <div style={style.separatorText}>
                        My Evaluations
                    </div>
                </div>

                { verifyBanner }

                <div className="marginBottom60px">
                    {evaluations}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        startLoading,
        stopLoading
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluations);
