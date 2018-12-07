"use strict";
import React, { Component } from "react";
import { getUserFromSession, setWebpSupport } from "./actions/usersActions";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
// so that axios works in IE < 11
require("es6-promise").polyfill();

import Menu from "./components/menu/menu";
import Footer from "./components/footer";
import Notification from "./components/notification";
import ContactUsDialog from "./components/childComponents/contactUsDialog";
import AddAdminDialog from "./components/childComponents/addAdminDialog";
import CopyLinkFooter from "./components/childComponents/copyLinkFooter";
import LockedAccountModal from "./components/childComponents/lockedAccountModal";
import PreOnboardingFooter from "./components/childComponents/preOnboardingFooter";
import OnboardingStepsFooter from "./components/childComponents/onboardingStepsFooter";
import AdminVerifyEmail from "./components/childComponents/adminVerifyEmail";
import BillingBanners from "./components/childComponents/billingBanners";
import ReactGA from "react-ga";

import "./main.css";

// OLD MUI THEME

import OldThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import {
    lightBlue500,
    grey300,
    grey400,
    grey500,
    white,
    darkBlack,
    fullBlack
} from "material-ui/styles/colors";
import { fade } from "material-ui/utils/colorManipulator";
import spacing from "material-ui/styles/spacing";

let oldTheme = {
    // this messes with the slider colors
    // userAgent: 'all',
    userAgent: false,
    spacing: spacing,
    fontFamily: "Muli, sans-serif",
    palette: {
        primary1Color: "#00c3ff",
        primary2Color: lightBlue500,
        primary3Color: grey400,
        accent1Color: lightBlue500,
        accent2Color: "rgba(0,0,0,0)",
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: darkBlack,
        canvasColor: white,
        borderColor: grey300,
        disabledColor: fade(darkBlack, 0.3),
        pickerHeaderColor: "#00c3ff",
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack
    }
};

let muiTheme = getMuiTheme(oldTheme);

// END OLD MUI THEME

// NEW MUI THEME

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";
// END NEW MUI THEME

const makeTheme = props => {
    const primaryColor = props.primaryColor ? props.primaryColor : "#ffffff";
    const secondaryColor = props.secondaryColor
        ? props.secondaryColor
        : props.primaryColor
            ? props.primaryColor
            : "#76defe";

    const primary = { main: primaryColor };
    let secondary = { main: secondaryColor };
    if (props.buttonTextColor) secondary.contrastText = props.buttonTextColor;

    return createMuiTheme({
        palette: { primary, secondary }
    });
};

class Main extends Component {
    constructor(props) {
        super(props);

        const theme = makeTheme(props);

        this.state = {
            loadedUser: false,
            agreedToTerms: false,
            agreeingToTerms: false,
            theme
        };
    }

    componentDidMount() {
        const self = this;
        if (
            this.props.location &&
            this.props.location.pathname &&
            (this.props.location.pathname.toLowerCase().startsWith("/apply/") ||
                this.props.location.pathname.toLowerCase().startsWith("/introduction"))
        ) {
            var wait = true;
        }
        // get the user from the session - if there is no user, just marks screen ready to display
        this.props.getUserFromSession(function(work) {
            if (work) {
                self.setState({ loadedUser: true }, () => {
                    const { currentUser } = self.props;
                    // get the user type
                    let userType = "lead";
                    if (currentUser) {
                        userType = currentUser.userType;
                    }
                    // pass the user type to google analytics
                    ReactGA.set({ dimension1: userType });

                    if (currentUser && currentUser.intercom) {
                        var email = currentUser.intercom.email;
                        var user_id = currentUser.intercom.id;
                        var user_hash = currentUser.hmac;
                    }
                    window.Intercom("boot", {
                        app_id: "xki3jtkg",
                        email,
                        user_id,
                        user_hash,
                        created_at: new Date().getTime() / 1000
                    });
                });
            }
        }, wait);

        this.checkWebpFeature("lossy", (feature, result) => {
            this.props.setWebpSupport(result);
        });
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.primaryColor !== this.props.primaryColor ||
            prevProps.secondaryColor !== this.props.secondaryColor ||
            prevProps.backgroundColor !== this.props.backgroundColor ||
            prevProps.buttonTextColor !== this.props.buttonTextColor
        ) {
            const { primaryColor, secondaryColor } = this.props;

            this.setState({ theme: makeTheme(this.props) });
        }
    }

    // check_webp_feature:
    //   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
    //   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
    checkWebpFeature(feature, callback) {
        var kTestImages = {
            lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"
            //lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
            //alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
            //animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
        };
        var img = new Image();
        img.onload = function() {
            var result = img.width > 0 && img.height > 0;
            callback(feature, result);
        };
        <div />;
        img.onerror = function() {
            callback(feature, false);
        };
        img.src = "data:image/webp;base64," + kTestImages[feature];
    }

    popupFooter() {
        const { currentUser, positionCount } = this.props;

        if (
            currentUser &&
            currentUser.userType === "accountAdmin" &&
            ((currentUser.popups && currentUser.popups.dashboard) ||
                (currentUser.popups && currentUser.popups.businessInterests) ||
                positionCount < 1)
        ) {
            return <PreOnboardingFooter />;
        } else if (
            currentUser &&
            currentUser.userType === "accountAdmin" &&
            currentUser.onboard &&
            !currentUser.onboard.timeFinished &&
            typeof currentUser.onboard.step === "number"
        ) {
            return <OnboardingStepsFooter />;
        } else if (
            currentUser &&
            currentUser.userType === "accountAdmin" &&
            !currentUser.confirmEmbedLink
        ) {
            return <CopyLinkFooter />;
        }
    }

    render() {
        let content = null;
        const { currentUser } = this.props;

        // if screen hasn't loaded yet, show empty screen
        if (!this.state.loadedUser || !this.props.webpSupportChecked) {
            content = <div className="fillScreen" />;
        }
        // otherwise show main content
        else {
            // get the current path from the url
            let pathname = undefined;
            // try to get the path; lowercased because capitalization will vary
            try {
                pathname = this.props.location.pathname.toLowerCase();
            } catch (e) {
                // if the pathname is not yet defined, don't do anything, this will be executed again later
                pathname = "";
            }

            // get the different parts of the pathname ([skillTest, front-end-developer, ...])
            const pathnameParts = pathname.split("/").slice(1);
            // get the first, most important part of the path first
            const pathFirstPart = pathnameParts[0];

            // if user is account admin OR they're on explore, give them the side-menu
            const adminDisplay =
                pathFirstPart === "explore" ||
                (currentUser && currentUser.userType === "accountAdmin");

            content = (
                <div>
                    <div style={{ position: "relative" }}>
                        <Menu />
                        <div styleName={adminDisplay ? "admin-content" : ""}>
                            <Notification />
                            <AdminVerifyEmail />
                            <BillingBanners />
                            <LockedAccountModal />
                            <AddAdminDialog />
                            <ContactUsDialog />
                            {this.props.children}
                            {this.popupFooter()}
                        </div>
                    </div>
                    <Footer />
                </div>
            );
        }

        return (
            <OldThemeProvider muiTheme={muiTheme}>
                <MuiThemeProvider theme={this.state.theme}>
                    <div style={{ color: this.props.textColor ? this.props.textColor : "#ffffff" }}>
                        {content}
                    </div>
                </MuiThemeProvider>
            </OldThemeProvider>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            getUserFromSession,
            setWebpSupport
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        notification: state.users.notification,
        webpSupportChecked: state.users.webpSupportChecked,
        positionCount: state.users.positionCount,
        primaryColor: state.users.primaryColor,
        secondaryColor: state.users.secondaryColor,
        buttonTextColor: state.users.buttonTextColor,
        textColor: state.users.textColor
    };
}

Main = withRouter(Main);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Main);
