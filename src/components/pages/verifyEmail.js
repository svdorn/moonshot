"use strict"
import React, { Component } from 'react';
import { verifyEmail } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Paper, RaisedButton } from 'material-ui';
class VerifyEmail extends Component {

    onVerifyClick() {
        const token = this.props.location.search.substr(1);
        this.props.verifyEmail(token);
    }

    render() {
        console.log("props: ", this.props);

        return(
            <div>
                {this.props.verifyEmailErrorMsg !== undefined ?
                    <Paper className="messageHeader errorHeader">
                        {this.props.verifyEmailErrorMsg}
                    </Paper>
                    :
                    null
                }
                <Paper className="form" zDepth={2}>
                    <h1>Verify Email</h1>
                    <RaisedButton
                        label="Verify my account"
                        primary={true}
                        onClick={this.onVerifyClick.bind(this)}
                    />
                </Paper>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        verifyEmail
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        verifyEmailErrorMsg: state.users.verifyEmailErrorMsg
    };
}

export default connect(null, mapDispatchToProps)(VerifyEmail);
