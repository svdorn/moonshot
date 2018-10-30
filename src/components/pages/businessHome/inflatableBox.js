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
            <div
                styleName="box"
                key={this.props.key ? this.props.key : ""}
                onClick={typeof this.props.onClick === "function" ? this.props.onClick : () => {}}
            >
                <div styleName="hoverable">
                    <div styleName="background" />
                </div>
                <div styleName="foreground">
                    <div styleName="title">{this.props.title}</div>
                    <div styleName="body">
                        <div>{this.props.body}</div>
                        <div>Tour the product now</div>
                        <img
                            className="hover-move-arrow"
                            style={{ height: "8px", marginTop: "-1px" }}
                            src={`/icons/ArrowBlue${this.props.png}`}
                        />
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
