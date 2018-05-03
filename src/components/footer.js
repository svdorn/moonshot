"use strict"
import React, { Component } from 'react';
import {browserHistory, withRouter} from 'react-router';
import { connect } from 'react-redux';

class Footer extends Component {

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        if (this.props.isOnboarding) {
            return null;
        }
        let footerColor = "purpleToBlue";
        // get the path from the url
        let pathname = undefined;
        // try to get the path
        try {
            pathname = this.props.location.pathname.toLowerCase();
        }
        // if the pathname is not yet defined, don't do anything, this will be executed again later
        catch (e) {
            pathname = "";
        }
        if ((pathname === '/mypathways') || (pathname === '/pathway')) {
            footerColor = "purpleToRedLightGradientOpacity";
        } else if ((pathname === '/profile') || (pathname === '/businessprofile')) {
            footerColor = "orangeToYellowGradientOpacity";
        } else if (pathname === '/resumeanalysis') {
            footerColor = "redToLightRedUpGradientOpacity";
        }

        return (
            <div className="jsxWrapper">
                <footer className={"footer " + footerColor}>
                    <ul className="horizCenteredList">
                        <li className="center">
                            <img
                                className="footerMoonshotLogo"
                                alt="Moonshot Logo"
                                title="Moonshot Logo"
                                src="/images/OfficialLogoWhite.png"/>
                            <div className="whiteText font12px font10pxUnder400">
                                &copy; 2018 Moonshot Learning Inc. All rights reserved.
                            </div>
                            <div style={{marginTop: "10px"}}>
                                <a href="https://www.facebook.com/MoonshotLearning/" target="_blank">
                                    <img
                                        alt="Facebook Logo"
                                        width={13}
                                        height={20}
                                        src="/logos/Facebook.png"/>
                                </a>
                                <a href="https://twitter.com/moonshotteched" target="_blank"
                                   style={{marginLeft: "20px"}}>
                                    <img
                                        alt="Twitter Logo"
                                        width={20}
                                        height={20}
                                        src="/logos/Twitter.png"/>
                                </a>
                                <a href="https://www.linkedin.com/company/18233111/" target="_blank"
                                   style={{marginLeft: "20px"}}>
                                    <img
                                        alt="LinkedIn Logo"
                                        width={20}
                                        height={20}
                                        src="/logos/LinkedIn.png"/>
                                </a>
                            </div>
                        </li>
                    </ul>
                </footer>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        isOnboarding: state.users.isOnboarding
    };
}

Footer = withRouter(Footer);

export default connect(mapStateToProps)(Footer);
