"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MetaTags from 'react-meta-tags';
import { browserHistory } from 'react-router';
import { closeNotification, updateOnboarding } from '../../../actions/usersActions';
import GoogleJobs from './googleJobs';
import ImportCandidates from "./importCandidates";
import InviteAdmins from "./inviteAdmins";
import InviteEmployees from "./inviteEmployees";
import YouTube from 'react-youtube';
import OnboardingProgress from "../../miscComponents/onboardingProgress";
import AddUserDialog from '../../childComponents/addUserDialog';
import { goTo } from "../../../miscFunctions";


class Onboarding extends Component {
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

        if (onboarding.step >= onboarding.furthestStep) {
            onboarding.furthestStep = onboarding.step;
        }
        if (onboarding.step > 8 || onboarding.furthestStep > 8) {
            onboarding.complete = true;
        }
        this.props.updateOnboarding(onboarding, user.verificationToken, user._id);
    }


    // the final page, all it does is show the onboarding bar as complete and
    // brings the user to the evals page
    createCongratulations() {
        return (
            <div className="congratulations primary-white center">
                <div>
                    <div className="font18px text-left">
                        You made it! You earned 50% off the first three months of
                        any subscription plan you select. The launch date of your
                        first evaluation takes a few days from the time you activate
                        your account to go live. We{"'"}ll let you know the second
                        it{"'"}s ready. In the meantime, you can see its status {"in "}
                        <span
                            onClick={() => this.goTo("/myEvaluations")}
                            className="primary-cyan pointer"
                        >
                            evaluations
                        </span>.
                    </div>
                    <div
                        className="medium button round-4px background-primary-cyan"
                        style={{padding: "3px 30px", margin: "0 auto"}}
                        onClick={() => this.goTo("/myEvaluations")}
                    >
                        Evaluations
                    </div>
                    <div className="previous-next-area font18px center">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock"
                            onClick={() => this.goTo("/myEvaluations")}
                        >
                            Finish
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    render() {
        const user = this.props.currentUser;

        // the tab to open to on Add User Modal
        let tab = "Candidate";

        const opts = {
            height: '183',
            width: '300',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                iv_load_policy: 3
            }
        };

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
                name: "Set Applicant Invite Cadence",
                length: "1m",
                step: 5
            },
            {
                name: "Invite Existing Candidates",
                length: "3m",
                step: 6
            },
            {
                name: "Invite Other Admins",
                length: "30s",
                step: 7
            },
            {
                name: "Invite Employees",
                length: "30s",
                step: 8
            }
        ];

        let body = <div></div>;

        const childProps = {
            next: this.handleNext.bind(this),
            previous: this.handlePrevious.bind(this)
        }

        if (user.onboarding) {
            const onboarding = user.onboarding;
            var key = 0;
            var checklist = checklistItems.map(item => {

                let body = <div></div>;

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
                    body = <div className="marginTop20px marginLeft25px marginBottom10px primary-white opacity30Percent font16px">{item.name} <i className="secondary-red">{item.length}</i></div>;
                } else {
                    body = <div className="marginTop20px marginLeft25px marginBottom10px primary-white font16px clickableNoUnderline" onClick={() => this.handleStep(item.step)}>{item.name} <i className="primary-cyan">{item.length}</i></div>;
                }
                key++;
                return (
                    <div key={key}>
                        {body}
                    </div>
                );
            });

            var stepName = "Create Evaluation";

            switch(onboarding.step) {
                // Create Evaluation
                case 0:
                    stepName = "Create Evaluation";
                    body = (
                        <div>
                            <div className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"auto", minWidth: "200px", textAlign: "left"}}>
                                Your evaluation has been created!
                            </div>
                            <div className="previous-next-area create-evaluation font18px primary-white center marginTop20px">
                                <div
                                    className="button noselect round-4px background-primary-cyan inlineBlock"
                                    onClick={this.handleNext.bind(this)}
                                >
                                    Next
                                </div>
                            </div>
                        </div>
                    );
                    break;
                // Activate Admin Account
                case 1:
                    stepName = "Activate Admin Account";
                    body = (
                        <div>
                            <p className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"auto", minWidth: "200px", textAlign: "left"}}>
                                Thank you for signing up for Moonshot Insights, please take 30 seconds now to go to your email and verify your account.
                            </p>
                            <p className="secondary-gray font16px font14pxUnder700" style={{width: "80%", margin:"auto", minWidth: "200px", textAlign: "left"}}>
                                Once you&#39;re done, continue with onboarding.
                            </p>
                            <div className="previous-next-area primary-white font18px center marginTop20px">
                                <div
                                    className="previous noselect clickable underline inlineBlock"
                                    onClick={this.handlePrevious.bind(this)}
                                >
                                    Previous
                                </div>
                                <div
                                    className="button noselect round-4px background-primary-cyan inlineBlock"
                                    onClick={this.handleNext.bind(this)}
                                >
                                    Next
                                </div>
                            </div>
                        </div>
                    );
                    break;
                // Watch Tutorial
                case 2:
                    stepName = "Watch Tutorial";
                    body = (
                        <div>
                            <YouTube
                                videoId="m4_M9onXmpY"
                                opts={opts}
                                onReady={this._onReady}
                                onEnd={this._onEnd}
                            />
                            <div className="previous-next-area primary-white font18px center marginTop20px">
                                <div
                                    className="previous noselect clickable underline inlineBlock"
                                    onClick={this.handlePrevious.bind(this)}
                                >
                                    Previous
                                </div>
                                <div
                                    className="button noselect round-4px background-primary-cyan inlineBlock"
                                    onClick={this.handleNext.bind(this)}
                                >
                                    Next
                                </div>
                            </div>
                        </div>
                    );
                    break;
                // Google Jobs Posting
                case 3:
                    stepName = "Google Jobs Posting";
                    body = (
                        <GoogleJobs {...childProps} />
                    );
                    break;
                // Automate Applicant Invites
                case 4:
                    stepName = "Automate Applicant Invites";
                    break;
                // Set Applicant Invite Cadence
                case 5:
                    stepName = "Set Applicant Invite Cadence";
                    break;
                // Invite Existing Candidates
                case 6:
                    stepName = "Import Candidates";
                    body = (
                        <ImportCandidates {...childProps} />
                    );
                    break;
                // Invite Other Admins
                case 7:
                    stepName = "Invite Admins"
                    tab = "Admin";
                    body = (
                        <InviteAdmins {...childProps} />
                    );
                    break;
                // Invite Employees
                case 8:
                    stepName = "Invite Employees";
                    tab = "Employee";
                    body = (
                        <InviteEmployees {...childProps} />
                    );
                    break;
                case 9:
                    stepName = "Congratulations!"
                    body = this.createCongratulations();
                    break;
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
                                {user.onboarding.step < NUM_ONBOARDING_STEPS ?
                                    `Step: ${user.onboarding.step + 1} / ${NUM_ONBOARDING_STEPS}`
                                    : "Completed"
                                }
                            </div>
                            <div
                                className="primary-cyan font26px font24pxUnder700 font20pxUnder500"
                                style={{margin: "5px auto 0"}}
                            >
                                {stepName}
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


export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
