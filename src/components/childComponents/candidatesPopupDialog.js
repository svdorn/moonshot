"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { closeCandidatesPopupModal, addNotification } from "../../actions/usersActions";
import {} from "../../miscFunctions";
import { Dialog } from "material-ui";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../colors";

class CandidatesPopupDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        };

        this.handleClose = this.handleClose.bind(this);
    }

    componentDidUpdate() {
        // make sure the props defining whether the modal is open matches the state for that
        if (this.props.modalOpen != undefined && this.props.modalOpen != this.state.open) {
            this.setState({ open: this.props.modalOpen });
        }
    }

    handleClose = () => {
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        let popups = currentUser.popups;
        if (popups) {
            popups.candidateModal = false;
        } else {
            popups = {};
            popups.candidateModal = false;
        }

        const userId = currentUser._id;
        const verificationToken = currentUser.verificationToken;

        this.props.closeCandidatesPopupModal(userId, verificationToken, popups);
    };

    render() {
        const dialog = (
            <Dialog
                modal={false}
                open={this.state.open}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                <div>
                    <div className="primary-cyan font24px font20pxUnder700 font18pxUnder500 marginTop20px">
                        View Mock Data
                    </div>
                    <div
                        className="secondary-gray marginTop10px font16px font14pxUnder700 font12pxUnder500"
                        style={{ textAlign: "left" }}
                    >
                        We populated mock data for you to play around with. This will give you a
                        sense of what things look like once you have candidates.
                    </div>
                    <div className="marginTop20px font18px font16pxUnder700">
                        {!this.props.loading ? (
                            <button
                                className="button noselect round-6px background-primary-cyan primary-white"
                                onClick={this.handleClose}
                                style={{ padding: "3px 10px" }}
                            >
                                <span>Check It Out</span>
                            </button>
                        ) : (
                            <div className="center marginTop20px">
                                <CircularProgress style={{ color: primaryCyan }} />
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        );

        return <div>{dialog}</div>;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        modalOpen: state.users.candidatesPopupModalOpen,
        loading: state.users.loadingSomething
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeCandidatesPopupModal,
            addNotification
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CandidatesPopupDialog);
