"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../../childComponents/addUserDialog';
import { changeAutomateInvites, addNotification, updateUser } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";

class WhichATS extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ats: ""
        }
    }


    submitATS() {
        const self = this;
        axios.post("/api/accountAdmin/identifyATS", {
            ats: this.state.ats,
            userId: this.props.user._id,
            verificationToken: this.props.user.verificationToken
        })
        .then(response => {
            this.props.updateUser(response.data.user);
        })
        .catch(error => {
            self.props.addNotification("Error, refresh and try again.", "error");
        });
    }


    // when typing into the form asking which ats they use
    onChange(e) {
        this.setState({ ats: e.target.value });
    }


    render() {
        return (
            <div>
                <div>
                    Let us know and we{"'"}ll see if we can set up an integration.
                </div>
                <div className="buttonArea font18px font14pxUnder900" style={{justifyContent:"center"}}>
                    <input
                        type="text"
                        name="email"
                        placeholder="What's your ATS?"
                        className="blackInput getStarted"
                        value={this.state.ats}
                        onChange={this.onChange.bind(this)}
                    />
                    <div
                        className="button round-10px gradient-transition gradient-1-purple-light gradient-2-cyan"
                        onClick={this.submitATS.bind(this)}
                        style={{
                            marginLeft: "20px",
                            padding: "0 14px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center"
                        }}
                    >Enter</div>
                </div>
                { this.props.previousNextArea }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        automationStep: state.users.automateInvites,
        user: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites,
        updateUser,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(WhichATS);
