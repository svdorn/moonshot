"use strict"
import React, { Component } from 'react';
import PathwayContentLink from '../childComponents/pathwayContentLink';
import PathwayContentVideo from '../childComponents/pathwayContentVideo';
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
        const pathway = this.state.pathway;

        return (
            <div>
                <PathwayStepList steps={pathway.steps} />
                Pathway Content
            </div>
        );
    }
}

export default PathwayContent;
