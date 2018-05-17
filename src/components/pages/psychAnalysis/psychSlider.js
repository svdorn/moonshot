"use strict"
import React, { Component } from "react";

class PsychSlider extends Component {
    constructor(props) {
        super(props);

        let width = this.props.width;
        let height = this.props.height;
        if (!width) {
            if (this.props.style && this.props.style.width) {
                width = this.props.style.width;
            } else {
                // default width
                width = 350;
            }
        }
        if (!height) {
            if (this.props.style && this.props.style.height) {
                height = this.props.style.height;
            } else {
                // default height
                height = 200;
            }
        }
        if (typeof width === "string") { width = parseInt(width, 10) };
        if (typeof height === "string") { height = parseInt(height, 10) };

        this.state = {
            // start out with the slider in the middle
            answer: 0,
            // user has not selected an answer
            answered: false,
            // width and height of the slider
            width, height
        };
    }


    componentDidMount() {

    }


    componentWillReceiveProps(newProps) {

    }


    // width and height correspond to the width and height of the whole slider
    makeVerticalLines(coverColor) {
        // make the 9 vertical lines separating the gradient things
        const verticalLines = [];
        const width = this.state.width;
        const height = this.state.height;

        const EXTRA_LENGTH = width / 120;
        for (let lineIndex = 1; lineIndex <= 17; lineIndex+=2) {
            let extraLeft = -EXTRA_LENGTH;
            let extraMiddle = 0;
            if (lineIndex > 9) {
                extraLeft = EXTRA_LENGTH
            };
            if (lineIndex === 9) {
                extraMiddle = 2 * EXTRA_LENGTH;
            };
            const lineStyle = {
                backgroundColor: coverColor,
                position: "absolute",
                height: "100%",
                width: `${(width/19) + (2 * EXTRA_LENGTH) + extraMiddle}px`,
                left: `${(lineIndex*width/19) - EXTRA_LENGTH + extraLeft}px`
            }

            verticalLines.push(
                <div key={`line${lineIndex}`} style={lineStyle} />
            );
        }

        return verticalLines;
    }


    onClick(event) {
        // how far left on the screen they clicked
        const xClick = event.clientX;
        console.log("xClick: ", xClick);
        // how far left on the screen the slider is
        const xOffset = event.currentTarget.offsetLeft;
        console.log("xOffset: ", xOffset);
        // how far left in the slider they clicked
        const fromLeft = xClick - xOffset;
        console.log("event: ", event);
        console.log("fromLeft: ", fromLeft);

    }


    // unfortunately you have to use px instead of % for width and height
    render() {
        const coverColor = this.props.backgroundColor ? this.props.backgroundColor : "#2e2e2e";
        const width = this.state.width;
        const height = this.state.height;

        let sliderStyle = {
            ...this.props.style,
            position: "relative",
            overflowY: "hidden",
            width: `${width}px`,
            height: `${height}px`
        };

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

        const verticalLines = this.makeVerticalLines(coverColor);

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
            <div className="psychSlider" style={sliderStyle} onClick={this.onClick.bind(this)}>
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
