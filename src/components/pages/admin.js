"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';

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

        let self = this;

        axios.get("/api/infoForAdmin", {params: {
            userId: user._id,
            verificationToken: user.verificationToken
        }})
        .then(function(response) {
            const usersArray = response.data;
            self.setState({
                ...self.state,
                users: usersArray
            })
        })
        .catch(function(err) {
            console.log("error with getting info for admin");
        })
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
        const users = this.state.users;
        let userLis = !users || users.length === 0 ? null : users.map(function(user) {
            return (
                <li>
                    <a href={"/adminUserView?user=" + user.profileUrl}>{user.name}</a> with email: {user.email}
                </li>
            );
        });

        const userList = <ul>{userLis}</ul>;

        return (
            <div>
                {this.props.currentUser.admin === true ?
                    <div>
                        <div className="headerDiv greenToBlue" />
                        {userList}
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
