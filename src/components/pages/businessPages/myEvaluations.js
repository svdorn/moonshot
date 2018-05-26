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
        axios.get("/api/business/positions", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            let positions = res.data.positions;
            console.log(positions)
            if (Array.isArray(positions) && positions.length > 0) {
                self.setState({
                    positions
                })
            } else {
                self.setState({
                    noPositions: true,
                })
            }
        })
        .catch(function (err) {
            console.log("error getting positions: ", err);
        });
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

        // TODO: make this work for everybody, not just Curate
        if (this.state.positions.length !== 0) {
            evaluations = this.state.positions.map(position => {
                key++;

                return (
                    <li style={{marginTop: '15px'}}
                        key={key}
                    >
                        <MyEvaluationsPreview
                            company="Curate"
                            logo="/logos/CurateLogoWhite.png"
                            name={position.name}
                            completions={position.completions}
                            length={position.length}
                            skills={position.skills}
                            timeAllotted={position.timeAllotted}
                            usersInProgress={position.usersInProgress}
                            variation={key}
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
                        My Evalutions
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
