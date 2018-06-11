import React, { Component } from "react";

class InfoBubble extends Component {
    render() {
        let overallClass = "infoBubble noselect";

        const style = this.props.style ? this.props.style : {};
        let bubbleStyle = {
            padding: "5px"
        }
        if (this.props.bubbleStyle) {
            bubbleStyle = {...bubbleStyle, ...this.props.bubbleStyle};
        }

        const defaultBlue = "rgb(117, 220, 252)";
        const defaultBlack = "#252525";
        const iconClass = typeof this.props.iconFontClasses === "string" ? this.props.iconFontClasses : "font10px";
        const iconColor = typeof this.props.iconColor === "string" ? this.props.iconColor : defaultBlue;
        const iconCircleColor = typeof this.props.iconCircleColor === "string" ? this.props.iconCircleColor : defaultBlue;
        const infoTextColor = typeof this.props.infoTextColor === "string" ? this.props.infoTextColor : "white";
        const bubbleColor = typeof this.props.bubbleColor === "string" ? this.props.bubbleColor : defaultBlack;
        const bubbleText = typeof this.props.bubbleText === "string" ? this.props.bubbleText : "";
        const bubbleClass = typeof this.props.bubbleFontClasses === "string" ? this.props.bubbleFontClasses : "font14px";
        const iconHeight = typeof this.props.iconHeight === "string" ? this.props.iconHeight : "16px";

        return (
            <div className={overallClass} style={style}>
                <div style={{border: `1px solid ${iconCircleColor}`, color: iconColor, height: iconHeight, width: iconHeight}}>
                    <div className={iconClass}>{"?"}</div>
                </div>
                <div style={{backgroundColor: bubbleColor, color: infoTextColor, ...bubbleStyle}}>
                    {bubbleText}
                    <div style={{borderRight: "4px solid transparent", borderBottom: `5px solid ${bubbleColor}`}}/>
                </div>
            </div>
        );
    }
}

export default InfoBubble;
