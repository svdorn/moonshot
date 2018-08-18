"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";


class MiscError extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        // TODO: include a fun picture in here
        return (
            <div className="center">
                Yikes, something went wrong. Our bad! Try refreshing or email
                us at support@moonshotinsights.io
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(MiscError);
