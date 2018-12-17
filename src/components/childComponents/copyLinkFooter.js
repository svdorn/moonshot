"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from '../../actions/usersActions';
import { propertyExists, makePossessive } from "../../miscFunctions";
import clipboard from "clipboard-polyfill";
import { withRouter } from 'react-router';
import axios from 'axios';

import './copyLinkFooter.css';

class CopyLinkFooter extends Component {
    constructor(props) {
        super(props);
    }

    copyLink = () => {
        const { currentUser } = this.props;
        if (propertyExists(currentUser, ["businessInfo", "uniqueName"], "string")) {
            let URL = "https://moonshotinsights.io/apply/" + currentUser.businessInfo.uniqueName;
            URL = encodeURI(URL);
            clipboard.writeText(URL);
            this.props.addNotification("Link copied to clipboard", "info");
        } else {
            this.props.addNotification("Error copying link, try refreshing", "error");
        }
    }

    render() {
        const { currentUser } = this.props;
        if (!currentUser || currentUser.userType !== "accountAdmin") { return null; }

        let businessName = "your";
        if (propertyExists(currentUser, ["businessInfo", "businessName"], "string")) {
            businessName = currentUser.businessInfo.businessName;
        }
        // get the current path from the url
        let pathname = undefined;
        // try to get the path; lowercased because capitalization will vary
        try { pathname = this.props.location.pathname.toLowerCase(); }
        // if the pathname is not yet defined, don't do anything, this will be executed again later
        catch (e) { pathname = ""; }

        const showFooter = pathname !== "/dashboard";

        if (!showFooter) { return null; }
        else {
            return (
                <div styleName={"footer-container" + (this.props.footerOnScreen ? " absolute" : "")}>
                    <div styleName="footer">
                        <img src={`/icons/Astrobot${this.props.png}`} styleName="astrobot-img" />
                        <div className="secondary-gray" styleName="text">
                            <div styleName="desktop-text">
                                Embed { makePossessive(businessName) } candidate invite page in your ATS, <br styleName="non-big-desktop"/>automated emails <br styleName="big-desktop"/>or other communications with candidates.
                            </div>
                        </div>
                        <div styleName="buttons">
                            <button styleName="button" className="button noselect round-6px background-primary-cyan primary-white" onClick={this.copyLink} style={{padding: "3px 10px"}}>
                                <span>Copy Link</span>
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
    return bindActionCreators({
        addNotification,
    }, dispatch);
}

CopyLinkFooter = withRouter(CopyLinkFooter);

export default connect(mapStateToProps, mapDispatchToProps)(CopyLinkFooter);
