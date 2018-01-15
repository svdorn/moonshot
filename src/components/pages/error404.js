"use strict"
import React, { Component } from 'react';
import { Paper } from 'material-ui';
import { browserHistory } from 'react-router';
import {connect} from 'react-redux';

class error404 extends Component {
    goTo (route)  {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render () {
        let route = '/';
        if (this.props.currentUser) {
            route = '/discover';
        }
        return (
            <div className="fullHeight greenToBlue" style={{textAlign:"center"}}>
                <Paper className="form" zDepth={2}>
                    <h1 className="bigText">404</h1>
                    <h2>Page not found</h2>
                    You are lost but we can show you the way!
                    <p  className="clickable blueText"
                        onClick={() => this.goTo(route)}>
                        Follow me!
                    </p>
                </Paper>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

export default connect(mapStateToProps)(error404);
