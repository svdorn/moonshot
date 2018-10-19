"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { closeNotification } from "../actions/usersActions";
import { withRouter } from "react-router";
import { Paper, SvgIcon } from "material-ui";
import ContentClear from "material-ui/svg-icons/content/clear";

import "./notification.css";

class Notification extends Component {
    close() {
        // only close the notification if the most recent notification popped up
        // more than 4 seconds ago - this prevents the situation where a notification
        // is x'ed out, another notification comes up within 5 seconds of the first
        // one coming up, and then the new one immediately closing itself
        if (
            this.props.notificationDate &&
            new Date().getTime() - this.props.notificationDate.getTime() > 4000
        ) {
            this.props.closeNotification();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // close after 5 seconds as long as the notification doesn't say not to
        const self = this;
        if (this.props.autoCloseNotification !== false) {
            setTimeout(() => self.close(), 5000);
        }
    }

    onCloseClick() {
        this.props.closeNotification();
    }

    render() {
        if (!this.props.notification) {
            return null;
        }

        let pathname = "";
        let shiftClass = "";
        try {
            pathname = this.props.location.pathname;
        } catch (e) {}

        if (pathname === "/") {
            shiftClass = "shift-down";
        }

        const { user } = this.props;
        const adminClass =
            pathname === "/explore" || (user && user.userType === "accountAdmin")
                ? "account-admin-notification"
                : "";

        return (
            <div>
                <Paper
                    styleName={`notification ${
                        this.props.notification.type
                    } ${adminClass} ${shiftClass}`}
                >
                    <div styleName="notification-message">{this.props.notification.message}</div>
                    <div styleName="close-button" onClick={this.onCloseClick.bind(this)}>
                        x
                    </div>
                </Paper>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        user: state.users.currentUser,
        notification: state.users.notification,
        notificationDate: state.users.notificationDate,
        autoCloseNotification: state.users.autoCloseNotification
    };
}

Notification = withRouter(Notification);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Notification);
