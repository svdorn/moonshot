"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";

import "./inflatableBox.css";

class InflatableBox extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div styleName="box">
                <div styleName="hoverable">
                    <div>
                        <div>{this.props.title}</div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

export default connect(mapStateToProps)(InflatableBox);
