"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { CircularProgress } from "material-ui";
import Dialog from '@material-ui/core/Dialog';
import { addNotification } from '../../../../actions/usersActions';
import {  } from "../../../../miscFunctions";

class VerifyEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }


    // move on to the next step
    next() {
        //this.props.next();
    }


    sendVerificationEmail = () => {
        this.setState({ loading: true });
        const args = {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken
        }
        axios.post("/accountAdmin/sendVerificationEmail", args)
        .then(response => {
            console.log('do something');
        })
        .catch(error => {
            console.log("UH OH", error);
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
                            Send Verifation Email
                        </div>
                    </div>
                    {this.state.loading ?
                        <CircularProgress />
                        : null
                    }
                    <div className="previous-next-area primary-white font18px center marginTop20px">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock"
                            onClick={() => this.handleNext.bind(this)}
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
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
