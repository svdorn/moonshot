"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';

class AdminUserView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: undefined
        };
    }


    componentDidMount() {
        const user = this.props.currentUser;
        let profileUrl = "";
        try {
            profileUrl = this.props.location.query.user;
        } catch(e) {
            this.goTo("/admin");
        }

        if (user.admin !== true) {
            this.goTo("/");
            return;
        }

        let self = this;

        axios.get("/api/userForAdmin", {params: {
            adminUserId: user._id,
            verificationToken: user.verificationToken,
            profileUrl
        }})
        .then(function(response) {
            const user = response.data;
            console.log("user is: ", user);
            self.setState({
                ...self.state,
                user: user
            });
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
        const user = this.state.user;

        return (
            <div>
                {this.props.currentUser.admin === true ?
                    <div>
                        <div className="headerDiv greenToBlue" />
                        {user ?
                            user.name : null
                        }
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

export default connect(mapStateToProps, mapDispatchToProps)(AdminUserView);
