"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../actions/usersActions";
import {  } from "../../../miscFunctions";

import "./dashboard.css";


class DashboardItem extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        // get the relative width of the dashboard item
        let width = this.props.width;
        if (typeof this.props.width === "string") {
            width = parseInt(this.props.width, 10);
        } if (typeof width !== "number" || width === NaN || width < 1 || width > 4) {
            width = 1;
        }
        width = Math.round(width);

        return (
            <div styleName=`dashboard-item width-${width}`>
                
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(DashboardItem);
