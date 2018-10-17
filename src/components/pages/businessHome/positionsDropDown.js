"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../actions/usersActions";
import {} from "../../../miscFunctions";

import "./businessHome.css";

const posTypes = ["Developer", "Product", "Support/Customer Service", "Marketing", "Sales"];

class PositionsDropDown extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    typeAdvance = type => () => {
        console.log("advancing with type: ", type);
    };

    nameAdvance = name => () => {
        console.log("advancing with position name: ", name);
    };

    noTextOptions() {
        const options = posTypes.map(type => {
            return (
                <div styleName="drop-down-option" onClick={this.typeAdvance(type)}>
                    {type}
                </div>
            );
        });

        return options;
    }

    render() {
        const options = this.props.inputText ? this.suggestions() : this.noTextOptions();

        return (
            <div styleName="drop-down">
                <div styleName="drop-down-header drop-down-option">Popular Positions</div>
                {options}
                <div />
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
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PositionsDropDown);
