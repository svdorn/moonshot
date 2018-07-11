"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import {ToolbarGroup, DropDownMenu, RaisedButton, MenuItem, Divider, Toolbar, IconMenu, IconButton} from 'material-ui';
import { bindActionCreators } from 'redux';
import {  } from '../../actions/usersActions';

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
            preference: "Daily",
            checkMark: false,
        };
    }

    componentWillMount() {
        // get current notification preferences and set state
    }

    handleCheckMarkClick() {
        console.log("here");
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
        const dropDownOptions = ["Daily", "Weekly", "Every 2 Days"]
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
                    type="submit"
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

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
