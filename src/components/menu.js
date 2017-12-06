"use strict"
import React, {Component} from 'react';
import {AppBar, FlatButton, ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarTitle} from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

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
            console.log("sign out");
        }
        this.setState({value})
    };

    render() {
        console.log("in menu");
        console.log(this.props.currentUser);

        return (
            <header>
                {this.props.currentUser ?
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarTitle text="Moonshot Learning" />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <FlatButton label="Home" href="/" />
                            <FlatButton label="Content" href="/content" />
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
                        <ToolbarTitle text="Moonshot Learning" />
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <FlatButton label="Home" href="/" />
                        <FlatButton label="Login" href="/login" />
                        <FlatButton label="Signup" href="/signup" />
                    </ToolbarGroup>
                </Toolbar>}
            </header>

        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

export default connect(mapStateToProps)(Menu);
