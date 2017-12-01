"use strict"
import React, { Component } from 'react';
import {AppBar, FlatButton, ToolbarGroup } from 'material-ui';

class Footer extends Component {
  render() {
    return (
      <footer className="footer text-center">
        <AppBar title="Copyright 2017 Moonshot Learning Inc. All rights reserved."
                showMenuIconButton={false}
        />
      </footer>
    );
  }
}

export default Footer;
