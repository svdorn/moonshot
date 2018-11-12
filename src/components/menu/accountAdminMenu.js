"use strict";
import React, { Component } from "react";
import { IconButton } from "material-ui";
import MoreHorizIcon from "material-ui/svg-icons/image/dehaze";
import { connect } from "react-redux";
import { browserHistory, withRouter } from "react-router";
import { bindActionCreators } from "redux";
import {
    signout,
    closeNotification,
    openAddUserModal,
    openContactUsModal,
    openSignupModal
} from "../../actions/usersActions";
import { goTo, getFirstName, withinElement } from "../../miscFunctions";
import { axios } from "axios";
import { button } from "../../classes.js";
import { animateScroll } from "react-scroll";

import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";

import "./accountAdminMenu.css";

class AccountAdminMenu extends Component {
    constructor(props) {
        super(props);

        // set the account popup as closed initially
        this.state = {
            accountPopupOpen: false,
            drawerOpen: false
        };

        // bind necessary functions
        this.bound_handleAnyClick = this.handleAnyClick.bind(this);
    }

    // sign out of user's account
    signOut = () => {
        this.removePopup();
        this.props.signout();
        goTo("/");
    };

    // open the box that has the options to sign out and go to other account pages
    openAccountBox = () => {
        this.setState({ accountPopupOpen: true });
        document.addEventListener("click", this.bound_handleAnyClick);
    };

    // handles clicks, is only activated when the account popup is open
    handleAnyClick = e => {
        // get the account popup element
        const popup = document.querySelector("#account-popup");
        // if the click is outside of the target, get rid of the popup
        if (!withinElement(e, popup)) {
            this.removePopup();
        }
    };

    // remove the account popup from the menu
    removePopup = () => {
        document.removeEventListener("click", this.bound_handleAnyClick);
        this.setState({ accountPopupOpen: false });
    };

    // navigate to an account place (billing, settings, etc)
    navigateAccount = url => {
        this.removePopup();
        if (this.state.drawerOpen) {
            this.setState({ drawerOpen: false });
        }
        goTo(url);
    };

    toggleDrawer = open => () => {
        this.setState({ drawerOpen: open });
    };

    // navigate somewhere from the menu
    navigate = menuOption => () => {
        if (this.state.drawerOpen) {
            this.setState({ drawerOpen: false });
        }

        const willNavigate = !!this.props.currentUser || menuOption.adminOnly !== true;
        // if should navigate (because user is logged in), do so
        if (willNavigate) {
            goTo(menuOption.url);
        }
        // otherwise open the sign up modal to prompt account creation
        else {
            this.openSignUpModal(menuOption.title);
        }
    };

    openSignUpModal = name => {
        this.props.openSignupModal("menu", name);
    };

    render() {
        const self = this;
        const user = this.props.currentUser;

        const { png } = this.props;

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

        const topOptions = [
            { title: "Dashboard", url: user ? "/dashboard" : "/explore" },
            { title: "Candidates", url: "/myCandidates", adminOnly: true },
            { title: "Evaluations", url: "/myEvaluations", adminOnly: true },
            { title: "Employees", url: "/myEmployees", adminOnly: true }
        ];

        const topItems = topOptions.map(menuOption => {
            const isCurrentPath = pathFirstPart === menuOption.url.substring(1).toLowerCase();
            return (
                <div
                    styleName={"menu-option" + (isCurrentPath ? " current" : "")}
                    onClick={this.navigate(menuOption)}
                    key={`top-menu-option ${menuOption.title}`}
                >
                    {menuOption.title}
                </div>
            );
        });

        let bottomItem = null;

        // if there is a current user, add popup items
        if (user) {
            const popupOptions = [
                { title: "Settings", url: "/settings" },
                { title: "Billing", url: "/billing" },
                { title: "Pricing", url: "/pricing" }
            ];

            let popupItems = popupOptions.map(popupOption => {
                return (
                    <div
                        styleName="menu-option"
                        onClick={this.navigateAccount.bind(this, popupOption.url)}
                        key={`popup-option ${popupOption.title}`}
                    >
                        {popupOption.title}
                    </div>
                );
            });

            popupItems.push(
                <div styleName="menu-option" key="sign-out">
                    <div styleName="sign-out" onClick={this.signOut}>
                        Sign Out
                    </div>
                </div>
            );

            bottomItem = (
                <div>
                    <img src={`/icons/User${png}`} styleName="user-icon" />
                    <div styleName="menu-option" onClick={this.openAccountBox}>
                        <div styleName="user-name">{getFirstName(user.name)}</div>
                        <div
                            id="account-popup"
                            styleName={
                                "account-popup " + (this.state.accountPopupOpen ? "visible" : "")
                            }
                        >
                            {popupItems}
                        </div>
                    </div>
                </div>
            );
        }
        // if there is no current user (we're on explore)
        else {
            bottomItem = (
                <div>
                    <img src={`/icons/User${png}`} styleName="user-icon" />
                    <div styleName="menu-option" onClick={() => this.openSignUpModal("Button")}>
                        <div className={button.cyan} style={{ color: "white" }}>
                            Create Account
                        </div>
                    </div>
                </div>
            );
        }

        // moonshot logo
        const home = user ? "/dashboard" : "/";
        let logo = (
            <img
                alt="Moonshot Logo"
                styleName="moonshot-logo"
                src={`/logos/MoonshotWhite${png}`}
                onClick={() => goTo(home)}
            />
        );

        const menuContent = (
            <div className={this.props.blurMenu ? "blur" : ""}>
                {logo}
                <div styleName="main-menu-items">{topItems}</div>
                <div styleName="menu-bottom">{bottomItem}</div>
            </div>
        );

        return (
            <div>
                <header styleName="top-menu-activator">
                    <IconButton
                        onClick={this.toggleDrawer(true)}
                        style={{ padding: "0", width: "32px", height: "32px" }}
                    >
                        <MoreHorizIcon color="white" />
                    </IconButton>
                </header>
                <div styleName="top-menu-activator-space" />
                <div styleName="hide-on-desktop">
                    <SwipeableDrawer
                        open={this.state.drawerOpen}
                        onClose={this.toggleDrawer(false)}
                        onOpen={this.toggleDrawer(true)}
                        style={{ overflowY: "hidden" }}
                        classes={{ paper: "overflow-visible-1 overflow-visible-2" }}
                    >
                        <div styleName="drawer-menu">{menuContent}</div>
                    </SwipeableDrawer>
                </div>
                <div styleName={"menu" + (this.props.footerOnScreen ? " absolute" : "")}>
                    {menuContent}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            signout,
            closeNotification,
            openAddUserModal,
            openContactUsModal,
            openSignupModal
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        png: state.users.png,
        footerOnScreen: state.users.footerOnScreen,
        blurMenu: state.users.blurMenu
    };
}

AccountAdminMenu = withRouter(AccountAdminMenu);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountAdminMenu);
