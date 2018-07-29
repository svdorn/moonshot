"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../childComponents/addUserDialog';
import { openAddUserModal, addNotification } from '../../../../actions/usersActions';
import { secondaryGray } from "../../../../colors";

class InviteAdmins extends Component {
    render() {
        return (
            <div className="invite-admins primary-white center">
                <div>
                    <div className="font18px">
                        Admins are able to manage employee and candidate accounts
                        and can see candidate evaluation results. Invite any
                        Hiring Managers, Recruiters, or Executives that are
                        involved in your hiring process.
                    </div>
                    <div className="font18px primary-cyan position-titles">
                        <div>Recruiters</div>
                        <div>Hiring Managers</div>
                        <div>Executives</div>
                    </div>
                    <div
                        className="medium button round-4px background-primary-cyan"
                        style={{padding: "3px 30px", margin: "0 auto"}}
                        onClick={this.props.openAddUserModal}
                    >
                        Invite
                    </div>
                    <div className="font14px">
                        You can also invite admins by going to Account&nbsp;&nbsp;>&nbsp;&nbsp;Add User&nbsp;&nbsp;>&nbsp;&nbsp;Admin.
                    </div>
                    <div className="previous-next-area font18px center">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock"
                            onClick={this.props.next}
                        >
                            Next
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        openAddUserModal,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(InviteAdmins);
