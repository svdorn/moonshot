"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContent/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContent/pathwayContentVideo';
import PathwayContentArticle from '../childComponents/pathwayContent/pathwayContentArticle';
import PathwayContentQuiz from '../childComponents/pathwayContent/pathwayContentQuiz';
import PathwayContentCompletePathway from '../childComponents/pathwayContent/pathwayContentCompletePathway';
import PathwayInfo from '../childComponents/pathwayContent/pathwayInfo';
import {Tabs, Tab, Paper, Drawer, RaisedButton} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, updateCurrentSubStep, setHeaderBlue} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayStepList from '../childComponents/pathwayContent/pathwayStepList';
import NavigateStepButtons from '../childComponents/pathwayContent/navigateStepsButtons';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

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

            let pathwayUrl = "";
            // try to get the pathwayUrl from the location query
            try {
                pathwayUrl = this.props.location.query.pathway;
                if (!pathwayUrl) {
                    throw "pathway url isn't in query form";
                }
            } catch (e) {
                // temporary fix, try to get the pathwayUrl from the location url without a query
                try {
                    let urlSearch = this.props.location.search;
                    let nextQueryIndex = urlSearch.indexOf("&");
                    if (nextQueryIndex > 1) {
                        pathwayUrl = urlSearch.substr(1, nextQueryIndex - 1);
                    } else {
                        pathwayUrl = urlSearch.substr(1);
                    }
                } catch (e2) {
                    return;
                }
            }

            // if no pathway url given, return
            // if (!this.props.location || !this.props.location.query || !this.props.location.query.pathway) {
            //     return;
            // }
            // set the pathway url to the one in the url's query
            //const pathwayUrl = this.props.location.query.pathway;

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
                        let stepNumber = userPath.currentStep.step;
                        // make sure we're on an actual step
                        if (!stepNumber || stepNumber < 1) {
                            // if the step number is less than 1, set it to 1
                            stepNumber = 1;
                        } else if (stepNumber > pathway.steps.length) {
                            // if the step number is bigger than possible, set
                            // it to the last step
                            stepNumber = pathway.steps.length;
                        }

                        const step = pathway.steps.find(function (step) {
                            return step.order == stepNumber;
                        });

                        let subStep = undefined;
                        let savedSubStep = userPath.currentStep.subStep;
                        // if we found the step at that number, find the right substep
                        if (step) {
                            // if saved substep too small, set to first substep
                            if (!savedSubStep || savedSubStep < 1) {
                                savedSubStep = 1;
                            }

                            // if saved substep too big, save to last possible substep
                            else if (savedSubStep > step.subSteps.length) {
                                savedSubStep = step.subSteps.length;
                            }

                            // find the actual substep, not just the number
                            subStep = step.subSteps.find(function (subStep) {
                                return subStep.order == savedSubStep;
                            });
                        }
                        this.props.updateCurrentSubStep(user, pathwayId, stepNumber, subStep);
                    }

                    this.setState({pathway});
                }

                // we do know what step we're currently on
                else {
                    // if the currently saved step is not for the right pathway
                    if (this.props.step.pathwayId != pathwayId) {
                        const user = this.props.currentUser;
                        let userPath = this.props.currentUser.pathways.find(function (path) {
                            return path.pathwayId == pathwayId;
                        });

                        let stepNumber = userPath.currentStep.step;

                        // if the step number is less than one (invalid) set it to 1
                        if (!stepNumber || stepNumber < 1) {
                            stepNumber = 1;
                        }

                        // if the step number is greater than the number of steps,
                        // set it to be the last step
                        else if (stepNumber > pathway.steps.length) {
                            stepNumber = pathway.steps.length;
                        }

                        // find the actual current step from the step number
                        let currStep = pathway.steps.find(function (step) {
                            return step.order == stepNumber;
                        })

                        // declare the current substep
                        let subStep = undefined;
                        // the sub step that has been recorded
                        let userSubStep = userPath.currentStep.subStep;


                        // if the recorded substep is too small, set to default (1)
                        if (!userSubStep || userSubStep < 1) {
                            userSubStep = 1;
                        }
                        // if the recorded substep is too large (invalid), set
                        // it to be the last possible substep
                        if (userSubStep >= currStep.subSteps.length) {
                            userSubStep = currStep.subSteps.length;
                        }

                        // if the step was found find the right substep
                        if (currStep) {
                            subStep = currStep.subSteps.find(function (subStep) {
                                return subStep.order == userSubStep;
                            })
                        }

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
            } else if (contentType == "completedPathway") {
                content = <PathwayContentCompletePathway pathway={pathway} />
            } else {
                console.log("this.props.step: ", this.props.step)
                content = <div style={style.div}>Error retrieving step.</div>;
            }
        }

        let formattedDeadline = undefined;
        if (pathway) {
            const deadline = new Date(pathway.deadline);
            formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
            if (formattedDeadline.includes("NaN")) {
                formattedDeadline = undefined;
            }
        }

        console.log("blah")

        // the title is either a string set specifically for the title or the name of the pathway (or empty)
        let pathwayTitle = "";
        // the meta description is either a given meta description or the description shown on the page
        let pathwayMetaDescription = "Go through this pathway to be evaluated for a position.";

        if (pathway) {
            pathwayTitle = pathway.tabTitle ? pathway.tabTitle : pathway.name;
            if (pathway.metaDescription) {
                pathwayMetaDescription = pathway.metaDescription;
            } else if (pathway.sponsor && pathway.sponsor.name) {
                pathwayMetaDescription = "Go through this pathway to be evaluated for a position at " + pathway.sponsor.name + "."
            }
        }

        return (
            <div style={{marginBottom: "50px"}}>
                {pathway ?
                    <div>
                        <MetaTags>
                            <title>{pathwayTitle} | Moonshot</title>
                            <meta name="description" content={pathwayMetaDescription} />
                        </MetaTags>

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
                                inDrawer={true}
                            />
                        </Drawer>


                        <div style={style.contentContainer}>
                            <div className="scrollBarAndContactUs above1000only">
                                <PathwayStepList
                                    className="stepScrollerContainer"
                                    steps={pathway.steps}
                                    pathwayId={pathway._id}
                                    inDrawer={false}
                                />

                                <Paper className="questionsContactUs">
                                    <img
                                        alt="Speech Bubble Icon"
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
                                            Hiring Partner<br/>
                                            <img src={pathway.sponsor.logoForLightBackground ? pathway.sponsor.logoForLightBackground : pathway.sponsor.logo}
                                                 alt={pathway.sponsor.name}
                                                 className="overviewAndCommentBoxImg"/>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="overviewAndCommentBoxInfo">
                                            Completion Time<br/>
                                            <div className="inlineBlock pathwayContentTimeText">{pathway.estimatedCompletionTime}</div>
                                        </div>
                                    </li>
                                    {formattedDeadline ?
                                        <li>
                                            <div className="overviewAndCommentBoxInfo">
                                                Complete By<br/>
                                                {formattedDeadline}
                                            </div>
                                        </li>
                                    : null
                                    }
                                </ul>
                            </Paper>

                            {pathway.showOverviewAndCommentBox ?
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
