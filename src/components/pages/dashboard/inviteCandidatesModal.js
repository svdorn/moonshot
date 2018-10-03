"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction } from "../../../actions/usersActions";
import {  } from "../../../miscFunctions";
import Dialog from "@material-ui/core/Dialog";


class InviteCandidatesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    handleClose = () => {
        this.props.generalAction("CLOSE_INVITE_CANDIDATES_MODAL");
    }


    render() {
        return (
            <Dialog
                open={this.props.open ? true : false}
                onClose={this.handleClose.bind(this)}
            >
                <div>How to invite candidates</div>
            </Dialog>
        );
    }
}


function mapStateToProps(state) {
    return {
        open: state.users.inviteCandidatesModalOpen
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(InviteCandidatesModal);
