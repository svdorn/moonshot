"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, postBusinessInterests } from "../../../../actions/usersActions";
import { CircularProgress } from "material-ui";
import { button } from "../../../../classes";

import "../dashboard.css";

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

        this.handleClick = this.handleClick.bind(this);
    }

    clickChoice(choice) {
        let choices = this.state.choices;

        const index = choices.findIndex(txt => {
            return txt.text.toString() === choice.toString();
        });

        choices[index].selected = !choices[index].selected;

        this.setState({ choices });
    }

    handleClick() {
        const choices = this.state.choices;

        let choiceArr = [];

        for (let i = 0; i < choices.length; i++) {
            if (choices[i].selected) {
                choiceArr.push(choices[i].text);
            }
        }

        // if no choices are made
        if (choiceArr.length === 0) {
            this.props.addNotification("Must select at least one interest to continue.", "error");
            return;
        }

        const userId = this.props.currentUser._id;
        const verificationToken = this.props.currentUser.verificationToken;
        const businessId = this.props.currentUser.businessInfo.businessId;
        let popups = this.props.currentUser.popups;
        if (popups) {
            popups.businessInterests = false;
        } else {
            popups = {};
            popups.businessInterests = false;
        }

        this.props.postBusinessInterests(userId, verificationToken, businessId, choiceArr, popups);
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
            <div>
                <div className="build-team-container marginTop10px marginBottom50px">
                    <div className="center font18px font16pxUnder700 font14pxUnder500">
                        Which of these is most interesting to you as you build your team?
                        <div className="font16px font14pxUnder700 font12pxUnder500">We will use this info to tune our ML models to your specific needs.</div>
                        <div className="primary-cyan font16px font14pxUnder700 font12pxUnder500">Choose at least one.</div>
                    </div>
                    <div className="build-team">
                        <div>{ this.makeChoices() }</div>
                    </div>
                    {this.props.loading ?
                        <div className="center">
                            <CircularProgress color="#76defe" />
                        </div>
                        :
                        <div
                            className={button.cyan}
                            styleName="got-it-button"
                            onClick={this.handleClick}
                        >
                            Continue
                        </div>
                    }
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        postBusinessInterests
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(BuildTeam);
