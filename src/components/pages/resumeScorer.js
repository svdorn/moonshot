"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, closeNotification, addPathway} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider, Chip} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
//import './pathway.css';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';
import MetaTags from 'react-meta-tags';

class ResumeScorer extends Component {
    render() {
        return (<div>Resume</div>);
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ResumeScorer);

