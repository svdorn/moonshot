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
import MyEvaluationsPreview from '../../childComponents/myEvaluationsPreview';

class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false
        }
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
                console.log("res.data.positions: ", res.data.positions)
                self.positionsFound(res.data.positions);
            })
            .catch(error => {
                console.log("error getting positions: ", error);
                if (error.response) { console.log(error.response.data); }
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
                this.positionsFound(res.data.positions);
            })
            .catch(function (err) {
                console.log("error getting positions: ", err);
            });
        }
    }


    // call this after positions are found from back end
    positionsFound(positions) {
        if (Array.isArray(positions) && positions.length > 0) {
            this.setState({ positions });
        } else {
            this.setState({ noPositions: true });
        }
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

        // create the evaluation previews
        let key = 0;
        let self = this;

        const currentUser = this.props.currentUser;

        // TODO: make this work for everybody, not just Curate
        if (currentUser && this.state.positions.length !== 0) {
            const userType = currentUser.userType;

            evaluations = this.state.positions.map(position => {
                key++;

                let attributes = {};
                attributes.company = position.businessName;

                // if user is manager or account admin, preview will look editable
                if (["accountAdmin", "manager"].includes(currentUser.userType)) {
                    attributes.completions = position.completions;
                    attributes.usersInProgress = position.usersInProgress;
                    attributes.length = position.length;
                    attributes.skills = position.skills;
                    attributes.timeAllotted = timeAlloted;
                    attributes.logo = "MoonshotWhite.png";
                    attributes.company = "Moonshot";
                    attributes.name = position.name;
                    attributes.length = position.length;

                    attributes.variation = "edit";
                }

                // otherwise the preview will look like you can take it
                else {
                    attributes.variation = "take";
                    attributes.logo = position.businessLogo;
                    attributes.name = position.positionName;
                    attributes.company = position.businessName;
                    attributes.businessId = position.businessId.toString();
                    attributes.positionId = position.positionId.toString();
                }

                return (
                    <li style={{marginTop: '15px'}}
                        key={key}
                    >
                        <MyEvaluationsPreview
                            timeAllotted={position.timeAllotted}
                            {...attributes}
                        />
                    </li>
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
                        My Evaluations
                    </div>
                </div>
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
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluations);
