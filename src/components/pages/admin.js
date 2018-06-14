"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }


    componentDidMount() {
        const user = this.props.currentUser;

        if (user.admin !== true) {
            this.goTo("/");
            return;
        }
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    render() {
        return (
            <div>
                <MetaTags>
                    <title>Admin | Moonshot</title>
                    <meta name="description" content="Moonshot admin page." />
                </MetaTags>

                {this.props.currentUser.admin === true ?
                    <div>
                        <div className="headerDiv greenToBlue" />

                        {this.props.children}
                    </div>

                    : null
                }
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
