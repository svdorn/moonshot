"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
import {AppBar, Paper} from 'material-ui';
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
                let userPath = this.props.currentUser.pathways.find(function(path) {
                    return path.pathwayId == pathwayId;
                });

                const userId = this.props.currentUser._id;

                // if the user doesn't have a step saved in db for this pathway,
                // the step is set the first step
                if (userPath.currentStep.step == undefined) {
                    const stepNumber = 1;
                    const subStep = pathway.steps.find(function(step) {
                        return step.order == 1;
                    }).subSteps.find(function(subStep) {
                        return subStep.order == 1;
                    });
                    this.props.updateCurrentSubStep(userId, pathwayId, stepNumber, subStep);
                }
                // otherwise save the step that was saved in the db to redux state
                else {
                    const stepNumber = userPath.currentStep.step;
                    const subStep = pathway.steps.find(function(step) {
                        return step.order == stepNumber;
                    }).subSteps.find(function(subStep) {
                        return subStep.order == userPath.currentStep.subStep;
                    })
                    this.props.updateCurrentSubStep(userId, pathwayId, stepNumber, subStep);
                }

                this.setState({pathway}, () => {
                    console.log("the pathway is ", this.state.pathway);
                });
            }

            // we do know what step we're currently on, simply set the state
            else {
                this.setState({pathway})
            }
        })
        .catch(function (err) {
            console.log("error getting searched-for pathway");
        })
    }

    render() {
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

        let content = <div>"here"</div>;
        // if the user is on a step, show that content
        if (this.props.step) {
            const contentType = this.props.step.contentType;
            if (contentType == "link") {
                content = <PathwayContentLink style={style.content}/>;
            } else if (contentType == "video") {
                content = <PathwayContentVideo className="videoContainer" />;
            } else {
                content = <div style={style.div}>Not Video or Link</div>;
            }
        }

        return (
            <div style={{marginBottom:"50px"}}>
                {this.state.pathway ?
                    <div>
                        <div style={style.headerSpace} className="greenToBlue"/>
                        <div style={style.pathwayHeader}>
                            { pathway.name }
                        </div>
                        <div style={style.contentContainer}>
                            <PathwayStepList className="stepScrollerContainer" steps={pathway.steps} pathwayId={pathway._id} />
                            { content }
                        </div>
                    </div>
                    : null}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateCurrentSubStep
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep,
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContent);
