"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../actions/usersActions';
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import colors from "../../colors";
import { goTo } from "../../miscFunctions";
import { button } from "../../classes.js";
import axios from 'axios';

import "./lockedAccountModal.css";

class LockedAccountModal extends Component {
    constructor(props) {
        super(props);

        this.state = { };
    }

    close = () => {
        this.props.generalAction("CLOSE_LOCKED_ACCOUNT_MODAL");
    }

    render() {

        return (
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
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

    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        open: state.users.lockedAccountModal
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LockedAccountModal);
