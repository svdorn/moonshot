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
        // paths that require the footer to be hidden
        const hideFooterLocations = ["/businesssignup", "/chatbot"];

        // check if the current path is one of the above paths
        const hidden = hideFooterLocations.includes(this.props.location.pathname.toLowerCase());

        return (
            <div className="footer-container" style={ hidden ? {display: "none"} : {} }>
                <div className="tabsShadow" style={{position:"absolute", zIndex: "100"}}><div/></div>
                <footer className={"footer"}>
                    <ul className="horizCenteredList">
                        <li className="center">
                            <img
                                className="footerMoonshotLogo"
                                alt="Moonshot Logo"
                                title="Moonshot Logo"
                                src={"/logos/MoonshotWhite" + this.props.png}/>
                            <div className="primary-white font12px font10pxUnder400">
                                &copy; 2018 Moonshot Learning Inc. All rights reserved.
                            </div>
                            <div style={{marginTop: "10px"}}>
                                <a href="https://www.facebook.com/MoonshotInsights/" target="_blank">
                                    <img
                                        alt="Facebook Logo"
                                        width={13}
                                        height={20}
                                        src={"/logos/Facebook" + this.props.png}/>
                                </a>
                                <a href="https://twitter.com/Moonshotinsight" target="_blank"
                                   style={{marginLeft: "20px"}}>
                                    <img
                                        alt="Twitter Logo"
                                        width={20}
                                        height={20}
                                        src={"/logos/Twitter" + this.props.png}/>
                                </a>
                                <a href="https://www.linkedin.com/company/18233111/" target="_blank"
                                   style={{marginLeft: "20px"}}>
                                    <img
                                        alt="LinkedIn Logo"
                                        width={20}
                                        height={20}
                                        src={"/logos/LinkedIn" + this.props.png}/>
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
        png: state.users.png
    };
}

Footer = withRouter(Footer);

export default connect(mapStateToProps)(Footer);
