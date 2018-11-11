"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { noop } from "../../miscFunctions";
import { primaryCyan, primaryWhite } from "../../colors";
import "./cornersButton.css";

class CornersButton extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        let { className, onClick, color1, color2, style, content, png, size, active } = this.props;
        console.log("active: ", active)
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
        if (typeof style !== "object") {
            style = {};
        }
        if (typeof size !== "string") {
            size = "";
        }
        if (typeof active !== "string") {
            active = "";
        }
        console.log("active: ", active)

        return (
            <div styleName={"button " + size + " " + active} className={className} onClick={onClick} style={style}>
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
                <img styleName="arrow" src={`/icons/LineArrow${png}`} />
                <div styleName="above-hover-content" style={{ backgroundColor: color1 }} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

export default connect(mapStateToProps)(CornersButton);
