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
            // list of other admins that are in this business
            adminList: undefined,
            // if there was an error fetching the data for this box
            fetchDataError: false
        };
    }


    componentDidMount() {
        const self = this;

        const { _id, verificationToken, businessInfo } = this.props.currentUser;
        const query = {
            params: {
                userId: _id,
                verificationToken,
                businessId: businessInfo.businessId,
                includeSelf: false
            }
        }

        axios.get("/api/business/adminList", query)
        .then(response => {
            if (propertyExists(response, ["data", "adminList"]) && Array.isArray(response.data.adminList)) {
                self.setState({ adminList: response.data.adminList });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            console.log(error);
            self.setState({ fetchDataError: true });
        })
    }


    render() {
        // return progress bar if not ready yet
        if (!Array.isArray(this.state.adminList)) {
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
            <div styleName="box-cta" onClick={() => goTo("/settings")}>
                Update Settings <img src={`/icons/LineArrow${this.props.png}`} />
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
