"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { changeAutomateInvites } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";
import Carousel from "../../../../miscComponents/carousel";


class ManualInvite extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    componentWillMount() {
        this.props.changeAutomateInvites({
            header: "How to Invite Applicants",
            lastSubStep: true,
            nextPage: null
        });
    }


    render() {
        const frame1 = (
            <img
                src={`/images/AddCandidateCarousel1${this.props.png}`}
                className="manual-add-example"
            />
        );
        const frame2 = (
            <img
                src={`/images/AddCandidateCarousel2${this.props.png}`}
                className="manual-add-example"
            />
        )
        return (
            <div className="manual-invite">
                <div style={{textAlign: "left", marginBottom: "20px"}}>
                    We will update you with options for integrations. You can
                    always manually invite candidates as seen below.
                </div>
                <Carousel
                    frames={[frame1, frame2]}
                    transitionDuration={500}
                />
                { this.props.previousNextArea }
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
        changeAutomateInvites
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ManualInvite);
