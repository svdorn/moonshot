"use strict"
import React, {Component} from 'react';
import {AppBar, FlatButton, ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarTitle} from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import {bindActionCreators} from 'redux';
import {signout} from "../actions/usersActions";

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
        console.log("in menu");
        console.log(this.props.currentUser);

        if (this.props.isFetching) {
            return (
                <header>
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarTitle text="Moonshot Learning" />
                        </ToolbarGroup>
                    </Toolbar>
                </header>
            );
        }

        return (
            <header>
                {this.props.currentUser ?
                    <Toolbar>
                        <ToolbarGroup>
                            <ToolbarTitle text="Moonshot Learning" />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <FlatButton label="Home" onClick={() => this.goTo('/')} />
                            <FlatButton label="Content"  onClick={() => this.goTo('/content')} />
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
                        <FlatButton label="Home" onClick={() => this.goTo('/')} />
                        <FlatButton label="Login" onClick={() => this.goTo('/login')} />
                        <FlatButton label="Signup" onClick={() => this.goTo('/signup')} />
                    </ToolbarGroup>
                </Toolbar>}
            </header>

        )
    }
}
function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
