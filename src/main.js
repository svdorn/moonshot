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
import {getUserFromSession, setWebpSupport} from './actions/usersActions';
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
        });

        this.checkWebpFeature("lossy", (feature, result) => {
            console.log("webp supported: ", result);
            this.props.setWebpSupport(result);
        })
    }


    // check_webp_feature:
    //   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
    //   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
    checkWebpFeature(feature, callback) {
        var kTestImages = {
            lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
            //lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
            //alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
            //animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
        };
        var img = new Image();
        img.onload = function () {
            var result = (img.width > 0) && (img.height > 0);
            callback(feature, result);
        };
        img.onerror = function () {
            callback(feature, false);
        };
        img.src = "data:image/webp;base64," + kTestImages[feature];
    }


    render() {
        let content = null;
        if (!this.state.loadedUser || !this.props.webpSupportChecked) {
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
        getUserFromSession,
        setWebpSupport
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        notification: state.users.notification,
        webpSupportChecked: state.users.webpSupportChecked
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
