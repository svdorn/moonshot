"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { closeNotification } from '../actions/usersActions';
import { Paper, SvgIcon } from 'material-ui';
import ContentClear from 'material-ui/svg-icons/content/clear';

class Notification extends Component {
    close() {
        // only close the notification if the most recent notification popped up
        // more than 4 seconds ago - this prevents the situation where a notification
        // is x'ed out, another notification comes up within 5 seconds of the first
        // one coming up, and then the new one immediately closing itself
        if (this.props.notificationDate && (new Date()).getTime() - this.props.notificationDate.getTime() > 4000) {
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
        const messageStyle = {
            display: "inline-block",
            verticalAlign: "top",
            paddingTop: "13px",
            marginRight: "30px",
            marginLeft: "30px"
        }

        return(
            <div>
                {this.props.notification ?
                    <Paper className={"messageHeader " + this.props.notification.type}>
                        <div style={messageStyle}>{this.props.notification.message}</div>
                        <SvgIcon
                            id="notificationCloseButton"
                            onClick={this.onCloseClick.bind(this)}
                            style={{marginTop: "-3px"}}
                            className="clickable">
                            <ContentClear color="#66b1ff" />
                        </SvgIcon>
                    </Paper>
                    :
                    null
                }
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        notification: state.users.notification,
        notificationDate: state.users.notificationDate,
        autoCloseNotification: state.users.autoCloseNotification
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
