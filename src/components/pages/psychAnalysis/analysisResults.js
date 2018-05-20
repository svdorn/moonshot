"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import { closeNotification, answerPsychQuestion } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import PsychSlider from './psychSlider';

class PsychAnalysis extends Component {
    constructor(props) {
        super(props);

        this.state = { };
    }


    componentDidMount() {

    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    render() {

        return (
            <div>
                You finished, yay!
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        answerPsychQuestion
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(PsychAnalysis);
