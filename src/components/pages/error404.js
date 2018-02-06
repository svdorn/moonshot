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
            <div className="fillScreen greenToBlue" style={{textAlign:"center"}}>
                <Paper className="form bigForm semiOpaquePaper blueTextImportant font20px font14pxUnder700 font10pxUnder400" zDepth={2}>
                    <img
                        src="/images/404.png"
                        id="image404"
                    /><br/>
                    You seem a little lost,<br/> but we can show you the way!
                    <p  className="clickable blueText underline"
                        onClick={() => this.goTo(route)}>
                        Follow Me
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
