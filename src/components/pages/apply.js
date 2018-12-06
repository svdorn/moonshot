"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {
    addNotification,
    openClaimPageModal,
    openAddPositionModal,
    generalAction
} from "../../actions/usersActions";
import { makePossessive } from "../../miscFunctions";
import MetaTags from "react-meta-tags";
import { goTo } from "../../miscFunctions";
import { HoverTip, Button } from "../miscComponents";
import ClaimPageModal from "./dashboard/dashboardItems/onboarding/childComponents/claimPageModal";
import ModalSignup from "./dashboard/dashboardItems/onboarding/childComponents/modalSignup";
import AddPositionDialog from "../childComponents/addPositionDialog";
import InviteCandidatesModal from "./dashboard/inviteCandidatesModal";
import axios from "axios";

import "./apply.css";

class Apply extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            position: "",
            company: "",
            logo: "",
            noPositions: false,
            // if the user is an accountAdmin of this company
            admin: false,
            // if the business has set up the page
            pageSetUp: undefined
        };
    }

    /* fetch the positions and codes and set the position field to be the first position in the array */
    componentDidMount() {
        let self = this;
        // get the company name from the url
        try {
            var company = this.props.params.company;
        } catch (e) {
            goTo("/");
            self.props.addNotification(
                "Couldn't get the company you're trying to apply for.",
                "error"
            );
        }

        const { currentUser, location } = this.props;

        if (
            location.query &&
            location.query.onboarding &&
            !(currentUser && currentUser.userType === "candidate")
        ) {
            // get positions from its form
            let positions = [{ name: "iOS Developer" }];
            const onboardingPositions = this.props.onboardingPositions;
            if (
                onboardingPositions &&
                Array.isArray(onboardingPositions) &&
                onboardingPositions.length > 0
            ) {
                positions = onboardingPositions.slice();
            }
            this.positionsFound(positions, undefined, company, true, false);
        } else {
            if (
                currentUser &&
                currentUser.userType === "accountAdmin" &&
                currentUser.businessInfo
            ) {
                var businessId = this.props.currentUser.businessInfo.businessId;
            }

            // get the positions from the database with the name and signup code
            axios
                .get("/api/business/positionsForApply", {
                    params: {
                        name: company,
                        businessId
                    }
                })
                .then(function(res) {
                    self.positionsFound(
                        res.data.positions,
                        res.data.logo,
                        res.data.businessName,
                        res.data.admin,
                        res.data.pageSetUp
                    );
                })
                .catch(function(err) {
                    goTo("/");
                    self.props.addNotification(err, "error");
                });
        }
    }

    // call this after positions are found from back end
    positionsFound(positions, logo, company, admin, pageSetUp) {
        const addMoreLater = "Add more below";
        if (Array.isArray(positions) && positions.length > 0) {
            const position = positions[0].name;
            if (admin && !positions.some(p => p.name === addMoreLater)) {
                positions.push({ name: addMoreLater });
            }
            this.setState({ positions, position, logo, company, admin, pageSetUp });
        } else {
            console.log("in here");
            this.setState({ noPositions: true });
        }
    }

    // create the dropdown for the different positions
    makeDropdown(position) {
        const positions = this.state.positions.map(pos => {
            return (
                <MenuItem value={pos.name} key={`position${pos.name}`}>
                    {pos.name}
                </MenuItem>
            );
        });

        const { textColor } = this.props;
        const iconClass =
            !textColor || textColor.toLowerCase() == "white" || textColor.toLowerCase() == "#ffffff"
                ? "selectIconWhiteImportant"
                : "";

        return (
            <Select
                disableUnderline={true}
                style={{ color: this.props.textColor }}
                classes={{
                    root: "select-no-focus-color font20px font16pxUnder500",
                    icon: "selectIconMargin " + iconClass
                }}
                value={position}
                onChange={this.handleChangePosition(position)}
                key={`position`}
            >
                {positions}
            </Select>
        );
    }

    // handle a click on position
    handleChangePosition = position => event => {
        this.setState({ position: event.target.value });
    };

    handleSignUp = () => {
        let URL = "/signup?code=";
        const position = this.state.positions.findIndex(pos => {
            return pos.name.toString() === this.state.position.toString();
        });

        const code = this.state.positions[position].code;

        URL += code;
        goTo(URL);
    };

    openClaimPageModal = () => {
        this.props.openClaimPageModal();
    };

    openAddPositionModal = () => {
        this.props.openAddPositionModal();
    };

    openInviteCandidatesModal = () => {
        this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
    };

    dashboardAndModal = () => {
        goTo("/dashboard");
        this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
    };

    // info for an admin coming to preview this page
    adminInformation() {
        const { currentUser } = this.props;
        if (currentUser) {
            if (!this.props.currentUser.confirmEmbedLink) {
                var buttonText = "Continue To Invite Candidates ";
                var onClick = () => this.dashboardAndModal();
            } else {
                var buttonText = "Invite Candidates ";
                var onClick = () => this.openInviteCandidatesModal();
            }
            var description = (
                <div>
                    This is {makePossessive(this.state.company)} candidate invite page. When
                    candidates click on your link, they will be taken here. New evaluations will
                    automatically be added to your dropdown list above.{" "}
                    <span className="primary-cyan clickable" onClick={this.openAddPositionModal}>
                        Add evaluations
                    </span>{" "}
                    for other open positions.
                </div>
            );
        } else {
            var buttonText = "Claim This Page";
            var onClick = this.openClaimPageModal;
            var description = (
                <div>
                    Candidates will see what's above when they click{" "}
                    {makePossessive(this.state.company)} invite link.
                </div>
            );
        }

        return (
            <div>
                <div>
                    <Button disabled={true} style={{ padding: "6px 20px" }}>
                        Next
                    </Button>
                    <HoverTip
                        className="font14px secondary-gray"
                        style={{ marginTop: "40px", marginLeft: "-6px" }}
                        text="After candidates press next, they sign up to complete your evaluation."
                    />
                </div>
                <div styleName="employer-box">
                    {description}
                    <Button onClick={onClick} style={{ marginTop: "20px" }}>
                        {buttonText}
                    </Button>
                </div>
            </div>
        );
    }

    // info for somebody about to create an account
    claimPage() {
        return (
            <div>
                <div>
                    <Button style={{ padding: "6px 20px" }} disabled={true}>
                        Next
                    </Button>
                    <HoverTip
                        className="font14px secondary-gray"
                        style={{ marginTop: "40px", marginLeft: "-6px" }}
                        text="After candidates press next, they sign up to complete your evaluation."
                    />
                </div>
                <div styleName="employer-box">
                    <div>
                        This is {makePossessive(this.state.company)} candidate invite page. New
                        evaluations will automatically be added to your dropdown list above. All of
                        your candidates can visit the link to this page to complete their
                        evaluation.
                    </div>
                    <div onClick={this.openClaimPageModal}>
                        Claim This Page <img src={`/icons/ArrowBlue${this.props.png}`} />
                    </div>
                </div>
            </div>
        );
    }

    // returns a button that lets you sign up
    nextButton() {
        return (
            <Button onClick={this.handleSignUp} style={{ padding: "6px 20px" }}>
                Next
            </Button>
        );
    }

    // add a newly-added position to the list of positions
    addPositionToParentState = newPosition => {
        let { positions } = this.state;
        positions.unshift({ name: newPosition });
        this.setState({ positions });
    };

    // for a candidate seeing this page before it has been set up
    pageNotSetUp() {
        return (
            <div>
                <div styleName="employer-box">
                    <div>
                        The administrator of this company account has not yet verified their email
                        to activate this page. If you are the administrator:
                    </div>
                    <div onClick={() => goTo("/dashboard")}>
                        Verify Your Email <img src={`/icons/ArrowBlue${this.props.png}`} />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        let content = null;

        const { pageSetUp, admin, company, position, noPositions } = this.state;

        const { currentUser } = this.props;

        // company has loaded
        if (company) {
            let actionsToTake = null;
            if (admin) {
                actionsToTake = this.adminInformation();
            } else if (pageSetUp === false) {
                actionsToTake = this.pageNotSetUp();
            } else {
                actionsToTake = this.nextButton();
            }

            content = (
                <div>
                    <div className="paddingTop50px marginBottom30px">
                        <div className="font38px font30pxUnder700 font24pxUnder500">
                            {this.state.company} Evaluation
                        </div>
                        <div
                            className="font16px font14pxUnder700 font12pxUnder500"
                            styleName="powered-by"
                            style={{ opacity: 0.6 }}
                        >
                            Powered by Moonshot Insights
                        </div>
                    </div>
                    <div
                        className="font16px font14pxUnder500"
                        style={{ width: "88%", margin: "auto", color: this.props.primaryColor }}
                    >
                        Select the position you would like to apply for.
                    </div>
                    <div className="font30px font16pxUnder400 marginBottom30px">
                        {this.makeDropdown(position)}
                    </div>
                    {actionsToTake}
                </div>
            );
        }
        // the company has no positions
        else if (noPositions) {
            content = (
                <div>
                    <div className="font18px font16pxUnder700 font14pxUnder500 secondary-gray marginTop30px">
                        This company has no active positions currently.
                    </div>
                </div>
            );
        }
        // page is still loading
        else {
            content = (
                <div>
                    <div className="font18px font16pxUnder700 font14pxUnder500 secondary-gray marginTop30px">
                        Loading...
                    </div>
                </div>
            );
        }

        let blurredClass = "";
        if (
            this.props.claimPageModal ||
            this.props.inviteCandidatesModal ||
            this.props.positionModal
        ) {
            blurredClass = "dialogForBizOverlay";
        }

        return (
            <div
                className={
                    "center full-height " +
                    blurredClass +
                    (this.props.blurLeadDashboard ? " blur" : "")
                }
            >
                <ClaimPageModal company={this.state.company} />
                <ModalSignup />
                <AddPositionDialog addPositionToParentState={this.addPositionToParentState} />
                <InviteCandidatesModal />
                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        formData: state.form,
        blurLeadDashboard: state.users.blurLeadDashboard,
        claimPageModal: state.users.claimPageModal,
        inviteCandidatesModal: state.users.inviteCandidatesModalOpen,
        positionModal: state.users.positionModalOpen,
        onboardingPositions: state.users.onboardingPositions,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            openClaimPageModal,
            openAddPositionModal,
            generalAction
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Apply);
