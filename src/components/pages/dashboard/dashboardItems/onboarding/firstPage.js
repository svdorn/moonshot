"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    addNotification,
    updateStore
} from "../../../../../actions/usersActions";
import {
    goTo
} from "../../../../../miscFunctions";
import { button } from "../../../../../classes";
import AddPosition from "./childComponents/addPosition";

import "../../dashboard.css";

class FirstPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    makeWelcomeFrame() {
        return (
            <div>
            </div>
        );
    }

    makeAddPositionFrame() {
        return (
            <AddPosition />
        );
    }

    render() {
        let frame = null;
        console.log(this.props.welcomeToMoonshot);
        if (!this.props.welcomeToMoonshot) {
            frame = this.makeWelcomeFrame();
        } else {
            frame = this.makeAddPositionFrame();
        }

        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <div className="center" style={{ height: "100%" }}>
                        { frame }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        welcomeToMoonshot: state.users.welcomeToMoonshot,
        onboardingPositions: state.users.onboardingPositions
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            updateStore
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FirstPage);
