"use strict"
import React, { Component } from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
import { AppBar, Paper } from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { closeNotification } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
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

    render(){
        const style = {
            stepList: {
                height: "600px",
                width: "400px",
                marginLeft: "30px"
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
            }
        }

        const pathway = this.state.pathway;
        console.log("pathway in render is: ", pathway);

        return (
            <div>
                { this.state.pathway ?
                    <div>
                        <div style={style.headerSpace} className="greenToBlue" />
                        <div style={style.pathwayHeader}>
                            {pathway.name}
                        </div>
                        <PathwayStepList
                            steps={pathway.steps}
                            pathwayId={pathway._id}
                            style={style.stepList}
                        />
                    </div>
                : null }
            </div>
        );
    }
}

export default PathwayContent;
