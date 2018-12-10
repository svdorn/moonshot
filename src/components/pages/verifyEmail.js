"use strict";
import React, { Component } from "react";
import { addNotification, updateUser } from "../../actions/usersActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MetaTags from "react-meta-tags";
import CircularProgress from "@material-ui/core/CircularProgress";
import { goTo } from "../../miscFunctions";
import axios from "axios";

class VerifyEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // verifying email/validating that email is already verified
            loading: true,
            // no error initially
            error: undefined
        };
    }

    componentWillMount() {
        const self = this;

        // don't try to verify the account if the user has already been verified
        if (this.props.user && this.props.user.verified) {
            if (this.props.user.userType === "accountAdmin") {
                goTo("/dashboard");
            } else {
                goTo("/myEvaluations");
            }

            this.props.addNotification("Already verified!");

            return;
        }

        const token = this.props.location.query.token;
        const userType = this.props.location.query.userType;

        axios
            .post("/api/user/verifyEmail", { userType, token })
            .then(function(response) {
                const { user, redirect } = response.data;
                // if the user can be logged in from the session, do it
                if (user) {
                    self.props.updateUser(user);
                }

                self.props.addNotification("Email verified!", "info");

                // redirect to a new page after verifying email
                const normalRedirect = userType === "accountAdmin" ? "dashboard" : "myEvaluations";
                goTo(redirect ? redirect : normalRedirect);
            })
            .catch(function(err) {
                self.setState({ loading: false, error: true });
                self.props.addNotification(
                    err.response && err.response.data
                        ? err.response.data
                        : "Error, try resending verification email.",
                    "error"
                );
            });
    }

    render() {
        const { user } = this.props;

        let status = <CircularProgress color="#76defe" />;

        if ((user && user.verified) || this.state.verified) {
            status = <div>Your email address has been verified!</div>;
        } else if (!this.state.loading && !this.state.verified) {
            status = <div>{"Couldn't verify email. Try resending the verification email."}</div>;
        } else if (this.state.error) {
            status = <div>Error. Try resending the verification email.</div>;
        }

        return (
            <div className="fillScreen blackBackground formContainer">
                <MetaTags>
                    <title>Verify Email | Moonshot Insights</title>
                    <meta
                        name="description"
                        content="Verify your email to get started on your path to finding the perfect job."
                    />
                </MetaTags>
                <div className="form lightBlackForm">
                    <h1 className="primary-white marginTop20px">Verify Email</h1>
                    {status}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            updateUser,
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        user: state.users.currentUser
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VerifyEmail);
