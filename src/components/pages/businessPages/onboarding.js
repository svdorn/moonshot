"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MetaTags from 'react-meta-tags';
import {  } from '../../../actions/usersActions';


class Dashboard extends Component {
    constructor(props) {
        super(props);

        //name, percent, finished (Bool)

        this.state = {

        };
    }

    componentDidMount() {

    }

    render() {

        const checklistItems = ["Create Evaluation", "Activate Admin Account", "Watch Tutorial", "Google Jobs Posting", "Automate Applicant Invites", "Set Applicate Invite Cadance", "Import CSV or Manually Invite Existing Candidates", "Invite Other Admins", "Invite Employees to Strengthen Baseline"];

        const checklist = checklistItems.map(item => {
            return (
                <div>
                    {item !== "Create Evaluation"
                    ? <div className="marginTop20px marginLeft20px marginBottom10px secondary-gray font16px">{item}</div>
                    : <div className="clickableNoUnderline marginTop20px marginBottom10px primary-cyan font16px">
                        <img
                            alt=""
                            src={"/icons/CheckMarkBlue" + this.props.png}
                            className="checkmark"
                        />
                        {item}
                    </div>}
                </div>
            );
        });

        let body = <div>Hey</div>

        return (
            <div className="fillScreen" id="employerOnboarding">
                <div className="onboardingLeft">
                    <div>
                        {checklist}
                    </div>
                </div>
                <div className="onboardingRight">
                    {body}
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


export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
