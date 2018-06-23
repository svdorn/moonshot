"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';

class AdminPages extends Component {
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
            <div className="fullHeight">
                <a href={"/admin/createBusinessAccount"}>Create Business Account</a><br/>
                <a href={"/admin/skillPicker"}>Skills</a><br/>
                <a href={"/admin/businessPicker"}>Businesses</a>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminPages);
