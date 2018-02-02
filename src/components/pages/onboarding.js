"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    updateInfo,
    updateGoals,
    updateInterests,
    startOnboarding,
    endOnboarding,
    closeNotification
} from "../../actions/usersActions";
import {DatePicker, RaisedButton} from 'material-ui';
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';

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
                                "Viral Marketing",
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
                    interestTypes.forEach(function (interestsObj, listIndex) {
                        // for each type of interest, set the interests object to a list of interest objects
                        interestObjects[interestsObj.name] = interestsObj.interests.map(function (interest) {
                            // if the user already has that interest, mark it as selected
                            let alreadyHasInterest = userInterests.some(function (userInterest) {
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

                potentialGoals.forEach(function (goal, goalIndex) {
                    let alreadyHasGoal = userGoals.some(function (userGoal) {
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
        let birthDate = null;
        let desiredJobs = "";
        let bio = "";
        let title = "";
        let gitHub = "";
        let linkedIn = "";
        let personal = "";
        let willRelocateTo = "";
        let eduInfo = [];
        let eduDates = [];

        let inSchool = false;

        if (user && user.info) {
            let info = user.info;
            location = info.location ? info.location : "";
            desiredJobs = info.desiredJobs ? info.desiredJobs : "";
            title = info.title ? info.title : "";
            bio = info.bio ? info.bio : "";
            willRelocateTo = info.willRelocateTo ? info.willRelocateTo : "";
            inSchool = info.inSchool ? info.inSchool : false;
            birthDate = info.birthDate ?
                new Date(parseInt(info.birthDate.substring(0, 4)),
                    parseInt(info.birthDate.substring(5, 7)) - 1,
                    parseInt(info.birthDate.substring(8, 10)))
                : null;
            let links = info.links;
            if (links) {
                links.forEach(function (link, linkIdx) {
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
            if (eduArray && eduArray.length > 0) {
                eduInfo = eduArray.map(function (edu) {
                    let endDate = {};
                    if (edu.endDate) {
                        endDate = new Date(parseInt(edu.endDate.substring(0, 4)),
                            parseInt(edu.endDate.substring(5, 7)) - 1,
                            parseInt(edu.endDate.substring(8, 10)));
                    }
                    return {
                        school: edu.school ? edu.school : "",
                        majors: edu.majors ? edu.majors : "",
                        minors: edu.minors ? edu.minors : "",
                        endDate: endDate,
                    };
                });
            } else {
                // add empty edu area if none written down
                eduInfo.push({
                    school: "",
                    majors: "",
                    minors: "",
                    endDate: null,
                });
            }
        }

        this.state = {
            tabValue: "interests",
            ...interestObjects,
            currInterestArea: interestObjects.designAndDevInterests,
            goals,
            location, birthDate, desiredJobs, bio, gitHub, title,
            linkedIn, personal, willRelocateTo, eduInfo, inSchool
        }
    }

    componentDidMount() {
        this.props.startOnboarding();
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
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

        this.props.updateGoals(this.props.currentUser, goals);
    }


    // INFO
    handleFinishButtonClick() {
        this.saveInfo();
        const markOnboardingComplete = true;
        this.props.endOnboarding(this.props.currentUser, markOnboardingComplete);
        browserHistory.push('/discover');
        window.scrollTo(0, 0);
    }

    saveInfo() {
        const state = this.state;

        const inSchool = state.inSchool;
        const location = state.location;
        const desiredJobs = state.desiredJobs;
        const title = state.title;
        const bio = state.bio;
        const willRelocateTo = state.willRelocateTo;
        const links = [
            {url: state.gitHub, displayString: "GitHub"},
            {url: state.linkedIn, displayString: "LinkedIn"},
            {url: state.personal, displayString: "Personal"}
        ];
        let education = state.eduInfo;

        education = education.filter(function (edu) {
            return (edu.school != "" || edu.endDate != {} || edu.majors != "" || edu.minors != "");
        });

        const birthDate = this.state.birthDate;

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
            endDate: {},
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
        }, function () {
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

    handleEduDateChange(event, date, eduIdx) {
        let eduInfo = this.state.eduInfo.slice();
        eduInfo[eduIdx].endDate = date;

        console.log("things");

        this.setState({
            ...this.state,
            ...eduInfo
        });
    };

    handleBirthDateChange(event, date) {
        this.setState({
            ...this.state,
            birthDate: date
        });
    };


    handleCheckMarkClick() {
        this.setState({
            ...this.state,
            inSchool: !this.state.inSchool
        })
    }


    handleTabChange = (value) => {
        setTabAndSave(value);
    };

    setTabAndSave(value) {
        this.setState({
            tabValue: value,
        });
        this.saveAllInfo();
    }

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
                    display: 'inline-block'
                },
                divider: {
                    position: 'relative',
                    marginBottom: '20px',
                },
                text: {
                    marginBottom: '30px',
                }
            },
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
                                <div className="font14px font12pxUnder500 onboardingPage1Text2">
                                    {interest.title}
                                </div>
                            </div>
                            :
                            <div
                                className="gradientBorderBlue center clickableNoUnderline noselect onboardingPage1Margin"
                                onClick={() => self.handleInterestClick(interest)}>
                                <div className="onboardingPage1Text3 font14px font12pxUnder500">
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
                            <div className="clickableNoUnderline onboardingPage2Text2Background center"
                                 onClick={() => self.handleGoalClick(goal)}>
                                <div className="font14px font12pxUnder500 onboardingPage1Text2">
                                    {goal.title}
                                </div>
                            </div>
                            :
                            <div className="clickableNoUnderline gradientBorderPurple center onboardingPage2Margin"
                                 onClick={() => self.handleGoalClick(goal)}>
                                <div className="onboardingPage2Text3 font14px font12pxUnder500">
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
        let educationUls = eduInfo.map(function (edu) {
            eduIdx++;
            const index = eduIdx;
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
                            <div className="dp greenInput">
                                <DatePicker
                                    openToYearSelection={true}
                                    eduidx={eduIdx}
                                    key={eduIdx + "date"}
                                    id={eduIdx + "date"}
                                    hintText="05/12/2017"
                                    value={self.state.eduInfo[eduIdx].endDate}
                                    onChange={(e, date) => self.handleEduDateChange(e, date, index)}
                                />
                            </div>

                            <br/>
                        </li>
                        <li className="inputSeparator"/>
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

        let onBoardingHtml = null;
        let tabValue = this.state.tabValue;

        if (!tabValue || tabValue == "interests") {
            const interestTypes = [
                {interestArea: this.state.designAndDevInterests,
                 pictureSrc: "/icons/Cube.png",
                 iconNumber: 1,
                 title: <b>Product Design<br/>and Development</b> },
                {interestArea: this.state.dataInterests,
                 pictureSrc: "/icons/Data.png",
                 iconNumber: 2,
                 title: <b>Data</b> },
                {interestArea: this.state.softwareDevInterests,
                 pictureSrc: "/icons/Computer.png",
                 iconNumber: 3,
                 title: <b>Software<br/>Development</b> },
                {interestArea: this.state.creationAndMarketingInterests,
                 pictureSrc: "/icons/Creation.png",
                 iconNumber: 4,
                 title: <b>Creation and<br/>Marketing</b>},
                {interestArea: this.state.businessInterests,
                 pictureSrc: "/icons/Business.png",
                 iconNumber: 5,
                 title: <b>Business</b> }
            ]

            let self = this;
            const iconLis = interestTypes.map(function(interest) {
                return (
                    <li className="clickableNoUnderline onboardingIconLi"
                        key={"onboardingIcon" + interest.iconNumber}
                        onClick={() => self.handleIconClick(interest.iconNumber)}>
                        <div className={self.state.currInterestArea === interest.interestArea ? "gradientBorderBlue center" : "transparentBorder center"}>
                            <div style={{padding: '5px'}}>
                                <img src={interest.pictureSrc} className="onboardingIcons"/>
                                <div className="font16px font12pxUnder500 center">
                                    {interest.title}
                                </div>
                            </div>
                        </div>
                    </li>
                );
            });

            onBoardingHtml =
                <div style={{marginBottom: '20px', minWidth: '100%', textAlign: 'center'}}>
                    <div className="onboardingPage1Text font40px font24pxUnder500 center" style={style.title.topTitle}>
                        Select Your
                        Interests
                    </div>
                    <div style={style.title.divider}>
                        <div className="onboardingDividerLeft" style={{bottom: "0"}}/>
                        <div className="onboardingDividerRight" style={{bottom: "0"}}/>
                    </div>
                    <div className="font14px font12pxUnder500 center" style={style.title.text}>What skills do you want
                        to learn or
                        improve?
                    </div>
                    <div>
                        <ul className="horizCenteredList onboardingListContainer">
                            {iconLis}
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
                            <div className="font20px font14pxUnder700 font12pxUnder400 onboardingPage1Text2">
                                Next
                            </div>
                        </button>
                    </div>
                </div>
        }

        else if (tabValue == "goals") {
            onBoardingHtml =
                <div style={{marginBottom: '20px', textAlign: 'center'}}>
                    <div className="onboardingPage2Text font40px font24pxUnder500 center" style={style.title.topTitle}>
                        What Are Your Goals?
                    </div>
                    <div style={style.title.divider}>
                        <div className="onboarding2DividerLeft" style={{bottom: "0"}}/>
                        <div className="onboarding2DividerRight" style={{bottom: "0"}}/>
                    </div>
                    <div className="font14px font10pxUnder500 center" style={{marginBottom: "20px"}}>
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
                            <div className="font20px font14pxUnder700 font12pxUnder400 onboardingPage1Text2">
                                Next
                            </div>
                        </button>
                    </div>
                </div>
        }

        else if (tabValue == "info") {
            onBoardingHtml =
                <div style={{marginBottom: '20px', textAlign: 'center'}}>
                    <div className="onboardingPage3TextTitle font40px font24pxUnder500 center"
                         style={style.title.topTitle}>
                        Start Building Your Profile
                    </div>
                    <div style={style.title.divider}>
                        <div className="onboarding3DividerLeft" style={{bottom: "0"}}/>
                        <div className="onboarding3DividerRight" style={{bottom: "0"}}/>
                    </div>
                    <div className="font20px font14pxUnder700 font12pxUnder400 center" style={style.title.text}>
                        The more complete your profile, the more appealing you look to employers.<br/>
                    </div>
                    <div className="center">
                        <img src="/icons/Portfolio.png" className="onboardingIcons" style={style.icons}/>
                        <div className="onboardingPage3Text font20px" style={{display: 'inline-block'}}><b>Personal</b>
                        </div>
                    </div>

                    <div className="horizCenteredList">
                        <li className="onboardingLeftInput">
                            <span>Date of Birth</span><br/>
                            <div className="dp greenInput">
                                <DatePicker
                                    openToYearSelection={true}
                                    hintText="11/19/1996"
                                    value={self.state.birthDate}
                                    onChange={(e, date) => self.handleBirthDateChange(e, date)}
                                />
                            </div>
                            <br/>
                            <span>Location</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="City, State"
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
                        <li className="inputSeparator"/>
                        <li className="onboardingRightInput">
                            <span>Title</span><br/>
                            <input
                                type="text"
                                className="greenInput"
                                placeholder="e.g. Front End Developer passionate about UX"
                                value={this.state.title}
                                onChange={(e) => this.handleInfoInputChange(e, "title")}
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
                        <span id="onboardingBioTextareaSpan" className="font20px">Bio</span><br/>
                        <textarea
                            className="greenInput"
                            id="onboardingBioTextarea"
                            placeholder="e.g. I have been creating virtual reality..."
                            value={this.state.bio}
                            onChange={(e) => this.handleInfoInputChange(e, "bio")}
                        /> <br/>
                    </div>

                    <div className="center">
                        <img src="/icons/GraduationHat.png" className="onboardingIcons" style={style.icons}/>
                        <div className="onboardingPage3Text font20px" style={{display: 'inline-block'}}><b>Education</b>
                        </div>
                    </div>

                    {educationUls}

                    <div className="center onboardingPage3 font18px font14pxUnder700 font12pxUnder400">
                        <button className="greenButton" onClick={this.addEducationArea.bind(this)}>
                            Add another school
                        </button>
                        <br/>
                        <div className="checkbox mediumCheckbox greenCheckbox"
                             onClick={this.handleCheckMarkClick.bind(this)}>
                            <img
                                className={"checkMark" + this.state.inSchool}
                                src="/icons/CheckMarkGreen.png"
                            />
                        </div>
                        I am currently in school<br/>
                    </div>


                    <div className="center">
                        <button className="onboardingPage3Button" onClick={this.handleFinishButtonClick.bind(this)}>
                            <div className="font20px font14pxUnder700 onboardingPage1Text2">
                                Finish
                            </div>
                        </button>
                    </div>
                </div>
        }


        return (
            <div>
                {onBoardingHtml}

                <div className={"onboardingDots center onboardingDots" + this.state.tabValue}>
                    <div
                        className="onboardingDot"
                        onClick={() => this.setTabAndSave("interests")}
                    />
                    <div
                        className="onboardingDot"
                        onClick={() => this.setTabAndSave("goals")}
                    />
                    <div
                        className="onboardingDot"
                        onClick={() => this.setTabAndSave("info")}
                    />
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
        updateGoals,
        updateInterests,
        startOnboarding,
        endOnboarding,
        closeNotification
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
