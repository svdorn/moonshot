"use strict";
import React, { Component } from "react";
import { browserHistory, withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { openContactUsModal, markFooterOnScreen } from "../actions/usersActions";
import { goTo, darken, isWhiteOrUndefined } from "../miscFunctions";
import { primaryBlackDark } from "../colors";
import EmailIcon from "./jsIcons/emailIcon";
import "./footer.css";

class Footer extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.bound_checkIfInView = this.checkIfInView.bind(this);
    }

    componentDidMount() {
        window.addEventListener("scroll", this.bound_checkIfInView);
    }

    checkIfInView() {
        try {
            const footer = document.querySelector("#footer");
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const footerDistance = footer.getBoundingClientRect().top;

            const { footerOnScreen } = this.props;

            // if the footer is OFF the screen and isn't marked as such
            if (windowHeight <= footerDistance && footerOnScreen) {
                this.props.markFooterOnScreen(false);
            }
            // if the footer is ON the screen and isn't marked as such
            else if (windowHeight > footerDistance && !footerOnScreen) {
                this.props.markFooterOnScreen(true);
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        // paths that require the footer to be hidden
        const hideFooterLocations = [];

        // check if the current path is one of the above paths
        const hidden = hideFooterLocations.includes(this.props.location.pathname.toLowerCase());

        // the background color should be a slightly darker version of the regular background
        let backgroundColor = this.props.backgroundColor
            ? this.props.backgroundColor
            : primaryBlackDark;
        backgroundColor = darken(backgroundColor, 8);

        const textColor = this.props.textColor ? this.props.textColor : "#ffffff";

        const iconColor = isWhiteOrUndefined(textColor) ? "White" : "Black";

        return (
            <div styleName="footer-container" style={hidden ? { display: "none" } : {}}>
                <div className="top-shadow" style={{ position: "absolute", zIndex: "100" }}>
                    <div />
                </div>
                <footer
                    styleName="footer"
                    id="footer"
                    style={{ backgroundColor, color: textColor }}
                >
                    <div className="center">
                        <img
                            styleName="footer-moonshot-logo"
                            alt="Moonshot Logo"
                            title="Moonshot Logo"
                            src={"/logos/Moonshot" + iconColor + this.props.png}
                        />
                        <div className="font10px">
                            &copy; 2018 Moonshot Learning, Inc. All rights reserved.
                        </div>
                        <div styleName="social-icons">
                            <img
                                alt="Mail Icon"
                                className="pointer"
                                onClick={() => this.props.openContactUsModal()}
                                style={{ height: "12px" }}
                                src={"/icons/Mail-" + iconColor + this.props.png}
                            />
                            <a href="https://www.facebook.com/MoonshotInsights/" target="_blank">
                                <img
                                    alt="Facebook Logo"
                                    style={{ height: "16px" }}
                                    src={"/logos/Facebook-" + iconColor + this.props.png}
                                />
                            </a>
                            <a href="https://twitter.com/Moonshotinsight" target="_blank">
                                <img
                                    alt="Twitter Logo"
                                    style={{ height: "16px" }}
                                    src={"/logos/Twitter-" + iconColor + this.props.png}
                                />
                            </a>
                            <a href="https://www.linkedin.com/company/18233111/" target="_blank">
                                <img
                                    alt="LinkedIn Logo"
                                    style={{ height: "16px" }}
                                    src={"/logos/LinkedIn-" + iconColor + this.props.png}
                                />
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            openContactUsModal,
            markFooterOnScreen
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        png: state.users.png,
        footerOnScreen: state.users.footerOnScreen,
        backgroundColor: state.users.backgroundColor,
        textColor: state.users.textColor
    };
}

Footer = withRouter(Footer);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Footer);
