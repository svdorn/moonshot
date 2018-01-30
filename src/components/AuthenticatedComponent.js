"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';

class AuthenticatedComponent extends Component {
    componentWillMount() {
        this.checkLoggedIn();
    }

    checkLoggedIn() {
        if (!this.props.currentUser || this.props.currentUser == "no user") {
            const location = this.props.location;
            const redirect = location.pathname + location.search;

            this.props.router.push('/login?redirect=' + redirect);
        }
    }



    //name, email, password, confirm password, signup button
    render() {
        // clone the element so that we can put props into the element, such as location
        const childElement = React.cloneElement(this.props.route.page, { location: this.props.location });

        return (
            <div>
                { childElement }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps)(AuthenticatedComponent);
