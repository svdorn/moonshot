 "use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MetaTags from 'react-meta-tags';
import { browserHistory } from 'react-router';
import { closeNotification, updateOnboarding } from '../../../../actions/usersActions';
import VerifyEmail from "./verifyEmail";
import GoogleJobs from './googleJobs';
import ImportCandidates from "./importCandidates";
import AutomateInvites from "./automateInvites/automateInvites";
import InviteCadence from './inviteCadence';
import InviteAdmins from "./inviteAdmins";
import InviteEmployees from "./inviteEmployees";
import YouTube from 'react-youtube';
import OnboardingProgress from "../../../miscComponents/onboardingProgress";
import AddUserDialog from '../../../childComponents/addUserDialog';
import { goTo } from "../../../../miscFunctions";


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

    handleNext(extraOnboardingArgs) {
        const user = this.props.currentUser;
        let onboarding = user.onboarding;
        // if we got extra args AND they aren't a click event, add them
        if (typeof extraOnboardingArgs === "object" && !extraOnboardingArgs.target) {
            onboarding = {...onboarding, ...extraOnboardingArgs};
        }

        onboarding.step++;

        if (onboarding.step >= onboarding.furthestStep) {
            onboarding.furthestStep = onboarding.step;
        }

        if (onboarding.step > 7 || onboarding.furthestStep > 7) {
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
        if (onboarding.step > 7 || onboarding.furthestStep > 7) {
            onboarding.complete = true;
        }
        this.props.updateOnboarding(onboarding, user.verificationToken, user._id);
    }


    // the final page, all it does is show the onboarding bar as complete and
    // brings the user to the evals page
    createCongratulations() {
        return (
            <div className="congratulations primary-white center" style={{height: "100%"}}>
                <div>
                    <div className="font16px text-left">
                        You made it! The launch date of your first evaluation
                        takes a few days from the time you activate your account
                        to go live. We{"'"}ll let you know the second it{"'"}s
                        ready. In the meantime, you can see its status {"in "}
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
                    <div className="previous-next-area font16px center">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.handlePrevious.bind(this)}
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
            height: '244',
            width: '400',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                iv_load_policy: 3
            }
        };

        const checklistItems = [
            {
                name: "Activate Admin Account",
                length: "30s",
                step: 0
            },
            {
                name: "Watch Tutorial",
                length: "3m",
                step: 1
            },
            {
                name: "Google Jobs Posting",
                length: "30s",
                step: 2
            },
            {
                name: "Automate Applicant Invites",
                length: "7m",
                step: 3
            },
            {
                name: "Set Applicant Invite Cadence",
                length: "1m",
                step: 4
            },
            {
                name: "Invite Existing Candidates",
                length: "3m",
                step: 5
            },
            {
                name: "Invite Other Admins",
                length: "30s",
                step: 6
            },
            {
                name: "Invite Employees",
                length: "30s",
                step: 7
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

            var stepName = "Activate Admin Account";

            switch(onboarding.step) {
                // Activate Admin Account
                case 0:
                    stepName = "Activate Admin Account";
                    body = (<VerifyEmail {...childProps} />);
                    break;
                // Watch Tutorial
                case 1:
                    stepName = "Watch Tutorial";
                    body = (
                        <div>
                            <div>
                                <YouTube
                                    videoId="m4_M9onXmpY"
                                    opts={opts}
                                    onReady={this._onReady}
                                    onEnd={this._onEnd}
                                />
                                <div className="previous-next-area primary-white font16px center marginTop20px marginBottom20px">
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
                        </div>
                    );
                    break;
                // Google Jobs Posting
                case 2:
                    stepName = "Google Jobs Posting";
                    body = (
                        <GoogleJobs {...childProps} />
                    );
                    break;
                // Automate Applicant Invites
                case 3:
                    stepName = this.props.automateApplicantsHeader;
                    body = (<AutomateInvites {...childProps} />);
                    break;
                // Set Applicant Invite Cadence
                case 4:
                    stepName =  "Applicant Invitation Cadence";
                    body = (
                        <InviteCadence {...childProps} />
                    );
                    break;
                // Invite Existing Candidates
                case 5:
                    stepName = "Import Candidates";
                    body = (
                        <ImportCandidates {...childProps} />
                    );
                    break;
                // Invite Other Admins
                case 6:
                    stepName = "Invite Admins"
                    tab = "Admin";
                    body = (
                        <InviteAdmins {...childProps} />
                    );
                    break;
                // Invite Employees
                case 7:
                    stepName = "Invite Employees";
                    tab = "Employee";
                    body = (
                        <InviteEmployees {...childProps} />
                    );
                    break;
                case 8:
                    stepName = "Congratulations!"
                    body = this.createCongratulations();
                    break;
            }
        }

        const NUM_ONBOARDING_STEPS = 8;

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
                        <div style={{display:"flex",flexDirection:"column", width: "100%"}}>
                            <div className="center top-progress-bar primary-white" style={{flex:"0 1 auto"}}>
                                <OnboardingProgress className="inlineBlock" />
                                <div className="font14px">
                                    {user.onboarding.step < NUM_ONBOARDING_STEPS ?
                                        `Step: ${user.onboarding.step + 1} / ${NUM_ONBOARDING_STEPS}`
                                        : "Completed"
                                    }
                                </div>
                                <div
                                    className="primary-cyan font26px font24pxUnder700 font20pxUnder500"
                                    style={{margin: "5px auto 0", lineHeight: "1.2"}}
                                >
                                    {stepName}
                                </div>
                            </div>
                            <div className="content font16px font14pxUnder800 font12pxUnder600" style={{flex: "1 1 auto"}}>
                                {body}
                            </div>
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
        automateInvites: state.users.automateInvites,
        automateApplicantsHeader: state.users.automateInvites && state.users.automateInvites.header ? state.users.automateInvites.header : "Automate Applicant Invites",
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
