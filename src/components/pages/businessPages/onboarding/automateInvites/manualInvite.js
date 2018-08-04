"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../../childComponents/addUserDialog';
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";

class ManualInvite extends Component {
    componentWillMount() {
        // add the right header
        this.props.changeAutomateInvites({ header: "How to Invite Applicants" });
    }


    render() {
        return (
            <div>
                <div>
                    We will update you with options for integrations. You can
                    always manually invite candidates as seen below.
                </div>

                { this.props.previousNextArea }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        sequence: state.users.automateInvites,
        user: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites,
        updateUser,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ManualInvite);
