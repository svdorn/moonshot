"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../actions/usersActions";
import {} from "../../miscFunctions";

class GeneralApply extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return <div />;
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GeneralApply);
