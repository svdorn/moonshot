"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction, addNotification } from "../../../actions/usersActions";
import { getFirstName, copyFromPage, copyCustomLink, makePossessive } from "../../../miscFunctions";
import { Dialog } from "@material-ui/core";
import { Button, CornersButton } from "../../miscComponents";
import axios from "axios";

import "./inviteCandidatesModal.css";

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
        copyFromPage("#invite-template-email");
        this.props.addNotification("Template copied to clipboard", "info");
    };

    // copy the business' custom link
    copyLink = e => {
        if (e) e.preventDefault();
        copyCustomLink(this.props.currentUser, this.props.addNotification);
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
            <div styleName="invite-candidates-modal" className="center">
                <div className="primary-cyan font22px font18pxUnder700">
                    Candidate Invite Template
                </div>
                <div className="font14px font12pxUnder700" style={{ margin: "10px auto 17px" }}>
                    Copy, paste, and tweak this message for your automated emails or other
                    communications with candidates. It's best to send this message to all (or the
                    majority) of your applicants 24-48 hours after they apply.
                </div>
                <div className="font14px font12pxUnder700">
                    <i style={{ marginRight: "7px" }}>
                        {businessName ? makePossessive(businessName) : "Your"} candidate invite page
                    </i>
                    <br className="under400only" />
                    <CornersButton
                        content="Get Link"
                        onClick={this.copyLink}
                        arrow={false}
                        paddingSides="24px"
                        paddingTop="6px"
                        style={{ marginLeft: "7px" }}
                        className="marginRight"
                    />
                </div>
                <div styleName="email" className="font14px font12pxUnder700">
                    <div>Subject: {subject}</div>
                    <div id="invite-template-email">
                        <div>Hi,</div>
                        <div>
                            Congratulations, we would like to invite you to the next round of
                            evaluations! We are excited to learn more about you and see how well you
                            could fit with our team. The next step is completing a 22-minute
                            evaluation, which you can take{" "}
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
                            <div>{currentUser ? getFirstName(currentUser.name) : ""}</div>
                        </div>
                    </div>
                </div>
                <Button onClick={this.copyTemplate}>Copy Message</Button>
            </div>
        );
    }

    render() {
        return this.props.currentUser ? (
            <Dialog
                open={!!this.props.open}
                onClose={this.handleClose}
                classes={{ paper: "background-primary-black-dark-important" }}
                maxWidth={false}
            >
                <div styleName="container">
                    {this.makeDialogBody()}
                    <Button
                        variant="text"
                        label="Close"
                        onClick={this.handleClose}
                        style={{
                            float: "right",
                            marginBottom: "5px",
                            marginRight: "-22px"
                        }}
                    >
                        CLOSE
                    </Button>
                </div>
            </Dialog>
        ) : null;
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
