"use strict"
import React, { Component } from 'react';
import {AppBar} from 'material-ui';
import FlatButton from 'material-ui/FlatButton';

class Menu extends Component {
    render() {
        return (
            <AppBar title="Moonshot Learning" iconElementRight={<FlatButton href="/admin" label="Admin" />}>
            </AppBar>
        )
    }
}
//admin, cart, login, signup

export default Menu;
