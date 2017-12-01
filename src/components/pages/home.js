"use strict"
import React, { Component } from 'react';
import { Paper } from 'material-ui';
class Home extends Component{

    render(){
        return(
          <div>
              <Paper className="form" zDepth={2}>
                  <h1>Home</h1>
                  <h3>
                      Moonshot learning is a company that is amazing.
                  </h3>
              </Paper>
          </div>
        );
    }
}

export default Home;