"use strict";
import React, { Component } from "react";
import {
    TextField,
    DropDownMenu,
    MenuItem,
    Divider,
    Toolbar,
    ToolbarGroup,
    Dialog,
    FlatButton,
    CircularProgress,
    RaisedButton,
    Paper
} from "material-ui";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import {
    addNotification,
    startLoading,
    stopLoading,
    openAddUserModal,
    hidePopups,
    openAddPositionModal
} from "../../../actions/usersActions";
import { Field, reduxForm } from "redux-form";
import MetaTags from "react-meta-tags";
import axios from "axios";
import MyEvaluationsAdminPreview from "../../childComponents/myEvaluationsAdminPreview";
import DeleteEvalModal from "../../childComponents/deleteEvalModal";
import AddUserDialog from "../../childComponents/addUserDialog";
import AddPositionDialog from "../../childComponents/addPositionDialog";
import clipboard from "clipboard-polyfill";
import { goTo, makePossessive, propertyExists } from "../../../miscFunctions";
import { Button } from "../../miscComponents";

const required = value => (value ? undefined : "This field is required.");

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
    <TextField
        hintText={label}
        hintStyle={{ color: "white" }}
        inputStyle={{ color: "#72d6f5" }}
        underlineStyle={{ color: "#72d6f5" }}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false,
            // logo of the company - doesn't apply for candidates
            logo: undefined
        };
    }

    componentDidMount() {
        if (this.props.location.query && this.props.location.query.open) {
            this.setState({ open: true });
        }
        let self = this;
        const { currentUser } = this.props;

        if (currentUser) {
            // get all the positions they're evaluating for
            axios
                .get("/api/business/positions", {
                    params: {
                        userId: currentUser._id,
                        verificationToken: currentUser.verificationToken
                    }
                })
                .then(res => {
                    self.positionsFound(res.data.positions, res.data.logo);
                })
                .catch(err => {
                    console.log("error getting positions: ", err);
                    if (err.response && err.response.data) {
                        console.log(err.response.data);
                    }
                });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.deleteEvaluationsPositions) {
            this.deletePosition(nextProps.deleteEvaluationsPositions.positions);
        }
    }

    // call this after positions are found from back end
    positionsFound(positions, logo) {
        if (Array.isArray(positions) && positions.length > 0) {
            this.setState({ positions, logo });
        } else {
            this.setState({ noPositions: true });
        }
    }

    deletePosition(positions) {
        if (!Array.isArray(positions) || positions.length === 0) {
            return this.setState({ noPositions: true });
        } else {
            let ids = [];
            for (let i = 0; i < positions.length; i++) {
                ids.push(positions[i]._id);
            }

            let newPositions = this.state.positions;
            for (let i = 0; i < newPositions.length; i++) {
                if (!ids.includes(newPositions[i]._id.toString())) {
                    newPositions.splice(i, 1);
                }
            }
            return this.setState({ positions: newPositions })
        }
    }

    positionsUpdate(positions) {
        if (Array.isArray(positions) && positions.length > 0) {
            // add the position to the end of the list
            let position = positions[positions.length - 1];
            let newPositions = this.state.positions;
            position.completions = 0;
            position.usersInProgress = 0;
            newPositions.push(position);
            this.setState({ positions: newPositions });
        } else {
            this.setState({ noPositions: true });
        }
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

    hideMessage() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        let popups = currentUser.popups;
        if (popups) {
            popups.evaluations = false;
        } else {
            popups = {};
            popups.evaluations = false;
        }

        const userId = currentUser._id;
        const verificationToken = currentUser.verificationToken;

        this.props.hidePopups(userId, verificationToken, popups);
    }

    popup() {
        const { currentUser } = this.props;
        if (currentUser && currentUser.popups && currentUser.popups.evaluations) {
            return (
                <div className="center marginBottom15px" key="popup box">
                    <div className="popup-box font16px font14pxUnder700 font12pxUnder500">
                        <div className="popup-frame" style={{ paddingBottom: "20px" }}>
                            <div>
                                <img alt="Alt" src={"/icons/evaluationsBanner" + this.props.png} />
                            </div>
                            <div style={{ marginTop: "20px" }}>
                                <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">
                                    An Overview of Your Evaluations
                                </div>
                                <div>
                                    See the activity for each evaluation, invite employees to be
                                    evaluated to customize predictions, invite candidates and add
                                    evaluations for any open position.
                                </div>
                            </div>
                        </div>
                        <div
                            className="hide-message font14px font12pxUnder700"
                            onClick={this.hideMessage.bind(this)}
                        >
                            Hide Message
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    // open the modal to add a new position
    openAddPositionModal = () => {
        this.props.openAddPositionModal();
    };

    render() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return null;
        }

        const style = {
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {
                fontSize: "18px",
                color: "white"
            }
        };

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />
        ];

        let evaluations = (
            <div className="center marginTop20px" style={{ color: "rgba(255,255,255,.8)" }}>
                Loading evaluations...
            </div>
        );

        if (this.state.noPositions) {
            evaluations = (
                <div className="center marginTop20px" style={{ color: "rgba(255,255,255,.8)" }}>
                    <div>No evaluations. Add your first evaluation below.</div>
                    <Button
                        style={{ marginTop: "20px" }}
                        onClick={this.openAddPositionModal}
                    >
                        + Add Evaluation
                    </Button>
                </div>
            );
        }

        // create the evaluation previews
        let key = 0;
        let self = this;

        try {
            var { businessName } = currentUser.businessInfo;
        } catch (e) {
            var businessName = "Your";
        }

        if (currentUser && this.state.positions.length !== 0) {
            const userType = currentUser.userType;

            evaluations = this.state.positions.map(position => {
                key++;
                // make sure position is the right type
                if (position && typeof position === "object") {
                    let attributes = {};
                    attributes.id = position._id;
                    attributes.variation = "edit";
                    attributes.name = position.name;
                    attributes.logo = self.state.logo;
                    attributes.length = position.length;
                    attributes.inactive = position.inactive;
                    attributes.positionKey = position._id;
                    attributes.skills = position.skillNames;
                    attributes.company = businessName;
                    attributes.completions = position.completions;
                    attributes.timeAllotted = position.timeAllotted;
                    attributes.usersInProgress = position.usersInProgress;

                    return (
                        <li style={{ marginTop: "35px", listStyleType: "none" }} key={key}>
                            <MyEvaluationsAdminPreview {...attributes} />
                        </li>
                    );
                }
                // if position is not the right type, don't show a position preview
                else {
                    return null;
                }
            });
        }

        if (this.state.positions.length !== 0) {
            var link = (
                <div
                    className="secondary-gray font16px font14pxUnder900 font12pxUnder500"
                    style={{ width: "95%", margin: "20px auto 20px" }}
                >
                    {makePossessive(businessName)} candidate invite page&nbsp;
                    <Button onClick={this.copyLink} style={{ marginLeft: "5px" }}>
                        Get Link
                    </Button>
                </div>
            );
            let attributes = {};
            attributes.variation = "edit";
            attributes.name = "Web Developer";
            attributes.logo = this.state.logo;
            attributes.length = 25;
            attributes.inactive = true;
            attributes.skills = ["HTML", "Javascript"];
            attributes.company = businessName;
            attributes.completions = 0;
            attributes.timeAllotted = 30;
            attributes.usersInProgress = 0;
            attributes.buttonsNotClickable = true;
            key++;

            evaluations.push(
                <li style={{ marginTop: "35px", listStyleType: "none" }} key={key}>
                    <div style={{ filter: "blur(5px)" }}>
                        <MyEvaluationsAdminPreview
                            {...attributes}
                            style={{ pointerEvents: "none" }}
                            className="noselect"
                        />
                    </div>
                    <div
                        className="font24px font22pxUnder700 font18pxUnder500 center addEval"
                        onClick={this.openAddPositionModal}
                    >
                        <Button size="large">
                            Add Evaluation
                        </Button>
                        <div className="font16px font14pxUnder700 font12pxUnder500 secondary-gray">
                            There{"'"}s no cost for adding evaluations
                        </div>
                    </div>
                </li>
            );
        }

        const blurredClass = this.props.blurModal ? "dialogForBizOverlay" : "";

        return (
            <div
                className={"jsxWrapper blackBackground fillScreen " + blurredClass}
                style={{ paddingBottom: "20px" }}
                ref="myEvaluations"
            >
                {currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>My Evaluations | Moonshot Insights</title>
                    <meta
                        name="description"
                        content="View the evaluations your company is running."
                    />
                </MetaTags>

                <AddPositionDialog />
                <DeleteEvalModal positionsFound={this.positionsFound.bind(this)} />

                <div className="page-line-header">
                    <div />
                    <div>Evaluations</div>
                </div>

                {this.popup()}

                <div className="center">{link}</div>
                <div className="marginBottom60px">{evaluations}</div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification,
            startLoading,
            stopLoading,
            openAddUserModal,
            openAddPositionModal,
            hidePopups
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png,
        blurModal: state.users.lockedAccountModal,
        deleteEvaluationsPositions: state.users.deleteEvaluationsPositions
    };
}

MyEvaluations = reduxForm({
    form: "addEval"
})(MyEvaluations);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyEvaluations);
