"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from '../../actions/usersActions';
import clipboard from "clipboard-polyfill";
import axios from 'axios';

import './copyLinkFooter.css';

class CopyLinkFooter extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        let self = this;
        axios.get("/api/business/uniqueName", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken
            }
        })
        .then(function (res) {
            self.setState({ name: res.data.name, uniqueName: res.data.uniqueName })
        })
        .catch(function (err) {

        });
    }

    copyLink = () => {
        let URL = "https://moonshotinsights.io/apply/" + this.state.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard.", "info");
    }

    render() {
        return (
            <div>
                {this.state.uniqueName && this.state.name ?
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
