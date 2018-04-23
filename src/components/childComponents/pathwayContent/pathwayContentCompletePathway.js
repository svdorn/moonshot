import React, {Component} from 'react';
import {Paper, CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import {completePathway, resetIncompleteSteps} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';

class PathwayContentCompletePathway extends Component {
    constructor(props) {
        super(props);

        // make sure any old incomplete steps don't show up as incomplete steps
        this.props.resetIncompleteSteps();

        let hasUser = false;
        let email = "";
        let phoneNumber = "";
        if (props.currentUser) {
            const user = props.currentUser;
            hasUser = true;
            if (user.emailToContact) {
                email = user.emailToContact;
            } else if (user.email) {
                email = user.email;
            }

            if (user.phoneNumber) {
                phoneNumber = user.phoneNumber;
            }
        }

        this.state = {
            hasUser, email, phoneNumber
        }
    }


    onEmailChange = (e) => {
        this.setState({
            ...this.state,
            email: e.target.value
        })
    }


    onPhoneChange = (e) => {
        this.setState({
            ...this.state,
            phoneNumber: e.target.value
        })
    }


    handleClick() {
        const pathway = this.props.pathway;
        const currentUser = this.props.currentUser;
        let referralCode = undefined;
        try {
            if (currentUser.answers[pathway.referralQuestionId]) {
                referralCode = currentUser.answers[pathway.referralQuestionId].value;
            }
        } catch (getReferralCodeErr) {
            /* this means they did not have a referral code */
        }

        const user = {
            userName: currentUser.name,
            pathwayName: pathway.name,
            pathwayId: pathway._id,
            _id: currentUser._id,
            verificationToken: currentUser.verificationToken,
            email: this.state.email,
            phoneNumber: this.state.phoneNumber,
            skills: pathway.skills,
            referralCode: referralCode
        };

        this.props.completePathway(user);

    }

    render() {
        let incompleteStepsNotification = null;
        let thereAreIncompleteSteps = Array.isArray(this.props.incompleteSteps) && this.props.incompleteSteps.length > 0;
        // create the list of incomplete steps if there are any
        if (thereAreIncompleteSteps) {
            // this is just used as a key
            let subStepCounter = 0;

            // go through every incomplete step and make a corresponding list item
            let incompleteStepsList = this.props.incompleteSteps.map(incompleteStep => {
                subStepCounter++;

                let stepNumberExists = typeof incompleteStep.stepNumber !== "undefined";
                let stepNameExists = typeof incompleteStep.stepName === "string";
                let subStepNumberExists = typeof incompleteStep.subStepNumber !== "undefined";
                let subStepNameExists = typeof incompleteStep.subStepName === "string";

                // make the step part
                let stepHtml = null;
                if (stepNumberExists && stepNameExists) {
                    stepHtml = (
                        <span>
                            {"Step "}{incompleteStep.stepNumber}{" ("}{incompleteStep.stepName}{") "}
                        </span>
                    );
                } else if (stepNumberExists) {
                    stepHtml = (
                        <span>
                            {"Step "}{incompleteStep.stepNumber}{" "}
                        </span>
                    );
                } else if (stepNameExists) {
                    stepHtml = (
                        <span>
                            {incompleteStep.stepName}{" "}
                        </span>
                    )
                }

                // make the subStep part
                let subStepHtml = null;
                if (subStepNumberExists && subStepNameExists) {
                    subStepHtml = (
                        <span>
                            {" Part "}{incompleteStep.subStepNumber}{" ("}{incompleteStep.subStepName}{")"}
                        </span>
                    );
                } else if (subStepNumberExists) {
                    subStepHtml = (
                        <span>
                            {" Part "}{incompleteStep.subStepNumber}
                        </span>
                    );
                } else if (subStepNameExists) {
                    subStepHtml = (
                        <span>
                            {incompleteStep.subStepName}
                        </span>
                    )
                }

                // return the list item
                return (
                    <li key={"incomplete substep " + subStepCounter}>
                        {stepHtml}{subStepHtml}
                    </li>
                );
            })

            incompleteStepsNotification = (
                <div style={{marginTop: "20px"}}>
                    You must complete all steps to finish the pathway.
                    Incomplete steps:
                    <ul className="incompleteStepsWarning">
                        { incompleteStepsList }
                    </ul>
                </div>
            )
        }

        return (
            <div className={this.props.className} style={{...this.props.style}}>
                <div className="center" style={{marginBottom: "10px"}}>
                    <h4 className="marginTop20px blueText font30px">Be Ready</h4>

                    {"We will review your results and let you know in the next 48 hours if you meet this position's requirements."}
                    <br/>
                    {"Verify your contact info so we can reach out to you if you advance to the next round."}
                    <br/>
                    <input
                        placeholder="Email address"
                        value={this.state.email}
                        type="text"
                        onChange={this.onEmailChange}
                        className="lightBlueBoxInput"
                    />
                    <input
                        placeholder="Phone number"
                        value={this.state.phoneNumber}
                        type="text"
                        onChange={this.onPhoneChange}
                        className="lightBlueBoxInput"
                    />

                    <div style={{marginRight: "20px", marginLeft: "20px"}}>
                        {"Click this button to complete the pathway."}
                    </div>
                    <button className="outlineButton font24px font20pxUnder500 whiteBlueButton"
                            onClick={this.handleClick.bind(this)}>
                        <div className="blueText">
                            Complete Pathway
                        </div>
                    </button>
                    {this.props.loadingPathwayComplete ?
                        <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                        : null
                    }
                    { incompleteStepsNotification }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        completePathway,
        resetIncompleteSteps
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingPathwayComplete: state.users.loadingSomething,
        incompleteSteps: state.users.incompleteSteps
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentCompletePathway);
