"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { CircularProgress } from "material-ui";
import Dialog from '@material-ui/core/Dialog';
import { addNotification, updateUser } from '../../../../actions/usersActions';
import {  } from "../../../../miscFunctions";

class VerifyEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }


    // move on to the next step
    next = () => {
        const user = this.props.currentUser;

        // if the user is already verified (and is marked as such in the redux store),
        // go to the next page
        if (user.verified) { this.props.next(); }
        else {
            // start loading spinner a-goin'
            this.setState({ loading: true });
            // check if the user is verified in the back end
            axios.get("/api/user/checkEmailVerified", {
                params: {
                    userId: user._id,
                    verificationToken: user.verificationToken
                }
            })
            .then(response => {
                this.setState({ loading: false });
                this.props.updateUser(response.data);
                this.props.next();
            })
            .catch(error => {
                // assume account isn't verified if error on verification
                this.setState({ loading: false });
                this.props.addNotification("Your account is not yet verified.", "error");
            });
        }
    }


    sendVerificationEmail = () => {
        this.setState({ loading: true });
        const args = {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken
        }
        axios.post("/api/accountAdmin/sendVerificationEmail", args)
        .then(response => {
            if (response.data.alreadyVerified) { // user already verified account
                this.props.addNotification("Your account is already verified!", "infoHeader");
            } else { // verification email successfully sent
                this.props.addNotification(`Verification email sent to ${this.props.currentUser.email}`);
            }

            // make loading symbol stop
            this.setState({ loading: false });
        })
        .catch(error => {
            this.props.addNotification("Server error, try again in a few seconds.", "errorHeader");
        });
    }


    render() {
        return (
            <div className="import-candidates primary-white center">
                <div>
                    <p  className="secondary-gray font16px font14pxUnder700"
                        style={{width: "80%", margin:"0 auto 20px", minWidth: "200px", textAlign: "left"}}
                    >
                        Thank you for signing up for Moonshot Insights, please take 30 seconds now to go to your email and verify your account.<br/>
                        Once you&#39;re done, continue with onboarding.
                    </p>
                    <div className="center">
                        <div
                            className="medium button noselect round-4px gradient-transition gradient-1-cyan gradient-2-purple-light"
                            onClick={this.sendVerificationEmail}
                        >
                            Send Verification Email
                        </div>
                    </div>
                    { this.state.loading ? <div className="center"><CircularProgress /></div> : null }
                    <div className="previous-next-area primary-white font18px center marginTop20px">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock"
                            onClick={this.next.bind(this)}
                        >
                            Next
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        updateUser
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
