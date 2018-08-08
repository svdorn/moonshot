"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { CircularProgress, Paper } from "material-ui";
import Dialog from '@material-ui/core/Dialog';
import {  } from '../../../../actions/usersActions';

class InviteCadence extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: props.currentUser.onboarding.daysBeforeInvite,
            click: false
        }
    }


    handleClick(selected) {
        this.setState({selected})
    }


    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            click: !this.state.click
        })
    }


    next = () => {
        if (this.state.selected) {
            // so that the info from this page gets saved
            const extraArgs = { daysBeforeInvite: this.state.selected };
            this.props.next(extraArgs);
        }
    }


    render() {
        const selected = this.state.selected;

        let additionalOneClassName = "";
        let additionalTwoClassName = "";
        if (selected === 1) {
            additionalOneClassName = "inviteCadenceGradient";
        } else if (selected === 2) {
            additionalTwoClassName = "inviteCadenceGradient";
        }
        return (
            <div>
                <div className="primary-white center">
                    <div className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"0 auto 10px", minWidth: "200px", textAlign: "left"}}>
                        In preparation for any integration you may create, select
                        one of the options below to automate invites to applicants
                        after they have completed your application.
                    </div>
                    <div className="marginTop30px">
                        <div className="marginTop10px primary-cyan font20px inline">
                            <Paper className={"inviteCadenceGradientBorder paperBoxInviteCadence clickableNoUnderline " + additionalOneClassName}
                                   zDepth={2}
                                   onClick={() => this.handleClick(1)}>
                                <div style={{textAlign: "center", position: "relative", paddingTop: "25px"}} className="secondary-gray font16px">
                                    Invite applicants to complete the evaluation <div className="primary-cyan font20px">1 day</div> after they have applied.
                                </div>
                            </Paper>
                        </div>
                        <div className="marginTop20px inline">
                            <Paper className={"inviteCadenceGradientBorder paperBoxInviteCadence clickableNoUnderline " + additionalTwoClassName}
                                   zDepth={2}
                                   onClick={() => this.handleClick(2)}>
                                <div style={{textAlign: "center", position: "relative", paddingTop: "25px"}} className="secondary-gray font16px">
                                    Invite applicants to complete the evaluation <div className="primary-cyan font20px">2 days</div> after they have applied.
                                </div>
                            </Paper>
                        </div>
                    </div>
                    <div className="previous-next-area primary-white font16px center marginTop20px marginBottom30px">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className={`button noselect round-4px inlineBlock ${this.state.selected ? "background-primary-cyan" : "disabled background-primary-black-light"}`}
                            onClick={this.next}
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
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(InviteCadence);
