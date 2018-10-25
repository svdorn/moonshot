"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generalAction, closeIntroductionModal } from '../../../../../../actions/usersActions';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import colors from "../../../../../../colors";
import { goTo } from "../../../../../../miscFunctions";
import { button } from "../../../../../../classes.js";
import axios from 'axios';

import "../../../dashboard.css";

class IntroductionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    close = () => {
        this.props.closeIntroductionModal();
    }

    render() {
        return (
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
                onClose={this.close}
            >
                <div styleName="modal-signup">
                    Introduction Modal
                </div>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction,
        closeIntroductionModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        open: state.users.introductionModal
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(IntroductionModal);
