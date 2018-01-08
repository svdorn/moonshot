"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
import PathwayContentArticle from '../childComponents/pathwayContentArticle';
import {AppBar, Paper, CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, updateCurrentSubStep, setPathwayId} from "../../actions/usersActions";
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

        console.log("checking");
        if (this.props.pathwayId != pathwayId) {
            setPathwayId(pathwayId);
        }

        axios.get("/api/getPathwayById", {
            params: {
                _id: pathwayId
            }
        }).then(res => {
            const pathway = res.data;

            const user = this.props.currentUser;
            // the current step of the current pathway
            let currentStep = user.pathways.find(function(path) {
                return path.pathwayId == pathwayId;
            }).currentStep;

            // if the current step in the current path isn't set, set it to the beginning
            if (currentStep == undefined) {
                // get the first substep
                const subStep = pathway.steps.find(function(step) {
                    return step.order == 1;
                }).subSteps.find(function(subStep) {
                    return subStep.order == 1;
                });

                currentStep = subStep;
                // update the current step in the user document, both in db and redux state
                this.props.updateCurrentSubStep(user, pathwayId, subStep);
            }

            //const currentStep = this.props.currentStep;

            this.setState({pathway});






            // // if we don't know what step we're currently on
            // if (this.props.step == undefined) {
            //     // find the current pathway in the user's profile
            //     let userPath = this.props.currentUser.pathways.find(function(path) {
            //         return path.pathwayId == pathwayId;
            //     });
            //
            //     const userId = this.props.currentUser._id;
            //
            //     // if the user doesn't have a step saved in db for this pathway,
            //     // the step is set the first step
            //     if (userPath.currentStep.step == undefined) {
            //         const stepNumber = 1;
            //         const subStep = pathway.steps.find(function(step) {
            //             return step.order == 1;
            //         }).subSteps.find(function(subStep) {
            //             return subStep.order == 1;
            //         });
            //         this.props.updateCurrentSubStep(userId, pathwayId, stepNumber, subStep);
            //     }
            //     // otherwise save the step that was saved in the db to redux state
            //     else {
            //         const stepNumber = userPath.currentStep.step;
            //         const subStep = pathway.steps.find(function(step) {
            //             return step.order == stepNumber;
            //         }).subSteps.find(function(subStep) {
            //             return subStep.order == userPath.currentStep.subStep;
            //         })
            //         this.props.updateCurrentSubStep(userId, pathwayId, stepNumber, subStep);
            //     }
            //
            //     this.setState({pathway}, () => {
            //         console.log("the pathway is ", this.state.pathway);
            //     });
            // }
            //
            // // we do know what step we're currently on, simply set the state
            // else {
            //     this.setState({pathway})
            // }
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

    // componentDidUpdate() {
    //     console.log("DID UPDATE")
    //     if (this.state.pathway) {
    //         const user = this.props.currentUser;
    //         const pathwayId = this.state.pathway._id;
    //         // the current step of the current pathway
    //         const currentStep = user.pathways.find(function(path) {
    //             return path.pathwayId == pathwayId;
    //         }).currentStep;
    //         if (currentStep != this.state.currentStep) {
    //             this.setState({...this.state, currentStep});
    //         }
    //     }
    // }

    render() {
        console.log("RENDERING")
        const style = {
            content: {
                display: "inline-block",
                marginLeft: "20px",
                width: "calc(100% - 470px)"
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
            }
        }

        const pathway = this.state.pathway;
        if (this.props.step !== undefined) {
            console.log(this.props.step.contentType);
            console.log(this.props.step);
        }

        // const currentStep = this.props.currentUser.pathways.find(function(path) {
        //     path.pathwayId == pathway.id
        // }).currentStep;

        //const currentStep = this.state.currentStep;




        // let currentStep = undefined;
        //
        // if (this.state.pathway) {
        //     const user = this.props.currentUser;
        //     const pathwayId = this.state.pathway._id
        //     // the current step of the current pathway
        //     currentStep = user.pathways.find(function(path) {
        //         return path.pathwayId == pathwayId;
        //     }).currentStep;
        //     console.log("currentStep is: ", currentStep);
        // }

        //const currentStep = this.state.currentStep;

        const currentStep = this.props.currentStep;

        let content = <div>"loading"</div>;
        // if the user is on a step, show that content
        if (currentStep) {
            const contentType = currentStep.contentType;
            if (contentType == "link") {
                content = <PathwayContentLink style={style.content} step={currentStep}/>;
            } else if (contentType == "video") {
                content = <PathwayContentVideo className="videoContainer" step={currentStep}/>;
            } else if (contentType == "article") {
                content = <PathwayContentArticle style={style.content} step={currentStep}/>
            } else {
                content = <div style={style.div}>Not Video or Link</div>;
            }
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
                        </div>
                    </div>
                    : <div>
                        <div style={style.headerSpace} className="greenToBlue"/>
                        <div className="center"><CircularProgress style={{marginTop: "20px"}}/><br/></div>
                    </div>}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateCurrentSubStep,
        closeNotification,
        setPathwayId
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        currentPathwayId: state.users.currentPathwayId,
        currentStep: state.currentPathwayId ?
            state.users.currentUser.pathways[state.currentPathwayId].currentStep
            : undefined
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContent);
