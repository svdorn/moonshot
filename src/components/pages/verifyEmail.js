"use strict"
import React, { Component } from 'react';
import { verifyEmail } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Paper } from 'material-ui';
class VerifyEmail extends Component {

    onVerifyClick() {
        let url = window.location.href;
        console.log(url);
        const token = url.substr(url.indexOf('?') + 1);
        console.log(token);
        this.props.verifyEmail(token)
    }

    render() {
        return(
            <div>
                <Paper className="form" zDepth={2}>
                    <h1>Verify Email</h1>
                    <button onClick={this.onVerifyClick.bind(this)}>
                        Click here to verify your email
                    </button>
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

// function mapStateToProps(state) {
//     return {};
// }

export default connect(null, mapDispatchToProps)(VerifyEmail);
