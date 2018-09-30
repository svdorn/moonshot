"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {  } from "../../../../actions/usersActions";

class BuildTeam extends Component {
    constructor(props) {
        super(props);

        this.state = {
            choices: [
                {
                    text: "Identifying top talent before Facebook and Google",
                    selected: false
                },
                {
                    text: "Replicating proven performers at your company",
                    selected: false
                },
                {
                    text: "Scaling your culture",
                    selected: false
                },
                {
                    text: "Creating a hiring process that constantly learns and improves",
                    selected: false
                },
                {
                    text: "Increasing diversity",
                    selected: false
                },
                {
                    text: "Reducing turnover",
                    selected: false
                }
            ]
        };
    }

    clickChoice(choice) {
        let choices = this.state.choices;

        const index = choices.findIndex(txt => {
            return txt.text.toString() === choice.toString();
        });

        choices[index].selected = !choices[index].selected;

        this.setState({ choices });
    }

    makeChoices() {
        const choices = this.state.choices.map(choice => {
            if(choice.selected) {
                var selectedClassName = "selected";
            }
            return (
                <div className={"method-box " + selectedClassName} key={choice.text} onClick={() => this.clickChoice(choice.text)}>
                    { choice.text }
                </div>
            );
        });
        return (
            <div className="method-boxes">
                { choices }
            </div>
        )
    }

    render() {
        return (
            <div className="build-team">
                <div>{ this.makeChoices() }</div>
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


export default connect(mapStateToProps, mapDispatchToProps)(BuildTeam);
