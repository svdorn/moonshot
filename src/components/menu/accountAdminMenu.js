"use strict"
import React, { Component } from 'react';
import { ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, IconMenu, IconButton } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/image/dehaze'
import { connect } from 'react-redux';
import { browserHistory, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout, closeNotification, openAddUserModal, openContactUsModal } from "../../actions/usersActions";
import { goTo } from "../../miscFunctions";
import { axios } from 'axios';
import { animateScroll } from "react-scroll";

import "./accountAdminMenu.css";


class Menu extends Component {
    constructor(props) {
        super(props);

        // set the initial state
        this.state = {

        };
    }


    signOut() {
        this.props.signout();
        goTo('/');
    }


    openAccountBox = () => {
        console.log("opening account box!");
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

        const topItems = topOptions.map(menuOption => {
            const isCurrentPath = pathFirstPart === menuOption.url.substring(1).toLowerCase();
            return (
                <div
                    styleName={"menu-option" + (isCurrentPath ? " current" : "")}
                    onClick={() => goTo(menuOption.url)}
                    key={`top-menu-option ${menuOption.title}`}
                >
                    { menuOption.title }
                </div>
            );
        });

        const bottomItems = [(
            <div styleName="menu-option" onClick={this.openAccountBox}>
                { user.name }
            </div>
        )];

        // moonshot logo
        let logo = (
            <img
                alt="Moonshot Logo"
                styleName="moonshot-logo"
                src={`/logos/MoonshotWhite${this.props.png}`}
                onClick={() => goTo("/dashboard")}
            />
        );

        return (
            <div styleName="menu">
                { logo }
                <div styleName="menu-top">
                    { topItems }
                </div>
                <div styleName="menu-bottom">
                    { bottomItems }
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

Menu = withRouter(Menu);

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
