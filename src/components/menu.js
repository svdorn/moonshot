"use strict"
import React, { Component } from 'react';
import { ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, IconMenu, IconButton } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/image/dehaze'
import { connect } from 'react-redux';
import { browserHistory, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout, closeNotification, endOnboarding, openAddUserModal, openContactUsModal } from "../actions/usersActions";
import { isValidEmail, goTo } from "../miscFunctions";
import { axios } from 'axios';
import { animateScroll } from "react-scroll";

const styles = {
    title: {
        cursor: 'pointer',
    },
    underlineStyle: {
        display: 'none',
    },
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'left'
    }
};


// pages that have a header but don't show the header shadow
const noShadowPages = [];
// pages where the menu scrolls with the page
const nonFixedMenuPages = ["evaluation"];
// pages that don't have a header at all
const noMenuPages = ["chatbot"];


class Menu extends Component {
    constructor(props) {
        super(props);
        let dropDownSelected = "Account";
        if (this.props.location.pathname === '/settings') {
            dropDownSelected = "Settings";
        } else if (this.props.location.pathname.toLowerCase() === '/adduser') {
            dropDownSelected = "Add User";
        } else if (this.props.location.pathname === '/billing') {
            dropDownSelected = "Billing";
        } else if (this.props.location.pathname === '/pricing') {
            dropDownSelected = "Pricing";
        }
        // class for the header, only needed for pages with unusual menus
        const headerClass = props.location.pathname === "/" && window.scrollY === 0 ? "noShadow" : "";
        const position = '';

        this.bound_checkForHeaderClassUpdate = this.checkForHeaderClassUpdate.bind(this);

        // set the initial state
        this.state = {
            dropDownSelected,
            headerClass,
            position,
            waitingForScroll: {
                page: undefined,
                anchor: undefined
            }
        };
    }

    componentDidUpdate() {
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname === '/settings') {
            if (this.state.dropDownSelected !== "Settings") {
                this.setState({dropDownSelected: "Settings"});
            }
        } else if (pathname === '/adduser') {
            if (this.state.dropDownSelected !== "Add User") {
                this.setState({dropDownSelected: "Add User"});
            }
        } else if (pathname === '/billing') {
            if (this.state.dropDownSelected !== "Billing") {
                this.setState({dropDownSelected: "Billing"})
            }
        } else if (pathname === '/pricing') {
            if (this.state.dropDownSelected !== "Pricing") {
                this.setState({dropDownSelected: "Pricing"})
            }
        } else {
            // set dropdown to be on Profile if not on settings or onboarding pages
            if (this.state.dropDownSelected !== "Account") {
                this.setState({dropDownSelected: "Account"});
            }
        }

        const wfs = this.state.waitingForScroll;
        // if we were waiting for a redirect to scroll
        if (wfs && wfs.page && wfs.anchor) {
            // if we are on the page that wants to be scrolled through ...
            if (pathname === wfs.page.toLowerCase()) {
                // ... set the state so we aren't waiting anymore ...
                this.setState({ waitingForScroll: {} });
                // ... wait a moment for the user to get used to the page ...
                setTimeout(() => {
                    // ... and scroll to the wanted anchor
                    this.scrollToAnchor(wfs.anchor);
                }, 50);
            }
        }
    }


    // fires when a dropDown menu item is clicked
    handleDropDownItemClick = (event, index, value) => {
        let currentUser = this.props.currentUser;
        switch (value) {
            case "Sign Out":
                // always sign out when sign out clicked
                this.props.signout();
                goTo("/");
                break;
            case "Profile":
                if (currentUser) {
                    // if user is employer, go to business profile
                    if (currentUser.userType === "manager" || currentUser.userType === "employee" || currentUser.userType === "accountAdmin") {
                        goTo("/");
                    }
                    // otherwise go to normal profile
                    else {
                        goTo("/profile");
                    }
                }
                break;
            case "Settings":
                goTo("/settings");
                break;
            case "Add User":
                this.props.openAddUserModal();
                break;
            case "Billing":
                goTo("/billing");
                break;
            case "Pricing":
                goTo("/pricing");
                break;
            default:
                break;
        }

        // if not clicking sign out, set the dropdown to be on the right option
        if (value !== "Sign Out") {
            this.setState({dropDownSelected: value});
        }
    };

    onChange(e) {
        this.setState({
            position: e.target.value
        });
    }


    selectAndGoTo(route, value) {
        this.setState({dropDownSelected: value});
        goTo(route);
    }

    signOut() {
        if (this.props.location.pathname === '/onboarding') {
            const markOnboardingComplete = false;
            this.props.endOnboarding(this.props.currentUser, markOnboardingComplete);
        }
        this.props.signout();
        goTo('/');
    }

    handleAnchorClick(anchor, wantedPath) {
        // if we aren't on the wanted path ...
        if (this.props.location.pathname.toLowerCase() != wantedPath.toLowerCase()) {
            // ... mark that we are waiting until we're on a new page to scroll ...
            this.setState({ waitingForScroll: { page: wantedPath, anchor } });
            // ... and redirect to that page
            goTo(wantedPath);
        }
        // if we are already on the wanted path, scroll to the wanted anchor
        else { this.scrollToAnchor(anchor); }
    }


    // scroll to an anchor on the current page, if it exists
    scrollToAnchor(anchor) {
        // get the element we want to scroll to
        const element = document.getElementById(anchor);
        // if the element exists
        if (element) {
            // get its y value
            let yPosition = this.distanceFromTop(element);
            // if the menu is fixed ...
            if (!nonFixedMenuPages.includes(this.props.location.pathname.toLowerCase())) {
                // ... scroll down a bit less so that the menu isn't in the way
                yPosition -= 50;
                // make sure we're scrolling to to a valid position
                if (yPosition < 0) { yPosition = 0; }
            }
            // scroll to the element
            animateScroll.scrollTo(yPosition);
        }
    }


    // get the distance from an element to the top of the page
    distanceFromTop(element) {
        try {
            // set initial distance to top to 0
            let distance = 0;
            // if the element has a parent (everything except the top element,
            // whose offset must be 0) ...
            if (element.offsetParent) {
                // go up through every layer in the hierarchy
                do {
                    // get the distance from the current element to its parent
                    distance += element.offsetTop;
                    // set the current element to its parent
                    element = element.offsetParent;
                }
                // continue to do this until the top element has been reached
                while (element);
            }
            // return the distance - return 0 if the distance is < 0 due to rounding
            return distance < 0 ? 0 : distance;
        }
        catch (e) {
            console.log("Error getting distance from top of page: ", e);
            return 0;
        }
    }


    checkForHeaderClassUpdate(event) {
        if (this.props.location.pathname === "/") {
            // on homepage, only give a shadow if wanted by both width and height
            const widthWantsShadow = window.innerWidth > 700;
            const scrollWantsShadow = window.scrollY !== 0;
            if (widthWantsShadow && scrollWantsShadow && this.state.headerClass === "noShadow") {
                this.setState({ headerClass: "" });
            } else if (!(widthWantsShadow && scrollWantsShadow) && this.state.headerClass === "") {
                this.setState({ headerClass: "noShadow" });
            }
        }
    }


    render() {
        let self = this;

        let isEmployer = false;
        let currentUser = this.props.currentUser;

        if (currentUser && (currentUser.userType === "accountAdmin" || currentUser.userType === "manager" || currentUser.userType === "employee")) {
            isEmployer = true;
        }

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

        // don't show the menu if this page requires no menu
        if (noMenuPages.includes(pathFirstPart)) { return null; }

        // the url to be directed to by default
        let homeUrl = "/";
        if (isEmployer) { homeUrl = "/myEvaluations"; }

        // color of the dropDown menu icon
        let iconMenuColor = "white";
        // source for the moonshot logo; will be black when onboarding
        let moonshotLogo = "/logos/MoonshotWhite" + this.props.png;
        // class of any dropdown menu
        let dropdownClass = "headerDropdownWhite wideScreenMenuItem";
        // class of any menu item that is NOT currently selected
        let menuItemClass = "menuItem font16px borderBottomClickable noWrap primary-white wideScreenMenuItem";
        // class of any menu item that IS currently selected
        const selectedMenuItemClass = menuItemClass + " currentRoute";

        // width of the bar that is only shown under the dropDown menu when
        // some element from the dropDown menu is selected
        let underlineWidth = "61px";
        // whether
        let hideUnderline = {};
        let additionalHeaderClass = "";

        // add the class to get rid of the shadow if the current path is one of those
        if (noShadowPages.includes(pathFirstPart)) { additionalHeaderClass += " noShadow"; }

        if (pathname === "/") {
            // make sure there aren't already event listeners on scroll/resize ...
            window.removeEventListener("scroll", this.bound_checkForHeaderClassUpdate);
            window.removeEventListener("resize", this.bound_checkForHeaderClassUpdate);
            // ... then add event listeners for adding the shadow to the menu
            window.addEventListener("scroll", this.bound_checkForHeaderClassUpdate);
            window.addEventListener("resize", this.bound_checkForHeaderClassUpdate);
            // if the user has not scrolled and the menu has a shadow, get rid of the shadow
            if (this.state.headerClass !== "noShadow" && window.scrollY === 0) {
                this.setState({ headerClass: "noShadow" });
            }
            // if the user has scrolled and there is no shadow, add a shadow
            else if (this.state.headerClass === "noShadow" && window.scrollY !== 0) {
                this.setState({ headerClass: "" });
            }
        } else {
            // if there are event listeners for scrolling/resizing, get rid of them
            window.removeEventListener("scroll", this.bound_checkForHeaderClassUpdate);
            window.removeEventListener("resize", this.bound_checkForHeaderClassUpdate);
            // make sure the menu has a shadow
            if (this.state.headerClass === "noShadow") {
                this.setState({ headerClass: "" });
            }

            if (pathname === '/settings') {
                dropdownClass += " currentRoute";
                // if settings is selected, the underline bar must be bigger
                // because "settings" is a bigger word
                underlineWidth = "60px";
            } else if (pathname === '/adduser') {
                dropdownClass += " currentRoute";
                // if settings is selected, the underline bar must be bigger
                // because "Add User" is a bigger
                underlineWidth = "69px";
            } else if (pathname === '/billing') {
                dropdownClass += " currentRoute";
                underlineWidth = "46px";
            } else if (pathname === '/pricing') {
                dropdownClass += " currentRoute";
                underlineWidth = "50px";
            } else if (nonFixedMenuPages.includes(pathFirstPart)){
                additionalHeaderClass += " notFixed";
            }
        }



        // show only the Moonshot logo if currently loading
        if (this.props.isFetching) {
            return (
                <header style={{zIndex: "100"}}>
                    <Toolbar id="menu" style={{marginTop: "10px"}}>
                        <ToolbarGroup>
                            <img
                                width={136}
                                height={64}
                                alt="Moonshot Logo"
                                title="Moonshot Logo"
                                className="clickable moonshotMenuLogo"
                                id="moonshotLogo"
                                src={moonshotLogo}
                                onClick={() => goTo(homeUrl)}
                            />
                        </ToolbarGroup>
                    </Toolbar>
                </header>
            );
        }

        // the options that will be shown in the menu
        let menuOptions = [];
        // if the Moonshot logo should redirect to the homepage
        let logoIsLink = true;
        // used for menu divider
        let loggedInClass = " loggedIn";

        // if on business signup page, menu is v sparse
        if (pathFirstPart === "businesssignup") {
            // don't show the underline thing
            hideUnderline = { display: "none" };
            // don't let the user click back to home via the logo
            logoIsLink = false;
            menuOptions = [ /* nothing in the menu */ ];
        }
        // if there is no user logged in
        else if (!currentUser) {
            loggedInClass = " loggedOut";
            menuOptions = [
                {optionType: "anchor", title: "Home", url: "/", anchor: "home-top"},
                {optionType: "anchor", title: "Pricing", url: "/", anchor: "pricing"},
                {optionType: "modal", title: "Contact Us", url: "/", modal: "contactUs"},
                {optionType: "separator"},
                {optionType: "url", title: "Log In", url: "/login"},
            ];
            if (pathname === "/") {
                menuOptions.push({optionType: "button", title: "Enter a position"});
            }
        }
        // if the current user is an account admin for a business
        else if (currentUser.userType === "accountAdmin") {
            menuOptions = [
                {optionType: "url", title: "Evaluations", url: "/myEvaluations"},
                {optionType: "url", title: "Employees", url: "/myEmployees"},
                {optionType: "url", title: "Candidates", url: "/myCandidates"},
                {optionType: "separator"},
                {optionType: "dropDown", components: [
                    {optionType: "url", title: "Account", url:"/"},
                    {optionType: "divider"},
                    {optionType: "url", title: "Add User", url: "/addUser"},
                    {optionType: "url", title: "Settings", url: "/settings"},
                    {optionType: "url", title: "Billing", url: "/billing"},
                    {optionType: "url", title: "Pricing", url: "/pricing"},
                    {optionType: "signOut"}
                ]}
            ];
        }
        // if the current user is a manager for a business
        // else if (currentUser.userType === "manager") {
        //     menuOptions = [
        //         {optionType: "url", title: "Evaluations", url: "/myEvaluations"},
        //         {optionType: "url", title: "Employees", url: "/myEmployees"},
        //         {optionType: "separator"},
        //         {optionType: "dropDown", components: [
        //             {optionType: "url", title: "Profile", url: "/"},
        //             {optionType: "divider"},
        //             {optionType: "url", title: "Settings", url: "/settings"},
        //             {optionType: "url", title: "Add User", url: "/addUser"},
        //             {optionType: "signOut"}
        //         ]}
        //     ];
        // }
        // if the current user is an employee for a business
        else if (currentUser.userType === "employee") {
            menuOptions = [
                {optionType: "url", title: "Evaluations", url: "/myEvaluations"},
                {optionType: "separator"},
                {optionType: "dropDown", components: [
                    {optionType: "url", title: "Account", url:"/"},
                    {optionType: "divider"},
                    {optionType: "url", title: "Settings", url: "/settings"},
                    {optionType: "signOut"}
                ]}
            ];
        }
        // if the current user is a candidate who is not onboarding
        else if (currentUser.userType === "candidate") {
            menuOptions = [
                {optionType: "url", title: "Evaluations", url: "/myEvaluations"},
                {optionType: "separator"},
                {optionType: "dropDown", components: [
                    {optionType: "url", title: "Account", url:"/"},
                    {optionType: "divider"},
                    {optionType: "url", title: "Settings", url: "/settings"},
                    {optionType: "signOut"}
                ]}
            ];
        }

        // if the user is a site admin, give them the admin tab
        if (currentUser && typeof currentUser === "object" && currentUser.admin === true) {
            menuOptions.unshift({optionType: "url", title: "Admin", url: "/admin"});
        }

        // construct the menu's tabs
        let desktopMenu = [];
        let mobileMenu = [];

        menuOptions.forEach(function(option) {
            switch (option.optionType) {
                case "url":
                    // default to not underlined
                    let optionClass = menuItemClass;
                    // if this option is the one that is currently selected, underline it
                    if (pathname === option.url.toLowerCase()) {
                        optionClass = selectedMenuItemClass;
                    }
                    desktopMenu.push(
                        <p key={option.title + " desktop"} className={optionClass} onClick={() => goTo(option.url)}>{option.title}</p>
                    );
                    mobileMenu.push(
                        <MenuItem key={option.title + " mobile"} primaryText={option.title} onClick={() => goTo(option.url)}/>
                    );
                    break;
                case "anchor":
                    desktopMenu.push(
                        <p key={option.title + " desktop"} className={menuItemClass} onClick={() => self.handleAnchorClick(option.anchor, option.url)}>{option.title}</p>
                    );
                    mobileMenu.push(
                        <MenuItem key={option.title + " mobile"} primaryText={option.title} onClick={() => self.handleAnchorClick(option.anchor, option.url)}/>
                    );
                    break;
                case "separator":
                    // push a line, only visible on desktop
                    desktopMenu.push(
                        <div key={"separator"} className={"menuDivider wideScreenMenuItem" + loggedInClass} />
                    );
                    break;
                case "modal":
                    desktopMenu.push(
                        <p key={option.title + " desktop"} className={menuItemClass} onClick={() => self.props.openContactUsModal()}>{option.title}</p>
                    );
                    mobileMenu.push(
                        <MenuItem key={option.title + " mobile"} primaryText={option.title} onClick={() => self.props.openContactUsModal()}/>
                    );
                    break;
                case "dropDown":
                    // the options that will be shown in the dropDown menu
                    let dropDownItems = [];
                    option.components.forEach(function(dropDownOption) {
                        switch (dropDownOption.optionType) {
                            case "url":
                                // add the menu item to the dropDown
                                dropDownItems.push(
                                    <MenuItem key={dropDownOption.title + " desktop"} value={dropDownOption.title} primaryText={dropDownOption.title} />
                                );
                                // no dropDowns on mobile menu
                                mobileMenu.push(
                                    <MenuItem key={dropDownOption.title + " mobile"} primaryText={dropDownOption.title} onClick={() => self.selectAndGoTo(dropDownOption.url, dropDownOption.title)}/>
                                );
                                break;
                            case "divider":
                                // add divider, only for desktop dropDown
                                dropDownItems.push(
                                    <Divider key={"divider"} />
                                );
                                break;
                            case "signOut":
                                // add sign out option to dropDown on desktop
                                dropDownItems.push(
                                    <MenuItem key={"signOut desktop"} value="Sign Out" primaryText="Sign Out" />
                                );
                                // add sign out option to regular menu on mobile
                                mobileMenu.push(
                                    <MenuItem key={"signOut mobile"} primaryText="Sign out" onClick={() => self.signOut()}/>
                                );
                                break;
                            case "text":
                                // add text to desktop menu
                                dropDownItems.push(<MenuItem value="Name" disabled primaryText={dropDownOption.title}/>);
                                // add text to mobile menu
                                mobileMenu.push(<MenuItem style={{color: "#00c3ff"}} disabled primaryText={dropDownOption.title}/>);
                                break;
                            default:
                                break;
                        }
                    });
                    let desktopDropDown = (
                        <DropDownMenu key={"desktop dropDown"}
                                      value={self.state.dropDownSelected}
                                      onChange={self.handleDropDownItemClick}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "16px", marginTop: "21px"}}
                                      className={dropdownClass}
                                      id="menuDropdown"
                        >
                            {dropDownItems}
                        </DropDownMenu>
                    );
                    // add the dropDown to the menu - only needed on desktop
                    // because the options have already been added on mobile
                    desktopMenu.push(desktopDropDown);
                    break;
                case "signOut":
                    // add sign out button to desktop menu
                    desktopMenu.push(
                        <p key={"signOut desktop"} className={menuItemClass} onClick={() => self.signOut()}>"Sign Out"</p>
                    );
                    // add sign out button to mobile menu
                    mobileMenu.push(
                        <MenuItem key={"signOut mobile"} primaryText="Sign out" onClick={() => self.signOut()}/>
                    );
                    break;
                case "button":
                    // add the menu item to the dropDown
                    let positionUrl = "";
                    if (self.state.position) {
                        positionUrl = "?position=" + self.state.position;
                    }
                    desktopMenu.push(
                        <div key="tryForFreeButton" className={"menuButtonArea font14px primary-white font14pxUnder900 noWrap wideScreenMenuItem menuItem above850OnlyImportant"}>
                            <input className="blackInput secondary-gray-important" type="text" placeholder="Enter a position..." name="position" value={self.state.position} onChange={self.onChange.bind(self)}
                            />
                            <div className="menuButton button medium round-8px gradient-transition gradient-1-purple-light gradient-2-cyan" style={{marginLeft: "5px"}} onClick={() => goTo("/chatbot" + positionUrl)}>
                                Try for Free
                            </div>
                        </div>
                    );
                    // no button on mobile menu
                    break;
                default:
                    break;

            }
        });

        // dropDown menu only appears if there is a user logged in, so if one
        // is logged in, show the line that shows up when a dropDown item is selected
        if (currentUser) {
            desktopMenu.push(
                <div key={"underline"} className="menuUnderline" style={{width: underlineWidth, ...hideUnderline}}/>
            )
        }

        // default logo class
        let logoClassName = "moonshotMenuLogo";
        // default to doing nothing on logo click
        let logoClickAction = () => {};
        // if the logo is a link, make clicking it go home and make it look clickable
        if (logoIsLink) {
            logoClassName = "clickable moonshotMenuLogo";
            logoClickAction = () => goTo("/");
        }
        let moonshotLogoHtml = (
            <img
                width={136}
                height={64}
                alt="Moonshot"
                className={logoClassName}
                id="moonshotLogo"
                src={moonshotLogo}
                onClick={logoClickAction}
            />
        );
        let easeLogoHtml =
        <img
            width={100}
            height={30}
            alt="Moonshot"
            style={{verticalAlign: "baseline"}}
            className="easeLogo"
            id="easeLogo"
            src={"/logos/EaseLogo" + this.props.png}
        />

        let menu = (
            <header
                className={this.state.headerClass + additionalHeaderClass}
                style={{zIndex: "100"}}
            >
                <div>
                    <Toolbar id="menu" style={{height: "35px"}}>
                        <ToolbarGroup className="logoToolbarGroup" style={{marginTop: "39px"}}>
                            {moonshotLogoHtml}
                            {this.props.location.pathname === '/influencer' ?
                                <div>
                                    <div className="easeDivider inlineBlock" />
                                    <div className="inlineBlock">
                                        {easeLogoHtml}
                                    </div>
                                </div>
                                : null
                            }
                        </ToolbarGroup>
                        <ToolbarGroup className="marginTop10px">
                            {desktopMenu}

                            <IconMenu
                                iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                className="smallScreenMenu"
                                iconStyle={{fill: iconMenuColor}}
                            >
                                {mobileMenu}
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                </div>

            </header>
        );

        return (
            <div>
                { menu }
                <div className="headerSpace" />
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout,
        closeNotification,
        endOnboarding,
        openAddUserModal,
        openContactUsModal
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        blueHeader: state.users.blueHeader,
        png: state.users.png
    };
}

Menu = withRouter(Menu);

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
