"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generalAction, addNotification } from '../../../../../../actions/usersActions';
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import colors from "../../../../../../colors";
import { goTo } from "../../../../../../miscFunctions";
import { button } from "../../../../../../classes.js";
import axios from 'axios';

import "../../../dashboard.css";

class VerificationModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingSendVerificationEmail: false
        }
    }

    close = () => {
        this.props.generalAction("CLOSE_VERIFICATION_MODAL");
    }

    sendVerificationEmail = () => {
        let self = this;
        if (this.state.loadingSendVerificationEmail) { return; }

        // set up the loading spinner
        this.setState({ loadingSendVerificationEmail: true });

        const user = this.props.currentUser;
        const credentials = {
            userId: user._id,
            verificationToken: user.verificationToken
        }
        axios.post("/api/accountAdmin/sendVerificationEmail", credentials)
        .then(response => {
            self.props.addNotification(`Verification email sent to ${user.email}!`, "info");
            self.close();
        })
        .catch(error => {
            self.props.addNotification(`Error sending verification email. Refresh and try again.`, "error");
            self.close();
        })
    }

    render() {

        return (
            <Dialog
                open={!!this.props.open}
                maxWidth={false}
                onClose={this.close}
            >
                <div styleName="modal-signup">
                    <div className="primary-cyan font22px font18pxUnder700 center">
                        Verify Your Email
                    </div>
                    <div className="center font16px font14pxUnder700" style={{maxWidth: "400px", margin:"5px auto"}}>
                        Go to your inbox to verify. This will allow us to activate your page and evaluations.
                    </div>
                    <div className="center">
                        <div
                            className={this.state.loadingSendVerificationEmail ? button.disabled : button.cyan}
                            onClick={this.sendVerificationEmail}
                            style={{margin: "20px auto", fontSize: "18px", color: "white"}}
                        >
                            Re-Send Verification Email
                        </div>
                        {this.state.loadingSendVerificationEmail ? <div><CircularProgress color={colors.primaryCyan} /></div> : null}
                    </div>
                </div>
            </Dialog>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        open: state.users.verificationModal,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VerificationModal);
