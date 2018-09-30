"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { hidePopups } from "../../../../actions/usersActions";

class WelcomeMessage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    hideMessage() {
        let popups = this.props.currentUser.popups;
        if (popups) {
            popups.dashboard = false;
        } else {
            popups = {};
            popups.dashboard = false;
        }

        const userId = this.props.currentUser._id;
        const verificationToken = this.props.currentUser.verificationToken;

        this.props.hidePopups(userId, verificationToken, popups);
    }

    popup() {
        if (this.props.currentUser && this.props.currentUser.popups && this.props.currentUser.popups.dashboard) {
            return (
                <div className="center marginBottom10px" key="popup box">
                    <div className="popup-box font16px font14pxUnder700 font12pxUnder500">
                        <div className="popup-frame" style={{paddingBottom:"20px"}}>
                            <div>
                                <img
                                    alt="Alt"
                                    src={"/icons/Cube" + this.props.png}
                                />
                            </div>
                            <div style={{marginTop:"20px"}}>
                                <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">Welcome to your Dashboard!</div>
                                <div>
                                    This is your dashboard, where you can see all the most recent activity across every
                                    project in this workspace. It is the perfect place to start your day.
                                </div>
                            </div>
                        </div>
                        <div className="hide-message" onClick={this.hideMessage.bind(this)}>Hide Message</div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <div>
                { this.popup() }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        loading: state.users.loadingSomething,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        hidePopups
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(WelcomeMessage);
