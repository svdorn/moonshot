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

                console.log("userPath is: ", userPath);

                const userId = this.props.currentUser._id;

                // if the user doesn't have a step saved, the step is set the first step
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
        })
        // .catch(function (err) {
        //     console.log("error getting searched-for pathway");
        // })
    }

    render() {
        const style = {
            stepList: {
                height: "600px",
                width: "400px",
                marginLeft: "30px",
                display: "inline-block",
                float: "left"
            },
            content: {
                display: "inline-block",
                marginLeft: "20px"
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

        return (
            <div>
                {this.state.pathway ?
                    <div>
                        <div style={style.headerSpace} className="greenToBlue"/>
                        <div style={style.pathwayHeader}>
                            {pathway.name}
                        </div>
                        <div style={style.contentContainer}>
                            <PathwayStepList steps={pathway.steps} pathwayId={pathway._id} style={style.stepList}/>
                            {this.props.step ?
                                <div style={style.div}>
                                    {this.props.step.contentType === 'link' ?
                                        <PathwayContentLink style={style.content}/>
                                        :
                                        <div style={style.div}>{this.props.step.contentType === 'video' ?
                                            <PathwayContentVideo style={style.content}/>
                                            : <div style={style.div}>Not Video or Link</div>}</div>}
                                </div>
                                : <div style={style.div}>here</div>}
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
