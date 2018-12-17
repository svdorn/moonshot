"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";

import CandidateEvaluations from "./candidateEvaluations";
import AccountAdminEvaluations from "./employerEvaluations";

class MyEvaluations extends Component {
    render() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return null;
        } else if (currentUser.userType === "accountAdmin") {
            return <AccountAdminEvaluations location={this.props.location} />;
        } else {
            return <CandidateEvaluations location={this.props.location} />;
        }
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyEvaluations);
