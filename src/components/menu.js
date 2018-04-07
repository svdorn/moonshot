"use strict"
import React, {Component} from 'react';
import {ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, IconMenu, IconButton} from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/image/dehaze'
import {connect} from 'react-redux';
import {browserHistory, withRouter} from 'react-router';
import {bindActionCreators} from 'redux';
import {signout, closeNotification, setHeaderBlue, endOnboarding} from "../actions/usersActions";
import {axios} from 'axios';

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

class Menu extends Component {
    constructor(props) {
        super(props);
        let value = 1;
        let dropDownSelected = "Profile";
        if (this.props.location.pathname === '/settings') {
            value = 2;
            dropDownSelected = "Settings";
        } else if (this.props.location.pathname === '/onboarding') {
            value = 4;
            dropDownSelected = "";
        }
        this.state = {value, dropDownSelected};
    }

    componentDidUpdate() {
        if (this.props.location.pathname === '/settings') {
            if (this.state.value !== 2) {
                this.setState({value: 2, dropDownSelected: "Settings"});
            }
        } else if (this.props.location.pathname === '/onboarding') {
            if (this.state.value !== 4) {
                this.setState({value: 4, dropDownSelected: ""});
            }
        } else {
            // set dropdown to be on Profile if not on settings or onboarding pages
            if (this.state.value !== 1) {
                this.setState({value: 1, dropDownSelected: "Profile"});
            }
        }
    }

    handleChange = (event, index, value) => {
        if (value === 1) {
            if (this.props.currentUser.userType === "employer") {
                this.goTo('/businessProfile');
            } else {
                this.goTo('/profile');
            }
        } else if (value === 2) {
            this.goTo('/settings');
        } else if (value === 4) {
            // do nothing
        } else {
            if (this.props.location.pathname === '/onboarding') {
                // user is signing out while on onboarding, don't mark onboarding complete yet
                const markOnboardingComplete = false;
                this.props.endOnboarding(this.props.currentUser, markOnboardingComplete);
            }

            value = 1;
            this.props.signout();
            this.goTo('/');
        }
        this.setState({value});
    };


    // fires when a dropDown menu item is clicked
    handleDropDownItemClick = (event, index, value) => {
        let currentUser = this.props.currentUser;
        switch (value) {
            case "Sign Out":
                //special case, user is signing out while on onboarding,
                // don't mark onboarding complete yet
                if (this.props.location.pathname === '/onboarding') {
                    const markOnboardingComplete = false;
                    this.props.endOnboarding(this.props.currentUser, markOnboardingComplete);
                }

                // always sign out when sign out clicked
                this.props.signout();
                this.goTo("/");
                break;
            case "Profile":
                if (currentUser) {
                    // if user is employer, go to business profile
                    if (currentUser.userType === "employer") {
                        this.goTo("/businessProfile");
                    }
                    // otherwise go to normal profile
                    else {
                        this.goTo("/profile");
                    }
                }
                break;
            case "Settings":
                this.goTo("/settings");
                break;
            default:
                break;
        }

        // if not clicking sign out, set the dropdown to be on the right option
        if (value !== "Sign Out") {
            this.setState({dropDownSelected: value});
        }
    };


    selectItem(route, value) {
        this.goTo(route);
        this.setState({value});
    }

    selectAndGoTo(route, value) {
        this.setState(dropDownSelected: value);
        this.goTo(route);
    }

    signOut() {
        if (this.props.location.pathname === '/onboarding') {
            const markOnboardingComplete = false;
            this.props.endOnboarding(this.props.currentUser, markOnboardingComplete);
        }
        this.props.signout();
        this.goTo('/');
        this.setState({value: 1});
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // sets header to white
        // this.props.setHeaderBlue(false);
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {

        let self = this;

        let isEmployer = false;
        let currentUser = this.props.currentUser;

        if (currentUser && currentUser.userType === "employer") {
            isEmployer = true;
        }

        let isOnboarding = false;
        if (this.props.location.pathname === '/onboarding') {
            isOnboarding = true;
        }
        let iconMenuColor = isOnboarding ? "black" : "white";
        let moonshotLogo = isOnboarding ? "/images/OfficialLogoBlack.png" : "/images/OfficialLogoWhite.png";
        let dropdownClass = isOnboarding ? "headerDropdownBlack wideScreenMenuItem" : "headerDropdownWhite wideScreenMenuItem";
        let menuItemClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem"

        let discoverClass = menuItemClass;
        if (this.props.location.pathname === '/discover') {
            discoverClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem currentRoute";
        }
        let homeClass = menuItemClass;
        if (this.props.location.pathname === '/') {
            homeClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem currentRoute";
        }
        let forBusClass = menuItemClass;
        if (this.props.location.pathname === '/forBusiness') {
            forBusClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem currentRoute";
        }
        let loginClass = menuItemClass;
        if (this.props.location.pathname === '/login') {
            loginClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem currentRoute";
        }
        let myPathwaysClass = menuItemClass;
        let hoverWidth = "52px";
        if (this.props.location.pathname === '/myPathways') {
            myPathwaysClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem currentRoute";
        }
        if (this.props.location.pathname === '/profile') {
            dropdownClass = "headerDropdownWhite wideScreenMenuItem currentRoute";
        }
        if (this.props.location.pathname === '/settings') {
            dropdownClass = "headerDropdownWhite wideScreenMenuItem currentRoute";
            hoverWidth = "67px";
        }


        if (this.props.isFetching) {
            return (
                <header style={{zIndex: "100"}}>
                    <Toolbar id="menu" style={{marginTop: "10px"}}>
                        <ToolbarGroup>
                            <img
                                width={180}
                                height={56}
                                alt="Moonshot Logo"
                                title="Moonshot Logo"
                                className="clickable moonshotMenuLogo"
                                id="moonshotLogo"
                                src={moonshotLogo}
                                onClick={() => this.goTo('/')}
                            />
                        </ToolbarGroup>
                    </Toolbar>
                </header>
            );
        }

        // menu shown on onboarding
        // if (isOnboarding && this.props.currentUser) {
        //     return (
        //         <Toolbar id="menu" style={{marginTop: "10px"}}>
        //             <ToolbarGroup className="logoToolbarGroup">
        //                 <img
        //                     width={187.5}
        //                     height={60}
        //                     alt="Moonshot Logo"
        //                     title="Moonshot Logo"
        //                     className="moonshotMenuLogo"
        //                     id="moonshotLogo"
        //                     src={moonshotLogo}
        //                 />
        //             </ToolbarGroup>
        //             <ToolbarGroup>
        //                 <DropDownMenu value={this.state.value}
        //                               onChange={this.handleChange}
        //                               underlineStyle={styles.underlineStyle}
        //                               anchorOrigin={styles.anchorOrigin}
        //                               style={{fontSize: "18px", marginTop: "21px"}}
        //                               className={dropdownClass}
        //                               id="menuDropdown"
        //                 >
        //                     <MenuItem value={4} primaryText={this.props.currentUser.name}/>
        //                     <Divider/>
        //                     <MenuItem value={3} primaryText="Sign Out"/>
        //                 </DropDownMenu>
        //
        //
        //                 <IconMenu
        //                     iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
        //                     anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        //                     targetOrigin={{horizontal: 'right', vertical: 'top'}}
        //                     className="smallScreenMenu"
        //                     iconStyle={{fill: iconMenuColor}}
        //                 >
        //                     <MenuItem style={{color: "#00c3ff"}} primaryText={this.props.currentUser.name}/>
        //                     <Divider/>
        //                     <MenuItem primaryText="Sign out" onClick={() => this.signOut()}/>
        //                 </IconMenu>
        //             </ToolbarGroup>
        //         </Toolbar>
        //     );
        // }


        // the options that will be shown in the menu
        let menuOptions = [];
        // if the Moonshot logo should redirect to the homepage
        let logoIsLink = true;
        // used for menu divider
        let loggedInClass = " loggedIn";
        // if there is no user logged in
        if (!currentUser) {
            loggedInClass = " loggedOut";
            menuOptions = [
                {optionType: "url", title: "Home", url: "/"},
                {optionType: "url", title: "Discover", url: "/discover"},
                {optionType: "url", title: "For Business", url: "/forBusiness"},
                {optionType: "separator"},
                {optionType: "url", title: "Sign In", url: "/login"},
            ];
        }
        // if the current user is an employer
        else if (currentUser.userType === "employer") {
            console.log("here");
            menuOptions = [
                {optionType: "url", title: "Home", url: "/businessHome"},
                {optionType: "url", title: "My Candidates", url: "/myCandidates"},
                {optionType: "separator"},
                {optionType: "dropDown", components: [
                    {optionType: "url", title: "Profile", url: "/businessProfile"},
                    {optionType: "divider"},
                    {optionType: "url", title: "Settings", url: "/settings"},
                    {optionType: "signOut"}
                ]}
            ];
        }
        // if the current user is onboarding (must be a candidate)
        else if (isOnboarding) {
            // moonshot logo should not redirect to homepage during onboarding
            logoIsLink = false;
            menuOptions = [
                {optionType: "dropDown", components: [
                    {optionType: "text", title: currentUser.name},
                    {optionType: "divider"},
                    {optionType: "signOut"}
                ]}
            ];
        }
        // if the current user is a candidate who is not onboarding
        else if (currentUser.userType === "candidate") {
            menuOptions = [
                {optionType: "url", title: "Discover", url: "/discover"},
                {optionType: "url", title: "My Pathways", url: "/myPathways"},
                {optionType: "separator"},
                {optionType: "dropDown", components: [
                    {optionType: "url", title: "Profile", url: "/profile"},
                    {optionType: "divider"},
                    {optionType: "url", title: "Settings", url: "/settings"},
                    {optionType: "signOut"}
                ]}
            ];
        }

        // construct the menu's tabs
        let desktopMenu = [];
        let mobileMenu = [];
        //const menuItemClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem";
        const selectedMenuItemClass = menuItemClass + " currentRoute";
        menuOptions.forEach(function(option) {
            switch (option.optionType) {
                case "url":
                    // default to not underlined
                    let optionClass = menuItemClass;
                    // if this option is the one that is currently selected, underline it
                    console.log("self.props.location.pathname: ", self.props.location.pathname);
                    console.log("option.url: ", option.url)
                    if (self.props.location.pathname === option.url) {
                        optionClass = selectedMenuItemClass;
                    }
                    desktopMenu.push(
                        <p key={option.title + " desktop"} className={optionClass} onClick={() => self.goTo(option.url)}>{option.title}</p>
                    );
                    mobileMenu.push(
                        <MenuItem key={option.title + " mobile"} primaryText={option.title} onClick={() => this.goTo(option.url)}/>
                    );
                    break;
                case "separator":
                    // push a line, only visible on desktop
                    desktopMenu.push(
                        <div key={"separator"} className={"menuDivider wideScreenMenuItem" + loggedInClass} />
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
                                    <MenuItem key={dropDownOption.title + " mobile"} primaryText={dropDownOption.title} onClick={() => this.selectAndGoTo(dropDownOption.url, dropDownOption.title)}/>
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
                                    <MenuItem key={"signOut mobile"} primaryText="Sign out" onClick={() => this.signOut()}/>
                                );
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
                                      style={{fontSize: "18px", marginTop: "21px"}}
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
                        <p key={"signOut desktop"} className={menuItemClass} onClick={() => this.signOut()}>"Sign Out"</p>
                    );
                    // add sign out button to mobile menu
                    mobileMenu.push(
                        <MenuItem key={"signOut mobile"} primaryText="Sign out" onClick={() => this.signOut()}/>
                    );
                    break;
                default:
                    break;

            }
        });

        // dropDown menu only appears if there is a user logged in, so if one
        // is logged in, show the line that shows up when a dropDown item is selected
        if (currentUser) {
            desktopMenu.push(
                <div key={"underline"} className="menuUnderline" style={{width: hoverWidth}}/>
            )
        }

        // default logo class
        let logoClassName = "moonshotMenuLogo";
        // default to doing nothing on logo click
        let logoClickAction = () => {};
        // if the logo is a link, make clicking it go home and make it look clickable
        if (logoIsLink) {
            logoClassName = "clickable moonshotMenuLogo";
            logoClickAction = () => this.goTo("/");
        }
        let moonshotLogoImg = (
            <img
                width={187.5}
                height={60}
                alt="Moonshot"
                className="clickable moonshotMenuLogo"
                id="moonshotLogo"
                src={moonshotLogo}
                onClick={logoClickAction}
            />
        );

        let menu = (
            <header style={{zIndex: "100"}}>
                <div>
                    <Toolbar id="menu" style={{marginTop: "10px"}}>
                        <ToolbarGroup className="logoToolbarGroup">
                            {moonshotLogoImg}
                        </ToolbarGroup>
                        <ToolbarGroup>
                            {desktopMenu}

                            <IconMenu
                                iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                className="smallScreenMenu"
                                iconStyle={{fill: "white"}}
                            >
                                {mobileMenu}
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                </div>
            </header>
        );

        return menu;


        return (
            <header style={{zIndex: "100"}}>
                {this.props.currentUser ?
                    /* logged in */
                    <div>
                        {this.props.currentUser.userType === "employer" ?
                            /* user is a business user */
                            <Toolbar id="menu" style={{marginTop: "10px"}}>
                                <ToolbarGroup className="logoToolbarGroup">
                                    <img
                                        width={187.5}
                                        height={60}
                                        alt="Moonshot"
                                        className="clickable moonshotMenuLogo"
                                        id="moonshotLogo"
                                        src={moonshotLogo}
                                        onClick={() => this.goTo('/businessHome')}
                                    />
                                </ToolbarGroup>
                                <ToolbarGroup>
                                    <p className={discoverClass} onClick={() => this.goTo('/businessHome')}>Home</p>
                                    <p className={myPathwaysClass} onClick={() => this.goTo('/myCandidates')}>My
                                        Candidates</p>
                                    <div className="menuDivider loggedIn wideScreenMenuItem"/>
                                    <DropDownMenu value={this.state.value}
                                                  onChange={this.handleChange}
                                                  underlineStyle={styles.underlineStyle}
                                                  anchorOrigin={styles.anchorOrigin}
                                                  style={{fontSize: "18px", marginTop: "21px"}}
                                                  className={dropdownClass}
                                                  id="menuDropdown"
                                    >
                                        <MenuItem value={1} primaryText="Profile"/>
                                        <Divider/>
                                        <MenuItem value={2} primaryText="Settings"/>
                                        <MenuItem value={3} primaryText="Sign Out"/>
                                    </DropDownMenu>
                                    <div className="menuUnderline" style={{width: hoverWidth}}/>

                                    <IconMenu
                                        iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
                                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                        className="smallScreenMenu"
                                        iconStyle={{fill: "white"}}
                                    >
                                        <MenuItem primaryText="Home" onClick={() => this.goTo('/businessHome')}/>
                                        <MenuItem primaryText="My Candidates" onClick={() => this.goTo('/myCandidates')}/>
                                        <MenuItem primaryText="Profile" onClick={() => this.selectItem('/businessProfile', 1)}/>
                                        <MenuItem primaryText="Settings"
                                                  onClick={() => this.selectItem('/settings', 2)}/>
                                        <MenuItem primaryText="Sign out" onClick={() => this.signOut()}/>
                                    </IconMenu>
                                </ToolbarGroup>
                            </Toolbar>
                        :
                            /* user is a candidate */
                            <Toolbar id="menu" style={{marginTop: "10px"}}>
                                <ToolbarGroup className="logoToolbarGroup">
                                    <img
                                        width={187.5}
                                        height={60}
                                        alt="Moonshot"
                                        className="clickable moonshotMenuLogo"
                                        id="moonshotLogo"
                                        src={moonshotLogo}
                                        onClick={() => this.goTo('/discover')}
                                    />
                                </ToolbarGroup>
                                <ToolbarGroup>
                                    <p className={discoverClass} onClick={() => this.goTo('/discover')}>Discover</p>
                                    <p className={myPathwaysClass} onClick={() => this.goTo('/myPathways')}>My
                                        Pathways</p>
                                    <div className="menuDivider loggedIn wideScreenMenuItem"/>
                                    <DropDownMenu value={this.state.value}
                                                  onChange={this.handleChange}
                                                  underlineStyle={styles.underlineStyle}
                                                  anchorOrigin={styles.anchorOrigin}
                                                  style={{fontSize: "18px", marginTop: "21px"}}
                                                  className={dropdownClass}
                                                  id="menuDropdown"
                                    >
                                        <MenuItem value={1} primaryText="Profile"/>
                                        <Divider/>
                                        <MenuItem value={2} primaryText="Settings"/>
                                        <MenuItem value={3} primaryText="Sign Out"/>
                                    </DropDownMenu>
                                    <div className="menuUnderline" style={{width: hoverWidth}}/>


                                    <IconMenu
                                        iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
                                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                        className="smallScreenMenu"
                                        iconStyle={{fill: "white"}}
                                    >
                                        <MenuItem primaryText="Discover" onClick={() => this.goTo('/discover')}/>
                                        <MenuItem primaryText="My Pathways" onClick={() => this.goTo('/myPathways')}/>
                                        <MenuItem primaryText="Profile" onClick={() => this.selectItem('/profile', 1)}/>
                                        <MenuItem primaryText="Settings"
                                                  onClick={() => this.selectItem('/settings', 2)}/>
                                        <MenuItem primaryText="Sign out" onClick={() => this.signOut()}/>
                                    </IconMenu>
                                </ToolbarGroup>
                            </Toolbar>
                        }
                    </div>
                :
                    /* not logged in */
                    <Toolbar style={{marginTop: "10px"}} id="menu">
                        <ToolbarGroup>
                            <img
                                width={187.5}
                                height={60}
                                alt="Moonshot Logo"
                                title="Moonshot Logo"
                                className="clickable moonshotMenuLogo"
                                id="moonshotLogo"
                                src={moonshotLogo}
                                onClick={() => this.goTo('/')}
                            />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <p className={homeClass} onClick={() => this.goTo('/')}>Home</p>
                            <p className={discoverClass} onClick={() => this.goTo('/discover')}>Discover</p>
                            <p className={forBusClass} onClick={() => this.goTo('/forBusiness')}>For Business</p>
                            <div className="menuDivider loggedOut wideScreenMenuItem"/>
                            <p className={loginClass} onClick={() => this.goTo('/login')}>Sign In</p>

                            <IconMenu
                                iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                className="smallScreenMenu"
                                iconStyle={{fill: "white"}}
                            >
                                <MenuItem primaryText="Home" onClick={() => this.goTo('/')}/>
                                <MenuItem primaryText="Discover" onClick={() => this.goTo('/discover')}/>
                                <MenuItem primaryText="For Business" onClick={() => this.goTo('/forBusiness')}/>
                                <MenuItem primaryText="Sign In" onClick={() => this.goTo('/login')}/>
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                }
            </header>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout,
        closeNotification,
        setHeaderBlue,
        endOnboarding
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        isOnboarding: state.users.isOnboarding,
        blueHeader: state.users.blueHeader
    };
}

Menu = withRouter(Menu);

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
