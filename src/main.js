"use strict"
import React, { Component } from 'react';
import Menu from './components/menu';
import Footer from './components/footer';
import Notification from './components/notification'
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

let theme = {
    userAgent: 'all',
    spacing: spacing,
    fontFamily: 'Century Gothic, CenturyGothic, AppleGothic, sans-serif',
    palette: {
        primary1Color: '#00c3ff',
        primary2Color: lightBlue500,
        primary3Color: grey400,
        accent1Color: lightBlue500,
        accent2Color: 'rgba(0,0,0,0)',
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: darkBlack,
        canvasColor: white,
        borderColor: grey300,
        disabledColor: fade(darkBlack, 0.3),
        pickerHeaderColor: '#00c3ff',
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack,
    }
}

let muiTheme = getMuiTheme(theme);

class Main extends Component {
    componentDidMount() {
        this.props.getUserFromSession();
        //this.props.getUserAgent();
    }

    render() {
        if (this.props.isFetching) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div>
                        <Menu/>
                        <Footer/>
                    </div>
                </MuiThemeProvider>
            );
        }
        // render the page once the current user is loaded
        else {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div>
                        <Menu/>
                        <Notification/>
                        { this.props.children }
                        <Footer/>
                    </div>
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
        isFetching: state.users.isFetching,
        notification: state.users.notification,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
