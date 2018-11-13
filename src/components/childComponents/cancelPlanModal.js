"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generalAction, updateStore } from '../../actions/usersActions';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
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
        this.setState({ frame: "First" });
    }

    changeFrame = (frame) => {
        this.setState({ frame })
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
                Pause
            </div>
        );
    }

    cancelPlanFrame() {
        return (
            <div styleName="cancel-plan">
                Cancel
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
                    { content }
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
