"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { addNotification } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import MetaTags from 'react-meta-tags';
import { goTo } from "../../miscFunctions";
import axios from 'axios';

import "./apply.css";

class Apply extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            position: "",
            company: ""
        }
    }

    /* fetch the positions and codes and set the position field to be the first position in the array */
    componentDidMount() {
        // get the company name from the url
        try {
            var company = this.props.params.company;
        } catch (e) {
            goTo("/");
            this.props.addNotification("Couldn't get the company you're trying to apply for.", "error");
        }
        // get the positions from the database with the name and signup code
    }


    // create the dropdown for the different positions
    makeDropdown(position) {
        // create the stage name menu items
        const positions = this.state.positions.map(pos => {
            return (
                <MenuItem
                    value={pos.name}
                    key={`position${pos.name}`}
                >
                    { pos.name }
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
        let URL = "/signup?code=";
        const position = this.state.positions.findIndex(pos => {
            return pos.name.toString() === this.state.position.toString();
        });

        const code = position.code;

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
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Apply);
