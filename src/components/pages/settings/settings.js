"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
    TextField,
    CircularProgress,
    RaisedButton,
    FlatButton,
    Dialog,
    DropDownMenu,
    MenuItem,
    Divider,
    Tab,
    Tabs
} from "material-ui";
import PasswordChange from "./passwordchange";
import Account from "./account";
import ApiKey from "./apiKey";
import Notifications from "./notifications";
import MetaTags from "react-meta-tags";
import AddUserDialog from "../../childComponents/addUserDialog";
import { addNotification } from "../../../actions/usersActions";
import axios from "axios";
import { bindActionCreators } from "redux";

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: "Account"
        };
    }

    handleTabChange = tab => {
        this.setState({ tab });
    };

    resetAlan = () => {
        axios
            .post("/api/misc/resetAlan", {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            })
            .then(response => {
                this.props.addNotification("Reset!", "info");
            })
            .catch(error => {
                console.log(error);
                this.props.addNotification("Didn't reset", "error");
            });
    };

    //name, email, password, confirm password, signup button
    render() {
        const { currentUser } = this.props;
        if (!currentUser) {
            return null;
        }

        const style = {
            tab: {
                color: "white"
            }
        };

        const blurredClass = this.props.blurModal ? "dialogForBizOverlay" : "";

        return (
            <div className={"fillScreen " + blurredClass}>
                {currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>Settings | Moonshot</title>
                    <meta name="description" content="Change your Moonshot account settings." />
                </MetaTags>
                <div className="formContainer center">
                    <div className="form lightBlackForm noBlur">
                        <div className="font32px font28pxUnder700 primary-cyan marginTop10px">
                            Settings
                        </div>
                        <Tabs
                            inkBarStyle={{ background: "white" }}
                            className="settingsTabs"
                            value={this.state.tab}
                            onChange={this.handleTabChange}
                        >
                            <Tab label="Account" value="Account" style={style.tab}>
                                <Account />
                            </Tab>
                            <Tab label="Password" value="Password" style={style.tab}>
                                <PasswordChange />
                            </Tab>
                            {currentUser.userType === "accountAdmin" ? (
                                <Tab label="API Key" value="API Key" style={style.tab}>
                                    <ApiKey />
                                </Tab>
                            ) : null}
                            {currentUser.userType === "accountAdmin" ? (
                                <Tab label="Notifications" value="Notifications" style={style.tab}>
                                    <Notifications />
                                </Tab>
                            ) : null}
                        </Tabs>
                    </div>
                </div>
                {currentUser.email === "alan.alanson@email.com" ? (
                    <div onClick={this.resetAlan} className="pointer primary-white">
                        RESET
                    </div>
                ) : null}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        blurModal: state.users.lockedAccountModal
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            addNotification
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Settings);
