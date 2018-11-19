"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction, addNotification } from "../../../actions/usersActions";
import { getFirstName, copyFromPage } from "../../../miscFunctions";
import { Dialog, FlatButton, CircularProgress } from "material-ui";
import { primaryCyan } from "../../../colors";
import { button } from "../../../classes.js";
import axios from "axios";

import "./dashboard.css";

class InviteCandidatesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose = () => {
        this.props.generalAction("CLOSE_INVITE_CANDIDATES_MODAL");
    };

    copyTemplate = () => {
        copyFromPage("#invite-template");
        this.handleClose();
        this.props.addNotification("Template copied to clipboard", "info");
    };

    makeDialogBody() {
        const { currentUser } = this.props;
        let businessName = undefined;
        let uniqueName = "";
        if (currentUser && typeof currentUser.businessInfo === "object") {
            const { businessInfo } = currentUser;
            businessName = businessInfo.businessName;
            uniqueName = businessInfo.uniqueName;
        }

        const subject = businessName ? `Invitation from ${businessName}` : "Evaluation Invitation";

        return (
            <div styleName="invite-candidates-modal">
                <div className="primary-cyan font22px font18pxUnder700">
                    Candidate Invite Template
                </div>
                <div className="font14px font12pxUnder700">
                    Copy, paste and tweak this message for your automated emails or other
                    communications with candidates.
                </div>
                <div className="font14px font12pxUnder700">
                    <div>Subject: {subject}</div>
                    <div id="invite-template">
                        <div>Hi,</div>
                        <div>
                            Congratulations, we would like to invite you to the next round of
                            evaluations! We are excited to learn more about you and see how well you
                            could fit with our team. The next step is completing a 22-minute
                            evaluation, which you can sign up and take{" "}
                            <a
                                style={{ color: "#76defe", textDecoration: "underline" }}
                                href={`https://moonshotinsights.io/apply/${uniqueName}`}
                            >
                                here
                            </a>.
                        </div>
                        <div>
                            We look forward to reviewing your results. Please let me know if you
                            have any questions.
                        </div>
                        <div>
                            All the best,
                            <div>{getFirstName(currentUser.name)}</div>
                        </div>
                    </div>
                </div>
                <div
                    className={
                        "primary-white font18px font16pxUnder700 font14pxUnder500 " + button.cyan
                    }
                    onClick={this.copyTemplate}
                >
                    Copy Message
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
            />
        ];

        return (
            <div>
                {this.props.currentUser ? (
                    <Dialog
                        actions={actions}
                        open={!!this.props.open}
                        onClose={this.handleClose}
                        autoScrollBodyContent={true}
                        paperClassName="dialogForBiz"
                        contentClassName="center"
                    >
                        <div>{this.makeDialogBody()}</div>
                    </Dialog>
                ) : null}
            </div>
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
    return bindActionCreators(
        {
            generalAction,
            addNotification
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InviteCandidatesModal);
