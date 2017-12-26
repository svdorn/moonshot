"use strict"
import React, { Component } from 'react';
import { AppBar, FlatButton, ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarTitle } from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout } from "../actions/usersActions";
import { getHomepageImages } from "../actions/imageactions";
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
        vertical: 'center',
        horizontal: 'middle'
    }
};

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {value: 1};
    }

    handleChange = (event, index, value) => {
        if (value === 1) {
            browserHistory.push('/profile');
        } else if (value === 2) {
            browserHistory.push('/settings');
        } else {
            this.props.signout();
            browserHistory.push('/');
        }
        this.setState({value})
    };

    goTo (route)  {
        browserHistory.push(route);
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
                        <ToolbarGroup>
                            <p className="menuItem clickable noWrap" onClick={() => this.goTo('/')}>Home</p>
                            <p className="menuItem clickable noWrap" onClick={() => this.goTo('/sandbox')}>Sandbox</p>
                            <DropDownMenu value={this.state.value}
                                          onChange={this.handleChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                            >
                                <MenuItem value={1} primaryText="Profile" />
                                <Divider />
                                <MenuItem value={2} primaryText="Settings" />
                                <MenuItem value={3} primaryText="Sign Out"/>
                            </DropDownMenu>
                        </ToolbarGroup>
                    </Toolbar>
                    :

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
        getHomepageImages
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        images: state.images.images
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
