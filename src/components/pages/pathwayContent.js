"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
import PathwayContentArticle from '../childComponents/pathwayContentArticle';
import {Tabs, Tab, CircularProgress, Paper} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, updateCurrentSubStep} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayStepList from '../childComponents/pathwayStepList';
import axios from 'axios';

class PathwayContent extends Component {


    constructor(props) {
        super(props);

        console.log("here");
        this.state = {
            pathway: undefined
        }
    }

    componentDidMount() {
        const pathwayId = this.props.params._id;

        axios.get("/api/getPathwayById", {
            params: {
                _id: pathwayId
            }
        }).then(res => {
            const pathway = res.data;

            // if we don't know what step we're currently on
            if (this.props.step == undefined) {
                // find the current pathway in the user's profile
                let userPath = this.props.currentUser.pathways.find(function (path) {
                    return path.pathwayId == pathwayId;
                });

                const user = this.props.currentUser;

                // if the user doesn't have a step saved in db for this pathway,
                // the step is set the first step
                if (userPath.currentStep.step == undefined) {
                    const stepNumber = 1;
                    const subStep = pathway.steps.find(function (step) {
                        return step.order == 1;
                    }).subSteps.find(function (subStep) {
                        return subStep.order == 1;
                    });
                    this.props.updateCurrentSubStep(user, pathwayId, stepNumber, subStep);
                }
                // otherwise save the step that was saved in the db to redux state
                else {
                    const stepNumber = userPath.currentStep.step;
                    const subStep = pathway.steps.find(function (step) {
                        return step.order == stepNumber;
                    }).subSteps.find(function (subStep) {
                        return subStep.order == userPath.currentStep.subStep;
                    })
                    this.props.updateCurrentSubStep(user, pathwayId, stepNumber, subStep);
                }

                this.setState({pathway}, () => {
                    console.log("the pathway is ", this.state.pathway);
                });
            }

            // we do know what step we're currently on
            else {
                // if the currently saved step is not for the right pathway
                if (this.props.step.pathwayId != pathwayId) {
                    const user = this.props.currentUser;
                    let userPath = this.props.currentUser.pathways.find(function (path) {
                        return path.pathwayId == pathwayId;
                    });
                    const stepNumber = userPath.currentStep.step;
                    const subStep = pathway.steps.find(function (step) {
                        return step.order == stepNumber;
                    }).subSteps.find(function (subStep) {
                        return subStep.order == userPath.currentStep.subStep;
                    })
                    this.props.updateCurrentSubStep(user, pathwayId, stepNumber, subStep);
                }
                this.setState({pathway})
            }
        })
        // .catch(function (err) {
        //     console.log("error getting searched-for pathway");
        // })
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        const style = {
            content: {
                display: "inline-block",
                marginLeft: "20px",
                width: "calc(100% - 470px)"
            },
            overviewAndCommentBox: {
                display: "inline-block",
                marginLeft: "20px",
                width: "calc(100% - 470px)",
                marginTop: "10px",
            },
            threeInfo: {
                display: "inline-block",
                width: "200px",
            },
            pathwayHeader: {
                width: "100%",
                height: "50px",
                backgroundColor: "white",
                borderTop: "2px solid black",
                borderBottom: "2px solid black",
                padding: "10px 30px",
                fontSize: "20px"
            },
            headerSpace: {
                width: "100%",
                height: "120px"
            },
            div: {
                display: "inline-block"
            },
            contentContainer: {
                overflow: "auto"
            },
            tab: {
                backgroundColor: "white",
                color: '#B869FF',
            },
            insideTab:{
                marginTop:"10px"
            }
        }

        const pathway = this.state.pathway;
        if (this.props.step !== undefined) {
            console.log(this.props.step.contentType);
            console.log(this.props.step);

        }

        let content = <div>"here"</div>;
        // if the user is on a step, show that content
        if (this.props.step) {
            const contentType = this.props.step.contentType;
            if (contentType == "link") {
                content = <PathwayContentLink style={style.content}/>;
            } else if (contentType == "video") {
                content = <PathwayContentVideo className="videoContainer"/>;
            } else if (contentType == "article") {
                content = <PathwayContentArticle style={style.content}/>
            } else {
                content = <div style={style.div}>Not Video or Link</div>;
            }
        }

        let formattedDeadline = '';
        if (this.state.pathway) {
            const deadline = new Date(this.state.pathway.deadline);
            formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
        }

        return (
            <div style={{marginBottom: "50px"}}>
                {this.state.pathway ?
                    <div>
                        <div style={style.headerSpace} className="greenToBlue"/>
                        <div style={style.pathwayHeader}>
                            {pathway.name}
                        </div>
                        <div style={style.contentContainer}>
                            <div className="scrollBarAndContactUs">
                                <PathwayStepList
                                    className="stepScrollerContainer"
                                    steps={pathway.steps}
                                    pathwayId={pathway._id}/>
                                <Paper className="questionsContactUs">
                                    <img
                                        src="/icons/VoiceBubble.png"
                                        style={{height: "50px", width: "50px", position: "absolute"}}
                                    />
                                    <span style={{fontSize: "20px", marginLeft: "75px"}}>
                                        Questions?
                                    </span><br/>
                                    <p className="clickable blueText"
                                       style={{margin: "10px 0px 0px 75px"}}
                                       onClick={() => this.goTo('/contactUs')}>
                                        Contact Us
                                    </p>
                                </Paper>
                            </div>
                            {content}
                            <Paper style={style.overviewAndCommentBox}>
                                <Paper style={{width: "100%"}}>
                                    <ul className="horizCenteredList darkPurpleText smallText2">
                                        <li>
                                            <div style={style.threeInfo}>
                                                <i>Sponsor</i><br/>
                                                <img src={pathway.sponsor.logo}
                                                     alt={pathway.sponsor.name}
                                                     height={35}/>
                                            </div>
                                        </li>
                                        <li>
                                            <div style={style.threeInfo}>
                                                <i>Completion Time</i><br/>
                                                {pathway.estimatedCompletionTime}
                                            </div>
                                        </li>
                                        <li>
                                            <div style={style.threeInfo}>
                                                <i>Complete By</i><br/>
                                                {formattedDeadline}
                                            </div>
                                        </li>
                                    </ul>
                                </Paper>
                                <div style={{textAlign: "center"}}>
                                    <Tabs
                                        inkBarStyle={{background: '#B869FF'}}
                                        tabItemContainerStyle={{width: '40%'}}
                                        className="myPathwaysTabs"
                                    >
                                        <Tab label="Overview" style={style.tab}>
                                            <p className="smallText2 center" style={style.insideTab}>{pathway.overview}</p>
                                        </Tab>
                                        <Tab label="Exercise Files" style={style.tab}>
                                            <h1 className="center smallText2" style={style.insideTab}>No exercise files yet.</h1>
                                        </Tab>
                                        <Tab label="Comments" style={style.tab}>
                                            <h1 className="center smallText2" style={style.insideTab}>No comments yet.</h1>
                                        </Tab>
                                    </Tabs>
                                </div>
                            </Paper>
                        </div>
                    </div>
                    : null}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateCurrentSubStep,
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep,
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContent);
