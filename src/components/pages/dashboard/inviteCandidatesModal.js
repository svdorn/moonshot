"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction, addNotification } from "../../../actions/usersActions";
import { getFirstName } from "../../../miscFunctions";
import { Dialog, FlatButton, CircularProgress } from 'material-ui';
import { primaryCyan } from "../../../colors";
import axios from 'axios';

import "./dashboard.css";

class InviteCandidatesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: undefined,
            uniqueName: undefined
        };

        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        let self = this;
        const user = this.props.currentUser;

        const nameQuery = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
        } };

        axios.get("/api/business/uniqueName", nameQuery )
        .then(function (res) {
            self.setState({ name: res.data.name, uniqueName: res.data.uniqueName });
        })
        .catch(err => {
            console.log("error");
        })
    }

    handleClose = () => {
        this.props.generalAction("CLOSE_INVITE_CANDIDATES_MODAL");
    }

    makeDialogBody() {
        return (
            <div styleName="invite-candidates-modal">
                <div className="primary-cyan font22px font18pxUnder700">
                    Candidate Invite Template
                </div>
                <div className="font14px font12pxUnder700">
                    Copy, paste and tweak this message for your automated emails or other communications with candidates.
                </div>
                <div className="font14px font12pxUnder700">
                    <div>
                        Subject: Invitation from { this.state.name }
                    </div>
                    <div>
                        Hi,
                    </div>
                    <div>
                        Congratulations, we would like to invite you to the next round of evaluations! We are excited to learn more about you and see how well you could fit with our team. The next step is
                        completing a 22-minute evaluation, which you can sign up and take <a style={{color:"#76defe", textDecoration:"underline"}} href={`https://moonshotinsights.io/apply/${this.state.uniqueName}`}>here</a>.
                    </div>
                    <div>
                        We look forward to reviewing your results. Please let me know if you have any questions.
                    </div>
                    <div>
                        All the best,
                        <div>
                            { getFirstName(this.props.currentUser.name) }
                        </div>
                    </div>
                </div>
                <div>
                </div>
            </div>
        );
    }


    render() {
        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

        return (
            <Dialog
                actions={actions}
                open={this.props.open ? true : false}
                onClose={this.handleClose}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                {this.state.name ?
                    <div>{ this.makeDialogBody() }</div>
                    :
                    <div className="fully-center">
                        <CircularProgress style={{ color: primaryCyan }} />
                    </div>
                }
            </Dialog>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        open: state.users.inviteCandidatesModalOpen
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(InviteCandidatesModal);
