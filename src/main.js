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
import { getUserFromSession } from './actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const muiTheme = getMuiTheme({
    spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: '#00c3ff',
        primary2Color: lightBlue500,
        primary3Color: grey400,
        accent1Color: white,
        accent2Color: 'transparent',
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
    menu: {
        textColor: white,
        accent2Color: darkBlack
    }
});

class Main extends Component {
    componentDidMount() {
        this.props.getUserFromSession();
    }

    render() {
        if (this.props.isFetching) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <Menu title="menu" />
                    <Footer/>
                </MuiThemeProvider>
            );
        }
        // render the page once the current user is loaded
        else {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <Menu/>
                        { this.props.children }
                    <Footer/>
                </MuiThemeProvider>
            );
        }
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getUserFromSession
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
