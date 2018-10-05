"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../actions/usersActions";
import {  } from "../../../../miscFunctions";
import Carousel from "../../../miscComponents/carousel";
import axios from "axios";

import "../dashboard.css";

class Activity extends Component {
    constructor(props) {
        super(props);

        this.state = { frame: "NoCandidates" };
    }

    componentDidMount() {

    }

    tipsForHiring() {
        const frame1 = (
            <div styleName="carousel-frame">
                <div>
                    <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">Welcome to your Dashboard!</div>
                    <div>
                        This is your dashboard, where you can see all the most recent activity across every
                        project in this workspace. It is the perfect place to start your day.
                    </div>
                </div>
            </div>
        );
        const frame2 = (
            <div styleName="carousel-frame">
                <div>
                    <div className="primary-cyan font20px">Welcome to your Dashboard!</div>
                    <div>
                        Frame 2 this is your dashboard, where you can see all the most recent activity across every
                        project in this workspace. It is the perfect place to start your day.
                    </div>
                </div>
            </div>
        );
        return (
            <div styleName="tips-for-hiring">
                <div>
                    Tips for hiring supremacy while you{"'"}re<br/> waiting for candidates to complete your evaluation
                </div>
                <div>
                    <Carousel
                        frames={[frame1, frame2]}
                        transitionDuration={1000}
                    />
                </div>
            </div>
        );
    }

    noCandidates() {
        return (
            <div>
            </div>
        );
    }

    awaitingCandidates() {
        return (
            <div>
            </div>
        );
    }

    render() {

        let content = null;
        switch (this.state.frame) {
            case "TipsForHiring": { content = this.tipsForHiring(); break; }
            case "NoCandidates": { content = this.noCandidates(); break; }
            case "AwaitingCandidates": { content = this.awaitingCandidates(); break; }
            default: { content = null; break; }
        }

        return (
            <div styleName="activity-container">
                { content }
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


export default connect(mapStateToProps, mapDispatchToProps)(Activity);
