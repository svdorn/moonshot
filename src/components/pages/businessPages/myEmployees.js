"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../../actions/usersActions";
import {Field, reduxForm} from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';

class MyEmployees extends Component {
    constructor(props) {
        super(props);

        const emptyEmployee = {
            name: "Loading...",
            complete: "",
            disabled: true
        }

        this.state = {
            searchTerm: "",
            complete: false,
            position: "",
            candidates: [emptyEmployee],
            positions: [],
            // true if the business has no pathways associated with it
            noPathways: false
        }
    }

    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myCandidates'>
                <MetaTags>
                    <title>My Employees | Moonshot</title>
                    <meta name="description" content="Grade your employees and see their results."/>
                </MetaTags>
                <div className="employerHeader"/>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        notification: state.users.notification,
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyEmployees);
