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
        let {
            className,
            onClick,
            color1,
            color2,
            style,
            content,
            png,
            size,
            active,
            arrow,
            paddingSides,
            paddingTop
        } = this.props;
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
        if (typeof paddingSides !== "string") {
            paddingSides = "50px";
        }
        if (typeof paddingTop !== "string") {
            paddingTop = "16px";
        }
        paddingSides = "side-padding-" + paddingSides;
        paddingTop = "top-padding-" + paddingTop;

        return (
            <div
                styleName={`button ${size} ${active} ${paddingSides} ${paddingTop}`}
                className={className}
                onClick={onClick}
                style={style}
            >
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
                {arrow === false ? null : <img styleName="arrow" src={`/icons/LineArrow${png}`} />}
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
