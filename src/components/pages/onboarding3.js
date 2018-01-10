"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {updateGoals} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';

class Onboarding3 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [
                {
                    title: "Get a Full-Time Job",
                    selected: false
                },
                {
                    title: "Find an Internship",
                    selected: false
                },
                {
                    title: "Find Part-Time/Contract Work",
                    selected: false
                },
                {
                    title: "Discover Your Dream Job",
                    selected: false
                },
                {
                    title: "Explore Emerging Career Path",
                    selected: false
                },
                {
                    title: "Learn About New Technologies",
                    selected: false
                },
                {
                    title: "Learn New Skills",
                    selected: false
                },
                {
                    title: "Improve Your Current Skills",
                    selected: false
                },
                {
                    title: "Build Your Portfolio",
                    selected: false
                },
                {
                    title: "Start a Business",
                    selected: false
                }
            ],
        }
    }

    handleGoalClick(goal) {
        if (this.state.goals !== undefined) {
            for (let i = 0; i < this.state.goals.length; i++) {
                let g = this.state.goals[i];
                if (goal === g) {
                    if (goal.selected) {
                        goal.selected = false;
                    } else {
                        goal.selected = true;
                    }
                    let area = this.state.goals[i];
                    this.setState({area: goal});
                    break;
                }
            }
        }
    }

    handleButtonClick() {
        let goals = [];
        for (let i = 0; i < this.state.goals.length; i++) {
            if (this.state.goals[i].selected) {
                goals.push(this.state.goals[i].title);
            }
        }
        console.log(goals);
        if (goals.length > 0) {
            this.props.updateGoals(this.props.currentUser, goals);
        } else {
            browserHistory.push('/');
            window.scrollTo(0, 0);
        }
    }

    render() {

        const style = {
            title: {
                topTitle: {
                    margin: '20px 0 10px 0',
                },
                divider: {
                    position: 'relative',
                    marginBottom: '20px',
                },
                text: {
                    marginBottom: '30px',
                }
            },
            iconLi: {
                marginRight: '90px',
            }
        };

        let goals = undefined;
        if (this.state.goals !== undefined) {
            let key = 0;
            let self = this;
            goals = this.state.goals.map(function (goal) {
                key++;
                return (
                    <li key={key} className="clickableNoUnderline"
                        onClick={() => self.handleGoalClick(goal)}>
                        {goal.selected ?
                            <div className="onboardingPage2Text2Background center">
                                <div className="smallText onboardingPage1Text2">
                                    {goal.title}
                                </div>
                            </div>
                            :
                            <div className="gradientBorderPurple center" style={{marginTop: '20px'}}>
                                <div className="onboardingPage2Text3 smallText">
                                    {goal.title}
                                </div>
                            </div>
                        }
                    </li>
                );
            });
        }

        return (
            <div style={{marginBottom: '50px'}}>
                <div className="onboardingPage2Text mediumText center" style={style.title.topTitle}>
                    What Are Your Goals?
                </div>
                <div style={style.title.divider}>
                    <div className="onboarding2DividerLeft" style={{bottom: "0"}}/>
                    <div className="onboarding2DividerRight" style={{bottom: "0"}}/>
                </div>
                <div className="smallText center" style={style.title.text}>
                    Select All That Apply.
                </div>
                <div>
                    {goals ?
                        <ul className="onboardingGoalsListContainer">
                            {goals}
                        </ul>
                        : null}
                </div>
                <div className="center">
                    <button className="onboardingPage2Button" onClick={this.handleButtonClick.bind(this)}>
                        <div className="smallText2 onboardingPage1Text2">
                            Next
                        </div>
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateGoals
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding3);
