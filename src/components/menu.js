"use strict"
import React, { Component } from 'react';
import {AppBar, FlatButton, ToolbarGroup } from 'material-ui';

class Menu extends Component {

    render() {
        const styles = {
            title: {
                cursor: 'pointer',
            },
        };
        const myButtons = (
            <div>
                <FlatButton label="Login" href="/login" hoverColor='#00c3ff' secondary={true}/>
                <FlatButton label="Signup" href="/signup" hoverColor='#00c3ff' secondary={true}/>
            </div>
        );

        return (
            <AppBar title={<span style={styles.title}>Moonshot Learning</span>}
                    iconElementRight={<ToolbarGroup>{myButtons}</ToolbarGroup>}
            >
            </AppBar>

        )
    }
}
//admin, cart, login, signup

export default Menu;
