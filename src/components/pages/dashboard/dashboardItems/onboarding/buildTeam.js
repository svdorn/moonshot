"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification, postBusinessInterests } from "../../../../../actions/usersActions";
import { CircularProgress } from "material-ui";
import { button } from "../../../../../classes";

import "../../dashboard.css";

class BuildTeam extends Component {
    constructor(props) {
        super(props);

        this.state = {
            choices: [
                {
                    text: "Scaling your culture",
                    selected: false
                },
                {
                    text: "Identifying top talent before Facebook and Google",
                    selected: false
                },
                {
                    text: "Increasing diversity",
                    selected: false
                },
                {
                    text: "Replicating proven performers at your company",
                    selected: false
                },
                {
                    text: "Reducing turnover",
                    selected: false
                },
                {
                    text: "Creating a hiring process that constantly learns and improves",
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
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <div className="center">
                        Which of these is most interesting to you?
                        <div className="primary-cyan">Your choice(s) help us know where to focus</div>
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
                            See What{"'"}s Next &#8594;
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
