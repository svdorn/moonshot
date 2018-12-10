"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {
    addNotification,
    getColorsFromBusiness,
    setDefaultColors
} from "../../actions/usersActions";
import { makePossessive } from "../../miscFunctions";
import MetaTags from "react-meta-tags";
import { goTo } from "../../miscFunctions";
import { HoverTip, Button, ShiftArrow } from "../miscComponents";
import axios from "axios";

import "./employee.css";

class Employee extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            position: "",
            company: "",
            logo: "",
            noPositions: false,
            // if the business has set up the page
            pageSetUp: undefined,
            // unique name of the business
            uniqueName: undefined
        };
    }

    componentWillMount() {
        const { currentUser } = this.props;
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

        if ((!this.props.location.query || !this.props.location.query.onboarding)) {
            this.props.getColorsFromBusiness(company);
        }
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
        // get the positions from the database with the name and signup code
        axios
            .get("/api/business/positionsForApply", {
                params: {
                    name: company
                }
            })
            .then(function(res) {
                self.positionsFound(
                    res.data.positions,
                    res.data.logo,
                    res.data.businessName,
                    res.data.pageSetUp,
                    company
                );
            })
            .catch(function(err) {
                goTo("/");
                self.props.addNotification(err, "error");
            });
    }

    componentWillUnmount() {
        const { currentUser } = this.props;

        if (currentUser && currentUser.userType === "accountAdmin") {
            this.props.setDefaultColors();
        }
    }

    // call this after positions are found from back end
    positionsFound(positions, logo, company, pageSetUp, uniqueName) {
        if (Array.isArray(positions) && positions.length > 0) {
            const position = positions[0].name;
            this.setState({ positions, position, logo, company, pageSetUp, uniqueName });
        } else {
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
            textColor &&
            (textColor.toLowerCase() == "white" || textColor.toLowerCase() == "#ffffff")
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
        let URL = "/introduction?code=";
        const position = this.state.positions.findIndex(pos => {
            return pos.name.toString() === this.state.position.toString();
        });

        const code = this.state.positions[position].employeeCode;

        URL += code;
        URL += `&company=${this.state.company}&uniqueName=${this.state.uniqueName}`;

        goTo(URL);
    };

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
                        Verify Your Email <ShiftArrow color="cyan" width="14px" />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        let content = null;

        const { pageSetUp, company, position, noPositions } = this.state;

        const { currentUser } = this.props;

        // company has loaded
        if (company) {
            let actionsToTake = null;
            if (pageSetUp === false) {
                actionsToTake = this.pageNotSetUp();
            } else {
                actionsToTake = this.nextButton();
            }

            content = (
                <div>
                    <div className="paddingTop50px marginBottom30px">
                        <div
                            className="font38px font30pxUnder700 font24pxUnder500"
                            style={{ color: this.props.primaryColor }}
                        >
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
                        style={{ width: "88%", margin: "auto" }}
                    >
                        Select the position you are taking the evaluation for.
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
                    <div className="font20px font18pxUnder700 font16pxUnder500 secondary-dark-gray marginTop30px">
                        Loading...
                    </div>
                </div>
            );
        }


        return (
            <div
                className={
                    "center full-height "
                }
            >
                {this.state.company ? (
                    <MetaTags>
                        <title>Employee | {this.state.company}</title>
                        <meta
                            name="description"
                            content="Take an evaluation as an employee of a company."
                        />
                    </MetaTags>
                ) : null}

                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        primaryColor: state.users.primaryColor,
        textColor: state.users.textColor
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            getColorsFromBusiness,
            setDefaultColors
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Employee);
