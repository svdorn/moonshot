"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../actions/usersActions";
import {  } from "../../../../miscFunctions";

import "../dashboard.css";


class Onboarding extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const checklistInfo = [
            {
                title: "What Candidates See",
                //body: <CandidateView/>
            },
            {
                title: "What You'll See",
                //body: <AdminView/>
            },
            {
                title: "Why It Works",
                //body: <WhyItWorks/>
            },
            {
                title: "What To Do",
                //body: <WhatToDo/>
            }
        ];

        const checklistItems = checklistInfo.map(info => {
            return (
                <div styleName={`checklist-item ${info.title === "What You'll See" ? "selected" : ""}`} key={info.title}>
                    <div styleName={`complete-mark ${info.title === "What Candidates See" ? "complete" : "incomplete"}`}><div/></div>
                    <div>{info.title}</div>
                </div>
            );
        })

        return (
            <div styleName="dashboard-item">
                <div styleName="checklist">
                    { checklistItems }
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
