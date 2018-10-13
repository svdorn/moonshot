"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, openAddPositionModal, openAddUserModal, generalAction } from "../../../../actions/usersActions";
import { propertyExists, goTo, makePossessive } from "../../../../miscFunctions";
import clipboard from "clipboard-polyfill";
import Carousel from "../../../miscComponents/carousel";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { primaryCyan, primaryWhite } from "../../../../colors";
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
            data : undefined,
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
         this.copyLink = this.copyLink.bind(this);
    }

    componentDidMount() {
        let self = this;
        const user = this.props.currentUser;

        const countQuery = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/candidatesTotal", countQuery )
        .then(response => {
            if (propertyExists(response, ["data", "totalCandidates"]), "number") {
                let frame = "Tips For Hiring";
                if (response.data.totalCandidates > 0) {
                    frame = "Awaiting Review";
                    self.setState({ frame, data: response.data.totalCandidates }, () => {
                        self.getCandidateData();
                    });
                } else {
                    self.setState({ frame, data: 0 });
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
    }

    getCandidateData() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/candidatesAwaitingReview", query )
        .then(response => {
            if (propertyExists(response, ["data", "newCandidates"]), "number") {
                self.setState({ data: response.data.newCandidates });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            self.setState({ fetchDataError: true });
        });
    }

    getEmployeeData() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/employeesAwaitingReview", query )
        .then(response => {
            if (propertyExists(response, ["data", "newEmployees"]), "number") {
                self.setState({ data: response.data.newEmployees });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            self.setState({ fetchDataError: true });
        });
    }

    copyLink = () => {
        let URL = "https://moonshotinsights.io/apply/" + this.props.currentUser.businessInfo.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard", "info");
    }

    openAddPositionModal = () => {
        this.props.openAddPositionModal();
    }

    openAddUserModal = () => {
        this.props.openAddUserModal();
    }

    openEmailTemplateModal = () => {
        this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
    }

    tipsForHiring() {
        const frame1 = (
            <div styleName="carousel-frame">
                <div>Tip #1: <span className="primary-cyan">First Things First</span></div>
                <div>
                    Don{"'"}t forget to embed your candidate invite page in your hiring workflow and communications
                    with candidates, otherwise all your effort so far will be lost.
                    <br/>
                    <u className="primary-cyan clickable" onClick={this.copyLink}>Copy your link</u>
                </div>
            </div>
        );
        const frame2 = (
            <div styleName="carousel-frame">
                <div>Tip #2: <span className="primary-cyan">Take Advantage</span></div>
                <div>
                    We align our incentives to your desired outcome, exceptional hires, so we only charge when you hire
                    an awesome employee who stays at your company. This allows you to invite as many candidates, add as many
                    positions and evaluate as many employees as your want so take advantage and <div className="primary-cyan clickable inlineBlock" onClick={this.openAddPositionModal}>add some more positions</div>.
                </div>
            </div>
        );
        const frame3 = (
            <div styleName="carousel-frame">
                <div>Tip #3: <span className="primary-cyan">Don{"'"}t Screen Out Great Candidates</span></div>
                <div>
                    If you screen applicants before inviting them to complete an evaluation, you{"'"}re very likely dismissing your best candidates.
                    As you know by now, education and experience provide 1% and 1.1% predictive ability; other resume and LinkedIn data are horrible predictors too.
                    Be sure to invite the vast majority, if not all, of your applicants.
                </div>
            </div>
        );
        const frame4 = (
            <div styleName="carousel-frame">
                <div>Tip #4: <span className="primary-cyan">Double Down On Your Team</span></div>
                <div>
                    You{"'"}re sacrificing a huge opportunity if you don{"'"}t invite employees to be evaluated. This data enables us to really
                    customize {this.props.currentUser.businessInfo.businessName}{"'"}s predictive model and generate Longevity/tenure and Culture Fit predictions for all of your candidates.
                    Improve your candidate predictions by <div className="primary-cyan clickable inlineBlock" onClick={this.openAddUserModal}>inviting employees</div> to complete a 22-minute evaluation.
                </div>
            </div>
        );

        return (
            <div styleName="tips-for-hiring">
                <div styleName="desktop-only tips-for-hiring-header">
                    { "While you're waiting for candidates to complete your \
                    evaluation, here are some hiring tips:" }
                </div>
                <div styleName="mobile-only tips-for-hiring-header">
                    { "A couple tips while you're waiting for candidates to \
                    complete your evaluation:" }
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

    handleTabChange = () => event => {
        const tab = event.target.value;
        let getData = this.getCandidateData;
        if (tab === "Employees") {
            getData = this.getEmployeeData;
        }
        this.setState({ tab, data: undefined }, getData);
    }

    makeDropdown() {
        const tabOptions = tabs.map(tab => {
            return <MenuItem value={tab} key={tab}>{ tab }</MenuItem>;
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
                onChange={ this.handleTabChange }
            >
                { tabOptions }
            </Select>
        );
    }

    makeButtons() {
        let self = this;
        let buttons = [];
        if (this.state.data === 0) {
            buttons = [
                { name: `Invite ${this.state.tab}`, action: "self.openEmailTemplateModal"},
                { name: "Add Position", action: "self.openAddPositionModal" }
            ]
        } else {
            buttons = [{ name: "Review Candidates", action: "self.reviewCandidates" }]
        }

        const displayButtons = buttons.map(button => {
            return (
                <div styleName="awaiting-review-buttons" key={"button " + button.name}>
                    <button
                        className="button noselect round-6px background-primary-cyan primary-white"
                        onClick={eval(button.action)}
                        style={{padding: "3px 10px"}}
                    >
                        <span>{button.name}</span>
                    </button>
                </div>
            );
        });
        return (
            <div>
                { displayButtons }
            </div>
        );
    }

    awaitingReview() {
        let { tab, data } = this.state;
        tab = tab.toLowerCase();
        // if there is only one candidate, make the tab not be plural
        if (data === 1) { tab = tab.slice(0,-1); }

        return (
            <div styleName="awaiting-review">
                <div>
                    {typeof data === "number" ?
                        <div>
                            <div styleName="important-stat">
                                <div styleName="important-number">{ data }</div> new { tab } to review
                            </div>
                            { this.makeButtons() }
                        </div>
                        :
                        <div className="center marginTop50px">
                            <CircularProgress style={{ color: primaryCyan }} />
                        </div>
                    }
                </div>
            </div>
        );
    }

    render() {
        const { frame, fetchDataError, data } = this.state;
        const { businessName } = this.props.currentUser.businessInfo;

        console.log("haha");

        let content = null;
        let dropdown = null;
        switch (frame) {
            case "Tips For Hiring": { content = this.tipsForHiring(); break; }
            case "Awaiting Review": {
                content = this.awaitingReview();
                dropdown = this.makeDropdown();
                break;
            }
            default: { content = null; break; }
        }

        return (
            <div>
                { typeof data === "number" && !fetchDataError ?
                    <div styleName="activity-container">
                        <div styleName="activity-title">
                            <span styleName="not-small-mobile">{ makePossessive(businessName) } </span>Activity
                        </div>
                        { dropdown }
                        { content }
                    </div>
                :
                    <div className="fully-center">
                        <CircularProgress style={{ color: primaryCyan }} />
                    </div>
                }
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
    return bindActionCreators({
        addNotification,
        openAddPositionModal,
        openAddUserModal,
        generalAction
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Activity);
