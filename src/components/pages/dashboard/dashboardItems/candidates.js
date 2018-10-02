"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import {  } from "../../../../actions/usersActions";
import { propertyExists } from "../../../../miscFunctions";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import "../dashboard.css";


const times = [ "7 Days", "2 Weeks", "1 Month", "3 Months" ];


class Candidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // how far back to graph new candidate data
            timeToGraph: "7 Days",
            // the number of candidates that have not yet been reviewed
            newCandidates: undefined,
            // if there was an error getting any candidates data
            fetchDataError: false
        };
    }


    // load data for the number of candidates that need review as well as the
    // graph for new candidates over the last 7 days
    componentDidMount() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/candidatesAwaitingReview", query )
        .then(response => {
            if (propertyExists(response, ["data", "newCandidates"]), "number") {
                self.setState({ newCandidates: response.data.newCandidates });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            console.log(error);
            self.setState({ fetchDataError: true });
        });
    }


    // change the amount of time being graphed
    handleTimeChange = () => event => {
        console.log("here");
        this.setState({ timeToGraph: event.target.value });
    }


    render() {
        const timeOptions = times.map(time => {
            return <MenuItem value={time} key={time}>{ time }</MenuItem>;
        });

        return (
            <div>
                <div styleName="box-header">
                    <div styleName="box-title">Candidates</div>
                    <Select
                        styleName="time-selector"
                        disableUnderline={true}
                        classes={{
                            root: "position-select-root selectRootWhite myCandidatesSelect",
                            icon: "selectIconWhiteImportant",
                            select: "no-focus-change-important"
                        }}
                        value={this.state.timeToGraph}
                        onChange={this.handleTimeChange()}
                    >
                        { timeOptions }
                    </Select>
                </div>
                <div>{ this.state.newCandidates } awaiting review</div>
                <div styleName="box-cta">Review Candidates</div>
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


export default connect(mapStateToProps, mapDispatchToProps)(Candidates);
