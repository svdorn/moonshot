"use strict"
import React, {Component} from 'react';
import {AppBar, FlatButton, ToolbarGroup} from 'material-ui';

class Menu extends Component {

    render() {
        const styles = {
            title: {
                cursor: 'pointer',
            },
        };
        const myButtons = (
            <div>
                <FlatButton label="Home" href="/" hoverColor='#00c3ff' secondary={true}/>
                <FlatButton label="Login" href="/login" hoverColor='#00c3ff' secondary={true}/>
                <FlatButton label="Signup" href="/signup" hoverColor='#00c3ff' secondary={true}/>
            </div>
        );

        return (
            <header>
                <AppBar title={<span style={styles.title}>Moonshot Learning</span>}
                        iconElementRight={<ToolbarGroup>{myButtons}</ToolbarGroup>}
                        showMenuIconButton={false}
                />
            </header>

        )
    }
}

export default Menu;
