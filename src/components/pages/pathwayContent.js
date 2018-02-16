"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContent/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContent/pathwayContentVideo';
import PathwayContentArticle from '../childComponents/pathwayContent/pathwayContentArticle';
import PathwayContentQuiz from '../childComponents/pathwayContent/pathwayContentQuiz';
import PathwayInfo from '../childComponents/pathwayContent/pathwayInfo';
import {Tabs, Tab, Paper, Drawer, RaisedButton} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, updateCurrentSubStep, setHeaderBlue} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayStepList from '../childComponents/pathwayContent/pathwayStepList';
import NavigateStepButtons from '../childComponents/pathwayContent/navigateStepsButtons';
import axios from 'axios';

class PathwayContent extends Component {


    constructor(props) {
        super(props);

        this.state = {
            pathway: undefined,
            drawerOpen: false
        }
    }


    componentDidMount() {
        // this.props.setHeaderBlue(true);
        const user = this.props.currentUser;

        if (user && user != "no user") {
            const pathwayUrl = this.props.location.search.substr(1);
            axios.get("/api/pathwayByPathwayUrl", {
                params: {
                    pathwayUrl,
                    userId: user._id,
//                    hashedVerificationToken: user.hashedVerificationToken
                    verificationToken: user.verificationToken
                }
            }).then(res => {
                const pathway = res.data;
                const pathwayId = pathway._id;

                // if we don't know what step we're currently on
                if (this.props.step == undefined) {
                    // find the current pathway in the user's profile
                    let userPath = this.props.currentUser.pathways.find(function (path) {
                        return path.pathwayId == pathwayId;
                    });

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
                        const step = pathway.steps.find(function (step) {
                            return step.order == stepNumber;
                        });
                        let subStep = 1;
                        // if we found the step at that number, find the right substep
                        if (step) {
                            subStep = step.subSteps.find(function (subStep) {
                                return subStep.order == userPath.currentStep.subStep;
                            });
                            // if substep not found, set to 1
                            if (!subStep) {
                                subStep = 1;
                            }
                        }
                        this.props.updateCurrentSubStep(user, pathwayId, stepNumber, subStep);
                    }

                    this.setState({pathway}, () => {
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
            .catch(err => {
                // go to the pathway landing page for this pathway if the user
                // does not have access to it
                this.goTo("/pathway" + this.props.location.search);
            })
        }
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
            insideTab: {
                marginTop: "10px",
                marginLeft: "5%",
                marginRight: "5%"
            },
        }

        const pathway = this.state.pathway;

        let content = <div>"loading"</div>;
        let contentClass = "pathwayContent";
        // if the user is on a step, show that content
        if (this.props.step) {
            const contentType = this.props.step.contentType;
            if (contentType == "link") {
                content = <PathwayContentLink/>;
            } else if (contentType == "video") {
                content = <PathwayContentVideo className="videoContainer"/>;
                contentClass += " noPadding";
            } else if (contentType == "article") {
                content = <PathwayContentArticle/>
            } else if (contentType == "quiz") {
                content = <PathwayContentQuiz/>
            } else if (contentType == "info") {
                content = <PathwayInfo/>
            } else {
                content = <div style={style.div}>Not Video or Link</div>;
            }
        }

        let formattedDeadline = undefined;
        if (this.state.pathway) {
            const deadline = new Date(this.state.pathway.deadline);
            formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            if (formattedDeadline.includes("NaN")) {
                formattedDeadline = undefined;
            }
        }

        return (
            <div style={{marginBottom: "50px"}}>
                {this.state.pathway ?
                    <div>
                        <div className="greenToBlue headerDiv"/>
                        <Paper style={style.pathwayHeader}>
                            {pathway.pathwayContentDisplayName ?
                                pathway.pathwayContentDisplayName
                            :
                                pathway.name
                            }
                        </Paper>


                        <Drawer
                            docked={false}
                            open={this.state.drawerOpen}
                            onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
                            width={400}
                            className="under1000only"
                            containerClassName="drawerWidth"
                        >
                            <PathwayStepList
                                className="stepScrollerContainerInDrawer"
                                steps={pathway.steps}
                                pathwayId={pathway._id}
                            />
                        </Drawer>


                        <div style={style.contentContainer}>
                            <div className="scrollBarAndContactUs above1000only">
                                <PathwayStepList
                                    className="stepScrollerContainer"
                                    steps={pathway.steps}
                                    pathwayId={pathway._id}
                                />

                                <Paper className="questionsContactUs">
                                    <img
                                        src="/icons/SpeechBubble.png"
                                        style={{height: "50px", width: "50px", position: "absolute"}}
                                    />
                                    <span style={{marginLeft: "75px"}} className="font20px font16pxUnder700 font font12pxUnder400">
                                        Questions?
                                    </span><br/>
                                    <p className="clickable blueText"
                                       style={{margin: "10px 0px 0px 75px"}}
                                       onClick={() => this.goTo('/contactUs')}>
                                        Contact Us
                                    </p>
                                </Paper>
                            </div>

                            <div style={{height: "10px"}}/>

                            <div className="pathwayContentContainer">
                                <Paper className={contentClass} zDepth={1}>
                                    {content}
                                </Paper>

                                <NavigateStepButtons
                                    steps={pathway.steps}
                                    pathwayId={pathway._id}
                                />
                            </div>

                            <RaisedButton
                                label="Open Step List"
                                onClick={this.handleToggle}
                                primary={true}
                                className="drawerOpener raisedButtonWhiteText"
                            />

                            <Paper className="overviewAndCommentBox">
                                <ul className="horizCenteredList blueText font20px font14pxUnder700 font10pxUnder400" style={{marginBottom:"0"}}>
                                    <li>
                                        <div className="overviewAndCommentBoxInfo">
                                            <i>Sponsor</i><br/>
                                            <img src={pathway.sponsor.logoForLightBackground ? pathway.sponsor.logoForLightBackground : pathway.sponsor.logo}
                                                 alt={pathway.sponsor.name}
                                                 className="overviewAndCommentBoxImg"/>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="overviewAndCommentBoxInfo">
                                            <i>Completion Time</i><br/>
                                            {pathway.estimatedCompletionTime}
                                        </div>
                                    </li>
                                    {formattedDeadline ?
                                        <li>
                                            <div className="overviewAndCommentBoxInfo">
                                                <i>Complete By</i><br/>
                                                {formattedDeadline}
                                            </div>
                                        </li>
                                    : null
                                    }
                                </ul>
                            </Paper>

                            {true ?
                                <Paper className="overviewAndCommentBox">
                                    <div style={{textAlign: "center"}}>
                                    <Tabs
                                    inkBarStyle={{background: '#00c3ff'}}
                                    tabItemContainerStyle={{width: '60%'}}
                                    className="overviewExercisesComments"
                                    >
                                    <Tab label="Overview" className="overviewAndCommentBoxTab font12pxUnder500Important font10pxUnder400Important">
                                    <p className="font20px font14pxUnder700 font10pxUnder400 center"
                                    style={style.insideTab}>{pathway.overview}</p>
                                    </Tab>
                                    <Tab label="Exercise Files" className="overviewAndCommentBoxTab font12pxUnder500Important font10pxUnder400Important">
                                    <h1 className="center font20px font14pxUnder700 font10pxUnder400" style={style.insideTab}>No exercise files
                                    yet.</h1>
                                    </Tab>
                                    <Tab label="Comments" className="overviewAndCommentBoxTab font12pxUnder500Important font10pxUnder400Important">
                                    <h1 className="center font20px font14pxUnder700 font10pxUnder400" style={style.insideTab}>No comments
                                    yet.</h1>
                                    </Tab>
                                    </Tabs>
                                    </div>
                                </Paper>
                            : null
                            }
                        </div>
                    </div>
                    :
                    <div>
                        <div className="fullHeight"/>
                        <div className="fullHeight"/>
                    </div>}
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
