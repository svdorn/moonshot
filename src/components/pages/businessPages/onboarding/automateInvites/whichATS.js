"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import AddUserDialog from '../../../../childComponents/addUserDialog';
import { changeAutomateInvites } from '../../../../../actions/usersActions';
import { secondaryGray } from "../../../../../colors";

class SelectMethod extends Component {
    boxClick(method) {
        //this.props.changeAutomateInvites({ method });
        console.log("doing: ", method);
    }


    render() {
        return null;

        return (
            <div>
                <div style={{textAlign: "left"}}>
                    Let us know and we{"'"}ll see if we can set up an integration.
                </div>
                <div className="buttonArea font18px font14pxUnder900">
                    <input
                        type="text"
                        name="email"
                        placeholder="Email Address"
                        className="blackInput getStarted"
                        value={this.state.email}
                        onChange={this.onChange.bind(this)}
                    />
                    <div className="getStarted button round-4px gradient-transition gradient-1-purple-light gradient-2-cyan" onClick={this.submitATS}>
                        Enter
                    </div>
                </div>
                { this.props.previousNextArea }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        sequence: state.users.automateInvites
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(SelectMethod);
