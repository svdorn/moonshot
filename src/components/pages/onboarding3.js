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

        let user = this.props.currentUser;

        let city = "";
        let state = "";
        let country = "";
        let zip = "";
        let birthDate: "";
        let bio: "";
        let description: "";

        if (user && user.info) {
            city = user.info.city ? user.info.city : "";
            state = user.info.state ? user.info.state : "";
            country = user.info.country ? user.info.country : "";
            zip = user.info.zip ? user.info.zip : "";
            birthDate = user.info.birthDate ? user.info.birthDate : "";
            bio = user.info.bio ? user.info.bio : "";
            description = user.info.description ? user.info.description : "";
        }

        this.state = {
            city, state, country, zip, birthDate, bio, description,
            educationAreas: [(
                <ul className="horizCenteredList">
                    <li className="onboardingLeftInput">
                        School<br/>
                        <input /> <br/>
                        Graduation Date<br/>
                        <input /><br/>
                    </li>
                    <li className="onboardingRightInput">
                        {"MAJORS(s), minors"}<br/>
                        <input /><br/>
                        G.P.A.<br/>
                        <input /><br/>
                    </li>
                </ul>
            )]
        }
    }

    handleButtonClick() {
        this.props.endOnboarding();
        browserHistory.push('/');
        window.scrollTo(0,0);
    }

    addEducationArea() {
        console.log("adding education area");
        // copy the old education area array
        let educationAreas = this.state.educationAreas.slice();

        educationAreas.push(
            <ul className="horizCenteredList">
                <li className="onboardingLeftInput">
                    School<br/>
                    <input /> <br/>
                    Graduation Date<br/>
                    <input /><br/>
                </li>
                <li className="onboardingRightInput">
                    {"MAJORS(s), minors"}<br/>
                    <input /><br/>
                    G.P.A.<br/>
                    <input /><br/>
                </li>
            </ul>
        );

        this.setState({
            ...this.state,
            educationAreas
        })
    }

    handleInputChange(e, field) {
        const updatedField = {};
        updatedField[field] = e.target.value;

        this.setState({
            ...this.state,
            ...updatedField
        })
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
            leftInput: { marginLeft:"80px" },
            rightInput: { marginRight:"80px" },
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
                    <li className="onboardingLeftInput">
                        Date of Birth<br/>
                        <input type="text" value={this.state.birthDate} onChange={(e) => this.handleInputChange(e, "birthDate")}/> <br/>
                        Bio<br/>
                        <input /><br/>
                        Description<br/>
                        <input /><br/>
                    </li>
                    <li className="onboardingRightInput">
                        Location<br/>
                        <input /><br/>
                        <input /><br/>
                        <input /><br/>
                        <input /><br/>
                    </li>
                </div>

                <div className="center">
                    <img src="/icons/GraduationHat.png" className="onboardingIcons" style={style.icons}/>
                    <div className="onboardingPage3Text smallText2" style={{display: 'inline-block'}}><b>Education</b></div>
                </div>

                {this.state.educationAreas}

                <button onClick={this.addEducationArea.bind(this)}>
                    Add another school
                </button>


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
