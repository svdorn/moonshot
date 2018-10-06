"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";

import "../dashboard.css";


class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }


    render() {
        // return progress bar if not ready yet
        if (typeof this.state.billingIsSetUp !== "boolean") {
            return (
                <div className="fully-center">
                    <CircularProgress style={{ color: primaryCyan }} />
                </div>
            );
        }

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Account</div>
            </div>
        );


        const content = (
            <div style={{padding: "5px 14px"}}>
                <div>Candidate Invite Page</div>
                <div>
                    <span>Copy Link</span>
                    {" "}
                    <span>Email Template</span>
                </div>
                <div>Where to embed</div>
                <div>Add Admin</div>
                <div>2 admins</div>
                <div>Who to add</div>
            </div>
        );

        const smallCTA = (
            <div styleName="box-cta" onClick={() => goTo("/billing")}>
                { billingAction } Billing Info <img src={`/icons/LineArrow${this.props.png}`} />
            </div>
        );

        return (
            <div>
                { header }
                { content }
                { smallCTA }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Account);
