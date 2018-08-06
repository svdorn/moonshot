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
            frame: 0
        };
    }


    bottomCircles() {
        let circles = [];
        for (let frameIndex = 0; frameIndex < this.props.frames.length; frameIndex++) {
            const selected = this.state.frame === frameIndex;
            circles.push(
                <div className={`frame-position-circle${selected ? " selected" : ""}`}/>
            )
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

        const content = (
            <div className="content">
                { this.props.frames[this.state.frame] }
            </div>
        );

        const leftArrow = null;
        const rightArrow = null;

        return (
            <div className="carousel">
                { content }
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
