"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction, addNotification } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";
import { button } from "../../../../classes";
import HoverTip from "../../../miscComponents/hoverTip";
import clipboard from "clipboard-polyfill";

import "../dashboard.css";


class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // list of other admins that are in this business
            adminList: undefined,
            // unique name for the business for the apply page
            uniqueName: undefined,
            // if there was an error fetching the data for this box
            fetchDataError: false
        };
    }


    componentDidMount() {
        const self = this;

        const { _id, verificationToken, businessInfo } = this.props.currentUser;
        const query = {
            params: {
                userId: _id,
                verificationToken,
                businessId: businessInfo.businessId,
                excludeSelf: true
            }
        }

        // get a list of the names of other admins for the account
        axios.get("/api/business/adminList", query)
        .then(response => {
            if (propertyExists(response, ["data", "adminList"]) && Array.isArray(response.data.adminList)) {
                self.setState({ adminList: response.data.adminList });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            self.setState({ fetchDataError: true });
        });

        // get the business unique name for the apply link
        axios.get("/api/business/uniqueName", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(response => {
            if (response && response.data && response.data.uniqueName) {
                self.setState({ uniqueName: response.data.uniqueName });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(function (err) {
            self.setState({ fetchDataError: true });
        });
    }


    copyLink() {
        let URL = "https://moonshotinsights.io/apply/" + this.state.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard!", "info");
    }


    render() {
        // return error message if errored out
        if (this.state.fetchDataError) {
            return <div className="fully-center" style={{width:"100%"}}>Error fetching data.</div>;
        }

        // return progress bar if not ready yet
        if (!Array.isArray(this.state.adminList) || !this.state.uniqueName) {
            return (
                <div className="fully-center">
                    <CircularProgress style={{ color: primaryCyan }} />
                </div>
            );
        }

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Account</div>
            </div>
        );

        let names = [];
        this.state.adminList.forEach((n, index) => {
            names.push(n);
            names.push(<br key={"br" +index}/>);
        });

        const content = (
            <div style={{padding: "5px 14px"}}>
                <div
                    className="clickable primary-cyan inline-block"
                    onClick={() => goTo(`/apply/${this.state.uniqueName}`)}
                >
                    Candidate Invite Page
                </div><br/>
                <div>
                    <span
                        className="primary-cyan clickable"
                        onClick={this.copyLink.bind(this)}
                    >
                        Copy Link
                    </span>
                    <div style={{display:"inline-block", width: "20px"}}/>
                    <div className="inline-block underline-hover primary-white default-cursor">
                        Where to Embed?
                    </div>
                    <HoverTip
                        style={{marginTop:"25px", marginLeft:"-110px"}}
                        text="ATS, emails, automated messages, or other communications with candidates"
                    />
                </div>
                <div
                    className="clickable primary-cyan inline-block"
                    onClick={() => this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL")}
                >
                    Email Template
                </div>

                <br/>

                <div
                    className={button.cyan + " primary-white"}
                    style={{marginTop: "20px"}}
                    onClick={() => this.props.generalAction("OPEN_ADD_ADMIN_MODAL")}
                >
                    Add Admin
                </div>
                <div style={{display:"inline-block", width: "20px"}}/>
                <div className="inline-block underline-hover primary-white default-cursor">
                    Who to add?
                </div>
                <HoverTip
                    sourceTriangle={false}
                    style={{marginTop:"49px", marginLeft:"-100px"}}
                    text="Hiring managers, recruiters, executives, and anyone involved in hiring decisions"
                />
                { /*
                    <br/>
                    <div className="pointer inline-block">
                        { this.state.adminList.length } other admin{this.state.adminList.length === 1 ? "" : "s"}
                    </div>
                    { this.state.adminList.length > 0 ?
                        <HoverTip
                            style={{marginLeft:"10px",whiteSpace:"nowrap"}}
                            text={names}
                            sourceTriangle={false}
                        />
                        : null
                    }
                */ }
            </div>
        );

        const smallCTA = (
            <div styleName="box-cta" onClick={() => goTo("/settings")}>
                Update Settings <img src={`/icons/LineArrow${this.props.png}`} />
            </div>
        );

        return (
            <div>
                { header }
                { content }
                { smallCTA }
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
        generalAction,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Account);
