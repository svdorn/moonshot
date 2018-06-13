import React, { Component } from "react";

class HoverTip extends Component {
    render() {
        const defaultBlack = "#252525";

        let style = { padding: "5px" };
        if (this.props.style) { style = {...style, ...this.props.style} };
        let className = "hoverTip noselect";
        if (this.props.className) { className = className + this.props.className; }

        const backgroundColor = this.props.backgroundColor ? this.props.backgroundColor : defaultBlack;
        const color = this.props.color ? this.props.color : "white";

        return (
            <div className={className} style={{backgroundColor, color, ...style}}>
                {this.props.text}
                <div style={{
                    borderRight: "4px solid transparent",
                    borderBottom: `5px solid ${backgroundColor}`,
                    position: "absolute",
                    top: "-5px",
                    left: "0"
                }}/>
            </div>
        );
    }
}

export default HoverTip;
