"use strict"
import React, { Component } from "react";

class PsychSlider extends Component {
    constructor(props) {
        super(props);

        // start out with the slider in the middle
        this.state = { answer: 0 };
    }


    componentDidMount() {

    }


    // unfortunately you have to use px instead of % for width and height
    render() {
        const coverColor = this.props.backgroundColor ? this.props.backgroundColor : "#2e2e2e";

        let sliderStyle = { ...this.props.style, position: "relative", overflowY: "hidden" };
        if (this.props.width) { sliderStyle.width = this.props.width; }
        if (this.props.height) { sliderStyle.height = this.props.height; }
        if (!sliderStyle.width) { sliderStyle.width = "400px"; }
        if (!sliderStyle.height) { sliderStyle.height = "200px"; }
        const width = parseInt(sliderStyle.width, 10);
        const height = parseInt(sliderStyle.height, 10);

        // the gradient color towards the middles of things
        const gradientNotSelected = "#f25a2b";
        // the gradient color when the thing is being selected
        const gradientSelected = "#ec008c";

        // the gradients that look like they're on the lines when being slid over
        let gradientRectRightStyle = {
            position: "absolute",
            width: "50%",
            height: "100%"
        }
        let gradientRectLeftStyle = Object.assign({}, gradientRectRightStyle);
        gradientRectRightStyle.right = "0";
        gradientRectLeftStyle.left = "0";
        gradientRectRightStyle.background = `linear-gradient(to right, ${gradientNotSelected}, ${gradientSelected})`;
        gradientRectLeftStyle.background = `linear-gradient(to left, ${gradientNotSelected}, ${gradientSelected})`;

        const rightCoverStyle = {};
        const leftCoverStyle = {};
        const horizontalCoverStyle = {
            position: "absolute",
            height: "10%",
            width: "100%",
            backgroundColor: coverColor,
            top: "45%"
        };
        const verticalLines = null;
        let topTriangleCoverStyle = {
            position: "absolute",
            height: "0",
            width: "0",
            borderLeft: `${width/2}px solid transparent`,
            borderRight: `${width/2}px solid transparent`
        };
        let bottomTriangleCoverStyle = Object.assign({}, topTriangleCoverStyle);
        topTriangleCoverStyle.borderTop = `${height/2.1}px solid ${coverColor}`;
        topTriangleCoverStyle.top = "0";
        bottomTriangleCoverStyle.borderBottom = `${height/2.1}px solid ${coverColor}`;
        bottomTriangleCoverStyle.bottom = "0";

        // the line that the circle sits on
        let horizontalLineRightStyle = {
            position: "absolute",
            width: "50%",
            height: "4%",
            top: "48%"
        };
        let horizontalLineLeftStyle = Object.assign({}, horizontalLineRightStyle);
        horizontalLineRightStyle.right = 0;
        horizontalLineLeftStyle.left = 0;
        horizontalLineRightStyle.background = `linear-gradient(to right, ${gradientNotSelected}, ${gradientSelected})`;
        horizontalLineLeftStyle.background = `linear-gradient(to left, ${gradientNotSelected}, ${gradientSelected})`;

        const horizontalLineRightCoverStyle = {};
        const horizontalLineLeftCoverStyle = {};
        const circleStyle = {};

        return (
            <div className="psychSlider" style={sliderStyle}>
                <div style={gradientRectRightStyle} />
                <div style={gradientRectLeftStyle} />
                <div style={rightCoverStyle} />
                <div style={leftCoverStyle} />
                <div style={horizontalCoverStyle} />
                {verticalLines}
                <div style={topTriangleCoverStyle} />
                <div style={bottomTriangleCoverStyle} />
                <div style={horizontalLineLeftStyle} />
                <div style={horizontalLineRightStyle} />
                <div style={horizontalLineRightCoverStyle} />
                <div style={horizontalLineLeftCoverStyle} />
                <div style={circleStyle} />
            </div>
        );
    }
}


export default PsychSlider;
