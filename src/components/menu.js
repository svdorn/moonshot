"use strict"
import React, { Component } from 'react';
import { AppBar, FlatButton, ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarTitle } from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout, closeNotification } from "../actions/usersActions";
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

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        if (this.props.isFetching) {
            return (
                <header style={{zIndex:"100"}}>
                    <Toolbar>
                        <ToolbarGroup>
                        <img
                            width={300}
                            height={100}
                            alt="300x100"
                            className="clickable"
                            src="/images/MoonshotTempLogo.png"
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
                    <Toolbar style={{marginTop:"20px"}}>
                        <ToolbarGroup>
                            <img
                                style={{marginLeft:"35px"}}
                                width={250}
                                height={80}
                                alt="Moonshot"
                                className="clickable"
                                src="/images/MoonshotTempLogo.png"
                                onClick={() => this.goTo('/')}
                            />
                        </ToolbarGroup>
                        <ToolbarGroup style={{marginTop:"20px"}}>
                            <p className="menuItem clickable noWrap" onClick={() => this.goTo('/discover')}>Discover</p>
                            <DropDownMenu value={this.state.value}
                                          onChange={this.handleChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                                          style={{fontSize:"20px", marginTop:"11px"}}
                                          className="headerDropdown"
                            >
                                <MenuItem value={1} primaryText="Profile" />
                                <Divider />
                                <MenuItem value={2} primaryText="Settings" />
                                <MenuItem value={3} primaryText="Sign Out"/>
                            </DropDownMenu>
                        </ToolbarGroup>
                    </Toolbar>
                    :

                <Toolbar style={{marginTop:"20px"}}>
                    <ToolbarGroup>
                    <img
                        style={{marginLeft:"35px"}}
                        width={250}
                        height={80}
                        alt="300x100"
                        className="clickable"
                        src="/images/MoonshotTempLogo.png"
                        onClick={() => this.goTo('/')}
                    />
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <p className="menuItem clickable noWrap" onClick={() => this.goTo('/')}>Home</p>
                        <p className="menuItem clickable noWrap" onClick={() => this.goTo('/forBusiness')}>For Business</p>
                        <div className="menuDivider" />
                        <p className="menuItem clickable noWrap" onClick={() => this.goTo('/login')}>Sign in</p>
                    </ToolbarGroup>
                </Toolbar>}
            </header>

        )
    }
}
function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout,
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
