"use strict"
import React, { Component } from 'react';
import {Toolbar, ToolbarTitle, FlatButton, ToolbarGroup } from 'material-ui';

class Footer extends Component {
  render() {
    return (
      <footer className="footer text-center">
        <Toolbar style={{textAlign:'center'}}>
            <ToolbarTitle text="Copyright 2017 Moonshot Learning Inc. All rights reserved."/>
        </Toolbar>
      </footer>
    );
  }
}

export default Footer;
