"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import DataDisplayMenu from "./dataDisplayMenu";
import "./dataDisplay.css";

const theme = createMuiTheme({
    palette: {
        primary: { main: "#76defe", dark: "#76defe", light: "#76defe" },
        secondary: { main: "#76defe", dark: "#76defe", light: "#76defe" }
    }
});

class DataDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <DataDisplayMenu />
                    <div styleName="content">{this.props.children}</div>
                </div>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataDisplay);
