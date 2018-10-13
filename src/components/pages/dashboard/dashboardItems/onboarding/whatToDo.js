"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from 'react-router';
import { updateOnboardingStep, addNotification, generalAction, updateUser, openAddPositionModal, intercomEvent } from "../../../../../actions/usersActions";
import clipboard from "clipboard-polyfill";
import { goTo, makePossessive } from "../../../../../miscFunctions";
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
        const { _id, verificationToken } = this.props.currentUser;
        // trigger intercom event
        this.props.intercomEvent('onboarding-step-4', _id, verificationToken, null);
    }

    copyLink = () => {
        let URL = "https://moonshotinsights.io/apply/" + this.state.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard", "info");
    }

    handleCustomPage = () => {
        goTo(`/apply/${this.state.uniqueName}`)
    }


    highlight(event) {
        try { event.target.select(); }
        catch (e) { /* not a big deal if can't highlight the link */ }
    }


    makeBody() {
        return (
            <div styleName="copy-link-view">
                <div styleName="onboarding-title title-margin">
                    {"A Candidate Invite Page Just For You"}
                </div>
                <div>
                    { `${makePossessive(this.state.name)} invite link is
                    designed to be embedded in your automated emails or other
                    messages to candidates. We see the best results when
                    companies invite all applicants to complete an evaluation,
                    as their highest performers are often screened out based on
                    non-predictive data in resumes. Copy and embed your link in
                    emails you send to candidates after they apply. Here's an ` }
                    <span
                        onClick={() => this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL")}
                        className="primary-cyan clickable"
                    >
                        {"email template"}
                    </span>
                    { " you can use." }
                </div>
                <div styleName="link-area">
                    <input
                        id="unique-link"
                        readOnly={true}
                        onClick={this.highlight}
                        value={`https://moonshotinsights.io/apply/${this.state.uniqueName}`}
                    />
                    <button className="button noselect round-6px background-primary-cyan primary-white learn-more-texts" onClick={this.copyLink} style={{padding: "3px 10px"}}>
                        <span>Copy Link</span>
                    </button>
                    <br styleName="small-mobile-only"/>
                    <div
                        className="pointer underline"
                        styleName="link-to-custom-page"
                        onClick={this.handleCustomPage}
                    >
                        { "See Your Page" }
                    </div>
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
        );
    }

    render() {
        return (
            <div styleName="full-step-container">
                { this.state.uniqueName ?
                    this.makeBody()
                :
                    <div styleName="circular-progress">
                        <CircularProgress style={{ color: primaryCyan }} />
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
        updateUser,
        openAddPositionModal,
        intercomEvent
    }, dispatch);
}

WhatToDo = withRouter(WhatToDo);

export default connect(mapStateToProps, mapDispatchToProps)(WhatToDo);
