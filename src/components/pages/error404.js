"use strict"
import React, { Component } from 'react';
import { Paper } from 'material-ui';
import { browserHistory } from 'react-router';

class error404 extends Component {
    goTo (route)  {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render () {
        return (
            <div className="fullHeight greenToBlue">
                <Paper className="form" zDepth={2}>
                    <h1 className="bigText">404</h1>
                    <h2>Page not found</h2>
                    You are lost but we can show you the way!
                    <p  className="clickable blueText"
                        onClick={() => this.goTo('/discover')}>
                        Follow me!
                    </p>
                </Paper>
            </div>
        );
    }
}

export default error404;
