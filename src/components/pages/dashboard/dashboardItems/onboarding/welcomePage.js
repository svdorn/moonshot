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

import "../../dashboard.css";

class WelcomePage extends Component {
    constructor(props) {
        super(props);
    }

    welcomeFrameClick = () => {
        this.props.updateStore("welcomeToMoonshot", true);
    }

    makeWelcomeFrame() {
        return (
            <div styleName="welcome-frame">
                <div className="font22px font20pxUnder700 font16pxUnder500 primary-cyan">
                    Welcome to Moonshot Insights!
                </div>
                <div>
                    We created a 22-minute evaluation that you can share with your candidates to understand their personality,
                    ability to learn, adapt and problem solve. This data enables us to predict each candidate{"'"}s job performance,
                    growth potential, longevity or tenure, and culture fit at your company.
                </div>
                <div styleName="blue-arrow" onClick={this.welcomeFrameClick}>
                    Start Here <img src={`/icons/ArrowBlue${this.props.png}`} />
                </div>
            </div>
        );
    }

    render() {
        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <div className="center" style={{ height: "100%" }}>
                        { this.makeWelcomeFrame() }
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
        png: state.users.png,
        welcomeToMoonshot: state.users.welcomeToMoonshot
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
)(WelcomePage);
