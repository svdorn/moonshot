"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {updateGoals, endOnboarding} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';

class Onboarding3 extends Component {
    constructor(props) {
        super(props);

        this.state = {}
    }


    handleButtonClick() {
        this.props.endOnboarding();
        browserHistory.push('/');
        window.scrollTo(0,0);
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
        updateGoals,
        endOnboarding
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding3);
