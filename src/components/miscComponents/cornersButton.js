"use strict";
import React, { Component } from "react";
import { noop } from "../../miscFunctions";
import { primaryCyan, primaryWhite } from "../../colors";
import "./cornersButton.css";

class CornersButton extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let { className, onClick, color1, color2, content } = this.props;
        if (typeof className !== "string") {
            className = "";
        }
        if (typeof onClick !== "function") {
            onClick = noop;
        }
        if (typeof color1 !== "string") {
            color1 = primaryCyan;
        }
        if (typeof color2 !== "string") {
            color2 = primaryWhite;
        }
        return (
            <div styleName="button" className={className} onClick={onClick}>
                <div styleName="content" style={{ color: color1 }}>
                    {content}
                </div>
                <div styleName="border border-top" style={{ backgroundColor: color1 }} />
                <div styleName="border border-right" style={{ backgroundColor: color1 }} />
                <div styleName="border border-bottom" style={{ backgroundColor: color1 }} />
                <div styleName="border border-left" style={{ backgroundColor: color1 }} />
                <div styleName="under-hover-content" style={{ backgroundColor: color1 }} />
                <div styleName="hover-content" style={{ color: color2 }}>
                    {content}
                </div>
                <div styleName="above-hover-content" style={{ backgroundColor: "red" }} />
            </div>
        );
    }
}

export default CornersButton;
