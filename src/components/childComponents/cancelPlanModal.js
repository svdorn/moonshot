"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generalAction, updateStore } from '../../actions/usersActions';
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import CornersButton from '../miscComponents/cornersButton';
import colors from "../../colors";
import { goTo } from "../../miscFunctions";
import { button } from "../../classes.js";
import axios from 'axios';

import "./cancelPlanModal.css";

class CancelPlanModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            frame: "First"
        };
    }

    close = () => {
        this.props.generalAction("CLOSE_CANCEL_PLAN_MODAL");
        this.props.updateStore("blurMenu", false);
        this.setState({ frame: "First" });
    }

    changeFrame = (frame) => {
        this.setState({ frame })
    }

    pausePlan = () => {
        console.log("pause plan");
        const pause = document.getElementById("pause");
        const message = pause.value;

        if (!message) {
            // error
        }

    }

    cancelPlan = () => {
        console.log("cancel plan");
        const cancel = document.getElementById("cancel");
        const message = cancel.value;

        if (!message) {
            // error
        }
        this.setState({ frame: "Cancel Confirmation" })
    }

    cancelPlanNoMessage = () => {
        console.log("cancel plan no message");
        this.setState({ frame: "Cancel Confirmation" })
    }

    firstFrame() {
        return (
            <div styleName="first-frame">
                <div className="font22px font20pxUnder700 font16pxUnder500">
                    Cancel Plan
                </div>
                <div styleName="header-seperator" />
                <div className="font18px font16pxUnder700 font14pxUnder500">
                    Would you pause the plan <div className="br above800Only"><br/></div>if you had the option?
                </div>
                <div className="font18px font16pxUnder700 font14pxUnder500">
                    <div onClick={() => this.changeFrame("Pause")}>
                        Yes
                    </div>
                    <div>
                        |
                    </div>
                    <div onClick={() => this.changeFrame("Cancel")}>
                        No
                    </div>
                </div>
            </div>
        );
    }

    pausePlanFrame() {
        return (
            <div styleName="pause-plan">
                How long do you need to pause the plan?
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
                    You{"'"}ll continue to have access <div className="br above800Only"><br/></div>until your current plan ends. All of <div className="br above800Only"><br/></div>your data will be saved for you.
                </div>
            </div>
        );
    }

    render() {
        const { frame } = this.state;

        let content = null;
        switch(frame) {
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
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
                onClose={this.close}
            >
                <div styleName="modal-container">
                    <DialogContent styleName="modal">
                        { content }
                    </DialogContent>
                    {frame === "First" || frame === "Cancel Confirmation" ?
                        <DialogActions>
                            <Button onClick={this.close} color="inherit">
                                Close
                            </Button>
                        </DialogActions>
                        : null
                    }
                </div>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction,
        updateStore
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        open: state.users.cancelPlanModal
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CancelPlanModal);
