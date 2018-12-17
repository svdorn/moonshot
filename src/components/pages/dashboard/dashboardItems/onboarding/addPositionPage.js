"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, updateStore } from "../../../../../actions/usersActions";
import { goTo } from "../../../../../miscFunctions";
import { button } from "../../../../../classes";
import AddPosition from "./childComponents/addPosition";

import "../../dashboard.css";

class AddPositionPage extends Component {
    constructor(props) {
        super(props);
    }

    makeAddPositionFrame() {
        return (
            <div>
                <div styleName="add-position-header">
                    <div className="primary-cyan">Who do you need to hire?</div>
                    <div className="font14px">Enter one of your open positions.</div>
                </div>
                <div styleName="non-desktop-activation-space">
                    <AddPosition />
                </div>
            </div>
        );
    }

    render() {
        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <div className="center" style={{ height: "100%" }}>
                        {this.makeAddPositionFrame()}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loading: state.users.loadingSomething,
        png: state.users.png,
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
)(AddPositionPage);
