"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../actions/usersActions';
import OnboardingProgress from "./onboardingProgress";
import { withRouter } from "react-router";


class FixedOnboardingProgress extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidUpdate() {
        console.log("updated");
    }

    render() {
        // console.log("rendering");
        // get the current user
        const user = this.props.currentUser;

        // get the current path from the url
        let pathname = undefined;
        // try to get the path; lowercased because capitalization will vary
        try { pathname = this.props.location.pathname.toLowerCase(); }
        // if the pathname is not yet defined, don't do anything, this will be executed again later
        catch (e) { pathname = ""; }
        // if the user is in the process of onboarding and isn't on the onboarding page...

        // if a bunch of conditions are true ...
        if (user &&
            // user must be an actual user
            typeof user === "object" &&
            // user has to have onboarding to see how far they are in onboarding
            typeof user.onboarding === "object" &&
            // only show the progress bar if the user isn't done
            !user.onboarding.complete &&
            // don't show the fixed progress bar while going through onboarding
            pathname !== "/onboarding"
        ) {
            // ... show the onboarding progress bar in the lower right corner
            return (
                <div className="fixed-onboarding-progress">
                    <div>
                        <div className="center primary-white">{"Onboarding Progress"}</div>
                        <OnboardingProgress className="fixed-progress-bar"/>
                    </div>
                </div>
            );
        }
        // if those conditions aren't all true, don't return anything to render
        else { return null; }
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FixedOnboardingProgress));
