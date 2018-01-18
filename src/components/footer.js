"use strict"
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
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

        return (
            <div className="jsxWrapper">
                <footer className="footer purpleToBlue">
                    <ul className="horizCenteredList">
                        <li className="center">
                            <img
                                className="footerMoonshotLogo"
                                alt="Moonshot Logo"
                                title="Moonshot Logo"
                                src="/images/OfficialLogoWhite.png"/>
                            <div className="whiteText tinyText">
                                &copy; 2018 Moonshot Learning Inc. All rights reserved.
                            </div>
                            <div style={{marginTop: "10px"}}>
                                <a href="https://www.facebook.com/MoonshotLearning/" target="_blank">
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/Facebook.png"/>
                                </a>
                                <a href="https://twitter.com/moonshotteched" target="_blank"
                                   style={{marginLeft: "10px"}}>
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/Twitter.png"/>
                                </a>
                                <a href="https://www.linkedin.com/company/18233111/" target="_blank"
                                   style={{marginLeft: "10px"}}>
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/LinkedIn.png"/>
                                </a>
                                <a href="https://www.youtube.com/channel/UCDna-8OVMOONwwqQk21f6ZQ" target="_blank"
                                   style={{marginLeft: "10px"}}>
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/YouTube.png"/>
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

export default connect(mapStateToProps)(Footer);
