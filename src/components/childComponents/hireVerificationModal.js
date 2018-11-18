"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generalAction, updateStore } from '../../actions/usersActions';
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import colors from "../../colors";
import { goTo, makePossessive } from "../../miscFunctions";
import { button } from "../../classes.js";
import axios from 'axios';

import "./hireVerificationModal.css";

class HireVerificationModal extends Component {
    constructor(props) {
        super(props);
    }

    close = () => {
        this.props.generalAction("CLOSE_HIRE_VERIFICATION_MODAL");
        this.props.updateStore("blurMenu", false);
    }

    render() {
        const { currentUser, open, candidateName, next } = this.props;

        if (!currentUser || currentUser.userType !== "accountAdmin" || !currentUser.businessInfo) return null;

        return (
            <Dialog
                open={!!open}
                maxWidth={false}
            >
                <div styleName="modal-container">
                    <div>
                        Hire Verification
                    </div>
                    <div>
                        Did you hire {candidateName}?
                    </div>
                    <div>
                        <div onClick={next}>
                            Yes
                        </div>
                        <div>
                            |
                        </div>
                        <div onClick={this.close}>
                            No
                        </div>
                    </div>
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
        open: state.users.hireVerificationModal
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HireVerificationModal);
