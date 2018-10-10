"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import { primaryWhite } from "../../colors";


class Carousel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // index of the frame the user is currently on, start at first frame
            frameIndex: 0,
            // class that will animate the frames when they're sliding
            animationClass: "",
            // if transitions are over, meaning Next and Back are clickable
            canNavigate: true
        };
    }


    previousFrame() {
        // if not on the first frame, return the previous frame in the array
        if (this.state.frameIndex > 0) {
            return this.props.frames[this.state.frameIndex - 1];
        }
        // if on the first frame, return the last frame in the array
        else { return this.props.frames[this.props.frames.length - 1]; }
    }


    nextFrame() {
        // if on the last frame, return the first frame
        if (this.state.frameIndex === this.props.frames.length - 1) {
            return this.props.frames[0];
        }
        // otherwise return the next frame
        else { return this.props.frames[this.state.frameIndex + 1]; }
    }


    content() {
        let animationStyle = {};
        if (this.state.animationClass) {
            // default is .5 second animation
            const millis = typeof this.props.transitionDuration === "number" ? this.props.transitionDuration : 500;
            const transition = `all ${millis / 1000}s ease`;
            animationStyle = {
                WebkitTransition: transition,
                MsTransition: transition,
                transition: transition
            }
        }
        return (
            <div className={`content${this.state.animationClass}`}>
                <div key="previous" style={animationStyle}>{ this.previousFrame() }</div>
                <div key="current" style={animationStyle}>{ this.props.frames[this.state.frameIndex] }</div>
                <div key="next" style={animationStyle}>{ this.nextFrame() }</div>
            </div>
        );
    }


    bottomCircles(color1, color2) {
        const selectedStyle = { background: `linear-gradient(to top, ${color1}, ${color2})` };

        let circles = [];
        for (let frameIndex = 0; frameIndex < this.props.frames.length; frameIndex++) {
            const selected = this.state.frameIndex === frameIndex;
            circles.push(
                <div
                    key={`circle${frameIndex}`}
                    className="frame-position-circle"
                    style={selected ? selectedStyle : {}}
                />
            );
        }
        return (
            <div key="bottomCircles">{ circles }</div>
        )
    }


    move(direction) {
        // only allow the user to move around if no animations are in-progress
        if (this.state.canNavigate) {
            // the frame that will be shown after animation
            let newFrameIndex;
            // if going to the next frame
            if (direction === "next") {
                if (this.state.frameIndex >= this.props.frames.length - 1) {
                    newFrameIndex = 0;
                } else {
                    newFrameIndex = this.state.frameIndex + 1;
                }
            }
            // if going to the previous frame
            else {
                if (this.state.frameIndex === 0) {
                    newFrameIndex = this.props.frames.length - 1;
                } else {
                    newFrameIndex = this.state.frameIndex - 1;
                }
            }
            // the class to add so that the objects inside the container slide around
            const animationClass = ` animate-${direction}`
            // how long the animation lasts
            const transitionDuration = typeof this.props.transitionDuration === "number" ? this.props.transitionDuration : 500;
            // set the animation class, don't let the user move around until animation is done
            this.setState({ animationClass, canNavigate: false }, () => {
                // then wait for the animation to be done (.5 secs)
                setTimeout(() => {
                    // then set the current frame and get rid of the animation
                    this.setState({ frameIndex: newFrameIndex, animationClass: "", canNavigate: true });
                }, transitionDuration);
            });
        }
    }


    render() {
        // if no content is given, can't show anything
        if (!Array.isArray(this.props.frames) || this.props.frames.length === 0) {
            return null;
        }

        const leftArrow = null;
        const rightArrow = null;

        const style = this.props.style ? this.props.style : {};
        const className = this.props.className ? this.props.className : "";
        const styleName = this.props.styleName ? this.props.styleName : "";

        const color1 = this.props.color1 ? this.props.color1 : primaryWhite;
        const color2 = this.props.color2 ? this.props.color2 : primaryCyan;

        const arrowStyle = { background: `linear-gradient(to bottom, ${color1}, ${color2})` };

        return (
            <div className={"carousel " + className} styleName={styleName} style={style}>
                <div style={{position: "relative"}}>
                    { this.content() }
                    <div
                        className="left circleArrowIcon" style={arrowStyle}
                        onClick={() => this.move("back")}
                    />
                    <div
                        className="right circleArrowIcon" style={arrowStyle}
                        onClick={() => this.move("next")}
                    />
                </div>
                { this.bottomCircles(color1, color2) }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Carousel);
