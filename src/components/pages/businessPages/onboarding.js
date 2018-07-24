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
        console.log(this.props.currentUser);
        const user = this.props.currentUser;

        const checklistItems = [
            {
                name: "Create Evaluation",
                length: "20s",
            },
            {
                name: "Activate Admin Account",
                length: "30s",
            },
            {
                name: "Watch Tutorial",
                length: "3m",
            },
            {
                name: "Google Jobs Posting",
                length: "30s",
            },
            {
                name: "Automate Applicant Invites",
                length: "7m",
            },
            {
                name: "Set Applicate Invite Cadance",
                length: "1m",
            },
            {
                name: "Import CSV or Manually Invite Existing Candidates",
                length: "3m",
            },
            {
                name: "Invite Other Admins",
                length: "30s",
            },
            {
                name: "Invite Employees to Strengthen Baseline",
                length: "30s",
            }
        ];
        if (user.onboarding && !user.onboarding.complete) {
            const onboarding = user.onboarding;
            let key = 0;
            var checklist = checklistItems.map(item => {
                let body = <div></div>;
                if (key < onboarding.step) {
                    body = (
                        <div className="marginTop20px marginBottom10px primary-cyan font16px">
                            <img
                                alt=""
                                src={"/icons/CheckMarkBlue" + this.props.png}
                                className="checkmark"
                            />
                            {item.name}
                        </div>
                    );
                } else if (key > onboarding.step) {
                    body = <div className="marginTop20px marginLeft20px marginBottom10px primary-white opacity30Percent font16px">{item.name} <i className="secondary-red">{item.length}</i></div>;
                } else {
                    body = <div className="marginTop20px marginLeft20px marginBottom10px primary-white font16px">{item.name} <i className="primary-cyan">{item.length}</i></div>;
                }
                key++;
                return (
                    <div key={key}>
                        {body}
                    </div>
                );
            });
        }

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
