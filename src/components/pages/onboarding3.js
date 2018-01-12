"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {updateInfo, endOnboarding} from "../../actions/usersActions";
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
        let eduInfo = [];

        let inSchool = false;

        if (user && user.info) {
            let info = user.info;
            location = info.location ? info.location : "";
            birthDate = info.birthDate ? info.birthDate : "";
            desiredJobs = info.desiredJobs ? info.desiredJobs : "";
            title = info.title ? info.title : "";
            bio = info.bio ? info.bio : "";
            willRelocateTo = info.willRelocateTo ? info.willRelocateTo : "";
            inSchool = info.inSchool ? info.inSchool : false;

            let links = info.links;
            if (links) {
                links.forEach(function(link, linkIdx) {
                    if (link.displayString == "GitHub") {
                        gitHub = link.url;
                    } else if (link.displayString == "LinkedIn") {
                        linkedIn = link.url;
                    } else if (link.displayString == "Personal") {
                        personal = link.url;
                    }
                });
            }

            let eduArray = info.education;
            if (eduArray) {
                eduInfo = eduArray.map(function(edu) {
                    return {
                        school: edu.school ? edu.school : "",
                        majors: edu.majors ? edu.majors : "",
                        minors: edu.minors ? edu.minors : "",
                        endDate: edu.endDate ? edu.endDate : "",
                    };
                });
            }
        }

        this.state = {
            ...this.state,
            location, birthDate, desiredJobs, bio, gitHub, title,
            linkedIn, personal, willRelocateTo, eduInfo, inSchool
        }
    }

    handleButtonClick() {
        this.props.endOnboarding();

        const state = this.state;

        const inSchool = state.inSchool;
        const location = state.location;
        const birthDate = state.birthDate;
        const desiredJobs = state.desiredJobs;
        const title = state.title;
        const bio = state.bio;
        const willRelocateTo = state.willRelocateTo;
        const links = [
            {url: state.gitHub, displayString: "GitHub"},
            {url: state.linkedIn, displayString: "LinkedIn"},
            {url: state.personal, displayString: "Personal"}
        ];
        const education = state.eduInfo;
        this.props.updateInfo(this.props.currentUser, {
            location, birthDate, desiredJobs, title,
            bio, links, willRelocateTo, education, inSchool
        });
        browserHistory.push('/');
        window.scrollTo(0,0);
    }

    addEducationArea() {
        let eduInfo = this.state.eduInfo.slice();
        eduInfo.push({
            school: "",
            majors: "",
            minors: "",
            endDate: "",
        })

        this.setState({
            ...this.state,
            eduInfo
        })
    }

    removeEducationArea(e) {
        const eduIdx = parseInt(e.target.attributes.eduidx.value);
        const oldEduInfo = this.state.eduInfo;

        let eduInfo = oldEduInfo.slice(0, eduIdx).concat(oldEduInfo.slice(eduIdx + 1));

        this.setState({
            ...this.state,
            eduInfo
        }, function() {
            console.log(this.state);
        });
    }

    handleInputChange(e, field) {
        const updatedField = {};
        updatedField[field] = e.target.value;

        this.setState({
            ...this.state,
            ...updatedField
        })
    }

    handleEduInputChange(e, field) {
        const eduIdx = parseInt(e.target.attributes.eduidx.value);
        let eduInfo = this.state.eduInfo.slice();
        eduInfo[eduIdx][field] = e.target.value;

        this.setState({
            ...this.state,
            ...eduInfo
        })
    }

    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            inSchool: !this.state.inSchool
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

        // make the education uls
        let eduInfo = this.state.eduInfo;
        let eduIdx = -1;
        let self = this;
        let educationUls = eduInfo.map(function(edu) {
            eduIdx++;
            return (
                <div key={eduIdx + "div"}>
                    <ul className="horizCenteredList" key={eduIdx + "ul"}>
                        <li className="onboardingLeftInput" key={eduIdx + "left"}>
                            <span>School</span><br/>
                            <input
                                type="text"
                                eduidx={eduIdx}
                                className="greenInput"
                                key={eduIdx + "school"}
                                placeholder="e.g. Columbia University"
                                value={self.state.eduInfo[eduIdx].school}
                                onChange={(e) => self.handleEduInputChange(e, "school")}
                            /> <br/>
                            <span>Graduation Date</span><br/>
                            <input
                                type="text"
                                eduidx={eduIdx}
                                key={eduIdx + "date"}
                                className="greenInput"
                                placeholder="e.g. May 2020"
                                value={self.state.eduInfo[eduIdx].endDate}
                                onChange={(e) => self.handleEduInputChange(e, "endDate")}
                            /> <br/>
                        </li>
                        <li className="inputSeparator" />
                        <li className="onboardingRightInput" key={eduIdx + "right"}>
                            <span>{"Major(s)"}</span><br/>
                            <input
                                type="text"
                                eduidx={eduIdx}
                                className="greenInput"
                                key={eduIdx + "majors"}
                                placeholder="e.g. Computer Science"
                                value={self.state.eduInfo[eduIdx].majors}
                                onChange={(e) => self.handleEduInputChange(e, "majors")}
                            /> <br/>
                            <span>{"Minor(s)"}</span><br/>
                            <input
                                type="text"
                                eduidx={eduIdx}
                                className="greenInput"
                                key={eduIdx + "minors"}
                                placeholder="e.g. Economics"
                                value={self.state.eduInfo[eduIdx].minors}
                                onChange={(e) => self.handleEduInputChange(e, "minors")}
                            /> <br/>
                        </li>
                    </ul>
                    <div className="center">
                        <button className="greenButton" eduidx={eduIdx} onClick={(e) => self.removeEducationArea(e)}>
                            Remove school
                        </button>
                    </div>
                </div>
            );
        });

        return (
            <div style={{marginBottom: '50px'}}>
                <div className="onboardingPage3TextTitle mediumText center" style={style.title.topTitle}>
                    Start Building Your Profile
                </div>
                <div style={style.title.divider}>
                    <div className="onboarding3DividerLeft" style={{bottom: "0"}}/>
                    <div className="onboarding3DividerRight" style={{bottom: "0"}}/>
                </div>
                <div className="smallText2 center" style={style.title.text}>
                    The more complete your profile, the more appealing you look to employers.<br/>
                    <a href="#" target="_blank" className="onboardingPage3Link">
                        View an example profile
                    </a>
                </div>
                <div className="center">
                    <img src="/icons/Portfolio.png" className="onboardingIcons" style={style.icons}/>
                    <div className="onboardingPage3Text smallText2" style={{display: 'inline-block'}}><b>Personal</b></div>
                </div>

                <div className="horizCenteredList">
                    <li className="onboardingLeftInput">
                        <span>Date of Birth</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="mm/dd/yyyy"
                            value={this.state.birthDate}
                            onChange={(e) => this.handleInputChange(e, "birthDate")}
                        /> <br/>
                        <span>Location</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="City, State, Country"
                            value={this.state.location}
                            onChange={(e) => this.handleInputChange(e, "location")}
                        /> <br/>
                        <span>Willing to relocate to</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="e.g. San Francisco, East Coast..."
                            value={this.state.willRelocateTo}
                            onChange={(e) => this.handleInputChange(e, "willRelocateTo")}
                            /> <br/>
                        <span>{"Desired Job(s)"}</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="e.g. VR/AR Developer..."
                            value={this.state.desiredJobs}
                            onChange={(e) => this.handleInputChange(e, "desiredJobs")}
                        /> <br/>
                    </li>
                    <li className="inputSeparator" />
                    <li className="onboardingRightInput">
                        <span>Title</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="e.g. Front End Developer passionate about UX"
                            value={this.state.title}
                            onChange={(e) => this.handleInputChange(e, "title")}
                        /> <br/>
                        <span>Bio</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="e.g. I have been creating virtual reality..."
                            value={this.state.bio}
                            onChange={(e) => this.handleInputChange(e, "bio")}
                        /> <br/>
                        <span>Links</span><br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="LinkedIn Profile"
                            value={this.state.linkedIn}
                            onChange={(e) => this.handleInputChange(e, "linkedIn")}
                        /> <br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="GitHub Profile"
                            value={this.state.gitHub}
                            onChange={(e) => this.handleInputChange(e, "gitHub")}
                        /> <br/>
                        <input
                            type="text"
                            className="greenInput"
                            placeholder="Personal Site"
                            value={this.state.personal}
                            onChange={(e) => this.handleInputChange(e, "personal")}
                        /> <br/>
                    </li>
                </div>

                <div className="center">
                    <img src="/icons/GraduationHat.png" className="onboardingIcons" style={style.icons}/>
                    <div className="onboardingPage3Text smallText2" style={{display: 'inline-block'}}><b>Education</b></div>
                </div>

                {educationUls}

                <div className="center onboardingPage3">
                    <button className="greenButton" onClick={this.addEducationArea.bind(this)}>
                        Add another school
                    </button><br/>
                    <div className="greenCheckbox" onClick={this.handleCheckMarkClick.bind(this)}>
                        <img
                            className={"checkMark"  + this.state.inSchool}
                            src="/icons/CheckMark.png"
                            height={15}
                            width={15}
                        />
                    </div>
                    I am currently in school<br/>
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
        updateInfo,
        endOnboarding
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding3);
