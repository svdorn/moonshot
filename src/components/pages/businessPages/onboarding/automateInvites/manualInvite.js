"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";


class ManualInvite extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    componentWillMount() {
        const automationStep = this.props.automationStep;
        // if the header is wrong, change it to the right header
        if (!automationStep || automationStep.header !== "How to Invite Applicants") {
            this.props.changeAutomateInvites({ header: "How to Invite Applicants" });
        }
    }


    render() {
        return (
            <div>
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


export default connect(mapStateToProps, mapDispatchToProps)(ManualInvite);
