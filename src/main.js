"use strict"
import React, {Component} from 'react';
import Menu from './components/menu';
import Footer from './components/footer';
import Notification from './components/notification'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
    lightBlue500,
    grey300, grey400, grey500,
    white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import {Paper, CircularProgress} from 'material-ui';
import {getUserFromSession} from './actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// so that axios works in IE < 11
require('es6-promise').polyfill();

let theme = {
    // this messes with the slider colors
    // userAgent: 'all',
    userAgent: false,
    spacing: spacing,
    fontFamily: 'Muli, sans-serif',
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
    constructor(props) {
        super(props);
        this.state = {
            loadedUser: false,
            agreedToTerms: false,
            agreeingToTerms: false
        };
    }

    componentDidMount() {
        const self = this;
        // get the user from the session - if there is no user, just marks screen ready to display
        this.props.getUserFromSession(function (work) {
            if (work) {
                self.setState({ loadedUser: true });
            }
        })
    }


    render() {
        let content = null;
        if (!this.state.loadedUser) {
            content = <div className="fillScreen"/>
        }
        else {
            content = (
                <div>
                    <Menu/>
                    <div className="headerSpace" />
                    <Notification/>
                    {this.props.children}
                    <Footer/>
                </div>
            );
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                { content }
            </MuiThemeProvider>
        )
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
