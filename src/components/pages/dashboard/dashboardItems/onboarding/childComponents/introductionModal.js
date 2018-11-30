"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router";
import {
    generalAction,
    closeIntroductionModal,
    updateStore
} from "../../../../../../actions/usersActions";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import colors from "../../../../../../colors";
import { goTo } from "../../../../../../miscFunctions";
import { button } from "../../../../../../classes.js";
import axios from "axios";
import AddPositionModal from "./addPositionModal";
import ShiftArrow from "../../../../../miscComponents/shiftArrow";

import "../../../dashboard.css";

class IntroductionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            frame: undefined,
            role: undefined,
            title: undefined
        };
    }

    componentDidMount() {
        const query = this.props.location.query;
        if (query) {
            if (query.role) {
                return this.setState({ frame: "addPosition", role: query.role });
            } else if (query.title) {
                return this.setState({ frame: "addPosition", title: query.title });
            }
        }
        this.setState({ frame: "welcome" });
    }

    close = () => {
        this.props.closeIntroductionModal();
    };

    welcomeFrameClick = () => {
        this.props.updateStore("welcomeToMoonshot", true);
        this.close();
    };

    makeWelcomeFrame() {
        return (
            <div styleName="welcome-frame-modal">
                <div className="font22px font18pxUnder700 font14pxUnder500 primary-cyan">
                    Welcome to Moonshot Insights!
                </div>
                <div className="font16px font14pxUnder700 font12pxUnder500 marginTop10px">
                    We created a 22-minute evaluation that you can share with your candidates to
                    understand their personality, ability to learn, adapt and problem solve. This
                    data enables us to predict each candidate’s job performance, growth potential,
                    culture fit, and longevity at your company.
                </div>
                <div styleName="welcome-text" onClick={this.welcomeFrameClick}>
                    Continue{" "}
                    <ShiftArrow width="17px" color="cyan" style={{ marginBottom: "4px" }} />
                </div>
            </div>
        );
    }

    render() {
        let frame = null;
        if (this.state.frame === "addPosition") {
            frame = (
                <div styleName="modal-position-info">
                    <AddPositionModal
                        close={this.close}
                        title={this.state.title}
                        role={this.state.role}
                    />
                </div>
            );
        } else {
            frame = <div styleName="modal-signup">{this.makeWelcomeFrame()}</div>;
        }

        return (
            <Dialog open={!!this.props.open} maxWidth={false} onClose={this.close}>
                {frame}
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            generalAction,
            closeIntroductionModal,
            updateStore
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        png: state.users.png,
        open: state.users.introductionModal
    };
}

IntroductionModal = withRouter(IntroductionModal);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IntroductionModal);
