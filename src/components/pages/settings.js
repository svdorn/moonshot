"use strict"
import React, { Component } from 'react';
import { Paper } from 'material-ui';
class Content extends Component{

    render(){
        return(
            <div>
                <Paper className="form" zDepth={2}>
                    <h1>Settings</h1>
                    <h3>
                        This is the settings page.
                    </h3>
                </Paper>
            </div>
        );
    }
}

export default Content;