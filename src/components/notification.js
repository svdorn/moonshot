"use strict"
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { closeNotification } from '../actions/usersActions';
import { Paper, RaisedButton, IconButton } from 'material-ui';
import ContentClear from 'material-ui/svg-icons/content/clear';

class Notification extends Component {
    componentDidUpdate() {
        // close after 5 seconds
        setTimeout(function() {this.props.closeNotification()}.bind(this), 5000)
    }

    onCloseClick() {
        this.props.closeNotification();
    }

    render() {
        const messageStyle = {
            display: "inline-block",
            verticalAlign: "top",
            paddingTop: "13px"
        }

        return(
            <div>
                {this.props.notification ?
                    <Paper className={"messageHeader " + this.props.notification.type}>
                        <div style={messageStyle}>{this.props.notification.message}</div>
                        <IconButton
                            onClick={this.onCloseClick.bind(this)}
                            style={{marginTop: "-3px"}}>
                            <ContentClear />
                        </IconButton>
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
        notification: state.users.notification
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
