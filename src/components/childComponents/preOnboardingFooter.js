"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from "../../actions/usersActions";
import { propertyExists, makePossessive, goTo } from "../../miscFunctions";
import { withRouter } from "react-router";
import axios from "axios";

import "./preOnboardingFooter.css";

class PreOnboardingFooter extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { currentUser } = this.props;
        if (!currentUser || currentUser.userType !== "accountAdmin") {
            return null;
        }
        // get the current path from the url
        let pathname = undefined;
        // try to get the path; lowercased because capitalization will vary
        try {
            pathname = this.props.location.pathname.toLowerCase();
        } catch (e) {
            // if the pathname is not yet defined, don't do anything, this will be executed again later
            pathname = "";
        }

        const showFooter = pathname !== "/dashboard";

        if (!showFooter) {
            return null;
        } else {
            return (
                <div
                    styleName={"footer-container" + (this.props.footerOnScreen ? " absolute" : "")}
                >
                    <div styleName="footer">
                        <img src={`/icons/Astrobot${this.props.png}`} styleName="astrobot-img" />
                        <div className="secondary-gray" styleName="text">
                            <div styleName="desktop-text">
                                Continue your progress <br styleName="non-big-desktop" />and start{" "}
                                <br styleName="big-desktop" />inviting candidates.
                            </div>
                        </div>
                        <div styleName="buttons">
                            <button
                                styleName="button"
                                className="button noselect round-6px background-primary-cyan primary-white"
                                onClick={() => goTo("/dashboard")}
                                style={{ padding: "3px 10px" }}
                            >
                                <span>Continue</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        footerOnScreen: state.users.footerOnScreen
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification
        },
        dispatch
    );
}

PreOnboardingFooter = withRouter(PreOnboardingFooter);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreOnboardingFooter);
