"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
import PathwayContentArticle from '../childComponents/pathwayContentArticle';
import {Tabs, Tab, CircularProgress, Paper, Drawer, RaisedButton} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, updateCurrentSubStep, setHeaderBlue} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayStepList from '../childComponents/pathwayStepList';
import axios from 'axios';

class PathwayContent extends Component {


    constructor(props) {
        super(props);

        console.log("here");
        this.state = {
            pathway: undefined,
            drawerOpen: false
        }
    }

    componentDidMount() {
        // this.props.setHeaderBlue(true);

        const pathwayId = this.props.location.search.substr(1);

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
        // turns header back to normal
        // this.props.setHeaderBlue(false);
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    handleToggle = () => {
        console.log("toggling");
        this.setState({drawerOpen: !this.state.drawerOpen});
    }

    render() {
        const style = {
            threeInfo: {
                display: "inline-block",
                width: "200px",
            },
            pathwayHeader: {
                width: "100%",
                height: "50px",
                backgroundColor: "white",
                padding: "10px 30px",
                fontSize: "20px"
            },
            div: {
                display: "inline-block"
            },
            contentContainer: {
                overflow: "auto",
                marginTop: '5px',
            },
            tab: {
                backgroundColor: "white",
                color: '#B869FF',
            },
            insideTab:{
                marginTop:"10px",
                marginLeft: "5%",
                marginRight:"5%"
            },
        }

        const pathway = this.state.pathway;
        if (this.props.step !== undefined) {
            console.log(this.props.step.contentType);
            console.log(this.props.step);

        }

        let content = <div>"loading"</div>;
        // if the user is on a step, show that content
        if (this.props.step) {
            const contentType = this.props.step.contentType;
            if (contentType == "link") {
                content = <PathwayContentLink className="pathwayContent"/>;
            } else if (contentType == "video") {
                content = <PathwayContentVideo className="videoContainer"/>;
            } else if (contentType == "article") {
                content = <PathwayContentArticle className="pathwayContent"/>
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
                        <div className="greenToBlue headerDiv"/>
                        <Paper style={style.pathwayHeader}>
                            {pathway.name}
                        </Paper>


                        <Drawer
                            docked={false}
                            width={400}
                            open={this.state.drawerOpen}
                            onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
                        >
                            <PathwayStepList
                                className="stepScrollerContainerInDrawer"
                                steps={pathway.steps}
                                pathwayId={pathway._id}
                            />
                        </Drawer>


                        <div style={style.contentContainer}>
                            <div className="scrollBarAndContactUs">
                                <PathwayStepList
                                    className="stepScrollerContainer"
                                    steps={pathway.steps}
                                    pathwayId={pathway._id}/>

                                <Paper className="questionsContactUs">
                                    <img
                                        src="/icons/SpeechBubble.png"
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

                            <div style={{height:"10px"}}/>
                            {content}

                            <RaisedButton
                                label="Open Step List"
                                onClick={this.handleToggle}
                                primary={true}
                                className="drawerOpener raisedButtonWhiteText"
                            />

                            <Paper className="overviewAndCommentBox">
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
                                        tabItemContainerStyle={{width: '60%'}}
                                        className="overviewExercisesComments"
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
        closeNotification,
        setHeaderBlue
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep,
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContent);
