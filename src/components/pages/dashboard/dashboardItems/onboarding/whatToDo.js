"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from 'react-router';
import { updateOnboardingStep, addNotification, generalAction, updateUser } from "../../../../../actions/usersActions";
import clipboard from "clipboard-polyfill";
import { goTo } from "../../../../../miscFunctions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../../colors";
import axios from 'axios';

import "../../dashboard.css";

class WhatToDo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: undefined,
            uniqueName: undefined
        };

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
            self.setState({ uniqueName: res.data.uniqueName, name: res.data.name })
        })
        .catch(function (err) {
            self.props.addNotification("Error loading page.", "error");
        });
    }

    next = () => {
        const { _id, verificationToken, verified } = this.props.currentUser;

        // TODO merge these two into one api call to avoid race conditions

        if (!verified) {
            axios.post("/api/accountAdmin/showVerifyEmailBanner", { userId: _id, verificationToken })
            .then(response => { this.props.updateUser(response.data.user); })
            .catch(error => { console.log(error); });
        }

        // go to the next onboarding step
        this.props.updateOnboardingStep(_id, verificationToken, -1);
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
    }

    makeBody() {
        return (
            <div styleName="full-step-container">
                <div styleName="copy-link-view">
                    <div styleName="onboarding-title">
                        {"A Candidate Invite Page Just For You"}
                    </div>
                    <div>
                        {this.state.name} has an invite link that can be embedded in your ATS, automated emails or other communications with candidates.
                        We see the best results when companies invite all of their applicants to complete an evaluation as the highest
                        performers are often dismissed based on non-predictive data. Copy and embed your link where you see fit.
                    </div>
                    <div styleName="link-area">
                        <div>{`https://moonshotinsights.io/apply/${this.state.uniqueName}`}</div>
                        <button className="button noselect round-6px background-primary-cyan primary-white learn-more-texts" onClick={this.copyLink} style={{padding: "3px 10px"}}>
                            <span>Copy Link</span>
                        </button>
                    </div>
                    <div styleName="invite-template-text">
                        <u className="pointer" onClick={() => this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL")}>
                            {"Candidate Invite Template"}
                        </u>
                        <u className="pointer marginLeft20px" onClick={this.handleCustomPage}>
                            {"See Your Page"}
                        </u>
                    </div>
                    {!this.props.loading ?
                        <div styleName="emoji-buttons-full">
                            <div onClick={this.next}>
                                <img
                                    src={`/icons/emojis/PartyPopper${this.props.png}`}
                                />
                                <div style={{paddingTop: "5px"}}>All set!</div>
                            </div>
                            <div onClick={this.intercomMsg}>
                                <img
                                    src={`/icons/emojis/Face${this.props.png}`}
                                />
                                <div style={{paddingTop: "5px"}}>More info</div>
                            </div>
                        </div>
                        :
                        <div styleName="circular-progress">
                            <CircularProgress style={{ color: primaryCyan }} />
                        </div>
                    }
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.state.uniqueName ?
                    <div>
                        { this.makeBody() }
                    </div>
                :
                    <div styleName="full-step-container">
                        <div styleName="circular-progress">
                            <CircularProgress style={{ color: primaryCyan }} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        loading: state.users.loadingSomething
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateOnboardingStep,
        addNotification,
        generalAction,
        updateUser
    }, dispatch);
}

WhatToDo = withRouter(WhatToDo);

export default connect(mapStateToProps, mapDispatchToProps)(WhatToDo);
