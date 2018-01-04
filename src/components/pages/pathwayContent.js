"use strict"
import React, { Component } from 'react';
import { AppBar, Paper } from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { closeNotification } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import PathwayPreview from '../childComponents/pathwayPreview';
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
        return (
          <div>
              Pathway Content
          </div>
        );
    }
}

export default PathwayContent;