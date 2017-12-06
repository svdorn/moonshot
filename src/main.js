"use strict"
import React, { Component } from 'react';
import Menu from './components/menu';
import Footer from './components/footer';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
    lightBlue500,
    grey100, grey300, grey400, grey500,
    white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

const muiTheme = getMuiTheme({
    spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: '#00c3ff',
        primary2Color: lightBlue500,
        primary3Color: grey400,
        accent1Color: white,
        accent2Color: grey100,
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: white,
        canvasColor: white,
        borderColor: grey300,
        disabledColor: fade(darkBlack, 0.3),
        pickerHeaderColor: '#00c3ff',
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack,
    },
});

class Main extends Component {

  render() {
      console.log("here");
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
          <Menu/>
            { this.props.children }
          <Footer/>
      </MuiThemeProvider>
    );
  }
}

export default Main;
