"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TextField, CircularProgress, RaisedButton, FlatButton, Dialog, DropDownMenu, MenuItem, Divider, Tab, Tabs } from 'material-ui';
import PasswordChange from './passwordchange';
import Account from './account';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';
import AddUserDialog from '../childComponents/addUserDialog';
import { addNotification } from "../../actions/usersActions"
import axios from "axios";
import { bindActionCreators } from "redux";

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: "Settings"
        }
    }

    handleTabChange = (tab) => {
        this.setState({tab})
    }


    resetAlan = () => {
        axios.post("/api/misc/resetAlan", {userId: this.props.currentUser._id, verificationToken: this.props.currentUser.verificationToken})
        .then(response => {
            this.props.addNotification("Reset!", "info");
        })
        .catch(error => {
            console.log(error);
            this.props.addNotification("Didn't reset", "error");
        });
    }


    //name, email, password, confirm password, signup button
    render() {
        const style = {
            tab: {
                color: 'white',

            }
        };
        return (
            <div className="fillScreen">
                {this.props.currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>Settings | Moonshot</title>
                    <meta name="description" content="Change your Moonshot account settings." />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents: "none"}} variation="5"/>
                <div className="formContainer center">
                    <div className="form lightBlackForm noBlur">
                    <div className="font32px font28pxUnder700 primary-cyan marginTop10px">Settings</div>
                    <Tabs
                        inkBarStyle={{background: 'white'}}
                        className="settingsTabs"
                        value={this.state.tab}
                        onChange={this.handleTabChange}
                    >
                        <Tab label="Change Settings" value="Settings" style={style.tab}>
                            <Account />
                        </Tab>
                        <Tab label="Change Password" value="Change Password" style={style.tab}>
                            <PasswordChange />
                        </Tab>
                    </Tabs>
                    </div>
                </div>
                {this.props.currentUser.email === "alan.alanson@email.com" ?
                    <div
                        onClick={this.resetAlan}
                        className="pointer primary-white"
                    >
                        RESET
                    </div>
                    : null
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
        addNotification
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
