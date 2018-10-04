"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from '../../actions/usersActions';
import clipboard from "clipboard-polyfill";
import axios from 'axios';


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
                    <div className="copy-link-footer-container">
                        <div className="copy-link-footer">
                            <img src={`/icons/Astrobot${this.props.png}`} height={50} />
                            <div className="inlineBlock secondary-gray marginLeft20px">
                                {`${this.state.name}'s candidate invite link`}
                            </div>
                            <button className="button noselect round-6px background-primary-cyan primary-white learn-more-texts inlineBlock marginLeft20px" onClick={this.copyLink} style={{padding: "3px 10px"}}>
                                <span>Copy Link</span>
                            </button>
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
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(CopyLinkFooter);
