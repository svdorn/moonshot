"use strict"
import React, {Component} from 'react';
import Notification from './notification'
import {getUserFromSession} from '../actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';


class AuthenticatedComponent extends Component {
    constructor(props) {
        super(props);

        // if userChecked is true, render the child component
        this.state = { userChecked: false };
    }


    componentDidMount() {
        this.checkLoggedIn();
    }


    checkLoggedIn() {
        // if there is no user, redirect to login page
        if (   !this.props.currentUser ||  this.props.currentUser == "no user") {
            const location = this.props.location;
            const redirect = location.pathname + location.search;

            this.props.router.push('/login?redirect=' + redirect);
        }
        // if there is a user see if they are of the right type
        else {
            const types = this.props.route.userType;
            const currentUserType = this.props.currentUser.userType;
            let authenticatedType = types.includes(currentUserType);

            // if one of the authenticated types matches the current user's type, they are authenticated
            if (authenticatedType) {
                this.setState({ userChecked: true });
            } else {
                this.props.router.push('/');
            }
        }
    }


    render() {
        // clone the element so that we can put props into the element,
        // such as location, children, params that are passed through the url
        const childElement = React.cloneElement(this.props.route.page, {
            location: this.props.location,
            children: this.props.children,
            params: this.props.params
        });
        return (
            <div>
                { this.state.userChecked ?
                    childElement : <div className="blackBackground fillScreen"/>
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
