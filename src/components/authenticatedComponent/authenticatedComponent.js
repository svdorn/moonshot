"use strict"
import React, {Component} from 'react';
import Notification from '../notification';
import {getUserFromSession} from '../../actions/usersActions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import AgreeToTerms from "./agreeToTerms";


class AuthenticatedComponent extends Component {
    constructor(props) {
        super(props);

        // if userChecked is true, render the child component
        this.state = { userChecked: false };
    }


    componentDidMount() {
        this.reCheck();
    }


    componentDidUpdate(prevProps, prevState) {
        this.reCheck();
    }


    reCheck() {
        // check if the user is logged in
        let userChecked = this.checkLoggedIn();
        // check if the user has agreed to the necessary terms and conditions
        let agreedToTerms = this.checkAgreedToTerms();

        if (this.state.userChecked !== userChecked || this.state.agreedToTerms !== agreedToTerms) {
            this.setState({ userChecked, agreedToTerms });
        }
    }


    checkAgreedToTerms() {
        let agreedToTerms = true;
        // if there is a current user we have to make sure they have agreed to the necessary terms
        if (this.props.currentUser) {
            agreedToTerms = false;
            const acceptedAgreements = this.props.currentUser ? this.props.currentUser.termsAndConditions : undefined;

            // if the user has some terms they have agreed to
            if (Array.isArray(acceptedAgreements)) {
                // everyone has to agree to the privacy policy and terms of use
                let necessaryAgreements = ["Privacy Policy", "Terms of Use"];
                if (this.props.currentUser.userType === "accountAdmin" && this.props.currentUser.firstBusinessUser === true) {
                    necessaryAgreements.push("Service Level Agreement");
                }
                agreedToTerms = true;
                // go through each necessary agreement ...
                necessaryAgreements.forEach(necessaryAgreement => {
                    // ... make sure the agreement is contained in the agreements the user has agreed to
                    if (!acceptedAgreements.some(acceptedAgreement => {
                        return acceptedAgreement.name === necessaryAgreement && acceptedAgreement.agreed === true;
                    })) {
                        // and if not, mark agreed-ness to false
                        agreedToTerms = false;
                    }
                });
            }
        }

        return agreedToTerms;
    }


    checkLoggedIn() {
        // if there is no user, redirect to login page
        const currentUser = this.props.currentUser;
        if (!currentUser || currentUser == "no user") {
            const location = this.props.location;
            const redirect = location.pathname + location.search;

            this.props.router.push('/login?redirect=' + redirect);
        }
        // if there is a user see if they are of the right type
        else {
            const types = this.props.route.userType;
            let authenticatedType = true;
            if (types) {
                authenticatedType = types.includes(currentUser.userType);
            }

            // if one of the authenticated types matches the current user's type, they are authenticated
            if (authenticatedType) {
                return true;
                this.setState({ userChecked: true });
            } else {
                this.props.router.push('/');
                return false;
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

        // if the user logged in has not agreed to the most updated terms,
        // ask them to agree
        if (this.state.userChecked && !this.state.agreedToTerms) {
            return  (
                <AgreeToTerms />
            );
        }

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
