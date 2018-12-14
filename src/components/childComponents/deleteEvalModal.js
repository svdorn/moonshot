"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    addNotification,
    generalAction,
    updateStore
} from "../../actions/usersActions";
import { Button } from "../miscComponents";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import colors from "../../colors";
import { goTo } from "../../miscFunctions";
import axios from "axios";

import "./deleteEvalModal.css";

class DeleteEvalModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            frame: "First"
        };
    }

    close = () => {
        this.props.generalAction("CLOSE_DELETE_EVAL_MODAL");
        this.props.updateStore("blurMenu", false);
        this.setState({ frame: "First" });
    };

    deleteEval = () => {
        let self = this;
        console.log("deleting eval: ", this.props.name);
        console.log("deleting eval with id: ", this.props.positionId);

        const { currentUser, positionId } = this.props;

        const credentials = {
            userId: currentUser._id,
            verificationToken: currentUser.verificationToken,
            businessId: currentUser.businessInfo.businessId,
            positionId: positionId
        };
        // delete in backend
        axios
            .post("/api/business/deleteEvaluation", credentials)
            .then(res => {
                console.log("called it")
                // update the page that it was on to have the deleted position
                self.setState({ frame: "Second" });
            })
            .catch(err => {
                console.log("error getting positions: ", err);
                if (err.response && err.response.data) {
                    console.log(err.response.data);
                }
            });
    };

    firstFrame() {
        return (
            <div styleName="first-frame">
                <div className="font22px font20pxUnder700 font16pxUnder500">Delete Position</div>
                <div styleName="header-seperator" />
                <div className="font16px font14pxUnder700">
                    All of the data you{"'"}ve collected on this position will still be
                    saved for you. Do you wish to continue and delete the {this.props.name} position?
                </div>
                <div className="font18px font16pxUnder700 font14pxUnder500">
                    <div onClick={this.deleteEval}>Yes</div>
                    <div>|</div>
                    <div onClick={this.close}>No</div>
                </div>
            </div>
        );
    }

    positionDeletedFrame() {
        return (
            <div styleName="position-deleted">
                <div>
                    Position Deleted
                </div>
                <div>
                    {"Position has been successfully deleted. Contact us if you'd like to get your data back or activate the position again."}
                </div>
                <div>
                    <Button onClick={this.close}>
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        const { frame } = this.state;

        let content = null;
        switch (frame) {
            case "First":
                content = this.firstFrame();
                break;
            case "Second":
                content = this.positionDeletedFrame();
                break;
            default:
                content = this.firstFrame();
                break;
        }

        return (
            <Dialog open={!!this.props.open} maxWidth={false} onClose={this.close}>
                <div styleName="modal-container">
                    <DialogContent styleName="modal">{content}</DialogContent>
                </div>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            generalAction,
            updateStore
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        open: state.users.deleteEvalModal,
        name: state.users.deleteEvalName,
        positionId: state.users.deleteEvalId
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeleteEvalModal);
