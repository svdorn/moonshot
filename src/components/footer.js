"use strict"
import React, { Component } from 'react';
import { browserHistory, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { openContactUsModal } from "../actions/usersActions";
import EmailIcon from "./jsIcons/emailIcon";
import "./footer.css";

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
                            <div styleName="social-icons">

                                <img
                                    alt="Mail Icon"
                                    className="pointer"
                                    onClick={() => this.props.openContactUsModal()}
                                    style={{height: "14px"}}
                                    src={"/icons/Mail" + this.props.png}
                                />
                                <a href="https://www.facebook.com/MoonshotInsights/" target="_blank">
                                    <img
                                        alt="Facebook Logo"
                                        style={{width: "13px", height: "20px"}}
                                        src={"/logos/Facebook" + this.props.png}/>
                                </a>
                                <a href="https://twitter.com/Moonshotinsight" target="_blank">
                                    <img
                                        alt="Twitter Logo"
                                        style={{width: "20px", height: "20px"}}
                                        src={"/logos/Twitter" + this.props.png}/>
                                </a>
                                <a href="https://www.linkedin.com/company/18233111/" target="_blank">
                                    <img
                                        alt="LinkedIn Logo"
                                        style={{width: "20px", height: "20px"}}
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


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        openContactUsModal
    }, dispatch);
}


function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

Footer = withRouter(Footer);

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
