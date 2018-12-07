"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CircularProgress, Dialog, DialogActions } from "@material-ui/core";
import { closeLogoutModal } from "../../actions/usersActions";
import { isWhiteOrUndefined } from "../../miscFunctions";
import { Button } from "../miscComponents";

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

    handleClose = () => {
        this.props.closeLogoutModal();
    };

    render() {
        let dialogBody = (

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
        textColor: state.users.textColor
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeLogoutModal
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LogoutModal);
