"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    addNotification,
    openAddPositionModal,
    openAddUserModal,
    updateUser,
    generalAction,
    confirmEmbedLink,
    intercomEvent
} from "../../../../actions/usersActions";
import {
    propertyExists,
    goTo,
    makePossessive,
    getFirstName,
    copyFromPage
} from "../../../../miscFunctions";
import clipboard from "clipboard-polyfill";
import Carousel from "../../../miscComponents/carousel";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { primaryCyan, primaryWhite } from "../../../../colors";
import { button } from "../../../../classes.js";
import HoverTip from "../../../miscComponents/hoverTip";
import axios from "axios";

import "../dashboard.css";

const tabs = ["Candidates", "Employees"];

class Activity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // the frame the activities box is on
            frame: undefined,
            // the amount of candidates or employees awaiting review
            numUsers: undefined,
            // if there was an error getting any candidates or employees data
            fetchDataError: false,
            // the tab either Candidates or Employees
            tab: "Candidates"
        };

        this.getCandidateData = this.getCandidateData.bind(this);
        this.getEmployeeData = this.getEmployeeData.bind(this);
        this.openAddPositionModal = this.openAddPositionModal.bind(this);
        this.openAddUserModal = this.openAddUserModal.bind(this);
        this.reviewCandidates = this.reviewCandidates.bind(this);
    }

    componentDidMount() {
        let self = this;
        const user = this.props.currentUser;

        const countQuery = {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                businessId: user.businessInfo.businessId
            }
        };

        axios
            .get("/api/business/candidatesTotal", countQuery)
            .then(response => {
                if ((propertyExists(response, ["data", "totalCandidates"]), "number")) {
                    let frame = "Tips For Hiring";
                    if (!user.confirmEmbedLink) {
                        frame = "Embed Link";
                        this.setState({ frame, numUsers: 0 });
                    } else if (response.data.totalCandidates > 0) {
                        frame = "Awaiting Review";
                        this.setState({ frame });
                        self.getCandidateData();
                    } else {
                        self.setState({ frame, numUsers: 0 });
                    }
                } else {
                    self.setState({ fetchDataError: true });
                }
            })
            .catch(error => {
                self.setState({ fetchDataError: true });
            });
    }

    reviewCandidates = () => {
        goTo("/myCandidates");
    };

    // get the number of candidates who haven't yet been reviewed
    getCandidateData() {
        const self = this;
        const user = this.props.currentUser;

        const query = {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                businessId: user.businessInfo.businessId
            }
        };

        axios
            .get("/api/business/candidatesAwaitingReview", query)
            .then(response => {
                if ((propertyExists(response, ["data", "newCandidates"]), "number")) {
                    self.setState({ numUsers: response.data.newCandidates });
                } else {
                    self.setState({ fetchDataError: true });
                }
            })
            .catch(error => {
                self.setState({ fetchDataError: true });
            });
    }

    // get the number of employees who haven't been graded
    getEmployeeData() {
        const self = this;
        const user = this.props.currentUser;

        const query = {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                businessId: user.businessInfo.businessId
            }
        };

        axios
            .get("/api/business/employeesAwaitingReview", query)
            .then(response => {
                if ((propertyExists(response, ["data", "newEmployees"]), "number")) {
                    self.setState({ numUsers: response.data.newEmployees });
                } else {
                    self.setState({ fetchDataError: true });
                }
            })
            .catch(error => {
                self.setState({ fetchDataError: true });
            });
    }

    copyLink = () => {
        const { currentUser } = this.props;
        if (propertyExists(currentUser, ["businessInfo", "uniqueName"], "string")) {
            let URL = "https://moonshotinsights.io/apply/" + currentUser.businessInfo.uniqueName;
            URL = encodeURI(URL);
            clipboard.writeText(URL);
            this.props.addNotification("Link copied to clipboard", "info");
        } else {
            this.props.addNotification("Error copying link, try refreshing", "error");
        }
    };

    copyTemplate = () => {
        copyFromPage("#invite-template");
        this.props.addNotification("Template copied to clipboard", "info");
    };

    confirmEmbedLink = () => {
        const userId = this.props.currentUser._id;
        const verificationToken = this.props.currentUser.verificationToken;
        const verified = this.props.currentUser.verified;

        if (!verified) {
            const credentials = {
                userId,
                verificationToken
            };
            axios
                .post("/api/accountAdmin/sendVerificationEmail", credentials)
                .then(res => {
                    axios
                        .post("/api/accountAdmin/showVerifyEmailBanner", {
                            userId,
                            verificationToken
                        })
                        .then(response => {
                            const { user } = response.data;
                            if (!user.verified) {
                                this.props.generalAction("OPEN_VERIFICATION_MODAL");
                            }
                            this.props.updateUser(user);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                })
                .catch(error => {});
        }

        this.props.confirmEmbedLink(userId, verificationToken);
        this.setState({ frame: "Tips For Hiring", numUsers: 0 });
    };

    openAddPositionModal = () => {
        this.props.openAddPositionModal();
    };

    openAddUserModal = () => {
        this.props.openAddUserModal();
    };

    openEmailTemplateModal = () => {
        this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
    };

    needHelpIntercomEvent = () => {
        const { _id, verificationToken } = this.props.currentUser;

        this.props.intercomEvent("need_help_embedding_link", _id, verificationToken, null);
    };

    tipsForHiring() {
        try {
            var possessiveBusinessName = makePossessive(
                this.props.currentUser.businessInfo.businessName
            );
        } catch (e) {
            var possessiveBusinessName = "your";
        }

        const frame1 = (
            <div styleName="carousel-frame">
                <div>
                    Tip #1: <span className="primary-cyan">First Things First</span>
                </div>
                <div>
                    Don{"'"}t forget to embed your candidate invite page in your hiring workflow and
                    communications with candidates, otherwise all your effort so far will be lost.
                    <br />
                    <u className="primary-cyan clickable" onClick={this.copyLink}>
                        Copy your link
                    </u>
                </div>
            </div>
        );
        const frame2 = (
            <div styleName="carousel-frame">
                <div>
                    Tip #2: <span className="primary-cyan">Take Advantage</span>
                </div>
                <div>
                    We align our incentives to your desired outcome, exceptional hires, so we only
                    charge when you hire an awesome employee who stays at your company. This allows
                    you to invite as many candidates, add as many positions and evaluate as many
                    employees as your want so take advantage and{" "}
                    <div
                        className="primary-cyan clickable inlineBlock"
                        onClick={this.openAddPositionModal}
                    >
                        add some more positions
                    </div>.
                </div>
            </div>
        );
        const frame3 = (
            <div styleName="carousel-frame">
                <div>
                    Tip #3:{" "}
                    <span className="primary-cyan">Don{"'"}t Screen Out Great Candidates</span>
                </div>
                <div>
                    If you screen applicants before inviting them to complete an evaluation, you{
                        "'"
                    }re very likely dismissing your best candidates. As you know by now, education
                    and experience provide 1% and 1.1% predictive ability; other resume and LinkedIn
                    data are horrible predictors too. Be sure to invite the vast majority, if not
                    all, of your applicants.
                </div>
            </div>
        );
        const frame4 = (
            <div styleName="carousel-frame">
                <div>
                    Tip #4: <span className="primary-cyan">Double Down On Your Team</span>
                </div>
                <div>
                    You{"'"}re sacrificing a huge opportunity if you don{"'"}t invite employees to
                    be evaluated. This data enables us to really customize {possessiveBusinessName}{" "}
                    predictive model and generate Longevity/tenure and Culture Fit predictions for
                    all of your candidates. Improve your candidate predictions by{" "}
                    <div
                        className="primary-cyan clickable inlineBlock"
                        onClick={this.openAddUserModal}
                    >
                        inviting employees
                    </div>{" "}
                    to complete a 22-minute evaluation.
                </div>
            </div>
        );

        return (
            <div styleName="tips-for-hiring">
                <div styleName="desktop-only tips-for-hiring-header">
                    {
                        "While you're waiting for candidates to complete your \
                    evaluation, here are some hiring tips:"
                    }
                </div>
                <div styleName="mobile-only tips-for-hiring-header">
                    {
                        "A couple tips while you're waiting for candidates to \
                    complete your evaluation:"
                    }
                </div>
                <div styleName="desktop-only">
                    <div styleName="page-unused">
                        <div>
                            <div className="info-hoverable">i</div>
                            Page Unused
                        </div>
                        <HoverTip
                            className="font12px secondary-gray"
                            style={{ marginTop: "-2px", marginLeft: "-80px" }}
                            text="No candidates have completed an evaluation yet. Confirm that you embedded your candidate invite link properly in your messages to candidates."
                        />
                    </div>
                </div>
                <div styleName="carousel-container">
                    <Carousel
                        frames={[frame1, frame2, frame3, frame4]}
                        transitionDuration={1000}
                        styleName="activity-carousel"
                        color1={primaryWhite}
                        color2={primaryCyan}
                    />
                </div>
            </div>
        );
    }

    embedLink() {
        const { currentUser } = this.props;
        let businessName = undefined;
        let uniqueName = "";
        if (typeof currentUser.businessInfo === "object") {
            const { businessInfo } = currentUser;
            businessName = businessInfo.businessName;
            uniqueName = businessInfo.uniqueName;
        }
        try {
            var possessiveBusinessName = makePossessive(
                this.props.currentUser.businessInfo.businessName
            );
        } catch (e) {
            possessiveBusinessName = "Your";
        }

        const subject = businessName ? `Invitation from ${businessName}` : "Evaluation Invitation";

        return (
            <div className="inline-block" styleName="onboarding-info embed-link">
                <div>
                    <div className="font22px font18pxUnder700 font16pxUnder500 primary-cyan">
                        {possessiveBusinessName} Activation
                    </div>
                    <div className="primary-white font16px font14pxUnder700">
                        Confirm that you{"'"}ve properly copied and pasted the link to your
                        candidate invite page in your automated emails or other communications with
                        candidates.
                    </div>
                    <div
                        className={
                            "primary-white font18px font16pxUnder900 font14pxUnder600 marginTop20px " +
                            button.cyanRound
                        }
                        onClick={this.confirmEmbedLink}
                    >
                        I have embedded the link
                    </div>
                    <div className="clickable marginTop10px" onClick={this.needHelpIntercomEvent}>
                        <u>Need help?</u>
                    </div>
                </div>
                <div className="primary-white">
                    <div styleName="invite-candidates-template">
                        <div>
                            <div
                                className={"primary-white " + button.cyanRound}
                                onClick={this.copyLink}
                            >
                                Copy Link
                            </div>
                            <div
                                className={"primary-white " + button.cyanRound}
                                onClick={this.copyTemplate}
                            >
                                Copy Template
                            </div>
                        </div>
                        <div>Subject: {subject}</div>
                        <div id="invite-template">
                            <div>Hi,</div>
                            <div>
                                Congratulations, we would like to invite you to the next round of
                                evaluations! We are excited to learn more about you and see how well
                                you could fit with our team. The next step is completing a 22-minute
                                evaluation, which you can sign up and take{" "}
                                <a
                                    style={{ color: "#76defe", textDecoration: "underline" }}
                                    href={`https://moonshotinsights.io/apply/${uniqueName}`}
                                >
                                    here
                                </a>.
                            </div>
                            <div>
                                We look forward to reviewing your results. Please let me know if you
                                have any questions.
                            </div>
                            <div>
                                All the best,
                                <div>{getFirstName(currentUser.name)}</div>
                            </div>
                        </div>
                    </div>
                    <div styleName="not-small-mobile">
                        Email template you can copy, paste and tweak for your automated emails to
                        candidates.
                    </div>
                </div>
            </div>
        );
    }

    handleTabChange = () => event => {
        const tab = event.target.value;
        let getData = this.getCandidateData;
        if (tab === "Employees") {
            getData = this.getEmployeeData;
        }
        this.setState({ tab, numUsers: undefined }, getData);
    };

    makeDropdown() {
        const tabOptions = tabs.map(tab => {
            return (
                <MenuItem value={tab} key={tab}>
                    {tab}
                </MenuItem>
            );
        });

        return (
            <Select
                styleName="tab-selector activity-dropdown"
                disableUnderline={true}
                classes={{
                    root: "position-select-root selectRootWhite dashboard-select",
                    icon: "selectIconWhiteImportant",
                    select: "no-focus-change-important"
                }}
                value={this.state.tab}
                onChange={this.handleTabChange}
            >
                {tabOptions}
            </Select>
        );
    }

    makeButtons() {
        let self = this;
        let buttons = [];
        if (this.state.numUsers === 0) {
            buttons = [
                { name: `Invite ${this.state.tab}`, action: "self.openEmailTemplateModal" },
                { name: "Add Position", action: "self.openAddPositionModal" }
            ];
        } else {
            buttons = [{ name: "Review Candidates", action: "self.reviewCandidates" }];
        }

        const displayButtons = buttons.map(button => {
            return (
                <div styleName="awaiting-review-buttons" key={"button " + button.name}>
                    <button
                        className="button noselect round-6px background-primary-cyan primary-white"
                        onClick={eval(button.action)}
                        style={{ padding: "3px 10px" }}
                    >
                        <span>{button.name}</span>
                    </button>
                </div>
            );
        });
        return <div>{displayButtons}</div>;
    }

    awaitingReview() {
        let { tab, numUsers } = this.state;
        tab = tab.toLowerCase();
        // if there is only one candidate, make the tab not be plural
        if (numUsers === 1) {
            tab = tab.slice(0, -1);
        }

        return (
            <div styleName="awaiting-review">
                <div>
                    {typeof numUsers === "number" ? (
                        <div>
                            <div styleName="important-stat">
                                <div styleName="important-number">{numUsers}</div> new {tab} to
                                review
                            </div>
                            {this.makeButtons()}
                        </div>
                    ) : (
                        <div className="center marginTop50px">
                            <CircularProgress style={{ color: primaryCyan }} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    render() {
        const { frame, fetchDataError, numUsers } = this.state;
        try {
            var possessiveBusinessName = makePossessive(
                this.props.currentUser.businessInfo.businessName
            );
        } catch (e) {
            possessiveBusinessName = "Your";
        }

        // if false, show the loading circle
        const doneLoading = typeof numUsers === "number" || fetchDataError;

        let content = null;
        let dropdown = null;
        // if there was an error getting the number of unreviewed users, show
        // tips for hiring instead of the number of users
        if (fetchDataError) {
            content = this.tipsForHiring();
        } else {
            switch (frame) {
                // if there are no candidates at all, show hiring tips
                case "Tips For Hiring": {
                    content = this.tipsForHiring();
                    break;
                }
                // if the user hasn't confirmed that they've embedded the link
                case "Embed Link": {
                    content = this.embedLink();
                    break;
                }
                // if there are any candidates, show number of unreviewed ones
                case "Awaiting Review": {
                    content = this.awaitingReview();
                    dropdown = this.makeDropdown();
                    break;
                }
                default: {
                    content = null;
                    break;
                }
            }
        }

        return (
            <div>
                {doneLoading ? (
                    <div>
                        {frame === "Embed Link" ? (
                            <div>{content}</div>
                        ) : (
                            <div styleName="activity-container">
                                <div styleName="activity-title">
                                    <span styleName="not-small-mobile">
                                        {possessiveBusinessName}{" "}
                                    </span>Activity
                                </div>
                                {dropdown}
                                {content}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="fully-center">
                        <CircularProgress style={{ color: primaryCyan }} />
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            openAddPositionModal,
            openAddUserModal,
            updateUser,
            generalAction,
            confirmEmbedLink,
            intercomEvent
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Activity);
