"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import Dialog from '@material-ui/core/Dialog';
import { } from '../../../../../actions/usersActions';

import SelectMethod from "./selectMethod";

class AutomateInvites extends Component {
    constructor(props) {
        super(props);

        this.state = { }
    }


    render() {
        let body = null;

        // the sequence of choices that have been made so far while following the
        // automate-candidate-invites path
        const sequence = this.props.sequence;

        // if no initial method path is selected, show the screen that asks if you want
        // to integrate with an ATS, put a script on your own site, or suggest
        // some other integration
        if (typeof sequence !== "object" || !sequence.method) { body = (<SelectMethod />); }

        return (
            <div className="automate-invites primary-white center">
                { body }
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

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(AutomateInvites);
