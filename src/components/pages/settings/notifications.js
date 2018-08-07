"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import {ToolbarGroup, DropDownMenu, RaisedButton, MenuItem, Divider, Toolbar, IconMenu, IconButton} from 'material-ui';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import { addNotification } from '../../../actions/usersActions';

const styles = {
    underlineStyle: {
        display: 'none',
    },
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'left'
    }
};

class Notifications extends Component {
    constructor(props) {
        super(props);

        this.state = {
            preference: "",
            checkMark: false,
        };
    }

    componentDidMount() {
        let self = this;
        // get current notification preferences and set state
        axios.get("/api/user/notificationPreferences", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            if (res.data && res.data.time) {
                if (res.data.time === "never") {
                    self.setState({preference: "Daily", checkMark: true})
                } else {
                    self.setState({preference: res.data.time})
                }
            } else {
                self.setState({preference: "Daily"})
            }
        })
        .catch(function (err) {
            self.setState({preference: "Daily"})
            console.log("error: ". err);
        });
    }

    handleUpdatePreferences() {
        let self = this;
        let preference = this.state.preference;
        if (this.state.checkMark) {
            preference = "never";
        }
        // get current notification preferences and set state
        axios.post("/api/user/postNotificationPreferences", {
            userId: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken,
            preference: preference
        })
        .then(function (res) {
            self.props.addNotification("Notification preferences updated successfully.", "info");
        })
        .catch(function (err) {
            console.log("error: ". err);
            self.props.addNotification("Error updating preferences.", "error");
        });
    }

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            checkMark: !this.state.checkMark
        })
    }

    // fires when a dropDown menu item is clicked
    handleDropDownItemClick = (event, index, value) => {
        this.setState({preference: value})
    };

    render() {
        const dropDownOptions = ["Daily", "Every 2 Days", "Every 5 Days", "Weekly"];
        let dropDownItems = [];
        dropDownItems = dropDownOptions.map(item => {
            return (
                <MenuItem key={item} value={item} primaryText={item} />
            )
        });
        const dropDown = (
            <DropDownMenu key={"dropDown"}
                      value={this.state.preference}
                      onChange={this.handleDropDownItemClick}
                      underlineStyle={styles.underlineStyle}
                      anchorOrigin={styles.anchorOrigin}
                      style={{fontSize: "18px"}}
                      className={"headerDropdownWhite"}
                      id="menuDropdown"
            >
                {dropDownItems}
            </DropDownMenu>
        );

        return (
            <div className="marginTop30px center grayText">
                <div className="font16px font12pxUnder500">
                    Notify me by email when someone completes an evaluation:
                </div>
                <div>
                    {dropDown}
                </div>
                <div style={{margin: "20px 20px 10px"}}>
                    <div className="checkbox smallCheckbox whiteCheckbox"
                         onClick={this.handleCheckMarkClick.bind(this)}>
                        <img
                            alt=""
                            className={"checkMark" + this.state.checkMark}
                            src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                        />
                    </div>
                    Opt out of email notifications.
                </div>
                <RaisedButton
                    label="Update Preferences"
                    onClick={this.handleUpdatePreferences.bind(this)}
                    className="raisedButtonBusinessHome"
                    style={{margin: '20px auto'}}
                />
                {this.props.loadingUpdateSettings ? <div className="center"><CircularProgress color="white" style={{marginTop: "10px"}}/></div> : null}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
