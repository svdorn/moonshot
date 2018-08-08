"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../childComponents/addUserDialog';
import { openAddUserModal, addNotification } from '../../../../actions/usersActions';
import { secondaryGray } from "../../../../colors";

class InviteEmployees extends Component {
    render() {
        return (
            <div className="invite-employees primary-white center">
                <div>
                    <div className="font18px text-left">
                        The more data we have on your company, the better our
                        predictions become. Culture fit and longevity are far
                        more difficult to predict without insight into your
                        company, so those measures won{"'"}t start populating
                        until employees complete an evaluation.
                    </div>
                    <div
                        className="medium button round-4px background-primary-cyan"
                        style={{padding: "3px 30px", margin: "0 auto"}}
                        onClick={this.props.openAddUserModal}
                    >
                        Invite
                    </div>
                    <div className="font14px">
                        You can also invite employees by going to Account&nbsp;&nbsp;>&nbsp;&nbsp;Add User&nbsp;&nbsp;>&nbsp;&nbsp;Employee.
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
                            onClick={() => this.props.next()}
                        >
                            Continue
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


export default connect(mapStateToProps, mapDispatchToProps)(InviteEmployees);
