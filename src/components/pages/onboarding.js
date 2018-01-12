"use strict"
import React, { Component}  from 'react';
import { connect } from 'react-redux';
import { updateInfo, updateGoals, updateInterests, startOnboarding, endOnboarding } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Tabs, Tab } from 'material-ui/Tabs';


class Onboarding extends Component {
    constructor(props) {
        super(props);

        let interestObjects = {};
        let goals = [];

        const user = this.props.currentUser;

        if (user) {
            const info = user.info;
            if (info) {
                const userInterests = info.interests;
                if (userInterests) {
                    const interestTypes = [
                        {
                            name: "designAndDevInterests",
                            interests: [
                                "Virtual Reality",
                                "Augmented Reality",
                                "3D Printing",
                                "UX Design",
                                "IOT",
                                "Wireframing",
                                "User Testing",
                                "A/B Testing",
                                "User Research",
                                "Electrical Engineering",
                                "Mechanical Engineering",
                                "Robotics",
                                "Mobile",
                                "Web",
                                "Lean Methodology",
                                "Responsive Design"
                            ]
                        },
                        {
                            name: "dataInterests",
                            interests: [
                                "SQL",
                                "MySQL",
                                "Database Analysis",
                                "Data Security",
                                "Machine Learning",
                                "Big Data",
                                "Data Science",
                                "Data Structures",
                                "Database Administration",
                                "Database Development"
                            ]
                        },
                        {
                            name: "softwareDevInterests",
                            interests: [
                                "Angular",
                                "React",
                                "Javascript",
                                "Java",
                                "Python",
                                "Node.js",
                                "Git",
                                "AWS",
                                "REST",
                                "C",
                                "C#",
                                "C++",
                                "HTML",
                                "CSS"
                            ]
                        },
                        {
                            name: "businessInterests",
                            interests: [
                                "Google Analytics",
                                "Project Management",
                                "Agile",
                                "Data Visualization",
                                "Data Analysis",
                                "Customer Service",
                                "Startups",
                                "Entrepreneurship",
                                "CRM",
                                "Management",
                                "Communication",
                                "Problem Solving",
                                "IT Fundamentals",
                                "Salesforce",
                                "Productivity"
                            ]
                        },
                        {
                            name: "creationAndMarketingInterests",
                            interests: [
                                "Virtual Marketing",
                                "Pay Per Click",
                                "Social Media",
                                "UX",
                                "UI Design",
                                "Web Design",
                                "Photoshop",
                                "Graphic Design",
                                 "SEO",
                                "Content Marketing",
                            ]
                        }
                    ];



                    // go over each type of interest (each of which is an object which contains a list of interests)
                    interestTypes.forEach(function(interestsObj, listIndex) {
                        // for each type of interest, set the interests object to a list of interest objects
                        interestObjects[interestsObj.name] = interestsObj.interests.map(function(interest) {
                            // if the user already has that interest, mark it as selected
                            let alreadyHasInterest = userInterests.some(function(userInterest) {
                                return userInterest == interest;
                            })
                            return {
                                title: interest,
                                selected: alreadyHasInterest
                            };
                        });
                    })
                }



                // GOALS
                const userGoals = info.goals;

                const potentialGoals = [
                    "Get a Full-Time Job",
                    "Find an Internship",
                    "Find Part-Time/Contract Work",
                    "Discover Your Dream Job",
                    "Explore Emerging Career Path",
                    "Learn About New Technologies",
                    "Learn New Skills",
                    "Improve Your Current Skills",
                    "Build Your Portfolio",
                    "Start a Business"
                ];

                let goalsObjects = [];

                potentialGoals.forEach(function(goal, goalIndex) {
                    let alreadyHasGoal = userGoals.some(function(userGoal) {
                        return userGoal == goal;
                    });
                    goalsObjects.push({
                        title: goal,
                        selected: alreadyHasGoal
                    });
                });

                goals = goalsObjects;
            }
        }


        // INFO
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
            tabValue: "interests",
            ...interestObjects,
            currInterestArea: undefined,
            goals,
            location, birthDate, desiredJobs, bio, gitHub, title,
            linkedIn, personal, willRelocateTo, eduInfo, inSchool
        }
    }

    componentDidMount() {
        this.props.startOnboarding();

    }

    handleIconClick(index) {
        let chosen = undefined;
        switch (index) {
            case 1:
                chosen = this.state.designAndDevInterests;
                break;
            case 2:
                chosen = this.state.dataInterests;
                break;
            case 3:
                chosen = this.state.softwareDevInterests;
                break;
            case 4:
                chosen = this.state.creationAndMarketingInterests;
                break;
            case 5:
                chosen = this.state.businessInterests;
                break;
            default:
                break;
        }
        this.setState({
            ...this.state,
            currInterestArea: chosen
        })
    }

    handleInterestClick(interest) {
        if (this.state.currInterestArea !== undefined) {
            for (let i = 0; i < this.state.currInterestArea.length; i++) {
                let int = this.state.currInterestArea[i];
                if (int === interest) {
                    if (interest.selected) {
                        interest.selected = false;
                    } else {
                        interest.selected = true;
                    }
                    let area = this.state.currInterestArea[i];
                    this.setState({area: interest});
                    break;
                }
            }
        }
    }

    handleStep1ButtonClick() {
        this.saveInterests();
        this.setState({
            ...this.state,
            tabValue: "goals"
        })
        window.scrollTo(0, 0);
    }

    saveInterests() {
        let interests = [];
        for (let i = 0; i < this.state.designAndDevInterests.length; i++) {
            if (this.state.designAndDevInterests[i].selected) {
                interests.push(this.state.designAndDevInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.dataInterests.length; i++) {
            if (this.state.dataInterests[i].selected) {
                interests.push(this.state.dataInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.softwareDevInterests.length; i++) {
            if (this.state.softwareDevInterests[i].selected) {
                interests.push(this.state.softwareDevInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.businessInterests.length; i++) {
            if (this.state.businessInterests[i].selected) {
                interests.push(this.state.businessInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.creationAndMarketingInterests.length; i++) {
            if (this.state.creationAndMarketingInterests[i].selected) {
                interests.push(this.state.creationAndMarketingInterests[i].title);
            }
        }
        if (interests.length > 0) {
            this.props.updateInterests(this.props.currentUser, interests);
        }
    }


    // GOALS
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

    handleGoalsButtonClick() {
        this.saveGoals();

        this.setState({
            ...this.state,
            tabValue: "info"
        })
        window.scrollTo(0, 0);
    }

    saveGoals() {
        let goals = [];
        for (let i = 0; i < this.state.goals.length; i++) {
            if (this.state.goals[i].selected) {
                goals.push(this.state.goals[i].title);
            }
        }

        if (goals.length > 0) {
            this.props.updateGoals(this.props.currentUser, goals);
        }
    }


    // INFO
    handleFinishButtonClick() {
        this.saveInfo();
        this.props.endOnboarding();
        browserHistory.push('/discover');
        window.scrollTo(0,0);
    }

    saveInfo() {
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

    handleInfoInputChange(e, field) {
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


    handleTabChange = (value) => {
        console.log(value);
        this.setState({
            tabValue: value,
        });
        this.saveAllInfo();
    };

    // save everything from all onboarding pages
    saveAllInfo() {
        this.saveInterests();
        this.saveGoals();
        this.saveInfo();
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

        // INTERESTS
        let interests = undefined;
        if (this.state.currInterestArea !== undefined) {
            let key = 0;
            let self = this;
            interests = this.state.currInterestArea.map(function (interest) {
                key++;
                return (
                    <li style={{verticalAlign: "top"}} key={key}>
                        {interest.selected ?
                            <div className="onboardingPage1Text2Background clickableNoUnderline noselect"
                                onClick={() => self.handleInterestClick(interest)}>
                                <div className="smallText onboardingPage1Text2">
                                    {interest.title}
                                </div>
                            </div>
                            :
                            <div className="gradientBorderBlue center clickableNoUnderline noselect" style={{marginRight: '20px', marginTop: '20px'}}
                                onClick={() => self.handleInterestClick(interest)}>
                                <div className="onboardingPage1Text3 smallText">
                                    {interest.title}
                                </div>
                            </div>
                        }
                    </li>
                );
            });
        }

        // GOALS
        let goals = undefined;
        if (this.state.goals !== undefined) {
            let key = 0;
            let self = this;
            goals = this.state.goals.map(function (goal) {
                key++;
                return (
                    <li key={key} className="noselect">
                        {goal.selected ?
                            <div className="clickableNoUnderline onboardingPage2Text2Background center" onClick={() => self.handleGoalClick(goal)}>
                                <div className="smallText onboardingPage1Text2">
                                    {goal.title}
                                </div>
                            </div>
                            :
                            <div className="clickableNoUnderline gradientBorderPurple center" style={{marginTop: '20px'}} onClick={() => self.handleGoalClick(goal)}>
                                <div className="onboardingPage2Text3 smallText">
                                    {goal.title}
                                </div>
                            </div>
                        }
                    </li>
                );
            });
        }


        // INFO
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
            <Tabs
                className="onboardingTabs"
                value={this.state.tabValue}
                onChange={this.handleTabChange}
            >
                <Tab label="Interests" value="interests">
                <div style={{marginBottom: '50px', minWidth: '100%'}}>
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
                    <div>
                        <ul className="horizCenteredList onboardingListContainer">
                            <li style={style.iconLi} className="clickableNoUnderline"
                                onClick={() => this.handleIconClick(1)}>
                                {this.state.currInterestArea === this.state.designAndDevInterests ?
                                    <div className="gradientBorderBlue center">
                                        <div style={{padding: '5px'}}>
                                            <img src="/icons/Cube.png" className="onboardingIcons"/>
                                            <div className="onboardingIconsText center"><b>Product Design<br/>and
                                                Development</b>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <img src="/icons/Cube.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Product Design<br/>and
                                            Development</b>
                                        </div>
                                    </div>
                                }
                            </li>
                            <li style={style.iconLi} className="clickableNoUnderline"
                                onClick={() => this.handleIconClick(2)}>
                                {this.state.currInterestArea === this.state.dataInterests ?
                                    <div className="gradientBorderBlue center">
                                        <div style={{padding: '5px'}}>
                                            <img src="/icons/Data.png" className="onboardingIcons"/>
                                            <div className="onboardingIconsText center"><b>Data</b></div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <img src="/icons/Data.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Data</b></div>
                                    </div>
                                }
                            </li>
                            <li className="clickableNoUnderline" onClick={() => this.handleIconClick(3)}>
                                {this.state.currInterestArea === this.state.softwareDevInterests ?
                                    <div className="gradientBorderBlue center">
                                        <div style={{padding: '5px'}}>
                                            <img src="/icons/Computer.png" className="onboardingIcons"/>
                                            <div className="onboardingIconsText center"><b>Software<br/> Development</b>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <img src="/icons/Computer.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Software<br/> Development</b></div>
                                    </div>
                                }
                            </li>
                        </ul>
                        <ul className="horizCenteredList onboardingListContainer">
                            <li style={style.iconLi} className="clickableNoUnderline"
                                onClick={() => this.handleIconClick(4)}>
                                {this.state.currInterestArea === this.state.creationAndMarketingInterests ?
                                    <div className="gradientBorderBlue center">
                                        <div style={{padding: '5px'}}>
                                            <img src="/icons/Creation.png" className="onboardingIcons"/>
                                            <div className="onboardingIconsText center"><b>Creation and<br/> Marketing</b>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <img src="/icons/Creation.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Creation and<br/> Marketing</b></div>
                                    </div>
                                }
                            </li>
                            <li className="clickableNoUnderline" onClick={() => this.handleIconClick(5)}>
                                {this.state.currInterestArea === this.state.businessInterests ?
                                    <div className="gradientBorderBlue center">
                                        <div style={{padding: '5px'}}>
                                            <img src="/icons/Business.png" className="onboardingIcons"/>
                                            <div className="onboardingIconsText center"><b>Business</b></div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <img src="/icons/Business.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Business</b></div>
                                    </div>
                                }
                            </li>
                        </ul>
                    </div>
                    <div className="center">
                        {interests ?
                            <ul className="horizCenteredList onboardingInterestsListContainer">
                                {interests}
                            </ul>
                            : null}
                    </div>
                    <div className="center">
                        <button className="onboardingPage1Button" onClick={this.handleStep1ButtonClick.bind(this)}>
                            <div className="smallText2 onboardingPage1Text2">
                                Next
                            </div>
                        </button>
                    </div>
                </div>
                </Tab>


                <Tab label="Goals" value="goals">
                <div style={{marginBottom: '50px'}}>
                    <div className="onboardingPage2Text mediumText center" style={style.title.topTitle}>
                        What Are Your Goals?
                    </div>
                    <div style={style.title.divider}>
                        <div className="onboarding2DividerLeft" style={{bottom: "0"}}/>
                        <div className="onboarding2DividerRight" style={{bottom: "0"}}/>
                    </div>
                    <div className="smallText center" style={{marginBottom: "20px"}}>
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
                        <button className="onboardingPage2Button" onClick={this.handleGoalsButtonClick.bind(this)}>
                            <div className="smallText2 onboardingPage1Text2">
                                Next
                            </div>
                        </button>
                    </div>
                </div>
                </Tab>


                <Tab label="Info" value="info">
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
                                onChange={(e) => this.handleInfoInputChange(e, "birthDate")}
                            /> <br/>
                            <span>Location</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="City, State, Country"
                                value={this.state.location}
                                onChange={(e) => this.handleInfoInputChange(e, "location")}
                            /> <br/>
                            <span>Willing to relocate to</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="e.g. San Francisco, East Coast..."
                                value={this.state.willRelocateTo}
                                onChange={(e) => this.handleInfoInputChange(e, "willRelocateTo")}
                                /> <br/>
                            <span>{"Desired Job(s)"}</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="e.g. VR/AR Developer..."
                                value={this.state.desiredJobs}
                                onChange={(e) => this.handleInfoInputChange(e, "desiredJobs")}
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
                                onChange={(e) => this.handleInfoInputChange(e, "title")}
                            /> <br/>
                            <span>Bio</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="e.g. I have been creating virtual reality..."
                                value={this.state.bio}
                                onChange={(e) => this.handleInfoInputChange(e, "bio")}
                            /> <br/>
                            <span>Links</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="LinkedIn Profile"
                                value={this.state.linkedIn}
                                onChange={(e) => this.handleInfoInputChange(e, "linkedIn")}
                            /> <br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="GitHub Profile"
                                value={this.state.gitHub}
                                onChange={(e) => this.handleInfoInputChange(e, "gitHub")}
                            /> <br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="Personal Site"
                                value={this.state.personal}
                                onChange={(e) => this.handleInfoInputChange(e, "personal")}
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
                                src="/icons/CheckMarkGreen.png"
                                height={15}
                                width={15}
                            />
                        </div>
                        I am currently in school<br/>
                    </div>


                    <div className="center">
                        <button className="onboardingPage3Button" onClick={this.handleFinishButtonClick.bind(this)}>
                            <div className="smallText2 onboardingPage1Text2">
                                Finish
                            </div>
                        </button>
                    </div>
                </div>
                </Tab>
            </Tabs>
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
        updateGoals,
        updateInterests,
        startOnboarding,
        endOnboarding
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
