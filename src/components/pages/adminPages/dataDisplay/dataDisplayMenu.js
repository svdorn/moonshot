"use strict";
import React, { Component } from "react";
import { IconButton } from "material-ui";
import MoreHorizIcon from "material-ui/svg-icons/image/dehaze";
import { connect } from "react-redux";
import { browserHistory, withRouter } from "react-router";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import { goTo, withinElement } from "../../../../miscFunctions";
import { axios } from "axios";
import { button } from "../../../../classes.js";

import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";

import "./dataDisplay.css";

class DataDisplayMenu extends Component {
    constructor(props) {
        super(props);

        // set the account popup as closed initially
        this.state = {};
    }

    // navigate somewhere from the menu
    navigate = menuOption => () => {
        goTo(menuOption.url);
    };

    render() {
        const self = this;

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

        const menuItems = ["psych", "gca", "business"];
        if (!menuItems.includes(pathname.split("/").pop())) {
            goTo("/admin/dataDisplay/psych");
        }

        const topOptions = [
            { title: "Personality", url: "/admin/dataDisplay/psych" },
            { title: "GCA", url: "/admin/dataDisplay/gca" },
            { title: "Business", url: "/admin/dataDisplay/business" }
        ];

        const topItems = topOptions.map(menuOption => {
            const isCurrentPath = pathname === menuOption.url.toLowerCase();
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

        const menuContent = (
            <div className={this.props.blurMenu ? "blur" : ""}>
                <div styleName="main-menu-items">{topItems}</div>
            </div>
        );

        return (
            <div>
                <div styleName={"menu" + (this.props.footerOnScreen ? " absolute" : "")}>
                    {menuContent}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
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

DataDisplayMenu = withRouter(DataDisplayMenu);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataDisplayMenu);
