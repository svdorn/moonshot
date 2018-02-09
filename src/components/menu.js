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
        if (this.props.location.pathname === '/settings') {
            value = 2;
        } else if (this.props.location.pathname === '/onboarding') {
            value = 4;
        }
        this.state = {value};
    }

    componentDidUpdate() {
        if (this.props.location.pathname === '/settings') {
            if (this.state.value !== 2) {
                this.setState({value:2});
            }
        } else if (this.props.location.pathname === '/onboarding') {
            if (this.state.value !== 4) {
                this.setState({value: 4});
            }
        } else {
            // set dropdown to be on Profile if not on settings or onboarding pages
            if (this.state.value !== 1) {
                this.setState({value:1});
            }
        }
    }

    handleChange = (event, index, value) => {
        if (value === 1) {
            this.goTo('/profile');
        } else if (value === 2) {
            this.goTo('/settings');
        } else if (value === 4) {
            // do nothing
        } else {
            if (this.props.location.pathname === '/onboarding') {
                const markOnboardingComplete = false;
                this.props.endOnboarding(this.props.currentUser, markOnboardingComplete);
            }

            value = 1;
            this.props.signout();
            this.goTo('/');
        }
        this.setState({value});
    };

    selectItem(route, value) {
        this.goTo(route);
        this.setState({value});
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
        let iconMenuColor = this.props.isOnboarding ? "#00c3ff" : "white";
        let moonshotLogo = this.props.isOnboarding ? "/images/OfficialLogoBlack.png" : "/images/OfficialLogoWhite.png";
        let dropdownClass = this.props.isOnboarding ? "headerDropdownBlue wideScreenMenuItem" : "headerDropdownWhite wideScreenMenuItem";
        let menuItemClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem"
        if (this.props.blueHeader) {
            moonshotLogo = "/images/OfficialLogoBlue.png";
            dropdownClass = "headerDropdownBlue wideScreenMenuItem";
            menuItemClass = "menuItem font18px borderBottomClickable noWrap blueText wideScreenMenuItem"
        }
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
        let hoverWidth = "47px";
        if (this.props.location.pathname === '/myPathways') {
            myPathwaysClass = "menuItem font18px borderBottomClickable noWrap whiteText wideScreenMenuItem currentRoute";
        }
        if (this.props.location.pathname === '/profile') {
            dropdownClass = "headerDropdownWhite wideScreenMenuItem currentRoute";
        }
        if (this.props.location.pathname === '/settings') {
            dropdownClass = "headerDropdownWhite wideScreenMenuItem currentRoute";
            hoverWidth = "62px";
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

        if (this.props.isOnboarding && this.props.currentUser) {
            return (
                <Toolbar id="menu" style={{marginTop: "10px"}}>
                    <ToolbarGroup className="logoToolbarGroup">
                        <img
                            width={187.5}
                            height={60}
                            alt="Moonshot Logo"
                            title="Moonshot Logo"
                            className="moonshotMenuLogo"
                            id="moonshotLogo"
                            src={moonshotLogo}
                        />
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <DropDownMenu value={this.state.value}
                                      onChange={this.handleChange}
                                      underlineStyle={styles.underlineStyle}
                                      anchorOrigin={styles.anchorOrigin}
                                      style={{fontSize: "18px", marginTop: "21px"}}
                                      className={dropdownClass}
                                      id="menuDropdown"
                        >
                            <MenuItem value={4} primaryText={this.props.currentUser.name}/>
                            <Divider/>
                            <MenuItem value={3} primaryText="Sign Out"/>
                        </DropDownMenu>


                        <IconMenu
                            iconButtonElement={<IconButton><MoreHorizIcon/></IconButton>}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            className="smallScreenMenu"
                            iconStyle={{fill: iconMenuColor}}
                        >
                            <MenuItem style={{color: "#00c3ff"}} primaryText={this.props.currentUser.name}/>
                            <Divider/>
                            <MenuItem primaryText="Sign out" onClick={() => this.signOut()}/>
                        </IconMenu>
                    </ToolbarGroup>
                </Toolbar>
            );
        }

        return (
            <header style={{zIndex: "100"}}>
                {this.props.currentUser ?
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
                            <p className={myPathwaysClass} onClick={() => this.goTo('/myPathways')}>My Pathways</p>
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
                                <MenuItem primaryText="Settings" onClick={() => this.selectItem('/settings', 2)}/>
                                <MenuItem primaryText="Sign out" onClick={() => this.signOut()}/>
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                    :

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
                    </Toolbar>}
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
