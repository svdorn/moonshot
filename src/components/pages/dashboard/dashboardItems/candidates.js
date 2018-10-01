"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../actions/usersActions";
import {  } from "../../../../miscFunctions";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import "../dashboard.css";


const times = [ "7 Days", "2 Weeks", "1 Month", "3 Months" ];


class Candidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            timeToGraph: "7 Days"
        };
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
