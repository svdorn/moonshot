"use strict"
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { positionSignup } from "../../actions/usersActions";

class PositionSignup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positionId: "5b0983a63167aae62b49d898",
            businessId: "5a710e123003a8145fbab6c6"
        }
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    apply() {
        this.props.positionSignup(this.props.currentUser._id, this.props.currentUser.verificationToken, this.state.positionId, this.state.businessId);
    }


    render() {
        return (
            <div className="blackBackground">
                <div className="extraHeaderSpace" />
                <div className="mediumButton getStarted blueToPurple" onClick={this.apply.bind(this)}>Sign up</div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        positionSignup
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(PositionSignup);
