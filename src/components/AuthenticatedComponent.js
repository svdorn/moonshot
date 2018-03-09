"use strict"
import React, {Component} from 'react';
import Notification from './notification'
import {getUserFromSession} from '../actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';


class AuthenticatedComponent extends Component {
    constructor(props) {
        super(props);

        console.log("props: ", props);

        // if userChecked is true, render the child component
        this.state = {userChecked: false};
    }


    componentDidMount() {
        // if we are in a route that is outside main, we need to get the user
        // from the session
        // if (this.props.route.outsideMain) {
        //     let self = this;
        //     this.props.getUserFromSession(function(work) {
        //         self.checkLoggedIn();
        //     });
        // } else {
            this.checkLoggedIn();
        // }
    }


    checkLoggedIn() {
        // if there is no user, redirect to home
        if (   !this.props.currentUser ||  this.props.currentUser == "no user") {
            const location = this.props.location;
            const redirect = location.pathname + location.search;

            this.props.router.push('/login?redirect=' + redirect);
        }
        // if there is a user but they don't have the right user type
        else if (this.props.route.userType && this.props.currentUser.userType !== this.props.route.userType) {
            this.props.router.push('/');
        }

        else {
            this.setState({userChecked: true});
        }
    }


    render() {
        // clone the element so that we can put props into the element, such as location
        const childElement = React.cloneElement(this.props.route.page, { location: this.props.location });
        return (
            <div>
                { this.state.userChecked ?
                    childElement
                    : null
                }
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getUserFromSession
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent);
