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

        );
    }

    makeAddPositionFrame() {
        return (
            <AddPosition />
        );
    }

    render() {
        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <div className="center" style={{ height: "100%" }}>
                        { this.makeAddPositionFrame() }
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
