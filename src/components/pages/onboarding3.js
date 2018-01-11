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

        let location = "";
        let birthDate: "";
        let desiredJobs = "";
        let bio = "";
        let title = "";
        let gitHub = "";
        let linkedIn = "";
        let personal = "";
        let willRelocateTo = "";

        if (user && user.info) {
            let info = user.info;
            location = info.location ? info.location : "";
            birthDate = info.birthDate ? info.birthDate : "";
            desiredJobs = info.desiredJobs ? info.desiredJobs : "";
            title = info.title ? info.title : "";
            bio = info.bio ? info.bio : "";
            willRelocateTo = info.willRelocateTo ? info.willRelocateTo : "";

            if (info.links) {
                let links = info.links;
                gitHub = links.gitHub ? links.gitHub : "";
                linkedIn = links.linkedIn ? links.linkedIn : "";
                personal = links.personal ? links.personal : "";
            }
        }

        this.state = {
            location, birthDate, desiredJobs, title, gitHub, linkedIn, personal,
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
                        Location<br/>
                        <input type="text" value={this.state.location} onChange={(e) => this.handleInputChange(e, "location")}/> <br/>
                        Willing to relocate to<br/>
                        <input type="text" value={this.state.willRelocateTo} onChange={(e) => this.handleInputChange(e, "willRelocateTo")}/> <br/>
                        {"Desired Job(s)"}<br/>
                        <input type="text" value={this.state.desiredJobs} onChange={(e) => this.handleInputChange(e, "desiredJobs")}/> <br/>
                    </li>
                    <li className="onboardingRightInput">
                        Title<br/>
                        <input type="text" value={this.state.title} onChange={(e) => this.handleInputChange(e, "title")}/> <br/>
                        Bio<br/>
                        <input type="text" value={this.state.bio} onChange={(e) => this.handleInputChange(e, "bio")}/> <br/>
                        Links<br/>
                        <input type="text" value={this.state.linkedIn} onChange={(e) => this.handleInputChange(e, "linkedIn")}/> <br/>
                        <input type="text" value={this.state.gitHub} onChange={(e) => this.handleInputChange(e, "gitHub")}/> <br/>
                        <input type="text" value={this.state.personal} onChange={(e) => this.handleInputChange(e, "personal")}/> <br/>
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
