"use strict"
import React, { Component } from 'react';
import { verifyEmail } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Paper } from 'material-ui';
class VerifyEmail extends Component{

    render(){
        onVerifyClick() {
            
        }

        return(
            <div>
                <Paper className="form" zDepth={2}>
                    <h1>Verify Email</h1>
                    <button onclick={onVerifyClick}>
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
//     return {
//         formData: state.form
//     };
// }

export default connect(null, mapDispatchToProps)(VerifyEmail);
