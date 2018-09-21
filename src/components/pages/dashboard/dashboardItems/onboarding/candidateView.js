"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../../actions/usersActions";
import {  } from "../../../../../miscFunctions";

import PsychSlider from "../../../evaluation/psychSlider";

import "../../dashboard.css";


class CandidateView extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="inline-block" styleName="onboarding-info candidate-view">
                <div>
                    {"Candidates will take a 12 minute quiz that determines their personality. It will involve a series of questions that look like this:"}
                </div>
                <div>
                    <PsychSlider
                        width={200}
                        height={100}
                        backgroundColor={"#393939"}
                        className="center"
                        updateAnswer={() => {}}
                        questionId={"1"}
                    />
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(CandidateView);
