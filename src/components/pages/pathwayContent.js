"use strict"
import React, { Component } from 'react';
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
            pathway: {},
        }
    }

    componentDidMount() {
        const id = this.props.params._id;

        axios.get("/api/getPathwayById", {
            params: {
                _id: id
            }
        }).then(res => {
            this.setState({pathway: res.data});
            console.log(this.state.pathway);

        }).catch(function (err) {
            console.log("error getting searched for pathw");
        })
    }

    render(){
        const style = {
            stepList: {
                height: "800px",
                width: "400px"
            }
        }

        const pathway = this.state.pathway;

        return (
            <div className="greenToBlue">
                <PathwayStepList steps={pathway.steps} style={style.stepList} />
                Pathway Content
            </div>
        );
    }
}

export default PathwayContent;
