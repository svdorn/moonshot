"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MetaTags from 'react-meta-tags';
import { browserHistory } from 'react-router';
import { closeNotification, updateOnboarding } from '../../../actions/usersActions';
import ImportCandidates from "./importCandidates";
import InviteAdmins from "./inviteAdmins";
import OnboardingProgress from "../../miscComponents/onboardingProgress";
import AddUserDialog from '../../childComponents/addUserDialog';


class Dashboard extends Component {
    constructor(props) {
        super(props);

        //name, percent, finished (Bool)

        this.state = {

        };
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    componentDidMount() {
        const user = this.props.currentUser;
        console.log(user);
        if (!(user && user.userType === "accountAdmin" && user.onboarding)) {
            this.goTo("/");
        }
    }

    handleNext() {
        const user = this.props.currentUser;
        let onboarding = user.onboarding;
        onboarding.step++;

        if (onboarding.step >= onboarding.furthestStep) {
            onboarding.furthestStep = onboarding.step;
        }
        console.log(onboarding.furthestStep)
        if (onboarding.step > 8 || onboarding.furthestStep > 8) {
            onboarding.complete = true;
        }
        this.props.updateOnboarding(onboarding, user.verificationToken, user._id);
    }

    handlePrevious() {
        const user = this.props.currentUser;
        let onboarding = user.onboarding;
        onboarding.step--;
        if (onboarding.step < 0) {
            return;
        }
        this.props.updateOnboarding(onboarding, user.verificationToken, user._id);
    }

    handleStep(step) {
        const user = this.props.currentUser;
        let onboarding = user.onboarding;
        onboarding.step = step;
        console.log(onboarding.step);
        if (onboarding.step >= onboarding.furthestStep) {
            onboarding.furthestStep = onboarding.step;
        }
        if (onboarding.step > 8 || onboarding.furthestStep > 8) {
            onboarding.complete = true;
        }
        this.props.updateOnboarding(onboarding, user.verificationToken, user._id);
    }


    render() {
        console.log(this.props.currentUser);
        const user = this.props.currentUser;

        // the tab to open to on Add User Modal
        let tab = "Candidate";

        const checklistItems = [
            {
                name: "Create Evaluation",
                length: "20s",
                step: 0
            },
            {
                name: "Activate Admin Account",
                length: "30s",
                step: 1
            },
            {
                name: "Watch Tutorial",
                length: "3m",
                step: 2
            },
            {
                name: "Google Jobs Posting",
                length: "30s",
                step: 3
            },
            {
                name: "Automate Applicant Invites",
                length: "7m",
                step: 4
            },
            {
                name: "Set Applicate Invite Cadance",
                length: "1m",
                step: 5
            },
            {
                name: "Import CSV or Manually Invite Existing Candidates",
                length: "3m",
                step: 6
            },
            {
                name: "Invite Other Admins",
                length: "30s",
                step: 7
            },
            {
                name: "Invite Employees to Strengthen Baseline",
                length: "30s",
                step: 8
            }
        ];

        let body = <div>Hey</div>;

        const childProps = {
            next: this.handleNext.bind(this),
            previous: this.handlePrevious.bind(this)
        }

        if (user.onboarding) {
            const onboarding = user.onboarding;
            var key = 0;
            var checklist = checklistItems.map(item => {
                let body = <div></div>;
                console.log(key);
                if (key < onboarding.furthestStep) {
                    body = (
                        <div className="marginTop20px marginBottom10px primary-cyan font16px clickableNoUnderline" onClick={() => this.handleStep(item.step)}>
                            <img
                                alt=""
                                src={"/icons/CheckMarkBlue" + this.props.png}
                                className="checkmark"
                            />
                            {item.name}
                        </div>
                    );
                } else if (key > onboarding.furthestStep) {
                    body = <div className="marginTop20px marginLeft20px marginBottom10px primary-white opacity30Percent font16px">{item.name} <i className="secondary-red">{item.length}</i></div>;
                } else {
                    body = <div className="marginTop20px marginLeft20px marginBottom10px primary-white font16px clickableNoUnderline" onClick={() => this.handleStep(item.step)}>{item.name} <i className="primary-cyan">{item.length}</i></div>;
                }
                key++;
                return (
                    <div key={key}>
                        {body}
                    </div>
                );
            });

            if (onboarding.step === 0) {
                body = (
                    <div className="marginTop30px">
                        <div className="primary-cyan font32px font28pxUnder700 font24pxUnder500">
                            ROI Driven Onboarding
                        </div>
                        <div className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"20px auto", minWidth: "200px", textAlign: "left"}}>
                            If you complete the onboarding checklist within 48 hours, you get 50% off the first three months of any subscription plan you select. Hundreds of dollars in savings and the full benefits of the product, faster.
                        </div>
                        <button className="button round-4px font20px font16pxUnder600 primary-white marginBottom30px" style={{backgroundColor: "#76defe"}} onClick={this.handleNext.bind(this)}>
                            I&#39;m in
                        </button>
                    </div>
                )
            } else if (onboarding.step === 6) {
                body = (
                    <ImportCandidates {...childProps} />
                )
            } else if (onboarding.step === 7) {
                tab = "Admin";
                body = (
                    <InviteAdmins {...childProps} />
                )
            }
        }

        const NUM_ONBOARDING_STEPS = 9;

        return (
            <div className="fillScreen">
                <AddUserDialog tab={tab} />
                <div id="employerOnboarding">
                    <div className="onboardingLeft">
                        <div>
                            {checklist}
                        </div>
                    </div>
                    <div className="onboardingRight">
                        <div className="center top-progress-bar primary-white">
                            <OnboardingProgress className="inlineBlock" />
                            <div className="font14px">
                                {`Step: ${user.onboarding.step + 1} / ${NUM_ONBOARDING_STEPS}`}
                            </div>
                        </div>
                        <div className="content">
                            {body}
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
        closeNotification,
        updateOnboarding
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
