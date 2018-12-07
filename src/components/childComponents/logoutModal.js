"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CircularProgress, Dialog, DialogActions } from "@material-ui/core";
import { closeLogoutModal, signout } from "../../actions/usersActions";
import { isWhiteOrUndefined, goTo } from "../../miscFunctions";
import { Button } from "../miscComponents";

import "./logoutModal.css";

class LogoutModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open || false
        };
    }

    componentDidUpdate(prevProps, prevState) {
        // make sure the props defining whether the modal is open matches the state for that
        if (this.props.open != this.state.open && this.props.open != undefined) {
            const open = this.props.open;
            this.setState({ open });
        }
    }

    // sign out of user's account
    signOut = () => {
        let self = this;

        this.props.signout(() => {
            self.handleClose();
            goTo("/");
        });
    };

    handleClose = () => {
        this.props.closeLogoutModal();
    };

    render() {
        let dialogBody = (
            <div styleName="body">
                <div style={{ color: this.props.primaryColor }} className="font22px font18pxUnder500">Log Out</div>
                <div>Are you sure you want to log out? By doing so, you won{"'"}t be able to access your account again.</div>
                <div styleName="yes-or-no" className="font18px font16pxUnder700 font14pxUnder500">
                    <div onClick={this.signOut}>Yes</div>
                    <div>|</div>
                    <div onClick={this.handleClose}>No</div>
                </div>
            </div>
        );

        return (
            <Dialog
                open={!!this.state.open}
                maxWidth={false}
                onClose={this.handleClose}
                classes={{
                    paper: isWhiteOrUndefined(this.props.textColor)
                        ? "background-primary-black-dark-important"
                        : ""
                }}
            >
                <div className="dialog-margins">{dialogBody}</div>
                <DialogActions>
                    <Button variant="text" onClick={this.handleClose}>
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        open: state.users.logoutModal,
        loading: state.users.loadingSomething,
        textColor: state.users.textColor,
        primaryColor: state.users.primaryColor
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeLogoutModal,
            signout
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogoutModal);
