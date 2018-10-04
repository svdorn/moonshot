"use strict"
import React, { Component } from 'react';
import { IconButton } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/image/dehaze'
import { connect } from 'react-redux';
import { browserHistory, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout, closeNotification, openAddUserModal, openContactUsModal } from "../../actions/usersActions";
import { goTo, getFirstName, withinElement } from "../../miscFunctions";
import { axios } from 'axios';
import { animateScroll } from "react-scroll";

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

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
        goTo('/');
    }


    // open the box that has the options to sign out and go to other account pages
    openAccountBox = () => {
        this.setState({ accountPopupOpen: true });
        document.addEventListener('click', this.bound_handleAnyClick);
    }


    // handles clicks, is only activated when the account popup is open
    handleAnyClick = (e) => {
        console.log("(handleAnyClick) handling click");
        // get the account popup element
        const popup = document.querySelector("#account-popup");
        // if the click is outside of the target, get rid of the popup
        if (!withinElement(e, popup)) {
            console.log("(handleAnyClick) popup does not contain target, calling removePopup");
            this.removePopup();
        }
    }


    // remove the account popup from the menu
    removePopup = () => {
        console.log("(removePopup) this.state: ", this.state);
        console.log("(removePopup) removing event listener");
        document.removeEventListener('click', this.bound_handleAnyClick);
        console.log("(removePopup) about to remove popup from state");
        this.setState({ accountPopupOpen: false }, () => {
            console.log("(removePopup) removed popup from state, this.state:", this.state);
        });
    }


    // navigate to an account place (billing, settings, etc)
    navigateAccount = (url) => {
        console.log("(navigateAccount) start");
        console.log("(navigateAccount) this.state: ", this.state);
        console.log("(navigateAccount) entering this.removePopup()");
        this.removePopup();
        console.log("(navigateAccount) hiding drawer");
        if (this.state.drawerOpen) { this.setState({ drawerOpen: false }); }
        console.log("(navigateAccount) entering goTo(url)");
        goTo(url);
    }


    toggleDrawer = (open) => () => {
        this.setState({ drawerOpen: open });
    }


    // navigate somewhere from the menu
    navigate = (url) => () => {
        if (this.state.drawerOpen) { this.setState({ drawerOpen: false }); }
        goTo(url);
    }


    render() {
        const self = this;
        const user = this.props.currentUser;

        // get the current path from the url
        let pathname = undefined;
        // try to get the path; lowercased because capitalization will vary
        try { pathname = this.props.location.pathname.toLowerCase(); }
        // if the pathname is not yet defined, don't do anything, this will be executed again later
        catch (e) { pathname = ""; }

        // get the different parts of the pathname ([skillTest, front-end-developer, ...])
        const pathnameParts = pathname.split("/").slice(1);
        // get the first, most important part of the path first
        const pathFirstPart = pathnameParts[0];

        const topOptions = [
            {title: "Dashboard", url: "/dashboard"},
            {title: "Candidates", url: "/myCandidates"},
            {title: "Evaluations", url: "/myEvaluations"},
            {title: "Employees", url: "/myEmployees"}
        ];

        const popupOptions = [
            {title: "Settings", url: "/settings"},
            {title: "Billing", url: "/billing"},
            {title: "Pricing", url: "/pricing"}
        ]

        const topItems = topOptions.map(menuOption => {
            const isCurrentPath = pathFirstPart === menuOption.url.substring(1).toLowerCase();
            return (
                <div
                    styleName={"menu-option" + (isCurrentPath ? " current" : "")}
                    onClick={this.navigate(menuOption.url)}
                    key={`top-menu-option ${menuOption.title}`}
                >
                    { menuOption.title }
                </div>
            );
        });

        let popupItems = popupOptions.map(popupOption => {
            return (
                <div
                    styleName="menu-option"
                    onClick={this.navigateAccount.bind(this, popupOption.url)}
                    key={`popup-option ${popupOption.title}`}
                >
                    { popupOption.title }
                </div>
            );
        });
        popupItems.push(
            <div
                styleName="menu-option"
                key="sign-out"
            >
                <div styleName="sign-out" onClick={this.signOut}>Sign Out</div>
            </div>
        );

        const bottomItem = (
            <div styleName="menu-option" onClick={this.openAccountBox}>
                <div styleName="user-name">{ getFirstName(user.name) }</div>
                <div id="account-popup" styleName={"account-popup " + (this.state.accountPopupOpen ? "visible" : "")}>
                    { popupItems }
                </div>
            </div>
        );

        // moonshot logo
        let logo = (
            <img
                alt="Moonshot Logo"
                styleName="moonshot-logo"
                src={`/logos/MoonshotWhite${this.props.png}`}
                onClick={() => goTo("/dashboard")}
            />
        );

        const menuContent = (
            <div>
                { logo }
                <div styleName="main-menu-items">
                    { topItems }
                </div>
                <div styleName="menu-bottom">
                    { bottomItem }
                </div>
            </div>
        );

        return (
            <div>
                <header styleName="top-menu-activator">
                    <IconButton
                        onClick={this.toggleDrawer(true)}
                        style={{padding: "0", width: "32px", height: "32px"}}
                    >
                        <MoreHorizIcon color="white"/>
                    </IconButton>
                </header>
                <div styleName="top-menu-activator-space" />
                <SwipeableDrawer
                    open={this.state.drawerOpen}
                    onClose={this.toggleDrawer(false)}
                    onOpen={this.toggleDrawer(true)}
                    style={{overflowY: "hidden"}}
                    classes={{ paper: "overflow-visible-1 overflow-visible-2" }}
                >
                    <div styleName="drawer-menu">
                        { menuContent }
                    </div>
                </SwipeableDrawer>
                <div styleName="menu">
                    { menuContent }
                </div>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout,
        closeNotification,
        openAddUserModal,
        openContactUsModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        png: state.users.png
    };
}

AccountAdminMenu = withRouter(AccountAdminMenu);

export default connect(mapStateToProps, mapDispatchToProps)(AccountAdminMenu);
