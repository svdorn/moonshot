"use strict"
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import {connect} from 'react-redux';
import MetaTags from 'react-meta-tags';

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
            route = '/myEvaluations';
        }
        return (
            <div className="fillScreen formContainer" style={{textAlign:"center"}}>
                <MetaTags>
                    <title>404 | Moonshot</title>
                    <meta name="description" content="You are lost but we can show you the way." />
                </MetaTags>

                <div className="form lightBlackForm noBlur">
                    <form>
                        <img
                            alt="404 Image - Rocket Doing Loops"
                            src={"/images/404" + this.props.png}
                            id="image404"
                        /><br/>
                        You seem a little lost,<br/> but we can show you the way!
                        <p  className="clickable blueText underline"
                            onClick={() => this.goTo(route)}>
                            Follow Me
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

export default connect(mapStateToProps)(error404);
