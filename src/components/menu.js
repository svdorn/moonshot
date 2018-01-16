"use strict"
import React, { Component } from 'react';
import { AppBar, FlatButton, ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarTitle, IconMenu, IconButton } from 'material-ui';
import MoreHorizIcon from 'material-ui/svg-icons/image/dehaze'
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout, closeNotification, setHeaderBlue } from "../actions/usersActions";
import Person from 'material-ui/svg-icons/social/person';
import { axios } from 'axios';

const styles = {
    title: {
        cursor: 'pointer',
    },
    underlineStyle: {
        display: 'none',
    },
    menuItemStyle: {
        textColor: '#00c3ff',
    },
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'left'
    }
};

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {value: 1};
    }

    handleChange = (event, index, value) => {
        if (value === 1) {
            this.goTo('/profile');
        } else if (value === 2) {
            this.goTo('/settings');
        } else {
            value = 1;
            this.props.signout();
            this.goTo('/');
        }
        this.setState({value})
    };

    selectItem(route, value) {
        this.goTo(route);
        this.setState({value});
    }

    signOut() {
        this.props.signout();
        this.goTo('/');
        this.setState({value:1});
    }

    goTo (route)  {
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
        if (this.props.isOnboarding) {
            return null;
        }

        let moonshotLogo = "/images/MoonshotTempLogo.png";
        let dropdownClass = "headerDropdownWhite wideScreenMenuItem";
        let menuItemClass = "menuItem clickable noWrap whiteText wideScreenMenuItem"
        if (this.props.blueHeader) {
            moonshotLogo = "/images/OfficialLogoBlue.png";
            dropdownClass = "headerDropdownBlue wideScreenMenuItem";
            menuItemClass = "menuItem clickable noWrap blueText wideScreenMenuItem"
        }


        if (this.props.isFetching) {
            return (
                <header style={{zIndex:"100"}}>
                    <Toolbar id="menu" style={{marginTop:"10px"}}>
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
                    </Toolbar>
                </header>
            );
        }

        return (
            <header style={{zIndex:"100"}}>
                {this.props.currentUser ?
                    <Toolbar id="menu" style={{marginTop:"10px"}}>
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
                            <p className={menuItemClass} onClick={() => this.goTo('/discover')}>Discover</p>
                            <p className={menuItemClass} onClick={() => this.goTo('/myPathways')}>My Pathways</p>
                            <DropDownMenu value={this.state.value}
                                          onChange={this.handleChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                                          style={{fontSize:"20px", marginTop:"21px"}}
                                          className={dropdownClass}
                                          id="menuDropdown"
                            >
                                <MenuItem value={1} primaryText="Profile" />
                                <Divider />
                                <MenuItem value={2} primaryText="Settings" />
                                <MenuItem value={3} primaryText="Sign Out"/>
                            </DropDownMenu>


                            <IconMenu
                                iconButtonElement={<IconButton><MoreHorizIcon /></IconButton>}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                className="smallScreenMenu"
                                iconStyle={{fill: "white"}}
                            >
                                <MenuItem primaryText="Discover" onClick={() => this.goTo('/discover')} />
                                <MenuItem primaryText="My Pathways" onClick={() => this.goTo('/myPathways')} />
                                <MenuItem primaryText="Profile" onClick={() => this.selectItem('/profile', 1)} />
                                <MenuItem primaryText="Settings" onClick={() => this.selectItem('/settings', 2)} />
                                <MenuItem primaryText="Sign out" onClick={() => this.signOut()} />
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                    :

                <Toolbar style={{marginTop:"10px"}} id="menu">
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
                        <p className={menuItemClass} onClick={() => this.goTo('/')}>Home</p>
                        <p className={menuItemClass} onClick={() => this.goTo('/forBusiness')}>For Business</p>
                        <div className="menuDivider wideScreenMenuItem" />
                        <p className={menuItemClass} onClick={() => this.goTo('/login')}>Sign in</p>

                        <IconMenu
                            iconButtonElement={<IconButton><MoreHorizIcon /></IconButton>}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            className="smallScreenMenu"
                            iconStyle={{fill: "white"}}
                        >
                            <MenuItem primaryText="Home" onClick={() => this.goTo('/')} />
                            <MenuItem primaryText="For Business" onClick={() => this.goTo('/forBusiness')} />
                            <MenuItem primaryText="Sign In" onClick={() => this.goTo('/login')} />
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
        setHeaderBlue
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

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
