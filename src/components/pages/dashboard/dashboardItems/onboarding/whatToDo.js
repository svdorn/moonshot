"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateOnboardingStep, addNotification } from "../../../../../actions/usersActions";
import clipboard from "clipboard-polyfill";
import { goTo } from "../../../../../miscFunctions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../../colors";
import axios from 'axios';

import "../../dashboard.css";

class WhatToDo extends Component {
    constructor(props) {
        super(props);

        this.state = { };

        this.next = this.next.bind(this);
        this.intercomMsg = this.intercomMsg.bind(this);
        this.handleCustomPage = this.handleCustomPage.bind(this);
        this.copyLink = this.copyLink.bind(this);
    }

    componentDidMount() {
        let self = this;
        axios.get("/api/business/uniqueName", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            self.setState({ step: 1, uniqueName: res.data })
        })
        .catch(function (err) {
            self.props.addNotification("Error loading page.", "error");
        });
    }

    next = () => {
        // check if need to go to next step in sequence
        if (this.state.step < 3) {
            this.setState({ step: ++this.state.step }, function(res) {
                return;
            });
         }
        // get credentials
        const { _id, verificationToken } = this.props.currentUser;
        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, 4);
    }

    intercomMsg = () => {
        console.log("here");
    }

    copyLink = () => {
        let URL = "https://moonshotinsights.io/apply/" + this.state.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard.", "info");
    }

    handleCustomPage = () => {
        goTo(`/apply/${this.state.uniqueName}`)
        let self = this;
        // get the business' unique name
        axios.get("/api/business/uniqueName", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            goTo(`/apply/${res.data}`);
        })
        .catch(function (err) {
            self.props.addNotification(err, "error");
        });
    }

    customPageView() {
        return (
            <div className="inline-block" styleName="onboarding-info ml-step">
                <div>
                    <div className="primary-cyan font18px">
                        {"A Custom Page Just for You"}
                    </div>
                    <div>
                        {"Why gamble on your hires? We use machine learning, predictive data, and decades of psychology research to find the candidates who can take your company to the next level."}
                    </div>
                    <div styleName="emoji-buttons">
                        <div onClick={this.next}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>Got it</div>
                        </div>
                        <div onClick={this.intercomMsg}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>More info</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <img
                            src={`/images/ApplyPage${this.props.png}`}
                            styleName="apply-image"
                        />
                    </div>
                    <div>
                        <button className="button noselect round-6px background-primary-cyan primary-white learn-more-texts" styleName="onboarding-button apply-button" onClick={this.handleCustomPage} style={{padding: "3px 10px"}}>
                            <span>See my Page &#8594;</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    copyLinkView() {
        return (
            <div styleName="full-step-container">
                <div styleName="copy-link-view">
                    <div className="primary-cyan font22px">
                        {"Copy Link View"}
                    </div>
                    <div>
                        {"Why gamble on your hires? We use machine learning, predictive data, and decades of psychology research to find the candidates who can take your company to the next level."}
                    </div>
                    <div styleName="link-area">
                        <div>{`https://moonshotinsights.io/apply/${this.state.uniqueName}`}</div>
                        <button className="button noselect round-6px background-primary-cyan primary-white learn-more-texts" onClick={this.copyLink} style={{padding: "3px 10px"}}>
                            <span>Copy Link</span>
                        </button>
                    </div>
                    <div styleName="invite-template-text">
                        <u>{"Invite template for candidates."}</u>
                    </div>
                    <div styleName="emoji-buttons-full">
                        <div onClick={this.next}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>Got it</div>
                        </div>
                        <div onClick={this.intercomMsg}>
                            <img
                                src={`/icons/Cube${this.props.png}`}
                            />
                            <div>More info</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    addPositionsView() {
        return (
            <div>
            </div>
        );
    }

    render() {
        switch (this.state.step) {
            case 1: return this.customPageView();
            case 2: return this.copyLinkView();
            case 3: return this.addPositionsView();
            default: return <div styleName="full-step-container"><div styleName="circular-progress"><CircularProgress style={{ color: primaryCyan }} /></div></div>;
        }
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateOnboardingStep,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(WhatToDo);
