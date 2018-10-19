"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { hidePopups, updateStore } from "../../../../actions/usersActions";

class WelcomeMessage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    hideMessage() {
        const { currentUser } = this.props;

        // if there is a user, save in the db that they dismissed the banner
        if (currentUser) {
            let popups = currentUser.popups;
            if (popups) {
                popups.dashboard = false;
            } else {
                popups = {};
                popups.dashboard = false;
            }

            const userId = currentUser._id;
            const verificationToken = currentUser.verificationToken;

            this.props.hidePopups(userId, verificationToken, popups);
        }
        // otherwise just save it in the redux store
        else {
            this.props.updateStore("dismissedWelcomeBanner", true);
        }
    }

    popup() {
        const { currentUser } = this.props;
        let showBanner = false;
        // if there is no current user, see if they dismissed the welcome banner
        // in redux state from the lead dashboard
        if (!currentUser) {
            showBanner = !this.props.dismissedWelcomeBanner;
        } else {
            showBanner = currentUser.popups && currentUser.popups.dashboard;
        }

        if (showBanner) {
            return (
                <div className="center marginBottom10px" key="popup box">
                    <div className="popup-box font16px font14pxUnder700 font12pxUnder500">
                        <div className="popup-frame" style={{ paddingBottom: "20px" }}>
                            <div>
                                <img alt="Alt" src={"/icons/dashboardBanner" + this.props.png} />
                            </div>
                            <div style={{ marginTop: "20px" }}>
                                <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">
                                    Welcome to Moonshot Insights!
                                </div>
                                <div>
                                    We predict the success of your candidates and build a predictive
                                    model for your company. You simply share your candidate invite
                                    page so candidates can complete their evaluations and you can
                                    review their results.
                                </div>
                            </div>
                        </div>
                        <div
                            className="hide-message font14px font12pxUnder700"
                            onClick={this.hideMessage.bind(this)}
                        >
                            Hide Message
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        return <div>{this.popup()}</div>;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        loading: state.users.loadingSomething,
        dismissedWelcomeBanner: state.users.dismissedWelcomeBanner
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ hidePopups, updateStore }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WelcomeMessage);
