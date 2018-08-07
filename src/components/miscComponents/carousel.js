"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../actions/usersActions";
import {  } from "../../miscFunctions";


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
        return (
            <div className={`content${this.state.animationClass}`}>
                <div key="previous">{ this.previousFrame() }</div>
                <div key="current">{ this.props.frames[this.state.frameIndex] }</div>
                <div key="next">{ this.nextFrame() }</div>
            </div>
        );
    }


    bottomCircles() {
        let circles = [];
        for (let frameIndex = 0; frameIndex < this.props.frames.length; frameIndex++) {
            const selected = this.state.frameIndex === frameIndex;
            circles.push(
                <div key={`circle${frameIndex}`} className={`frame-position-circle${selected ? " selected" : ""}`}/>
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
            // set the animation class, don't let the user move around until animation is done
            this.setState({ animationClass, canNavigate: false }, () => {
                // then wait for the animation to be done (.5 secs)
                setTimeout(() => {
                    // then set the current frame and get rid of the animation
                    this.setState({ frameIndex: newFrameIndex, animationClass: "", canNavigate: true });
                }, 500);
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

        return (
            <div className="carousel">
                <div style={{position: "relative", display: "inline-block"}}>
                    { this.content() }
                    <div
                        className="left circleArrowIcon"
                        onClick={() => this.move("back")}
                    />
                    <div
                        className="right circleArrowIcon"
                        onClick={() => this.move("next")}
                    />
                </div>
                { this.bottomCircles() }
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
