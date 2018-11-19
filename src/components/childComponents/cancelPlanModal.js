"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    addNotification,
    cancelBillingPlan,
    generalAction,
    pauseBillingPlan,
    updateStore
} from "../../actions/usersActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import CornersButton from "../miscComponents/cornersButton";
import colors from "../../colors";
import { goTo } from "../../miscFunctions";
import { button } from "../../classes.js";
import axios from "axios";

import "./cancelPlanModal.css";

class CancelPlanModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            frame: "First",
            error: undefined
        };
    }

    close = () => {
        this.props.generalAction("CLOSE_CANCEL_PLAN_MODAL");
        this.props.updateStore("blurMenu", false);
        this.setState({ frame: "First", error: undefined });
    };

    changeFrame = frame => {
        this.setState({ frame, error: undefined });
    };

    pausePlan = () => {
        const pause = document.getElementById("pause");
        const message = pause.value;

        if (!this.props.currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        const { _id, verificationToken } = this.props.currentUser;

        if (!message) {
            // error
            return this.setState({ error: "Before you cancel, please let us know why." });
        }
        this.props.pauseBillingPlan(_id, verificationToken, message);
        this.setState({ frame: "First" });
    };

    cancelPlan = () => {
        const cancel = document.getElementById("cancel");
        const message = cancel.value;

        // make sure there's a user logged in
        if (!this.props.currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        const { _id, verificationToken } = this.props.currentUser;

        if (!message) {
            // error
            return this.setState({ error: "Before you cancel, please let us know why." });
        }
        this.props.cancelBillingPlan(_id, verificationToken, message);
        this.setState({ frame: "Cancel Confirmation" });
    };

    cancelPlanNoMessage = () => {
        // make sure there's a user logged in
        if (!this.props.currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        const { _id, verificationToken } = this.props.currentUser;

        this.props.cancelBillingPlan(_id, verificationToken, null);
        this.setState({ frame: "Cancel Confirmation" });
    };

    firstFrame() {
        return (
            <div styleName="first-frame">
                <div className="font22px font20pxUnder700 font16pxUnder500">Cancel Plan</div>
                <div styleName="header-seperator" />
                <div className="font18px font16pxUnder700 font14pxUnder500">
                    Would you pause the plan{" "}
                    <div className="br above800Only">
                        <br />
                    </div>if you had the option?
                </div>
                <div className="font18px font16pxUnder700 font14pxUnder500">
                    <div onClick={() => this.changeFrame("Pause")}>Yes</div>
                    <div>|</div>
                    <div onClick={() => this.changeFrame("Cancel")}>No</div>
                </div>
            </div>
        );
    }

    pausePlanFrame() {
        return (
            <div styleName="pause-plan">
                How long do you need to pause the plan?
                {this.state.error ? (
                    <div className="font14px secondary-red">{this.state.error}</div>
                ) : null}
                <div>
                    <textarea styleName="textarea" id="pause" placeholder="Type info here..." />
                </div>
                <CornersButton
                    onClick={this.pausePlan}
                    content="Request a Pause"
                    size="small-padding"
                    color1={colors.primaryCyan}
                    color2={colors.primaryWhite}
                    className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                />
                <div onClick={this.cancelPlanNoMessage} styleName="finalize-cancellation">
                    <u>Finalize Cancellation</u>
                </div>
            </div>
        );
    }

    cancelPlanFrame() {
        return (
            <div styleName="cancel-plan">
                {"What's the single biggest reason for you cancelling?"}
                {this.state.error ? (
                    <div className="font14px secondary-red">{this.state.error}</div>
                ) : null}
                <div>
                    <textarea styleName="textarea" id="cancel" placeholder="Type here..." />
                </div>
                <CornersButton
                    onClick={this.cancelPlan}
                    content="Finalize Cancellation"
                    size="small-padding"
                    color1={colors.primaryCyan}
                    color2={colors.primaryWhite}
                    className="font16px font14pxUnder900 font12pxUnder400 marginTop20px"
                />
            </div>
        );
    }

    cancelConfirmationFrame() {
        return (
            <div styleName="cancel-confirmation">
                <div className="font22px font20pxUnder700 font16pxUnder500 marginBottom15px">
                    Plan Cancelled
                </div>
                <div styleName="header-seperator" />
                <div className="font18px font16pxUnder700 font14pxUnder500 marginTop15px">
                    You{"'"}ll continue to have access{" "}
                    <div className="br above800Only">
                        <br />
                    </div>until your current plan ends. All of{" "}
                    <div className="br above800Only">
                        <br />
                    </div>your data will be saved for you.
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
            case "Pause":
                content = this.pausePlanFrame();
                break;
            case "Cancel":
                content = this.cancelPlanFrame();
                break;
            case "Cancel Confirmation":
                content = this.cancelConfirmationFrame();
                break;
            default:
                content = this.firstFrame();
                break;
        }

        return (
            <Dialog open={!!this.props.open} maxWidth={false} onClose={this.close}>
                <div styleName="modal-container">
                    <DialogContent styleName="modal">{content}</DialogContent>
                    {frame === "First" || frame === "Cancel Confirmation" ? (
                        <DialogActions>
                            <Button onClick={this.close} color="inherit">
                                Close
                            </Button>
                        </DialogActions>
                    ) : null}
                </div>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            cancelBillingPlan,
            generalAction,
            pauseBillingPlan,
            updateStore
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        open: state.users.cancelPlanModal
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CancelPlanModal);
