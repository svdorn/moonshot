"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Paper, Menu, MenuItem, Divider} from 'material-ui';

class Onboarding extends Component {

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
                <div className="onboardingPage1Text mediumText center" style={style.title.topTitle}>Select Your
                    Interests
                </div>
                <div style={style.title.divider}>
                    <div className="onboardingDividerLeft" style={{bottom: "0"}}/>
                    <div className="onboardingDividerRight" style={{bottom: "0"}}/>
                </div>
                <div className="smallText center" style={style.title.text}>What skills do you want to learn or
                    improve?
                </div>
                <div className="center">
                    <ul className="horizCenteredList onboardingListContainer">
                        <li style={style.iconLi}>
                            <img src="/icons/Cube.png" className="onboardingIcons"/>
                            <div className="onboardingIconsText center"><b>Product Design<br/>and Development</b></div>
                        </li>
                        <li style={style.iconLi}>
                            <img src="/icons/Data.png" className="onboardingIcons"/>
                            <div className="onboardingIconsText center"><b>Data</b></div>
                        </li>
                        <li>
                            <img src="/icons/Computer.png" className="onboardingIcons"/>
                            <div className="onboardingIconsText center"><b>Software<br/> Development</b></div>
                        </li>
                    </ul>
                    <ul className="horizCenteredList onboardingListContainer">
                        <li style={style.iconLi}>
                            <img src="/icons/Creation.png" className="onboardingIcons"/>
                            <div className="onboardingIconsText center"><b>Creation and<br/> Marketing</b></div>
                        </li>
                        <li>
                            <img src="/icons/Business.png" className="onboardingIcons"/>
                            <div className="onboardingIconsText center"><b>Business</b></div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
