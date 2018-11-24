"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { reduxForm } from "redux-form";
import {
    closeAddPositionModal,
    addNotification,
    startLoading,
    stopLoading,
    openAddUserModal
} from "../../actions/usersActions";
import {} from "../../miscFunctions";
import {
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
import axios from "axios";
import TextInput from "../userInput/textInput";

const required = value => (value ? undefined : "This field is required.");

class AddPositionDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // type of position for adding an evaluation
            positionType: "Position Type",
            // whether the new position to add is for a manager
            newPosIsManager: false,
            // list of position Types
            positionTypes: [
                "Position Type",
                "Developer",
                "Sales",
                "Support",
                "Marketing",
                "Product"
            ],
            // if user didn't select a position type when making a new position
            mustSelectTypeError: false,
            // error adding a position
            addPositionError: undefined,
            open: false,
            screen: 1
        };
    }

    componentDidUpdate() {
        // make sure the props defining whether the modal is open matches the state for that
        if (this.props.modalOpen != this.state.open && this.props.modalOpen != undefined) {
            this.setState({ open: this.props.modalOpen });
        }
    }

    // reset the state and close the dialog
    handleClose = () => {
        this.setState({
            screen: 1,
            addPositionError: undefined,
            mustSelectTypeError: false,
            positionType: this.state.positionTypes[0],
            newPosIsManager: false
        });
        this.props.closeAddPositionModal();
    };

    handleNextScreen = () => {
        const screen = this.state.screen + 1;
        if (screen > 0 && screen < 3) {
            this.setState({ screen });
        }
    };

    handlePositionTypeChange = (event, index) => {
        const positionType = this.state.positionTypes[index];
        let newState = { ...this.state, positionType };
        if (positionType !== "Position Type") {
            newState.mustSelectTypeError = false;
        }
        this.setState(newState);
    };

    handleClickIsManager = () => {
        const newState = { ...this.state, newPosIsManager: !this.state.newPosIsManager };
        this.setState(newState);
    };

    handleSubmit(e) {
        try {
            let self = this;
            e.preventDefault();
            const vals = this.props.formData.addPosition.values;

            // Form validation before submit
            let notValid = false;
            const requiredFields = ["position"];
            requiredFields.forEach(field => {
                if (!vals || !vals[field]) {
                    this.props.touch(field);
                    notValid = true;
                }
            });
            if (notValid) return;

            // if the user didn't select a position type, don't let them move on
            if (this.state.positionType === "Position Type") {
                return this.setState({ mustSelectTypeError: true });
            } else {
                this.setState({ mustSelectTypeError: false });
            }

            // get all necessary params
            const user = this.props.currentUser;
            if (!user) {
                return this.props.addNotification(
                    "You aren't logged in! Try refreshing the page.",
                    "error"
                );
            }
            const userId = user._id;
            const businessId = user.businessInfo.businessId;
            const verificationToken = user.verificationToken;
            const positionName = vals.position;
            const positionType = this.state.positionType;
            const isManager = this.state.newPosIsManager;

            this.props.startLoading();

            axios
                .post("api/business/addEvaluation", {
                    userId,
                    verificationToken,
                    businessId,
                    positionName,
                    positionType,
                    isManager
                })
                .then(res => {
                    self.setState({ positionType: "Position Type", newPosIsManager: false });
                    self.handleNextScreen();
                    self.props.stopLoading();
                    self.props.reset();
                })
                .catch(error => {
                    self.props.stopLoading();
                    self.setState({ addPositionError: "Error adding position." });
                });
        } catch (error) {
            this.props.stopLoading();
            this.setState({ addPositionError: "Error adding position." });
            return;
        }
    }

    // inviteCandidates() {
    //     this.props.closeAddPositionModal();
    // }

    render() {
        const style = {
            separator: {
                width: "70%",
                margin: "25px auto 0",
                position: "relative",
                height: "40px",
                textAlign: "center"
            },
            separatorText: {
                padding: "0px 40px",
                backgroundColor: "#2e2e2e",
                display: "inline-block",
                position: "relative",
                fontSize: "23px",
                color: "white"
            },
            separatorLine: {
                width: "100%",
                height: "3px",
                backgroundColor: "white",
                position: "absolute",
                top: "12px"
            },
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

        const positionTypeItems = this.state.positionTypes.map(function(positionType, index) {
            return <MenuItem value={positionType} primaryText={positionType} key={index} />;
        });

        // Dialog for adding evaluation
        const screen = this.state.screen;
        let dialogBody = <div />;
        if (screen === 1) {
            dialogBody = (
                <form onSubmit={this.handleSubmit.bind(this)} className="center">
                    {this.state.mustSelectTypeError ? (
                        <div className="secondary-red" style={{ marginBottom: "-23px" }}>
                            Must select a position type.
                        </div>
                    ) : null}
                    <div className="primary-cyan font28px font24pxUnder700 font20pxUnder500 marginTop40px">
                        Add Evaluation
                    </div>
                    <div className="primary-white font16px font14pxUnder700 marginTop10px marginBottom10px">
                        Enter the details of your new position.
                    </div>
                    <TextInput
                        name="position"
                        label="Position Name"
                        validate={[required]}
                        required={true}
                        placeholder="iOS Developer"
                    />
                    <br />
                    <div className="primary-cyan font16px marginTop10px">
                        <div
                            style={{
                                display: "inline-block",
                                marginTop: "16px",
                                verticalAlign: "top"
                            }}
                        >
                            Select a position type:
                        </div>
                        <DropDownMenu
                            value={this.state.positionType}
                            onChange={this.handlePositionTypeChange}
                            labelStyle={style.menuLabelStyle}
                            anchorOrigin={style.anchorOrigin}
                            style={{ fontSize: "16px" }}
                        >
                            {positionTypeItems}
                        </DropDownMenu>
                    </div>
                    <br />
                    <div style={{ margin: "-20px auto 10px" }} className="primary-white">
                        <div
                            className="checkbox smallCheckbox whiteCheckbox"
                            onClick={this.handleClickIsManager.bind(this)}
                        >
                            <img
                                alt=""
                                className={"checkMark" + this.state.newPosIsManager}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        {"Position is a manager role"}
                    </div>
                    <RaisedButton
                        label="Continue"
                        type="submit"
                        className="raisedButtonBusinessHome marginTop10px"
                    />
                    <br />
                    {this.state.addPositionError ? (
                        <div className="secondary-red font16px marginTop10px">
                            {this.state.addPositionError}
                        </div>
                    ) : null}
                    {this.props.loading ? (
                        <CircularProgress color="white" style={{ marginTop: "8px" }} />
                    ) : null}
                </form>
            );
        } else if (screen === 2) {
            dialogBody = (
                <div>
                    <div
                        className="primary-cyan font28px font24pxUnder700 font20pxUnder500"
                        style={{ width: "90%", margin: "30px auto" }}
                    >
                        Evaluation Added
                    </div>
                    <div
                        className="primary-white-important font16px font14pxUnder700 font12pxUnder400"
                        style={{ width: "90%", margin: "10px auto 0" }}
                    >
                        Congrats on adding an evaluation! Embed your link into your hiring workflow
                        to automate your candidate invites.
                        <div className="marginTop20px">
                            <button
                                className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font16px primary-white"
                                onClick={this.handleClose}
                                style={{ padding: "5px 17px" }}
                            >
                                {"Close"}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const dialog = (
            <Dialog
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                {dialogBody}
            </Dialog>
        );

        return <div>{dialog}</div>;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
        loading: state.users.loadingSomething,
        userPosted: state.users.positionPosted,
        userPostedFailed: state.users.positionPostedFailed,
        modalOpen: state.users.positionModalOpen,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeAddPositionModal,
            addNotification,
            startLoading,
            stopLoading,
            openAddUserModal
        },
        dispatch
    );
}

AddPositionDialog = reduxForm({
    form: "addPosition"
})(AddPositionDialog);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddPositionDialog);
