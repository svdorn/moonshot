"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';

class AuthenticatedComponent extends Component {
    componentWillMount() {
        console.log("checking user");
        this.checkLoggedIn();
    }

    checkLoggedIn() {
        console.log('in checkLoggedIn')
        if (!this.props.currentUser || this.props.currentUser == "no user") {
            const location = this.props.location;
            const redirect = location.pathname + location.search;

            this.props.router.push('/login?redirect=${redirect}');
        }
    }



    //name, email, password, confirm password, signup button
    render() {
        return (
            <div>
                {this.props.route.page}
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






// import React from 'react';
// import { withRouter } from 'react-router';
//
// export default function requireAuth(Component) {
//
//   class AuthenticatedComponent extends React.Component {
//
//     componentWillMount() {
//         console.log("checkig auth");
//         this.checkAuth();
//     }
//
//     checkAuth() {
//       //if ( ! this.props.isLoggedIn) {
//       if (true) {
//         const location = this.props.location;
//         const redirect = location.pathname + location.search;
//
//         this.props.router.push('/login?redirect=${redirect}');
//       }
//     }
//
//     render() {
//       return this.props.isLoggedIn
//         ? <Component { ...this.props } />
//         : null;
//     }
//
//   }
//
//   return withRouter(AuthenticatedComponent);
// }
