"use strict";
import React, { Component } from "react";
import Notification from "../notification";
import { getUserFromSession } from "../../actions/usersActions";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { bindActionCreators } from "redux";
import AgreeToTerms from "./agreeToTerms";
import { goTo } from "../../miscFunctions";
import Error403 from "../pages/errors/error403";

const homePages = {
    accountAdmin: "/dashboard",
    candidate: "/myEvaluations",
    employee: "/myEvaluations"
};

class AuthenticatedComponent extends Component {
    constructor(props) {
        super(props);

        // if userHasAccess is true, render the child component
        this.state = {
            userHasAccess: undefined,
            agreedToTerms: undefined
        };
    }

    componentWillMount() {
        this.reCheck();
    }

    componentDidUpdate(prevProps, prevState) {
        const prevPath = prevProps.location.pathname;
        const newPath = this.props.location.pathname;
        const userExisted = typeof prevProps.currentUser === "object";
        const userExists = typeof this.props.currentUser === "object";
        // if there used to be a user and now isn't or vise versa
        // OR if the path has changed, check if permissions are correct
        if (prevPath !== newPath || userExisted !== userExists) {
            this.reCheck();
        }
    }

    reCheck() {
        // check if the user is logged in
        let userHasAccess = this.checkAccess();
        // if the user does not have access, the previous function call will have redirected them
        if (!userHasAccess) {
            return;
        }

        // check if the user has agreed to the necessary terms and conditions
        let agreedToTerms = this.checkAgreedToTerms();

        // if we get here then we know the user has access
        // set state determining if they have to agree to terms to see the page
        if (!this.state.userHasAccess || this.state.agreedToTerms !== agreedToTerms) {
            this.setState({ userHasAccess: true, agreedToTerms });
        }
    }

    checkAgreedToTerms() {
        let agreedToTerms = true;
        // if there is a current user we have to make sure they have agreed to the necessary terms
        if (this.props.currentUser) {
            agreedToTerms = false;
            const acceptedAgreements = this.props.currentUser
                ? this.props.currentUser.termsAndConditions
                : undefined;

            // if the user has some terms they have agreed to
            if (Array.isArray(acceptedAgreements)) {
                // everyone has to agree to the privacy policy
                let necessaryAgreements = ["Privacy Policy"];
                // candidates have to agree to to the terms of use
                if (this.props.currentUser.userType === "candidate") {
                    necessaryAgreements.push("Terms of Use");
                }
                // everyone else (employees, account admins, managers) has to agree to terms and conditions
                else {
                    necessaryAgreements.push("Terms of Service");
                }
                // assume the agreements have all been agreed to
                agreedToTerms = true;
                // go through each necessary agreement ...
                necessaryAgreements.forEach(necessaryAgreement => {
                    // ... make sure the agreement is contained in the agreements the user has agreed to
                    if (
                        !acceptedAgreements.some(acceptedAgreement => {
                            return (
                                acceptedAgreement.name === necessaryAgreement &&
                                acceptedAgreement.agreed === true
                            );
                        })
                    ) {
                        // and if not, mark agreed-ness to false
                        agreedToTerms = false;
                    }
                });
            }
        }

        return agreedToTerms;
    }

    checkAccess() {
        // if there is no user, redirect to login page
        const { currentUser } = this.props;
        const allowedTypes = this.props.route.userType;
        const wantsGuest =
            (Array.isArray(allowedTypes) && allowedTypes.includes("lead")) ||
            (typeof allowedTypes === "string" && allowedTypes === "lead");

        if (!currentUser) {
            // if there is no user and that is what is wanted, user has access
            if (wantsGuest) {
                return true;
            }
            // login page needs to redirect back to this page after login, so
            // get the current url
            const location = this.props.location;
            const redirect = location.pathname + location.search;
            // go to the login page with this page as the redirect
            goTo("/login?redirect=" + redirect);
            // user does NOT have access
            return false;
        }
        // if there is a user see if they are of the right type
        else {
            // if one of the authenticated types matches the current user's type,
            // let them see the page
            if (this.hasAccess()) {
                return true;
            }
            // user doesn't have access ...
            else {
                // ... so if the state doesn't know the user doesn't have access ...
                if (this.state.userHasAccess !== false) {
                    // ... tell state not to show the content, and show 403 instead
                    this.setState({ userHasAccess: false });
                }
                // goTo('/');
                // user does NOT have access
                return false;
            }
        }
    }

    hasAccess() {
        // get the current user
        const user = this.props.currentUser;
        // the types of user that are allowed to see the page
        const allowedTypes = this.props.route.userType;
        // assume user can access the page
        let userHasAccess = true;

        // if the page wants only someone without an account to see it
        const wantsGuest =
            (Array.isArray(allowedTypes) && allowedTypes.includes("lead")) ||
            (typeof allowedTypes === "string" && allowedTypes === "lead");

        // if the page wants only people who are not logged in to see it
        if (wantsGuest) {
            // allowed to see page if no user is logged in
            return !user;
        }

        // if no one is logged in and it doesn't want a lead, access not granted
        else if (!user) {
            return false;
        }

        // if the user must be the first business user to see this page but isn't ...
        else if (this.props.route.firstBusinessUser === true && !user.firstBusinessUser) {
            // ... don't give access
            userHasAccess = false;
        }

        // if the allowed type passed in is just a single string with a user type ...
        else if (typeof allowedTypes === "string") {
            // ... check if the current user type matches it
            userHasAccess = allowedTypes === user.userType;
        }
        // if the allowed types passed in are in array form ...
        else if (Array.isArray(allowedTypes)) {
            // ... check if the current user's type matches any of those
            userHasAccess = allowedTypes.includes(user.userType);
        }

        // if the user doesn't have access and should be rerouted, do so
        if (!userHasAccess && !this.props.route.show403) {
            this.redirect();
        }

        return userHasAccess;
    }

    // if the user doesn't have access to the page and we're not showing a 403 page
    redirect() {
        const { currentUser } = this.props;

        // go to the homepage if no user is logged in
        if (typeof currentUser !== "object") {
            goTo("/");
        }

        // if there is a redirect for this user type given by props
        const specifiedRedirect = this.props[currentUser.userType + "Redirect"];
        if (typeof specifiedRedirect === "string") {
            return goTo(specifiedRedirect);
        }

        // if the user has an allowed user type
        if (["accountAdmin", "candidate", "employee"].includes(currentUser.userType)) {
            return goTo(homePages[currentUser.userType]);
        }

        // shouldn't be able to get here, but if you do, go to business home
        return goTo("/");
    }

    render() {
        // if user access has not yet been checked, show this while checking
        if (this.state.userHasAccess === undefined) {
            return <div className="blackBackground fillScreen" />;
        }

        // if user does not have access display a 403 page
        if (this.state.userHasAccess === false) {
            return <Error403 />;
        }

        // if the user logged in has not agreed to the most updated terms,
        // ask them to agree
        if (!this.state.agreedToTerms) {
            return <AgreeToTerms />;
        }

        // user has access to see this component;
        // clone the element so that we can put props into the element,
        // such as location, children, params that are passed through the url
        const childElement = React.cloneElement(this.props.route.page, {
            location: this.props.location,
            children: this.props.children,
            params: this.props.params
        });

        return childElement;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            getUserFromSession
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

AuthenticatedComponent = withRouter(AuthenticatedComponent);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AuthenticatedComponent);
