"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { addNotification } from "../../actions/usersActions";
import { makePossessive } from "../../miscFunctions";
import MetaTags from 'react-meta-tags';
import { goTo } from "../../miscFunctions";
import HoverTip from "../miscComponents/hoverTip";
import axios from 'axios';

import "./apply.css";

const checklistInfo = [
    {
        title: "What Candidates See",
        step: 1
    },
    {
        title: "What You'll See",
        step: 2
    },
    {
        title: "How It Works",
        step: 3
    },
    {
        title: "What To Do",
        step: 4
    }
];

class Apply extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            position: "",
            company: "",
            logo: "",
            noPositons: false,
            // if the user is an accountAdmin of this company
            admin: false,
            // if the business has set up the page
            pageSetUp: undefined
        }
    }

    /* fetch the positions and codes and set the position field to be the first position in the array */
    componentDidMount() {
        let self = this;
        // get the company name from the url
        try { var company = this.props.params.company; }
        catch (e) {
            goTo("/");
            self.props.addNotification("Couldn't get the company you're trying to apply for.", "error");
        }

        if (this.props.currentUser && this.props.currentUser.userType === "accountAdmin" && this.props.currentUser.businessInfo) {
            var businessId = this.props.currentUser.businessInfo.businessId;
        }

        // get the positions from the database with the name and signup code
        axios.get("/api/business/positionsForApply", {
            params: {
                name: company,
                businessId
            }
        })
        .then(function (res) {
            self.positionsFound(res.data.positions, res.data.logo, res.data.businessName, res.data.admin, res.data.pageSetUp);
        })
        .catch(function (err) {
            goTo("/");
            self.props.addNotification(err, "error");
        });
    }

    // call this after positions are found from back end
    positionsFound(positions, logo, company, admin, pageSetUp) {
        console.log("pageSetUp: ", pageSetUp);
        if (Array.isArray(positions) && positions.length > 0) {
            const position = positions[0].name;
            if (admin) { positions.push({ name: "Add more positions later" }) }
            this.setState({ positions, position, logo, company, admin, pageSetUp });
        } else {
            this.setState({ noPositions: true });
        }
    }


    // create the dropdown for the different positions
    makeDropdown(position) {
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


    adminInformation() {
        return (
            <div>
                <div>
                    <button className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700 font14pxUnder500" styleName="next-button" style={{padding: "6px 20px"}}>
                        <span>Next &#8594;</span>
                    </button>
                    <HoverTip
                        className="font14px secondary-gray"
                        style={{marginTop: "40px", marginLeft: "-6px"}}
                        text="After candidates press next, they sign up to complete your evaluation."
                        />
                </div>
                <div styleName="employer-box">
                    <div>
                        This is { makePossessive(this.state.company) } candidate invite page. When candidates click on your link, they will be taken here. New evaluations will automatically be added to your dropdown list above.
                    </div>
                    <div onClick={() => goTo("/dashboard")}>
                        Continue To Embed Your Link <img src={`/icons/ArrowBlue${this.props.png}`} />
                    </div>
                </div>
            </div>
        );
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
                        {this.state.admin ?
                            this.adminInformation()
                            :
                            <button
                                className="button noselect round-6px background-primary-cyan primary-white learn-more-text font18px font16pxUnder700 font14pxUnder500"
                                styleName="next-button"
                                onClick={this.handleSignUp.bind(this)}
                                style={{padding: "6px 20px"}}
                            >
                                <span>Next &#8594;</span>
                            </button>
                        }
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
