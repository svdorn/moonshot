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
                <Carousel
                    frames={[frame1, frame2]}
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
