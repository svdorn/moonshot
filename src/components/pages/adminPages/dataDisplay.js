"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../actions/usersActions";
import {} from "../../../miscFunctions";

class DataDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return <div>Hyello</div>;
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
)(DataDisplay);
