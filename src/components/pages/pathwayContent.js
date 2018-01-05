"use strict"
import React, {Component} from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
import {AppBar, Paper} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
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
        const id = this.props.params._id;

        axios.get("/api/getPathwayById", {
            params: {
                _id: id
            }
        }).then(res => {
            this.setState({pathway: res.data}, () => {
                console.log("the pathway is ", this.state.pathway);
            });
        }).catch(function (err) {
            console.log("error getting searched-for pathway");
        })
    }

    render() {
        const style = {
            stepList: {
                height: "600px",
                width: "400px",
                marginLeft: "30px",
                display: "inline-block",
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
                        <PathwayStepList steps={pathway.steps} style={style.stepList}/>
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
                    : null}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        step: state.users.currentSubStep
    };
}

export default connect(mapStateToProps)(PathwayContent);
