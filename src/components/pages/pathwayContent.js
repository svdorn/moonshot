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
    render(){
        return (
          <div>
              Pathway Content
          </div>
        );
    }
}

export default PathwayContent;