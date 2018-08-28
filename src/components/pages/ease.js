"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {  } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import MetaTags from 'react-meta-tags';
import { goTo } from "../../miscFunctions";

import "./ease.css";

class Ease extends Component {
    constructor(props) {
        super(props);

        this.state = {
            position: "Content Marketer"
        }
    }

    // create the dropdown for the different positions
    makeDropdown(position) {
        const positionNames = ["Content Marketer", "Web Developer", "Graphic Designer", "Digital Media Buyer or Planner", "Copywriting Marketer"];

        // create the stage name menu items
        const positions = positionNames.map(pos => {
            return (
                <MenuItem
                    value={pos}
                    key={`position${pos}`}
                >
                    { pos }
                </MenuItem>
            )
        });

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite font20px font16pxUnder500",
                    icon: "selectIconWhiteImportant selectIconMargin"
                }}
                value={position}
                onChange={this.handleChangePosition(position)}
                key={`position`}
            >
                { positions }
            </Select>
        );
    }

    // handle a click on position
    handleChangePosition = position => event => {
        this.setState({position: event.target.value});
    }

    handleSignUp() {
        const position = this.state.position;
        let URL = "/signup?code=";
        let code = "";
        if (position === "Content Marketer") {
            code = "d08d646c25";
        } else if (position === "Web Developer") {
            code = "215391f4c5";
        } else if (position === "Graphic Designer") {
            code = "cc53e5a6f4";
        } else if (position === "Digital Media Buyer or Planner") {
            code = "1269aec924";
        } else if (position === "Copywriting Marketer") {
            code = "fef356ac1e";
        }

        URL += code;
        goTo(URL);
    }

    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen center">
                <MetaTags>
                    <title>Ease | Moonshot</title>
                    <meta name="description" content="Get started with the Ease evaluation." />
                </MetaTags>
                <div className="marginTop40px">
                    <img src={"/logos/EaseLogo" + this.props.png} styleName="easeLogo"/>
                </div>
                <div className="font18px font16pxUnder500 marginTop10px marginBottom10px primary-cyan" style={{width: "88%", margin:"auto"}}>
                    Select the position you would like to apply for below.
                </div>
                <div className="font30px font16pxUnder400 marginTop20px marginBottom20px">
                    {this.makeDropdown(this.state.position)}
                </div>
                <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-6px font16px primary-white" onClick={this.handleSignUp.bind(this)} style={{padding: "5px 17px"}}>
                    {"Sign Up"}
                </button>
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


export default connect(mapStateToProps, mapDispatchToProps)(Ease);
