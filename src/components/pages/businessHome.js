"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

class BusinessHome extends Component {
    render() {
        return (
            <div>
                <div>
                    <div id="stripes" />
                    <section id="intro">
                        <div className="container-header">
                            <h1>Hey</h1>
                        </div>
                    </section>
                    <figure className="floatingCards">
                        <div className="leftFloatingCard leftFloatingCardDeepShadow"/>
                        <div className="rightFloatingCard">
                            <img src="/images/ProductScreenshot1.jpg" />
                        </div>
                        <div className="leftFloatingCard leftFloatingCardNearShadow">
                            <img src="/images/ProductScreenshot2.jpg" />
                        </div>
                    </figure>
                </div>
            </div>
        );
    }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHome);
