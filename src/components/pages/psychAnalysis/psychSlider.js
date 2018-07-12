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
            // the id of the question currently being answered; need this because
            // when it changes we will reset the score to 0
            questionId: props.questionId,
            // how far from the left the slider circle is (as an int); start in middle
            fromLeft: width/2,
            // only move the circle if the mouse is clicked down
            mouseDown: false,
            // width and height of the slider
            width, height
        };
    }


    // user has to be able to unclick while outside the slider's div
    componentDidMount() {
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("touchend", this.onMouseUp.bind(this));
        window.addEventListener("touchmove", this.onTouchMove.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener("mouseup", this.onMouseUp.bind(this));
        window.removeEventListener("mousemove", this.onMouseMove.bind(this));
        window.removeEventListener("touchend", this.onMouseUp.bind(this));
        window.removeEventListener("touchmove", this.onTouchMove.bind(this));
    }


    componentDidUpdate(prevProps, prevState) {
        let shouldUpdateState = false;
        let newState = {};

        if (this.props.questionId.toString() !== prevState.questionId) {
            // need to update state with the new question id info
            shouldUpdateState = true;
            // new question, update current answer to be 0
            this.props.updateAnswer(0);
            // record the question id so we know next time if we need to reset
            newState.questionId = this.props.questionId.toString();
            // reset the slider
            newState.fromLeft = prevState.width/2;
        }

        // if the slider dimensions need to be changed ...
        if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
            // ... update state with the new dimensions
            shouldUpdateState = true;
            // new slider width
            newState.width = this.props.width;
            // new slider height
            newState.height = this.props.height;
            // calculate the new position of the circle
            newState.fromLeft = prevState.fromLeft * (this.props.width / prevState.width);
        }

        if (shouldUpdateState) {
            this.setState(newState);
        }
    }


    // width and height correspond to the width and height of the whole slider
    makeVerticalLines(coverColor) {
        // make the 9 vertical lines separating the gradient things
        const verticalLines = [];
        const width = this.state.width;
        const height = this.state.height;

        const extraLength = width / 120;
        for (let lineIndex = 1; lineIndex <= 17; lineIndex+=2) {
            let extraLeft = -extraLength;
            let extraMiddle = 0;
            if (lineIndex > 9) {
                extraLeft = extraLength
            };
            if (lineIndex === 9) {
                extraMiddle = 2 * extraLength;
            };
            const lineStyle = {
                backgroundColor: coverColor,
                position: "absolute",
                height: "100%",
                width: `${(width/19) + (2 * extraLength) + extraMiddle}px`,
                left: `${(lineIndex*width/19) - extraLength + extraLeft}px`
            }

            verticalLines.push(
                <div key={`line${lineIndex}`} style={lineStyle} />
            );
        }

        return verticalLines;
    }


    // when finger pressed down
    onTouchStart(event) {
        // convert touch to normal mouse down, act like it's a normal mouse down
        this.onMouseDown(event.touches[0]);
    }


    onMouseDown(event) {
        let self = this;
        document.body.className += " " + "grabbing";

        // need to calculate offset left of slider in case it has changed
        let counter = 0;
        let target = event.target;

        // need to be on the big psychSlider container element to find the right left offset
        while(![...target.classList].includes("psychSlider")) {
            target = target.parentElement;
            // no reason we should get farther than ten elements up
            counter++
            if (counter === 10) { break; }
        }

        let offsetLeft = 0;
        // if the target is legit, set the correct left offset
        if (counter < 10 && target) { offsetLeft = target.getBoundingClientRect().left; };

        // only persist if it was a click, not a touch
        if (typeof event.persist === "function") {
            event.persist();
        }
        this.setState({...this.state, sliderOffsetLeft: offsetLeft}, setMouseDown);

        function setMouseDown() {
            if (!self.state.mouseDown) {
                const SET_MOUSE_DOWN = true;
                self.setFromLeft(event, SET_MOUSE_DOWN);
            }
        }
    }


    onMouseUp(event) {
        document.body.className = document.body.className.replace("grabbing", "");
        if (this.state.mouseDown) {
            this.setState({ ...this.state, mouseDown: false })
        }
    }



    onTouchMove(event) {
        // convert touch to normal mouse move, act like it's a normal mouse move
        this.onMouseMove(event.touches[0]);
    }


    onMouseMove(event) {
        // only move the circle if the mouse button is pressed down and we know the slider offset
        if (this.state.mouseDown && typeof this.state.sliderOffsetLeft !== "undefined") {
            this.setFromLeft(event);
        }
    }


    // set how far left the circle slider should be
    setFromLeft(event, setMouseDown) {
        // how far left on the screen they clicked
        const xClick = event.clientX;
        // how far left on the screen the slider is
        const xOffset = this.state.sliderOffsetLeft;
        // how far left in the slider they clicked
        let fromLeft;
        // if the click is farther left than the slider goes
        if (xClick <= xOffset) { fromLeft = 0; }
        // if the click is farther right than the slider goes
        else if (xClick >= xOffset + this.state.width) { fromLeft = this.state.width; }
        // if the click is within the slider
        else { fromLeft = xClick - xOffset; }

        let newState = { ...this.state, fromLeft };
        if (setMouseDown) { newState.mouseDown = true };

        // get new answer from -5 to 5
        let newAnswer = (fromLeft*10 / this.state.width) - 5;

        // set the state for fromLeft and update answer
        this.setState(newState, () => this.props.updateAnswer(newAnswer));
    }


    // unfortunately you have to use px instead of % for width and height
    render() {
        const coverColor = this.props.backgroundColor ? this.props.backgroundColor : "#2e2e2e";
        const neutralColor = this.props.neutralColor ? this.props.neutralColor : "rgb(160,160,160)";
        const width = this.state.width;
        const height = this.state.height;

        let sliderClass = this.state.mouseDown ? "grabbing" : "grab";
        if (this.props.className) { sliderClass += " " + this.props.className; }
        let sliderStyle = {
            ...this.props.style,
            position: "relative",
            display: "inline-block",
            overflowX: "visible",
            width: `${width}px`,
            height: `${height}px`
        }

        // the gradient color towards the middles of things
        const gradientNotSelected = "#f25a2b";
        // the gradient color when the thing is being selected
        const gradientSelected = "#ec008c";

        // the gradients that look like they're on the lines
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

        // makes the lines look gray when not being slid over
        const rightCoverWidth = this.state.fromLeft < width/2 ? "50%" : `${width - this.state.fromLeft}px`;
        const leftCoverWidth = this.state.fromLeft < width/2 ? this.state.fromLeft : "50%";
        let rightBigCoverStyle = {
            position: "absolute",
            height: "100%",
            backgroundColor: neutralColor,
            top: "0"
        };
        let leftBigCoverStyle = Object.assign({}, rightBigCoverStyle);
        rightBigCoverStyle.width = rightCoverWidth;
        leftBigCoverStyle.width = leftCoverWidth;
        rightBigCoverStyle.right = "0";
        leftBigCoverStyle.left = "0";

        // covers the middle of the slider so the colored thing that the slider
        // goes on has room to breathe on top and bottom
        const horizontalCoverStyle = {
            position: "absolute",
            height: "10%",
            width: "100%",
            backgroundColor: coverColor,
            top: "45%"
        };

        // the background-colored lines that split up the gradient lines
        const verticalLines = this.makeVerticalLines(coverColor);

        // the triangles on top and bottom that make the lines show up as increasing in height
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
        const horizontalLineHeight = "4%";
        const horizontalLineTop = "48%";
        let horizontalLineRightStyle = {
            position: "absolute",
            width: "50%",
            height: horizontalLineHeight,
            top: horizontalLineTop,
        };
        let horizontalLineLeftStyle = Object.assign({}, horizontalLineRightStyle);
        horizontalLineRightStyle.right = 0;
        horizontalLineLeftStyle.left = 0;
        horizontalLineRightStyle.background = `linear-gradient(to right, ${gradientNotSelected}, ${gradientSelected})`;
        horizontalLineLeftStyle.background = `linear-gradient(to left, ${gradientNotSelected}, ${gradientSelected})`;

        // they cover the line the circle sits on
        let horizontalLineRightCoverStyle = {
            position: "absolute",
            backgroundColor: neutralColor,
            height: horizontalLineHeight,
            top: horizontalLineTop
        };
        let horizontalLineLeftCoverStyle = Object.assign({}, horizontalLineRightCoverStyle);
        horizontalLineRightCoverStyle.width = rightCoverWidth;
        horizontalLineLeftCoverStyle.width = leftCoverWidth;
        horizontalLineRightCoverStyle.right = "0";
        horizontalLineLeftCoverStyle.left = "0";

        // the circle that will be dragged around
        const circleWidth = width/10;
        const rotationDegrees = this.state.fromLeft - (width / 2);
        const circleStyle = {
            width: `${circleWidth}px`,
            height: `${circleWidth}px`,
            borderRadius: "100%",
            position: "absolute",
            top: `${(height/2) - (circleWidth/2)}px`,
            left: `${this.state.fromLeft - (circleWidth/2)}px`,
            background: `linear-gradient(to right, ${gradientNotSelected}, ${gradientSelected})`,
            transform: `rotate(${rotationDegrees}deg)`
        };

        return (
            <div className={"psychSlider " + sliderClass}
                style={sliderStyle}
                onMouseDown={this.onMouseDown.bind(this)}
                onTouchStart={this.onTouchStart.bind(this)}
            >
                <div style={gradientRectRightStyle} />
                <div style={gradientRectLeftStyle} />
                <div style={rightBigCoverStyle} />
                <div style={leftBigCoverStyle} />
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
