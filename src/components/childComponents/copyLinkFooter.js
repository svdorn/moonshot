"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from '../../actions/usersActions';
import { propertyExists } from "../../miscFunctions";
import clipboard from "clipboard-polyfill";
import axios from 'axios';

import './copyLinkFooter.css';

class CopyLinkFooter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: undefined,
            uniqueName: undefined,
            candidateCount: undefined,
            fetchDataError: false,
        };
    }

    componentDidMount() {
        console.log("in here");
        let self = this;
        const user = this.props.currentUser;

        const nameQuery = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
        } };

        const countQuery = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/uniqueName", nameQuery)
        .then(function (res) {
            axios.get("/api/business/candidatesTotal", countQuery )
            .then(response => {
                if (propertyExists(response, ["data", "totalCandidates"]), "number") {
                    console.log("res: ", response.data.totalCandidates)
                    console.log("res: ", response.data);
                    self.setState({ name: res.data.name, uniqueName: res.data.uniqueName, candidateCount: response.data.totalCandidates })
                } else {
                    self.setState({ fetchDataError: true });
                }
            })
            .catch(error => {
                self.setState({ fetchDataError: true });
            });
        })
        .catch(function (err) {
            self.setState({ fetchDataError: true });
        });
    }

    copyLink = () => {
        let URL = "https://moonshotinsights.io/apply/" + this.state.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard", "info");
    }

    render() {
        console.log("candidate count: ", this.state.candidateCount)
        return (
            <div>
                {!this.state.fetchDataError && this.state.candidateCount === 0 ?
                    <div styleName={"footer-container" + (this.props.footerOnScreen ? " absolute" : "")}>
                        <div styleName="footer">
                            <img src={`/icons/Astrobot${this.props.png}`} styleName="astrobot-img" />
                            <div className="secondary-gray" styleName="text">
                                <div styleName="desktop-text">
                                    Embed {this.state.name}{"'"}s candidate invite page in your <br/>ATS, automated emails or other communications with candidates.
                                </div>
                            </div>
                            <div styleName="buttons">
                                <button styleName="button" className="button noselect round-6px background-primary-cyan primary-white" onClick={this.copyLink} style={{padding: "3px 10px"}}>
                                    <span>Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    : null
                 }
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png,
        footerOnScreen: state.users.footerOnScreen
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(CopyLinkFooter);
