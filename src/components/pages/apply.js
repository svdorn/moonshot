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
            company: "",
            logo: "",
            noPositons: false
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

        let self = this;
        // get the positions from the database with the name and signup code
        axios.get("/api/business/positionsForApply", {
            params: {
                name: company
            }
        })
        .then(function (res) {
            self.positionsFound(res.data.positions, res.data.logo, res.data.businessName);
        })
        .catch(function (err) {
            goTo("/");
            this.props.addNotification("Couldn't get the company you're trying to apply for.", "error");
        });
    }

    // call this after positions are found from back end
    positionsFound(positions, logo, company) {
        if (Array.isArray(positions) && positions.length > 0) {
            const position = positions[0].name;
            this.setState({ positions, position, logo, company });
        } else {
            this.setState({ noPositions: true });
        }
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

        const code = this.state.positions[position].code;

        URL += code;
        goTo(URL);
    }

    render() {
        return (
            <div className="jsxWrapper blackBackground fillScreen center">
                {this.state.company ?
                    <div>
                        <div className="marginTop50px marginBottom30px">
                            <div className="font38px font30pxUnder700 font24pxUnder500 primary-white">{this.state.company} Evaluation</div>
                            <div className="font16px font14pxUnder700 font12pxUnder500 secondary-gray" styleName="powered-by">Powered by Moonshot Insights</div>
                        </div>
                        <div className="font16px font14pxUnder500 primary-cyan" style={{width: "88%", margin:"auto"}}>
                            Select the position you would like to apply for.
                        </div>
                        <div className="font30px font16pxUnder400 marginBottom30px">
                            {this.makeDropdown(this.state.position)}
                        </div>
                        <button className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700 font14pxUnder500" styleName="next-button" onClick={this.handleSignUp.bind(this)} style={{padding: "6px 20px"}}>
                            <span>Next &#8594;</span>
                        </button>
                    </div>
                    :
                    <div>
                        <div className="font18px font16pxUnder700 font14pxUnder500 secondary-gray marginTop30px">
                            Loading...
                        </div>
                    </div>
                }
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
