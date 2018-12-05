"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    addNotification,
    postBusinessInterests,
    updateStore
} from "../../../../../actions/usersActions";
import { CircularProgress } from "material-ui";
import { button } from "../../../../../classes";
import ShiftArrow from "../../../../miscComponents/ShiftArrow";

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
                    text: "Identifying top talent before big tech companies do",
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
        const { choices } = this.state;
        const { currentUser } = this.props;

        let choiceArr = [];

        for (let i = 0; i < choices.length; i++) {
            if (choices[i].selected) {
                choiceArr.push(choices[i].text);
            }
        }

        // if there is an admin logged in, save their response and move on
        if (currentUser) {
            let { _id, verificationToken, popups } = currentUser;
            const businessId = currentUser.businessInfo.businessId;
            if (!popups) {
                popups = {};
            }
            popups.businessInterests = false;

            this.props.postBusinessInterests(_id, verificationToken, businessId, choiceArr, popups);
        }
        // if no one is logged in, move to the next step in onboarding
        else {
            this.props.updateStore("selectedJobsToBeDone", choiceArr);
        }
    }

    makeChoices() {
        const choices = this.state.choices.map(choice => {
            const selectedClassName = choice.selected ? "selected" : "";
            return (
                <div
                    className={"method-box " + selectedClassName}
                    key={choice.text}
                    onClick={() => this.clickChoice(choice.text)}
                >
                    {choice.text}
                </div>
            );
        });
        return <div className="method-boxes">{choices}</div>;
    }

    render() {
        return (
            <div styleName="item-padding">
                <div styleName="build-team-container">
                    <div className="center">
                        <div className="primary-cyan">
                            Which of these is most interesting to you?
                        </div>
                        <div className="primary-white">
                            Your choice(s) help us know where to focus.
                        </div>
                    </div>
                    <div className="build-team">
                        <div>{this.makeChoices()}</div>
                    </div>
                    <div styleName="got-it-area">
                        {this.props.loading ? (
                            <CircularProgress color="#76defe" />
                        ) : (
                            <div className={button.cyan} onClick={this.handleClick}>
                                See What{"'"}s Next <ShiftArrow />
                            </div>
                        )}
                    </div>
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
    return bindActionCreators(
        {
            addNotification,
            postBusinessInterests,
            updateStore
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BuildTeam);
