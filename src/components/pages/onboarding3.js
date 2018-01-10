"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {updateGoals, endOnboarding} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import axios from 'axios';

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
            },
            icons: {
                paddingBottom: '15px',

            },
        };

        return (
            <div style={{marginBottom: '50px'}}>
                <div className="onboardingPage3TextTitle mediumText center" style={style.title.topTitle}>
                    Start Building Your Profile
                </div>
                <div style={style.title.divider}>
                    <div className="onboarding3DividerLeft" style={{bottom: "0"}}/>
                    <div className="onboarding3DividerRight" style={{bottom: "0"}}/>
                </div>
                <div className="smallText center" style={style.title.text}>
                    The more complete your profile, the more appealing you look to employers.<br/>
                    <a href="#" target="_blank">View an example profile</a>
                </div>
                <div className="center">
                    <img src="/icons/Portfolio.png" className="onboardingIcons" style={style.icons}/>
                    <div className="onboardingPage3Text smallText2" style={{display: 'inline-block'}}><b>Personal</b></div>
                </div>

                <div className="horizCenteredList">
                    <li style={style.leftInput}>
                        Date of Birth
                        <input />
                        Bio
                        <input />
                        Description
                        <input />
                    </li>
                    <li style={style.rightInput}>
                        Location
                        <input />
                        <input />
                        <input />
                        <input />
                    </li>
                </div>

                <div className="center">
                    <img src="/icons/GraduationHat.png" className="onboardingIcons" style={style.icons}/>
                    <div className="onboardingPage3Text smallText2" style={{display: 'inline-block'}}><b>Education</b></div>
                </div>
                <div className="center">
                    <button className="onboardingPage3Button" onClick={this.handleButtonClick.bind(this)}>
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
