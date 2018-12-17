"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { goTo } from "../../miscFunctions";
import Button from "./Button";

class MiscError extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        // TODO: include a fun picture in here
        return (
            <div className="center fillScreen">
                <div className="font24px" style={{ margin: "30px" }}>
                    Whoops
                </div>
                <div>
                    Yikes, something went wrong. Our bad!<br />
                    Try refreshing or email us at support@moonshotinsights.io
                </div>
                <Button style={{ margin: "20px" }} onClick={() => goTo("/myEvaluations")}>
                    Take Me Home
                </Button>
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
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MiscError);
