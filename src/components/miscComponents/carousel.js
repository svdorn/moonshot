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
            frameIndex: 0
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
            <div className="content">
                <div>{ this.previousFrame() }</div>
                <div>{ this.props.frames[this.state.frameIndex] }</div>
                <div>{ this.nextFrame() }</div>
            </div>
        );
    }


    bottomCircles() {
        let circles = [];
        for (let frameIndex = 0; frameIndex < this.props.frames.length; frameIndex++) {
            const selected = this.state.frameIndex === frameIndex;
            circles.push(
                <div className={`frame-position-circle${selected ? " selected" : ""}`}/>
            );
        }
        return (
            <div>
                { circles }
            </div>
        )
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
                { this.content() }
                { leftArrow }
                { rightArrow }
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
